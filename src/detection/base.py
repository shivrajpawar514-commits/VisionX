from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np
from src.detection.schemas import Detection

class BaseDetector(ABC):
    """Abstract Base Class for all VisionX Object Detectors."""

    def __init__(self, model_path: str, conf_threshold: float = 0.35, iou_threshold: float = 0.45, device: str = "auto"):
        self.model_path = model_path
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.device = device
        self.is_loaded = False

    @abstractmethod
    def load(self):
        """Load model weights and initialize runtime."""
        pass

    @abstractmethod
    def predict(self, frame: np.ndarray) -> List[Detection]:
        """Perform object detection on an input BGR image frame."""
        pass

    @abstractmethod
    def warm_up(self, iterations: int = 3):
        """Warm up model inference engine."""
        pass
