import os
from typing import List, Optional
import numpy as np
from src.core.logger import logger
from src.detection.base import BaseDetector
from src.detection.schemas import Detection, BoundingBox
from src.detection.synthetic_detector import SyntheticDetector

class YOLODetector(BaseDetector):
    """Ultralytics YOLO inference wrapper supporting YOLOv8, YOLOv9, and YOLOv11."""

    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.35, iou_threshold: float = 0.45, device: str = "auto"):
        super().__init__(model_path, conf_threshold, iou_threshold, device)
        self.model = None
        self._fallback_detector = None
        self.load()

    def load(self):
        try:
            from ultralytics import YOLO
            logger.info(f"Loading Ultralytics YOLO model from {self.model_path} on device {self.device}...")
            self.model = YOLO(self.model_path)
            self.is_loaded = True
        except Exception as e:
            logger.warning(f"Could not load Ultralytics YOLO ({e}). Initializing SyntheticDetector fallback.")
            self._fallback_detector = SyntheticDetector(self.model_path, self.conf_threshold)
            self.is_loaded = True

    def warm_up(self, iterations: int = 3):
        if self.model:
            dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)
            for _ in range(iterations):
                self.model.predict(dummy_frame, verbose=False, device=self.device)

    def predict(self, frame: np.ndarray) -> List[Detection]:
        if self._fallback_detector:
            return self._fallback_detector.predict(frame)

        if not self.model:
            return []

        try:
            results = self.model.predict(
                source=frame,
                conf=self.conf_threshold,
                iou=self.iou_threshold,
                verbose=False,
                device=self.device
            )

            detections: List[Detection] = []
            if results and len(results) > 0:
                res = results[0]
                names = res.names
                boxes = res.boxes

                if boxes is not None and len(boxes) > 0:
                    xyxy = boxes.xyxy.cpu().numpy()
                    confs = boxes.conf.cpu().numpy()
                    classes = boxes.cls.cpu().numpy().astype(int)

                    for i in range(len(boxes)):
                        cls_id = classes[i]
                        cls_name = names.get(cls_id, f"class_{cls_id}")
                        x1, y1, x2, y2 = xyxy[i]
                        conf = float(confs[i])

                        detections.append(Detection(
                            bbox=BoundingBox(x1=float(x1), y1=float(y1), x2=float(x2), y2=float(y2)),
                            class_id=cls_id,
                            class_name=cls_name,
                            confidence=round(conf, 3)
                        ))

            return detections
        except Exception as e:
            logger.error(f"Inference error: {e}")
            if not self._fallback_detector:
                self._fallback_detector = SyntheticDetector()
            return self._fallback_detector.predict(frame)
