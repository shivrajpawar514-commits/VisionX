import pytest
import time
import numpy as np
from src.tracking.track import STrack
from src.analytics.zone_analytics import ZoneAnalytics
from src.analytics.line_crossing import LineCrossingAnalytics
from src.analytics.ppe_safety import PPESafetyAnalytics
from src.analytics.speed import SpeedAnalytics
from src.analytics.heatmap import SpatialHeatmapAccumulator

def test_zone_intrusion():
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
    assert len(events) == 1
    assert events[0]["event_type"] == "restricted_zone_intrusion"
    assert events[0]["severity"] == "CRITICAL"

def test_line_crossing():
    tripwire = LineCrossingAnalytics(
        line_id="tw-1",
        line_name="Entry Line",
        line_coords=[[0, 100], [200, 100]],
        target_classes=["person"]
    )

    track = STrack(tlwh=np.array([50, 50, 40, 80]), score=0.9, class_id=0, class_name="person")
    track.track_id = 10
    track.trajectory = [(50.0, 80.0, 1.0), (50.0, 120.0, 2.0)] # Crosses y=100

    events = tripwire.update([track])
    assert len(events) == 1
    assert events[0]["event_type"] == "line_crossing"
    assert tripwire.total_count == 1

def test_ppe_safety_violation():
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
    assert len(events) == 1
    assert events[0]["event_type"] == "ppe_safety_violation"

def test_spatial_heatmap():
    heatmap = SpatialHeatmapAccumulator(grid_width=10, grid_height=10, frame_width=100, frame_height=100)
    track = STrack(tlwh=np.array([40, 40, 20, 20]), score=0.9, class_id=0, class_name="person")
    track.mean = np.array([50, 50, 1.0, 20, 0, 0, 0, 0])

    heatmap.update([track])
    grid = heatmap.get_normalized_grid()
    assert len(grid) == 10
    assert len(grid[0]) == 10
    assert max(max(row) for row in grid) > 0.0
