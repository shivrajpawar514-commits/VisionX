import pytest
import numpy as np
from src.detection.schemas import Detection, BoundingBox
from src.tracking.kalman_filter import KalmanFilter
from src.tracking.tracker import ByteTracker
from src.tracking.trajectory import TrajectoryAnalyzer

def test_kalman_filter():
    kf = KalmanFilter()
    measurement = np.array([100.0, 100.0, 1.0, 50.0])
    mean, cov = kf.initiate(measurement)
    assert mean.shape == (8,)
    assert cov.shape == (8, 8)

    mean, cov = kf.predict(mean, cov)
    assert mean.shape == (8,)

def test_byte_tracker_association():
    tracker = ByteTracker(track_thresh=0.4, frame_rate=25)

    # Frame 1 detections
    dets_f1 = [
        Detection(bbox=BoundingBox(x1=100, y1=100, x2=150, y2=200), class_id=0, class_name="person", confidence=0.9),
        Detection(bbox=BoundingBox(x1=400, y1=300, x2=550, y2=400), class_id=1, class_name="car", confidence=0.85)
    ]
    tracks_f1 = tracker.update(dets_f1)
    assert len(tracks_f1) == 2
    track_ids_f1 = {t.track_id for t in tracks_f1}

    # Frame 2 slightly moved detections
    dets_f2 = [
        Detection(bbox=BoundingBox(x1=105, y1=102, x2=155, y2=202), class_id=0, class_name="person", confidence=0.92),
        Detection(bbox=BoundingBox(x1=410, y1=300, x2=560, y2=400), class_id=1, class_name="car", confidence=0.88)
    ]
    tracks_f2 = tracker.update(dets_f2)
    assert len(tracks_f2) == 2
    track_ids_f2 = {t.track_id for t in tracks_f2}

    # Persistent IDs should match between frames
    assert track_ids_f1 == track_ids_f2

def test_trajectory_velocity():
    traj = [(10.0, 20.0, 1.0), (20.0, 20.0, 2.0)]
    vx, vy, spd = TrajectoryAnalyzer.calculate_velocity(traj)
    assert vx == 10.0
    assert vy == 0.0
    assert spd == 10.0
