import time
from typing import List, Dict, Any, Optional
from shapely.geometry import Point, Polygon
from src.tracking.track import STrack

class LoiteringAnalytics:
    """Loitering and dwell-time violation detector."""

    def __init__(self, zone_id: str, zone_name: str, polygon_coords: List[List[float]], threshold_sec: float = 10.0):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.polygon = Polygon(polygon_coords)
        self.threshold_sec = threshold_sec
        self.dwell_tracker: Dict[int, float] = {}
        self.alerted_tracks = set()

    def update(self, tracks: List[STrack]) -> List[Dict[str, Any]]:
        events = []
        now = time.time()
        active_ids = set()

        for track in tracks:
            cx, cy = track.center
            if self.polygon.contains(Point(cx, cy)):
                active_ids.add(track.track_id)
                if track.track_id not in self.dwell_tracker:
                    self.dwell_tracker[track.track_id] = now

                dwell = now - self.dwell_tracker[track.track_id]
                if dwell >= self.threshold_sec and track.track_id not in self.alerted_tracks:
                    self.alerted_tracks.add(track.track_id)
                    events.append({
                        "event_type": "loitering_alert",
                        "zone_id": self.zone_id,
                        "zone_name": self.zone_name,
                        "track_id": track.track_id,
                        "class_name": track.class_name,
                        "dwell_time": round(dwell, 1),
                        "severity": "WARNING",
                        "description": f"Loitering alert: {track.class_name.capitalize()} #{track.track_id} stationary for {dwell:.1f}s in {self.zone_name}"
                    })

        for tid in list(self.dwell_tracker.keys()):
            if tid not in active_ids:
                del self.dwell_tracker[tid]
                self.alerted_tracks.discard(tid)

        return events
