import json
import asyncio
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from src.core.logger import logger

class WebSocketHub:
    """Manages active WebSocket connections for live camera telemetry, alerts, and video frames."""

    def __init__(self):
        self.camera_connections: Dict[str, Set[WebSocket]] = {}
        self.event_connections: Set[WebSocket] = set()
        self.telemetry_connections: Set[WebSocket] = set()

    async def connect_camera(self, websocket: WebSocket, camera_id: str):
        await websocket.accept()
        if camera_id not in self.camera_connections:
            self.camera_connections[camera_id] = set()
        self.camera_connections[camera_id].add(websocket)
        logger.info(f"WebSocket client connected to live feed: {camera_id}")

    def disconnect_camera(self, websocket: WebSocket, camera_id: str):
        if camera_id in self.camera_connections and websocket in self.camera_connections[camera_id]:
            self.camera_connections[camera_id].remove(websocket)

    async def broadcast_camera_frame(self, camera_id: str, payload: dict):
        if camera_id in self.camera_connections:
            dead_sockets = []
            for ws in list(self.camera_connections[camera_id]):
                try:
                    await ws.send_text(json.dumps(payload))
                except Exception:
                    dead_sockets.append(ws)
            for ws in dead_sockets:
                self.disconnect_camera(ws, camera_id)

    async def connect_events(self, websocket: WebSocket):
        await websocket.accept()
        self.event_connections.add(websocket)

    def disconnect_events(self, websocket: WebSocket):
        self.event_connections.discard(websocket)

    async def broadcast_event(self, event_data: dict):
        dead_sockets = []
        for ws in list(self.event_connections):
            try:
                await ws.send_text(json.dumps(event_data))
            except Exception:
                dead_sockets.append(ws)
        for ws in dead_sockets:
            self.event_connections.discard(ws)

    async def connect_telemetry(self, websocket: WebSocket):
        await websocket.accept()
        self.telemetry_connections.add(websocket)

    def disconnect_telemetry(self, websocket: WebSocket):
        self.telemetry_connections.discard(websocket)

    async def broadcast_telemetry(self, telemetry_data: dict):
        dead_sockets = []
        for ws in list(self.telemetry_connections):
            try:
                await ws.send_text(json.dumps(telemetry_data))
            except Exception:
                dead_sockets.append(ws)
        for ws in dead_sockets:
            self.telemetry_connections.discard(ws)

ws_hub = WebSocketHub()
