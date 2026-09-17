import threading
import time
from typing import Dict, Optional, Any, Callable
try:
    import cv2
except ImportError:
    cv2 = None
import numpy as np
from src.core.logger import logger
from src.video.frame_buffer import FrameBuffer
from src.video.stream_health import StreamHealthMonitor, StreamHealthMetrics
from src.video.synthetic_stream import SyntheticStreamGenerator

class CameraStream:
    """Represents an active video ingestion thread for a single camera source."""
    
    def __init__(self, camera_id: str, source: str, target_fps: int = 25, resolution: str = "1280x720"):
        self.camera_id = camera_id
        self.source = source
        self.target_fps = target_fps
        self.resolution = resolution
        self.buffer = FrameBuffer(maxsize=5)
        self.health = StreamHealthMonitor(camera_id, target_fps=float(target_fps), resolution=resolution)
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.synthetic_gen: Optional[SyntheticStreamGenerator] = None

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True, name=f"cam-stream-{self.camera_id}")
        self.thread.start()
        logger.info(f"Started video stream worker for camera: {self.camera_id} (source: {self.source})")

    def stop(self):
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)
        logger.info(f"Stopped video stream worker for camera: {self.camera_id}")

    def _capture_loop(self):
        # Check if source is synthetic or hardware/RTSP
        is_synthetic = (self.source.lower() == "synthetic" or not self.source)
        cap = None

        if not is_synthetic:
            try:
                # Handle webcam index (e.g. "0" or 0)
                src = int(self.source) if self.source.isdigit() else self.source
                cap = cv2.VideoCapture(src)
                if not cap.isOpened():
                    logger.warning(f"Could not open source '{self.source}' for camera {self.camera_id}. Falling back to synthetic.")
                    is_synthetic = True
            except Exception as e:
                logger.warning(f"Error opening camera {self.camera_id}: {e}. Falling back to synthetic.")
                is_synthetic = True

        if is_synthetic:
            self.synthetic_gen = SyntheticStreamGenerator(self.camera_id, width=1280, height=720, fps=self.target_fps)

        frame_interval = 1.0 / max(self.target_fps, 1)

        while self.running:
            loop_start = time.time()
            frame = None

            if is_synthetic:
                frame = self.synthetic_gen.read_frame()
            else:
                ret, raw_frame = cap.read()
                if not ret:
                    # If video file ended, loop it
                    if isinstance(self.source, str) and not self.source.startswith("rtsp"):
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, raw_frame = cap.read()
                    
                    if not ret:
                        self.health.record_drop()
                        time.sleep(0.1)
                        continue
                frame = raw_frame

            if frame is not None:
                self.buffer.put(frame, timestamp=loop_start)
                self.health.record_frame()

            # Maintain target FPS
            elapsed = time.time() - loop_start
            sleep_time = frame_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

        if cap:
            cap.release()

class StreamManager:
    """Manages all active camera streams across the VisionX platform."""
    
    def __init__(self):
        self._streams: Dict[str, CameraStream] = {}
        self._lock = threading.Lock()

    def register_camera(self, camera_id: str, source: str = "synthetic", target_fps: int = 25, resolution: str = "1280x720") -> CameraStream:
        with self._lock:
            if camera_id in self._streams:
                self._streams[camera_id].stop()
            stream = CameraStream(camera_id, source, target_fps, resolution)
            self._streams[camera_id] = stream
            stream.start()
            return stream

    def unregister_camera(self, camera_id: str):
        with self._lock:
            if camera_id in self._streams:
                self._streams[camera_id].stop()
                del self._streams[camera_id]

    def get_stream(self, camera_id: str) -> Optional[CameraStream]:
        return self._streams.get(camera_id)

    def get_all_health(self) -> Dict[str, StreamHealthMetrics]:
        return {cam_id: stream.health.get_metrics() for cam_id, stream in self._streams.items()}

    def stop_all(self):
        with self._lock:
            for stream in self._streams.values():
                stream.stop()
            self._streams.clear()

# Global stream manager
stream_manager = StreamManager()
