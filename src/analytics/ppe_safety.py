import time
from typing import List, Dict, Any, Optional
from shapely.geometry import Point, Polygon
from src.detection.schemas import Detection
from src.tracking.track import STrack

class PPESafetyAnalytics:
    """PPE and workplace safety intelligence checking person + helmet/vest compliance."""

    def __init__(self, zone_id: str, zone_name: str, polygon_coords: Optional[List[List[float]]] = None, required_ppe: Optional[List[str]] = None, cooldown_sec: float = 5.0):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.polygon = Polygon(polygon_coords) if polygon_coords else None
        self.required_ppe = required_ppe or ["helmet", "safety_vest"]
        self.cooldown_sec = cooldown_sec
        self.last_violation_time: Dict[int, float] = {}

    def update(self, tracks: List[STrack], all_detections: Optional[List[Detection]] = None) -> List[Dict[str, Any]]:
        events = []
        now = time.time()

        for track in tracks:
            if track.class_name != "person":
                continue

            cx, cy = track.center
            if self.polygon and not self.polygon.contains(Point(cx, cy)):
                continue

            # Check attributes or sub-detections
            has_helmet = track.attributes.get("has_helmet", False)
            has_vest = track.attributes.get("has_vest", False)

            # Check if all detections contain explicit no-helmet or no-vest overlapping with track
            missing = []
            if "helmet" in self.required_ppe and not has_helmet:
                missing.append("hard hat / helmet")
            if "safety_vest" in self.required_ppe and not has_vest:
                missing.append("high-vis safety vest")

            if missing:
                last_time = self.last_violation_time.get(track.track_id, 0.0)
                if now - last_time >= self.cooldown_sec:
                    self.last_violation_time[track.track_id] = now
                    missing_str = " & ".join(missing)
                    events.append({
                        "event_type": "ppe_safety_violation",
                        "zone_id": self.zone_id,
                        "zone_name": self.zone_name,
                        "track_id": track.track_id,
                        "class_name": "person",
                        "missing_ppe": missing,
                        "severity": "CRITICAL",
                        "description": f"PPE Violation: Worker #{track.track_id} missing {missing_str} in {self.zone_name}"
                    })

        return events
