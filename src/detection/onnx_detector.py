import os
from typing import List
import numpy as np
try:
    import cv2
except ImportError:
    cv2 = None
from src.core.logger import logger
from src.detection.base import BaseDetector
from src.detection.schemas import Detection, BoundingBox
from src.detection.synthetic_detector import SyntheticDetector

class ONNXDetector(BaseDetector):
    """High-performance ONNX Runtime object detector supporting FP32, FP16, and INT8 quantized models."""

    def __init__(self, model_path: str, conf_threshold: float = 0.35, iou_threshold: float = 0.45, device: str = "cpu"):
        super().__init__(model_path, conf_threshold, iou_threshold, device)
        self.session = None
        self.input_name = None
        self.output_names = []
        self._fallback_detector = None
        self.classes = ["person", "car", "truck", "bus", "motorcycle", "bicycle", "helmet", "safety_vest"]
        self.load()

    def load(self):
        try:
            import onnxruntime as ort
            if os.path.exists(self.model_path):
                providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if self.device.startswith('cuda') else ['CPUExecutionProvider']
                self.session = ort.InferenceSession(self.model_path, providers=providers)
                self.input_name = self.session.get_inputs()[0].name
                self.output_names = [o.name for o in self.session.get_outputs()]
                self.is_loaded = True
                logger.info(f"Loaded ONNX model: {self.model_path}")
            else:
                logger.warning(f"ONNX model file not found at {self.model_path}. Using synthetic detector.")
                self._fallback_detector = SyntheticDetector(self.model_path, self.conf_threshold)
                self.is_loaded = True
        except Exception as e:
            logger.warning(f"ONNX initialization failed ({e}). Falling back to synthetic detector.")
            self._fallback_detector = SyntheticDetector(self.model_path, self.conf_threshold)
            self.is_loaded = True

    def warm_up(self, iterations: int = 3):
        if self.session:
            dummy = np.zeros((1, 3, 640, 640), dtype=np.float32)
            for _ in range(iterations):
                self.session.run(self.output_names, {self.input_name: dummy})

    def predict(self, frame: np.ndarray) -> List[Detection]:
        if self._fallback_detector:
            return self._fallback_detector.predict(frame)

        if not self.session:
            return []

        h, w = frame.shape[:2]
        # Preprocessing: resize, convert to RGB, normalize, transpose to (1, 3, H, W)
        img = cv2.resize(frame, (640, 640))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img.astype(np.float32) / 255.0
        img = np.transpose(img, (2, 0, 1))
        img = np.expand_dims(img, axis=0)

        outputs = self.session.run(self.output_names, {self.input_name: img})
        output = outputs[0] # Shape: (1, 84, 8400) or (1, num_classes+4, 8400)

        # Parse detections and scale back to original image dimensions
        detections: List[Detection] = []
        predictions = np.transpose(output[0], (1, 0)) # (8400, 84)

        for row in predictions:
            scores = row[4:]
            class_id = int(np.argmax(scores))
            confidence = float(scores[class_id])

            if confidence >= self.conf_threshold:
                cx, cy, bw, bh = row[0], row[1], row[2], row[3]
                x1 = (cx - bw / 2.0) * (w / 640.0)
                y1 = (cy - bh / 2.0) * (h / 640.0)
                x2 = (cx + bw / 2.0) * (w / 640.0)
                y2 = (cy + bh / 2.0) * (h / 640.0)

                cls_name = self.classes[class_id] if class_id < len(self.classes) else f"class_{class_id}"
                detections.append(Detection(
                    bbox=BoundingBox(x1=float(max(0, x1)), y1=float(max(0, y1)), x2=float(min(w, x2)), y2=float(min(h, y2))),
                    class_id=class_id,
                    class_name=cls_name,
                    confidence=round(confidence, 3)
                ))

        return detections
