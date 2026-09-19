import time
from typing import List, Tuple, Optional, Dict, Any
from enum import Enum
import numpy as np
from src.tracking.kalman_filter import KalmanFilter

class TrackState(Enum):
    New = 0
    Tracked = 1
    Lost = 2
    Removed = 3

class STrack:
    """Single-target tracking state representation with trajectory memory."""
    shared_kalman = KalmanFilter()
    _count = 0

    def __init__(self, tlwh: np.ndarray, score: float, class_id: int, class_name: str, attributes: Optional[Dict[str, Any]] = None):
        self._tlwh = np.asarray(tlwh, dtype=np.float32)
        self.score = score
        self.class_id = class_id
        self.class_name = class_name
        self.attributes = attributes or {}

        self.kalman_filter = None
        self.mean = None
        self.covariance = None
        self.is_activated = False

        self.track_id = 0
        self.state = TrackState.New
        self.frame_id = 0
        self.start_frame = 0
        self.start_time = time.time()
        self.last_update_time = time.time()
        self.trajectory: List[Tuple[float, float, float]] = [] # (cx, cy, timestamp)

    @classmethod
    def next_id(cls) -> int:
        cls._count += 1
        return cls._count

    @property
    def tlwh(self) -> np.ndarray:
        if self.mean is None:
            return self._tlwh.copy()
        ret = self.mean[:4].copy()
        ret[2] *= ret[3]
        ret[:2] -= ret[2:] / 2
        return ret

    @property
    def tlbr(self) -> np.ndarray:
        ret = self.tlwh
        ret[2:] += ret[:2]
        return ret

    @property
    def center(self) -> Tuple[float, float]:
        box = self.tlbr
        return ((box[0] + box[2]) / 2.0, (box[1] + box[3]) / 2.0)

    @property
    def dwell_time(self) -> float:
        return time.time() - self.start_time

    def activate(self, kalman_filter: KalmanFilter, frame_id: int):
        self.kalman_filter = kalman_filter
        self.track_id = self.next_id()
        self.mean, self.covariance = self.kalman_filter.initiate(self.tlwh_to_xyah(self._tlwh))

        self.frame_id = frame_id
        self.start_frame = frame_id
        self.state = TrackState.Tracked
        self.is_activated = True
        cx, cy = self.center
        self.trajectory.append((cx, cy, time.time()))

    def re_activate(self, new_track: 'STrack', frame_id: int, new_id: bool = False):
        self.mean, self.covariance = self.kalman_filter.update(
            self.mean, self.covariance, self.tlwh_to_xyah(new_track.tlwh)
        )
        self.frame_id = frame_id
        self.state = TrackState.Tracked
        self.is_activated = True
        self.score = new_track.score
        self.attributes.update(new_track.attributes)
        self.last_update_time = time.time()
        if new_id:
            self.track_id = self.next_id()
        cx, cy = self.center
        self.trajectory.append((cx, cy, time.time()))
        if len(self.trajectory) > 100:
            self.trajectory.pop(0)

    def update(self, new_track: 'STrack', frame_id: int):
        self.frame_id = frame_id
        self.mean, self.covariance = self.kalman_filter.update(
            self.mean, self.covariance, self.tlwh_to_xyah(new_track.tlwh)
        )
        self.state = TrackState.Tracked
        self.is_activated = True
        self.score = new_track.score
        self.attributes.update(new_track.attributes)
        self.last_update_time = time.time()
        cx, cy = self.center
        self.trajectory.append((cx, cy, time.time()))
        if len(self.trajectory) > 100:
            self.trajectory.pop(0)

    def predict(self):
        if self.state != TrackState.Tracked:
            self.mean[7] = 0
        self.mean, self.covariance = self.kalman_filter.predict(self.mean, self.covariance)

    def mark_lost(self):
        self.state = TrackState.Lost

    def mark_removed(self):
        self.state = TrackState.Removed

    @staticmethod
    def tlwh_to_xyah(tlwh: np.ndarray) -> np.ndarray:
        ret = np.asarray(tlwh).copy()
        ret[:2] += ret[2:] / 2
        ret[2] /= ret[3]
        return ret
