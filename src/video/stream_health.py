import time
from typing import Dict, Any
from pydantic import BaseModel, Field

class StreamHealthMetrics(BaseModel):
    camera_id: str
    status: str = "connected" # connected, degraded, reconnecting, disconnected
    fps: float = 0.0
    target_fps: float = 30.0
    resolution: str = "1280x720"
    codec: str = "h264"
    bitrate_kbps: float = 4096.0
    dropped_frames: int = 0
    total_frames: int = 0
    drop_percentage: float = 0.0
    latency_ms: float = 18.5
    uptime_seconds: float = 0.0
    last_frame_timestamp: float = Field(default_factory=time.time)

class StreamHealthMonitor:
    """Monitors live stream health, frame timing, FPS, and dropped frames."""
    
    def __init__(self, camera_id: str, target_fps: float = 30.0, resolution: str = "1280x720"):
        self.camera_id = camera_id
        self.target_fps = target_fps
        self.resolution = resolution
        self.start_time = time.time()
        self.last_frame_time = time.time()
        self.frame_count = 0
        self.dropped_count = 0
        self.window_frames = 0
        self.window_start = time.time()
        self.current_fps = target_fps
        self.status = "connected"

    def record_frame(self, latency_ms: float = 0.0):
        now = time.time()
        self.last_frame_time = now
        self.frame_count += 1
        self.window_frames += 1

        elapsed = now - self.window_start
        if elapsed >= 1.0:
            self.current_fps = round(self.window_frames / elapsed, 1)
            self.window_frames = 0
            self.window_start = now
            
            if self.current_fps < (self.target_fps * 0.5):
                self.status = "degraded"
            else:
                self.status = "connected"

    def record_drop(self):
        self.dropped_count += 1

    def set_status(self, status: str):
        self.status = status

    def get_metrics(self) -> StreamHealthMetrics:
        now = time.time()
        if now - self.last_frame_time > 3.0:
            self.status = "reconnecting" if (now - self.last_frame_time < 10.0) else "disconnected"

        total = self.frame_count + self.dropped_count
        drop_pct = round((self.dropped_count / total * 100.0), 2) if total > 0 else 0.0

        return StreamHealthMetrics(
            camera_id=self.camera_id,
            status=self.status,
            fps=self.current_fps,
            target_fps=self.target_fps,
            resolution=self.resolution,
            codec="h264",
            bitrate_kbps=round(self.current_fps * 128.0, 1),
            dropped_frames=self.dropped_count,
            total_frames=self.frame_count,
            drop_percentage=drop_pct,
            latency_ms=round(1000.0 / max(self.current_fps, 1.0), 1),
            uptime_seconds=round(now - self.start_time, 1),
            last_frame_timestamp=self.last_frame_time
        )
