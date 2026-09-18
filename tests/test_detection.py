import pytest
import numpy as np
from src.detection.schemas import BoundingBox, Detection
from src.detection.synthetic_detector import SyntheticDetector

def test_bounding_box_properties():
    box = BoundingBox(x1=100.0, y1=150.0, x2=300.0, y2=450.0)
    assert box.width == 200.0
    assert box.height == 300.0
    assert box.center == (200.0, 300.0)
    assert box.area == 60000.0
    assert box.to_xyxy_list() == [100.0, 150.0, 300.0, 450.0]

def test_synthetic_detector():
    detector = SyntheticDetector(conf_threshold=0.3)
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    detections = detector.predict(frame)

    assert len(detections) > 0
    classes = [d.class_name for d in detections]
    assert "person" in classes
    for d in detections:
        assert d.confidence >= 0.3
        assert d.bbox.width > 0
        assert d.bbox.height > 0
