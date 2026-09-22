import time
from typing import List, Dict, Any, Optional
from shapely.geometry import Point, Polygon
from src.tracking.track import STrack

class CrowdAnalytics:
    """Monitors crowd count and triggers high-density alerts."""

    def __init__(self, zone_id: str, zone_name: str, polygon_coords: Optional[List[List[float]]] = None, max_threshold: int = 8, alert_cooldown_sec: float = 10.0):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.polygon = Polygon(polygon_coords) if polygon_coords else None
        self.max_threshold = max_threshold
        self.alert_cooldown_sec = alert_cooldown_sec
        self.last_alert_time = 0.0

    def update(self, tracks: List[STrack]) -> List[Dict[str, Any]]:
        events = []
        now = time.time()

        count = 0
        for track in tracks:
            if track.class_name == "person":
                if self.polygon is None:
                    count += 1
                else:
                    cx, cy = track.center
                    if self.polygon.contains(Point(cx, cy)):
                        count += 1

        if count >= self.max_threshold and (now - self.last_alert_time >= self.alert_cooldown_sec):
            self.last_alert_time = now
            events.append({
                "event_type": "crowd_density_alert",
                "zone_id": self.zone_id,
                "zone_name": self.zone_name,
                "crowd_count": count,
                "threshold": self.max_threshold,
                "severity": "WARNING",
                "description": f"High crowd density detected: {count} persons in {self.zone_name} (Threshold: {self.max_threshold})"
            })

        return events
