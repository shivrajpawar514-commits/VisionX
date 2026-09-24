import time
from typing import List, Dict, Any, Optional
from src.detection.schemas import Detection
from src.tracking.track import STrack
from src.analytics.zone_analytics import ZoneAnalytics
from src.analytics.line_crossing import LineCrossingAnalytics
from src.analytics.loitering import LoiteringAnalytics
from src.analytics.crowd import CrowdAnalytics
from src.analytics.ppe_safety import PPESafetyAnalytics
from src.analytics.speed import SpeedAnalytics
from src.analytics.heatmap import SpatialHeatmapAccumulator

class CameraEventEngine:
    """Per-camera event processing pipeline orchestrating all analytical modules."""

    def __init__(self, camera_id: str, camera_config: Optional[Dict[str, Any]] = None):
        self.camera_id = camera_id
        self.config = camera_config or {}

        self.zone_analyzers: List[ZoneAnalytics] = []
        self.line_analyzers: List[LineCrossingAnalytics] = []
        self.loitering_analyzers: List[LoiteringAnalytics] = []
        self.crowd_analyzer: Optional[CrowdAnalytics] = None
        self.ppe_analyzer: Optional[PPESafetyAnalytics] = None
        self.speed_analyzer: Optional[SpeedAnalytics] = None
        self.heatmap = SpatialHeatmapAccumulator(grid_width=64, grid_height=36)

        self._setup_modules()

    def _setup_modules(self):
        rois = self.config.get("rois", [])
        for roi in rois:
            roi_type = roi.get("type", "restricted_zone")
            coords = roi.get("points", [])
            name = roi.get("name", "Zone")
            roi_id = roi.get("id", "roi-1")

            if roi_type == "restricted_zone" or roi_type == "intrusion":
                self.zone_analyzers.append(ZoneAnalytics(
                    zone_id=roi_id,
                    zone_name=name,
                    polygon_coords=coords,
                    alert_classes=roi.get("alert_on_classes")
                ))
            elif roi_type == "ppe_inspection":
                self.ppe_analyzer = PPESafetyAnalytics(
                    zone_id=roi_id,
                    zone_name=name,
                    polygon_coords=coords,
                    required_ppe=roi.get("required_ppe")
                )

        tripwires = self.config.get("tripwires", [])
        for tw in tripwires:
            self.line_analyzers.append(LineCrossingAnalytics(
                line_id=tw.get("id", "tw-1"),
                line_name=tw.get("name", "Tripwire"),
                line_coords=tw.get("line", [[100, 200], [500, 200]]),
                target_classes=tw.get("target_classes")
            ))

        # Defaults if not explicitly defined
        if not self.ppe_analyzer:
            self.ppe_analyzer = PPESafetyAnalytics(zone_id="ppe-default", zone_name="Facility Floor")
        if not self.speed_analyzer:
            self.speed_analyzer = SpeedAnalytics(zone_id="speed-default", zone_name="Roadway")
        if not self.crowd_analyzer:
            self.crowd_analyzer = CrowdAnalytics(zone_id="crowd-default", zone_name="Perimeter Area", max_threshold=8)

    def process(self, tracks: List[STrack], detections: List[Detection]) -> List[Dict[str, Any]]:
        events: List[Dict[str, Any]] = []

        # Update heatmap
        self.heatmap.update(tracks)

        # 1. Zone intrusion checks
        for za in self.zone_analyzers:
            for ev in za.update(tracks):
                ev["camera_id"] = self.camera_id
                events.append(ev)

        # 2. Line crossing checks
        for la in self.line_analyzers:
            for ev in la.update(tracks):
                ev["camera_id"] = self.camera_id
                events.append(ev)

        # 3. PPE Safety inspection
        if self.ppe_analyzer:
            for ev in self.ppe_analyzer.update(tracks, detections):
                ev["camera_id"] = self.camera_id
                events.append(ev)

        # 4. Speed estimation & overspeed
        if self.speed_analyzer:
            for ev in self.speed_analyzer.update(tracks):
                ev["camera_id"] = self.camera_id
                events.append(ev)

        # 5. Crowd density
        if self.crowd_analyzer:
            for ev in self.crowd_analyzer.update(tracks):
                ev["camera_id"] = self.camera_id
                events.append(ev)

        return events
