import time
from typing import List, Dict, Any, Optional
from shapely.geometry import Point, Polygon
from src.tracking.track import STrack

class ZoneAnalytics:
    """Detects restricted-zone intrusions and tracks dwell time within polygon regions."""

    def __init__(self, zone_id: str, zone_name: str, polygon_coords: List[List[float]], alert_classes: Optional[List[str]] = None, dwell_grace_sec: float = 1.0):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.polygon = Polygon(polygon_coords)
        self.alert_classes = alert_classes or ["person", "car", "truck"]
        self.dwell_grace_sec = dwell_grace_sec
        self.track_entry_times: Dict[int, float] = {}
        self.active_intrusions: Dict[int, Dict[str, Any]] = {}

    def update(self, tracks: List[STrack]) -> List[Dict[str, Any]]:
        events = []
        current_track_ids = set()
        now = time.time()

        for track in tracks:
            if track.class_name not in self.alert_classes:
                continue

            cx, cy = track.center
            point = Point(cx, cy)
            is_inside = self.polygon.contains(point)

            if is_inside:
                current_track_ids.add(track.track_id)
                if track.track_id not in self.track_entry_times:
                    self.track_entry_times[track.track_id] = now

                dwell = now - self.track_entry_times[track.track_id]

                # Trigger intrusion event once grace period is passed
                if dwell >= self.dwell_grace_sec and track.track_id not in self.active_intrusions:
                    event = {
                        "event_type": "restricted_zone_intrusion",
                        "zone_id": self.zone_id,
                        "zone_name": self.zone_name,
                        "track_id": track.track_id,
                        "class_name": track.class_name,
                        "dwell_time": round(dwell, 1),
                        "position": [round(cx, 1), round(cy, 1)],
                        "severity": "CRITICAL" if track.class_name == "person" else "WARNING",
                        "description": f"Intrusion detected: {track.class_name.capitalize()} (ID #{track.track_id}) inside restricted {self.zone_name}"
                    }
                    self.active_intrusions[track.track_id] = event
                    events.append(event)
            else:
                if track.track_id in self.track_entry_times:
                    del self.track_entry_times[track.track_id]
                if track.track_id in self.active_intrusions:
                    del self.active_intrusions[track.track_id]

        # Cleanup lost tracks
        for tid in list(self.track_entry_times.keys()):
            if tid not in current_track_ids:
                del self.track_entry_times[tid]
                if tid in self.active_intrusions:
                    del self.active_intrusions[tid]

        return events
