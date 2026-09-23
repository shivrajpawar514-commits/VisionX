import time
from typing import List, Dict, Any, Optional
from shapely.geometry import Point, Polygon
from src.tracking.track import STrack

class SpeedAnalytics:
    """Vehicle speed estimation and overspeed violation trigger."""

    def __init__(self, zone_id: str, zone_name: str, speed_limit_kmh: float = 30.0, pixels_per_meter: float = 25.0):
        self.zone_id = zone_id
        self.zone_name = zone_name
        self.speed_limit_kmh = speed_limit_kmh
        self.pixels_per_meter = pixels_per_meter
        self.alerted_overspeed = set()

    def update(self, tracks: List[STrack]) -> List[Dict[str, Any]]:
        events = []

        for track in tracks:
            if track.class_name not in ["car", "truck", "bus", "motorcycle"]:
                continue

            # Check explicit speed attribute or estimate from trajectory
            speed_kmh = track.attributes.get("speed_kmh")
            if speed_kmh is None and len(track.trajectory) >= 3:
                # Calculate metric velocity
                dx = track.trajectory[-1][0] - track.trajectory[-3][0]
                dy = track.trajectory[-1][1] - track.trajectory[-3][1]
                dt = track.trajectory[-1][2] - track.trajectory[-3][2]
                if dt > 0.05:
                    dist_px = (dx**2 + dy**2)**0.5
                    dist_meters = dist_px / self.pixels_per_meter
                    speed_mps = dist_meters / dt
                    speed_kmh = speed_mps * 3.6
                    track.attributes["speed_kmh"] = round(speed_kmh, 1)

            if speed_kmh and speed_kmh > self.speed_limit_kmh:
                if track.track_id not in self.alerted_overspeed:
                    self.alerted_overspeed.add(track.track_id)
                    events.append({
                        "event_type": "overspeed_violation",
                        "zone_id": self.zone_id,
                        "zone_name": self.zone_name,
                        "track_id": track.track_id,
                        "class_name": track.class_name,
                        "speed_kmh": round(speed_kmh, 1),
                        "speed_limit_kmh": self.speed_limit_kmh,
                        "severity": "WARNING" if speed_kmh < self.speed_limit_kmh * 1.3 else "CRITICAL",
                        "description": f"Overspeed: {track.class_name.capitalize()} #{track.track_id} clocked at {speed_kmh:.1f} km/h (Limit: {self.speed_limit_kmh} km/h)"
                    })

        return events
