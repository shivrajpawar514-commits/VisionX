#!/usr/bin/env python3
"""VisionX Test Runner supporting standalone execution and unit tests."""

import sys
import os
import unittest
import numpy as np

# Ensure repository root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.detection.schemas import BoundingBox, Detection
from src.detection.synthetic_detector import SyntheticDetector
from src.tracking.kalman_filter import KalmanFilter
from src.tracking.tracker import ByteTracker
from src.tracking.trajectory import TrajectoryAnalyzer
from src.analytics.zone_analytics import ZoneAnalytics
from src.analytics.line_crossing import LineCrossingAnalytics
from src.analytics.ppe_safety import PPESafetyAnalytics
from src.analytics.speed import SpeedAnalytics
from src.analytics.heatmap import SpatialHeatmapAccumulator
from src.analytics.nl_analytics import nl_engine
from src.tracking.track import STrack

class TestVisionXSuite(unittest.TestCase):

    def test_bounding_box(self):
        box = BoundingBox(x1=100.0, y1=150.0, x2=300.0, y2=450.0)
        self.assertEqual(box.width, 200.0)
        self.assertEqual(box.height, 300.0)
        self.assertEqual(box.center, (200.0, 300.0))
        self.assertEqual(box.area, 60000.0)

    def test_synthetic_detector(self):
        detector = SyntheticDetector(conf_threshold=0.3)
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        detections = detector.predict(frame)
        self.assertGreater(len(detections), 0)
        classes = [d.class_name for d in detections]
        self.assertIn("person", classes)

    def test_kalman_filter(self):
        kf = KalmanFilter()
        measurement = np.array([100.0, 100.0, 1.0, 50.0])
        mean, cov = kf.initiate(measurement)
        self.assertEqual(mean.shape, (8,))
        self.assertEqual(cov.shape, (8, 8))
        mean, cov = kf.predict(mean, cov)
        self.assertEqual(mean.shape, (8,))

    def test_bytetrack_association(self):
        tracker = ByteTracker(track_thresh=0.4, frame_rate=25)
        dets_f1 = [
            Detection(bbox=BoundingBox(x1=100, y1=100, x2=150, y2=200), class_id=0, class_name="person", confidence=0.9),
            Detection(bbox=BoundingBox(x1=400, y1=300, x2=550, y2=400), class_id=1, class_name="car", confidence=0.85)
        ]
        tracks_f1 = tracker.update(dets_f1)
        self.assertEqual(len(tracks_f1), 2)
        ids_f1 = {t.track_id for t in tracks_f1}

        dets_f2 = [
            Detection(bbox=BoundingBox(x1=105, y1=102, x2=155, y2=202), class_id=0, class_name="person", confidence=0.92),
            Detection(bbox=BoundingBox(x1=410, y1=300, x2=560, y2=400), class_id=1, class_name="car", confidence=0.88)
        ]
        tracks_f2 = tracker.update(dets_f2)
        self.assertEqual(len(tracks_f2), 2)
        ids_f2 = {t.track_id for t in tracks_f2}
        self.assertEqual(ids_f1, ids_f2)

    def test_zone_intrusion(self):
        zone = ZoneAnalytics(
            zone_id="test-zone",
            zone_name="Secure Perimeter",
            polygon_coords=[[0, 0], [200, 0], [200, 200], [0, 200]],
            alert_classes=["person"],
            dwell_grace_sec=0.0
        )
        track = STrack(tlwh=np.array([50, 50, 40, 80]), score=0.9, class_id=0, class_name="person")
        track.track_id = 1
        track.mean = np.array([70, 90, 0.5, 80, 0, 0, 0, 0])
        events = zone.update([track])
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["event_type"], "restricted_zone_intrusion")
        self.assertEqual(events[0]["severity"], "CRITICAL")

    def test_line_crossing(self):
        tripwire = LineCrossingAnalytics(
            line_id="tw-1",
            line_name="Entry Line",
            line_coords=[[0, 100], [200, 100]],
            target_classes=["person"]
        )
        track = STrack(tlwh=np.array([50, 50, 40, 80]), score=0.9, class_id=0, class_name="person")
        track.track_id = 10
        track.trajectory = [(50.0, 80.0, 1.0), (50.0, 120.0, 2.0)]
        events = tripwire.update([track])
        self.assertEqual(len(events), 1)
        self.assertEqual(tripwire.total_count, 1)

    def test_ppe_safety_violation(self):
        ppe = PPESafetyAnalytics(
            zone_id="ppe-1",
            zone_name="Worksite",
            required_ppe=["helmet", "safety_vest"],
            cooldown_sec=0.0
        )
        track_violating = STrack(tlwh=np.array([50, 50, 40, 80]), score=0.9, class_id=0, class_name="person", attributes={"has_helmet": False, "has_vest": False})
        track_violating.track_id = 4
        track_violating.mean = np.array([70, 90, 0.5, 80, 0, 0, 0, 0])
        events = ppe.update([track_violating])
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["event_type"], "ppe_safety_violation")

    def test_spatial_heatmap(self):
        heatmap = SpatialHeatmapAccumulator(grid_width=10, grid_height=10, frame_width=100, frame_height=100)
        track = STrack(tlwh=np.array([40, 40, 20, 20]), score=0.9, class_id=0, class_name="person")
        track.mean = np.array([50, 50, 1.0, 20, 0, 0, 0, 0])
        heatmap.update([track])
        grid = heatmap.get_normalized_grid()
        self.assertEqual(len(grid), 10)
        self.assertGreater(max(max(row) for row in grid), 0.0)

    def test_nl_query_engine(self):
        res = nl_engine.process_query("What PPE safety violations occurred today?")
        self.assertEqual(res["intent"], "safety_violation_lookup")
        self.assertGreater(res["confidence"], 0.9)

        res_veh = nl_engine.process_query("How many vehicles entered through the main gate?")
        self.assertEqual(res_veh["intent"], "vehicle_traffic_count")
        self.assertGreater(res_veh["result_count"], 0)

if __name__ == "__main__":
    print("=== Running VisionX Core Test Suite ===")
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestVisionXSuite)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
