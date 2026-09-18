import time
import math
import random
from typing import List
import numpy as np
from src.detection.base import BaseDetector
from src.detection.schemas import Detection, BoundingBox

class SyntheticDetector(BaseDetector):
    """Zero-dependency synthetic detector that simulates high-precision object detection for local development & testing."""

    def __init__(self, model_path: str = "synthetic-yolo", conf_threshold: float = 0.35, **kwargs):
        super().__init__(model_path=model_path, conf_threshold=conf_threshold)
        self.is_loaded = True
        self.classes = ["person", "car", "truck", "helmet", "safety_vest", "no-helmet", "no-vest"]
        self.tick = 0

    def load(self):
        self.is_loaded = True

    def warm_up(self, iterations: int = 3):
        pass

    def predict(self, frame: np.ndarray) -> List[Detection]:
        self.tick += 1
        h, w = frame.shape[:2]
        detections: List[Detection] = []
        t = self.tick * 0.04

        # Simulated Person 1 (Compliant worker)
        p1_x = int((0.30 + 0.12 * math.sin(t * 0.8)) * w)
        p1_y = int((0.42 + 0.08 * math.cos(t * 0.6)) * h)
        detections.append(Detection(
            bbox=BoundingBox(x1=p1_x, y1=p1_y, x2=p1_x + 65, y2=p1_y + 150),
            class_id=0,
            class_name="person",
            confidence=0.92,
            attributes={"has_helmet": True, "has_vest": True, "speed_kmh": 3.2}
        ))
        # PPE sub-detections for person 1
        detections.append(Detection(
            bbox=BoundingBox(x1=p1_x + 12, y1=p1_y - 10, x2=p1_x + 52, y2=p1_y + 25),
            class_id=3,
            class_name="helmet",
            confidence=0.89
        ))
        detections.append(Detection(
            bbox=BoundingBox(x1=p1_x + 5, y1=p1_y + 30, x2=p1_x + 60, y2=p1_y + 90),
            class_id=4,
            class_name="safety_vest",
            confidence=0.88
        ))

        # Simulated Person 2 (Violating worker / Restricted Zone intruder)
        p2_x = int((0.15 + 0.10 * math.cos(t * 0.7)) * w)
        p2_y = int((0.35 + 0.15 * math.sin(t * 0.5)) * h)
        detections.append(Detection(
            bbox=BoundingBox(x1=p2_x, y1=p2_y, x2=p2_x + 60, y2=p2_y + 145),
            class_id=0,
            class_name="person",
            confidence=0.87,
            attributes={"has_helmet": False, "has_vest": False, "speed_kmh": 4.1}
        ))
        detections.append(Detection(
            bbox=BoundingBox(x1=p2_x + 10, y1=p2_y - 8, x2=p2_x + 50, y2=p2_y + 20),
            class_id=5,
            class_name="no-helmet",
            confidence=0.84
        ))

        # Simulated Vehicle (Road/Gate)
        v_x = int(((t * 30) % (w + 200)) - 100)
        v_y = int(0.68 * h)
        if 0 <= v_x < w:
            is_overspeed = (self.tick % 200 > 100)
            spd = 48.5 if is_overspeed else 24.2
            detections.append(Detection(
                bbox=BoundingBox(x1=v_x, y1=v_y, x2=v_x + 180, y2=v_y + 90),
                class_id=1,
                class_name="car",
                confidence=0.95,
                attributes={"speed_kmh": spd}
            ))

        # Filter by confidence
        return [d for d in detections if d.confidence >= self.conf_threshold]
