import time
from typing import List, Dict, Any, Optional, Tuple
from shapely.geometry import LineString
from src.tracking.track import STrack

class LineCrossingAnalytics:
    """Tripwire analytics with bidirectional line crossing counting (Inbound / Outbound)."""

    def __init__(self, line_id: str, line_name: str, line_coords: List[List[float]], target_classes: Optional[List[str]] = None):
        self.line_id = line_id
        self.line_name = line_name
        self.line = LineString(line_coords)
        self.p1 = line_coords[0]
        self.p2 = line_coords[1]
        self.target_classes = target_classes or ["person", "car", "truck"]

        self.in_count = 0
        self.out_count = 0
        self.total_count = 0
        self.crossed_tracks = set()

    def _get_side(self, pt: Tuple[float, float]) -> float:
        # Cross product to determine side of line
        return (self.p2[0] - self.p1[0]) * (pt[1] - self.p1[1]) - (self.p2[1] - self.p1[1]) * (pt[0] - self.p1[0])

    def update(self, tracks: List[STrack]) -> List[Dict[str, Any]]:
        events = []

        for track in tracks:
            if track.class_name not in self.target_classes:
                continue

            if len(track.trajectory) < 2:
                continue

            prev_pt = (track.trajectory[-2][0], track.trajectory[-2][1])
            curr_pt = (track.trajectory[-1][0], track.trajectory[-1][1])
            traj_seg = LineString([prev_pt, curr_pt])

            if self.line.intersects(traj_seg):
                if track.track_id not in self.crossed_tracks:
                    self.crossed_tracks.add(track.track_id)
                    side_prev = self._get_side(prev_pt)
                    side_curr = self._get_side(curr_pt)

                    direction = "inbound" if side_curr > side_prev else "outbound"
                    if direction == "inbound":
                        self.in_count += 1
                    else:
                        self.out_count += 1
                    self.total_count += 1

                    event = {
                        "event_type": "line_crossing",
                        "line_id": self.line_id,
                        "line_name": self.line_name,
                        "track_id": track.track_id,
                        "class_name": track.class_name,
                        "direction": direction,
                        "in_count": self.in_count,
                        "out_count": self.out_count,
                        "total_count": self.total_count,
                        "severity": "INFO",
                        "description": f"Line crossing: {track.class_name.capitalize()} #{track.track_id} crossed {self.line_name} ({direction.upper()})"
                    }
                    events.append(event)

        return events
