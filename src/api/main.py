import os
import time
import asyncio
import base64
import yaml
from contextlib import asynccontextmanager
from typing import Dict, List, Any
try:
    import cv2
except ImportError:
    cv2 = None

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import settings
from src.core.logger import logger
from src.database.session import init_db, AsyncSessionLocal
import src.database.crud as crud
from src.video.stream_manager import stream_manager
from src.detection.synthetic_detector import SyntheticDetector
from src.detection.yolo_detector import YOLODetector
from src.tracking.tracker import ByteTracker
from src.events.event_engine import CameraEventEngine
from src.alerts.alert_manager import alert_manager
from src.api.websocket import ws_hub

# Routers
from src.api.routers import auth, cameras, detections, events, analytics, models, health, hitl

# Pipeline engines mapped per camera
camera_detectors: Dict[str, Any] = {}
camera_trackers: Dict[str, ByteTracker] = {}
camera_engines: Dict[str, CameraEventEngine] = {}
bg_task: asyncio.Task = None

async def camera_processing_loop():
    """Continuous inference & video analytics worker loop."""
    logger.info("VisionX Live Inference & Analytics worker started.")
    tick = 0

    while True:
        try:
            tick += 1
            for cam_id, stream in list(stream_manager._streams.items()):
                frame_data = stream.buffer.get(timeout=0.01)
                if frame_data is None:
                    continue

                frame, timestamp, meta = frame_data
                detector = camera_detectors.get(cam_id)
                tracker = camera_trackers.get(cam_id)
                engine = camera_engines.get(cam_id)

                if not detector or not tracker or not engine:
                    continue

                start_infer = time.time()
                detections_list = detector.predict(frame)
                infer_ms = (time.time() - start_infer) * 1000.0

                # Run ByteTrack
                tracks = tracker.update(detections_list)

                # Process Analytics & Events
                new_events = engine.process(tracks, detections_list)

                # Handle newly generated events
                for ev in new_events:
                    alert = alert_manager.trigger_alert(
                        camera_id=cam_id,
                        event_type=ev.get("event_type", "event"),
                        severity=ev.get("severity", "INFO"),
                        title=ev.get("description", "Event detected"),
                        description=ev.get("description", ""),
                        metadata=ev
                    )
                    # Broadcast event to WebSocket
                    await ws_hub.broadcast_event(alert.model_dump())

                # Broadcast live detections & telemetry to connected clients
                if cam_id in ws_hub.camera_connections and len(ws_hub.camera_connections[cam_id]) > 0:
                    # Encode frame as JPEG base64 for real-time web stream
                    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
                    frame_b64 = base64.b64encode(buffer).decode('utf-8')

                    payload = {
                        "camera_id": cam_id,
                        "frame_id": tick,
                        "timestamp": timestamp,
                        "inference_time_ms": round(infer_ms, 1),
                        "fps": stream.health.current_fps,
                        "detections": [
                            {
                                "bbox": d.bbox.model_dump(),
                                "class_name": d.class_name,
                                "class_id": d.class_id,
                                "confidence": d.confidence,
                                "attributes": d.attributes
                            }
                            for d in detections_list
                        ],
                        "tracks": [
                            {
                                "track_id": t.track_id,
                                "class_name": t.class_name,
                                "bbox": [float(x) for x in t.tlbr],
                                "dwell_sec": t.attributes.get("dwell_sec", 0.0),
                                "speed_kmh": t.attributes.get("speed_kmh", 0.0),
                                "trajectory": [[float(p[0]), float(p[1])] for p in t.trajectory[-15:]]
                            }
                            for t in tracks
                        ],
                        "frame_image": f"data:image/jpeg;base64,{frame_b64}"
                    }
                    await ws_hub.broadcast_camera_frame(cam_id, payload)

            # Broadcast system telemetry periodically
            if tick % 10 == 0:
                stats = health.get_system_stats()
                await ws_hub.broadcast_telemetry(stats)

            await asyncio.sleep(0.02)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Inference loop error: {e}")
            await asyncio.sleep(0.05)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing VisionX Platform Services...")
    await init_db()

    # Load cameras from configs/cameras.yaml
    cam_configs = []
    if os.path.exists("configs/cameras.yaml"):
        with open("configs/cameras.yaml", "r") as f:
            data = yaml.safe_load(f) or {}
            cam_configs = data.get("cameras", [])

    async with AsyncSessionLocal() as session:
        for cc in cam_configs:
            await crud.create_or_update_camera(session, cc)
            stream_manager.register_camera(cc["id"], cc.get("source", "synthetic"), cc.get("target_fps", 25))
            camera_detectors[cc["id"]] = SyntheticDetector(model_path=cc.get("model_id", "yolov8n"))
            camera_trackers[cc["id"]] = ByteTracker(frame_rate=cc.get("target_fps", 25))
            camera_engines[cc["id"]] = CameraEventEngine(cc["id"], cc)

    global bg_task
    bg_task = asyncio.create_task(camera_processing_loop())

    yield

    # Shutdown
    logger.info("Shutting down VisionX Platform Services...")
    if bg_task:
        bg_task.cancel()
    stream_manager.stop_all()

# FastAPI App Creation
app = FastAPI(
    title="VisionX Real-Time Video Analytics Platform",
    description="Production-grade real-time computer vision, multi-object tracking, event intelligence, and MLOps API.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(cameras.router, prefix="/api/v1")
app.include_router(detections.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(models.router, prefix="/api/v1")
app.include_router(hitl.router, prefix="/api/v1")
app.include_router(health.router) # includes /api/v1/health and /metrics

# WebSocket Endpoints
@app.websocket("/ws/live/{camera_id}")
async def websocket_live_feed(websocket: WebSocket, camera_id: str):
    await ws_hub.connect_camera(websocket, camera_id)
    try:
        while True:
            # Keep alive and receive control messages if any
            msg = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect_camera(websocket, camera_id)

@app.websocket("/ws/events")
async def websocket_events_feed(websocket: WebSocket):
    await ws_hub.connect_events(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect_events(websocket)

@app.websocket("/ws/telemetry")
async def websocket_telemetry_feed(websocket: WebSocket):
    await ws_hub.connect_telemetry(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect_telemetry(websocket)

@app.get("/")
async def root():
    return {
        "service": "VisionX Video Analytics Platform",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "metrics_url": "/metrics"
    }
