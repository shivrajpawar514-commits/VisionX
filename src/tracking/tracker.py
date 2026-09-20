from typing import List, Dict, Any, Tuple
import numpy as np
from src.detection.schemas import Detection
from src.tracking.track import STrack, TrackState
from src.tracking.kalman_filter import KalmanFilter
from src.tracking.matching import iou_distance, linear_assignment
from src.tracking.trajectory import TrajectoryAnalyzer

class ByteTracker:
    """Production ByteTrack implementation for multi-object tracking with persistent IDs."""

    def __init__(
        self,
        track_thresh: float = 0.5,
        match_thresh: float = 0.8,
        track_buffer: int = 30,
        frame_rate: int = 30
    ):
        self.track_thresh = track_thresh
        self.match_thresh = match_thresh
        self.track_buffer = track_buffer
        self.frame_rate = frame_rate

        self.tracked_stracks: List[STrack] = []
        self.lost_stracks: List[STrack] = []
        self.removed_stracks: List[STrack] = []

        self.frame_id = 0
        self.kalman_filter = KalmanFilter()
        self.max_time_lost = int(frame_rate / 30.0 * track_buffer)

    def update(self, detections: List[Detection]) -> List[STrack]:
        self.frame_id += 1
        activated_stracks: List[STrack] = []
        refind_stracks: List[STrack] = []
        lost_stracks: List[STrack] = []
        removed_stracks: List[STrack] = []

        # Convert detections to STrack
        det_stracks: List[STrack] = []
        for det in detections:
            x1, y1, x2, y2 = det.bbox.x1, det.bbox.y1, det.bbox.x2, det.bbox.y2
            tlwh = np.array([x1, y1, x2 - x1, y2 - y1], dtype=np.float32)
            det_stracks.append(STrack(tlwh, det.confidence, det.class_id, det.class_name, det.attributes))

        # Split detections by score threshold
        dets_high = [d for d in det_stracks if d.score >= self.track_thresh]
        dets_low = [d for d in det_stracks if d.score < self.track_thresh]

        # Step 1: Predict current locations of existing tracks with Kalman filter
        unconfirmed = [t for t in self.tracked_stracks if not t.is_activated]
        tracked_stracks = [t for t in self.tracked_stracks if t.is_activated]

        strack_pool = joint_stracks(tracked_stracks, self.lost_stracks)
        for track in strack_pool:
            track.predict()

        # Step 2: First association with high score detections
        dists = iou_distance(strack_pool, dets_high)
        matches, u_track, u_detection = linear_assignment(dists, thresh=self.match_thresh)

        for itracked, idet in matches:
            track = strack_pool[itracked]
            det = dets_high[idet]
            if track.state == TrackState.Tracked:
                track.update(det, self.frame_id)
                activated_stracks.append(track)
            else:
                track.re_activate(det, self.frame_id, new_id=False)
                refind_stracks.append(track)

        # Step 3: Second association with low score detections
        r_tracked_stracks = [strack_pool[i] for i in u_track if strack_pool[i].state == TrackState.Tracked]
        dists = iou_distance(r_tracked_stracks, dets_low)
        matches, u_track_low, u_det_low = linear_assignment(dists, thresh=0.5)

        for itracked, idet in matches:
            track = r_tracked_stracks[itracked]
            det = dets_low[idet]
            if track.state == TrackState.Tracked:
                track.update(det, self.frame_id)
                activated_stracks.append(track)
            else:
                track.re_activate(det, self.frame_id, new_id=False)
                refind_stracks.append(track)

        for it in u_track_low:
            track = r_tracked_stracks[it]
            if track.state != TrackState.Lost:
                track.mark_lost()
                lost_stracks.append(track)

        # Step 4: Deal with unconfirmed tracks
        detections_high_remain = [dets_high[i] for i in u_detection]
        dists = iou_distance(unconfirmed, detections_high_remain)
        matches, u_unconfirmed, u_detection_unconf = linear_assignment(dists, thresh=0.7)

        for itracked, idet in matches:
            unconfirmed[itracked].update(detections_high_remain[idet], self.frame_id)
            activated_stracks.append(unconfirmed[itracked])

        for it in u_unconfirmed:
            track = unconfirmed[it]
            track.mark_removed()
            removed_stracks.append(track)

        # Step 5: Init new tracks
        for inew in u_detection_unconf:
            track = detections_high_remain[inew]
            if track.score >= self.track_thresh:
                track.activate(self.kalman_filter, self.frame_id)
                activated_stracks.append(track)

        # Step 6: Update track pools
        for track in self.lost_stracks:
            if self.frame_id - track.frame_id > self.max_time_lost:
                track.mark_removed()
                removed_stracks.append(track)

        self.tracked_stracks = [t for t in self.tracked_stracks if t.state == TrackState.Tracked]
        self.tracked_stracks = joint_stracks(self.tracked_stracks, activated_stracks)
        self.tracked_stracks = joint_stracks(self.tracked_stracks, refind_stracks)
        self.lost_stracks = sub_stracks(self.lost_stracks, self.tracked_stracks)
        self.lost_stracks.extend(lost_stracks)
        self.lost_stracks = sub_stracks(self.lost_stracks, self.removed_stracks)
        self.removed_stracks.extend(removed_stracks)
        self.tracked_stracks, self.lost_stracks = remove_duplicate_stracks(self.tracked_stracks, self.lost_stracks)

        # Attach velocity and trajectory analytics
        output_tracks = [t for t in self.tracked_stracks if t.is_activated]
        for t in output_tracks:
            vx, vy, spd = TrajectoryAnalyzer.calculate_velocity(t.trajectory)
            t.attributes["velocity_x"] = round(vx, 2)
            t.attributes["velocity_y"] = round(vy, 2)
            t.attributes["dwell_sec"] = round(t.dwell_time, 1)

        return output_tracks

def joint_stracks(tlista: List[STrack], tlistb: List[STrack]) -> List[STrack]:
    exists = {}
    res = []
    for t in tlista:
        exists[t.track_id] = 1
        res.append(t)
    for t in tlistb:
        if t.track_id not in exists:
            exists[t.track_id] = 1
            res.append(t)
    return res

def sub_stracks(tlista: List[STrack], tlistb: List[STrack]) -> List[STrack]:
    stracks = {t.track_id: t for t in tlista}
    for t in tlistb:
        if t.track_id in stracks:
            del stracks[t.track_id]
    return list(stracks.values())

def remove_duplicate_stracks(s_a: List[STrack], s_b: List[STrack]) -> Tuple[List[STrack], List[STrack]]:
    pdist = iou_distance(s_a, s_b)
    pairs = np.where(pdist < 0.15)
    dup_a, dup_b = set(), set()
    for p, q in zip(*pairs):
        time_a = s_a[p].frame_id - s_a[p].start_frame
        time_b = s_b[q].frame_id - s_b[q].start_frame
        if time_a > time_b:
            dup_b.add(q)
        else:
            dup_a.add(p)
    res_a = [s_a[i] for i in range(len(s_a)) if i not in dup_a]
    res_b = [s_b[i] for i in range(len(s_b)) if i not in dup_b]
    return res_a, res_b
