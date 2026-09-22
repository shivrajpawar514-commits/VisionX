import numpy as np
from typing import List, Tuple, Dict, Any
from src.tracking.track import STrack

class SpatialHeatmapAccumulator:
    """Accumulates spatial dwell and traffic density into a 2D grid matrix with Gaussian smoothing."""

    def __init__(self, grid_width: int = 64, grid_height: int = 36, frame_width: int = 1280, frame_height: int = 720, decay_rate: float = 0.995):
        self.gw = grid_width
        self.gh = grid_height
        self.fw = frame_width
        self.fh = frame_height
        self.decay_rate = decay_rate
        self.grid = np.zeros((self.gh, self.gw), dtype=np.float32)

    def update(self, tracks: List[STrack]):
        # Apply slight temporal decay
        self.grid *= self.decay_rate

        for track in tracks:
            cx, cy = track.center
            gx = int((cx / self.fw) * self.gw)
            gy = int((cy / self.fh) * self.gh)

            if 0 <= gx < self.gw and 0 <= gy < self.gh:
                # Add Gaussian splat
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        nx, ny = gx + dx, gy + dy
                        if 0 <= nx < self.gw and 0 <= ny < self.gh:
                            dist_sq = dx * dx + dy * dy
                            weight = np.exp(-dist_sq / 2.0)
                            self.grid[ny, nx] += weight * 0.1

    def get_normalized_grid(self) -> List[List[float]]:
        max_val = np.max(self.grid)
        if max_val > 0:
            norm = (self.grid / max_val)
        else:
            norm = self.grid
        return np.round(norm, 3).tolist()

    def get_peak_density_zones(self) -> List[Dict[str, Any]]:
        # Identify top 3 peak coordinates
        flat_indices = np.argsort(self.grid.flatten())[::-1][:3]
        peaks = []
        for idx in flat_indices:
            r = idx // self.gw
            c = idx % self.gw
            val = float(self.grid[r, c])
            if val > 0.5:
                peaks.append({
                    "grid_x": int(c),
                    "grid_y": int(r),
                    "frame_x": int((c / self.gw) * self.fw),
                    "frame_y": int((r / self.gh) * self.fh),
                    "density_score": round(val, 2)
                })
        return peaks
