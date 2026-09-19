import math
from typing import List, Tuple, Optional
import numpy as np

class TrajectoryAnalyzer:
    """Computes directional vectors, historical path smoothing, speed, and zone transit angles."""

    @staticmethod
    def calculate_velocity(trajectory: List[Tuple[float, float, float]], window: int = 5) -> Tuple[float, float, float]:
        """Returns (vx, vy, speed_px_per_sec)."""
        if len(trajectory) < 2:
            return 0.0, 0.0, 0.0

        pts = trajectory[-window:]
        p_start = pts[0]
        p_end = pts[-1]

        dt = p_end[2] - p_start[2]
        if dt <= 1e-4:
            return 0.0, 0.0, 0.0

        dx = p_end[0] - p_start[0]
        dy = p_end[1] - p_start[1]
        vx = dx / dt
        vy = dy / dt
        speed = math.sqrt(vx * vx + vy * vy)
        return vx, vy, speed

    @staticmethod
    def calculate_heading_angle(vx: float, vy: float) -> float:
        """Returns heading in degrees (0 to 360)."""
        angle = math.degrees(math.atan2(vy, vx))
        if angle < 0:
            angle += 360.0
        return angle
