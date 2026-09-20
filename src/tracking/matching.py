from typing import List, Tuple
import numpy as np

def bbox_ious(atlbrs: np.ndarray, btlbrs: np.ndarray) -> np.ndarray:
    """Compute pairwise Intersection-over-Union (IoU) between two sets of bounding boxes."""
    ious = np.zeros((len(atlbrs), len(btlbrs)), dtype=np.float32)
    if len(atlbrs) == 0 or len(btlbrs) == 0:
        return ious

    for i, a in enumerate(atlbrs):
        for j, b in enumerate(btlbrs):
            x1 = max(a[0], b[0])
            y1 = max(a[1], b[1])
            x2 = min(a[2], b[2])
            y2 = min(a[3], b[3])

            w = max(0.0, x2 - x1)
            h = max(0.0, y2 - y1)
            inter = w * h

            area_a = max(0.0, a[2] - a[0]) * max(0.0, a[3] - a[1])
            area_b = max(0.0, b[2] - b[0]) * max(0.0, b[3] - b[1])
            union = area_a + area_b - inter

            ious[i, j] = inter / union if union > 0 else 0.0

    return ious

def iou_distance(atracks: list, btracks: list) -> np.ndarray:
    """Compute cost matrix as 1.0 - IoU."""
    if len(atracks) == 0 or len(btracks) == 0:
        return np.zeros((len(atracks), len(btracks)), dtype=np.float32)

    atlbrs = np.array([t.tlbr for t in atracks])
    btlbrs = np.array([t.tlbr for t in btracks])
    _ious = bbox_ious(atlbrs, btlbrs)
    cost_matrix = 1.0 - _ious
    return cost_matrix

def linear_assignment(cost_matrix: np.ndarray, thresh: float) -> Tuple[List[Tuple[int, int]], List[int], List[int]]:
    """Solve linear assignment using scipy Hungarian algorithm or greedy fallback."""
    if cost_matrix.size == 0:
        return [], list(range(cost_matrix.shape[0])), list(range(cost_matrix.shape[1]))

    try:
        from scipy.optimize import linear_sum_assignment
        x, y = linear_sum_assignment(cost_matrix)
        matches, unmatched_a, unmatched_b = [], [], []

        for row, col in zip(x, y):
            if cost_matrix[row, col] <= thresh:
                matches.append((row, col))
            else:
                unmatched_a.append(row)
                unmatched_b.append(col)

        for i in range(cost_matrix.shape[0]):
            if i not in x:
                unmatched_a.append(i)
        for j in range(cost_matrix.shape[1]):
            if j not in y:
                unmatched_b.append(j)

        return matches, unmatched_a, unmatched_b

    except Exception:
        # Simple greedy assignment fallback
        matches = []
        unmatched_a = list(range(cost_matrix.shape[0]))
        unmatched_b = list(range(cost_matrix.shape[1]))

        flat_indices = np.argsort(cost_matrix.flatten())
        for idx in flat_indices:
            r = idx // cost_matrix.shape[1]
            c = idx % cost_matrix.shape[1]
            if cost_matrix[r, c] > thresh:
                break
            if r in unmatched_a and c in unmatched_b:
                matches.append((r, c))
                unmatched_a.remove(r)
                unmatched_b.remove(c)

        return matches, unmatched_a, unmatched_b
