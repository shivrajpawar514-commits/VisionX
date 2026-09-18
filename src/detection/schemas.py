from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

    @property
    def width(self) -> float:
        return self.x2 - self.x1

    @property
    def height(self) -> float:
        return self.y2 - self.y1

    @property
    def center(self) -> tuple[float, float]:
        return ((self.x1 + self.x2) / 2.0, (self.y1 + self.y2) / 2.0)

    @property
    def area(self) -> float:
        return max(0.0, self.width) * max(0.0, self.height)

    def to_xyxy_list(self) -> List[float]:
        return [self.x1, self.y1, self.x2, self.y2]

class Detection(BaseModel):
    bbox: BoundingBox
    class_id: int
    class_name: str
    confidence: float
    track_id: Optional[int] = None
    keypoints: Optional[List[List[float]]] = None
    mask: Optional[List[List[int]]] = None
    attributes: Dict[str, Any] = Field(default_factory=dict) # e.g. {"has_helmet": True, "has_vest": False}

class DetectionBatch(BaseModel):
    camera_id: str
    frame_id: int
    timestamp: float
    detections: List[Detection]
    inference_time_ms: float
    model_name: str

class ModelBenchmarkResult(BaseModel):
    model_id: str
    model_name: str
    framework: str # ultralytics, onnx, tensorrt
    precision: str # fp32, fp16, int8
    batch_size: int
    avg_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    fps: float
    throughput_samples_per_sec: float
    memory_mb: float
    device: str
