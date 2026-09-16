import queue
import time
from typing import Optional, Tuple, Any
import numpy as np

class FrameBuffer:
    """Thread-safe frame buffer with drop-oldest policy to prevent pipeline latency accumulation."""
    
    def __init__(self, maxsize: int = 5):
        self.maxsize = maxsize
        self._queue = queue.Queue(maxsize=maxsize)
        self.dropped_frames = 0
        self.total_frames = 0

    def put(self, frame: np.ndarray, timestamp: Optional[float] = None, metadata: Optional[dict] = None) -> bool:
        if timestamp is None:
            timestamp = time.time()
        
        self.total_frames += 1
        item = (frame, timestamp, metadata or {})

        if self._queue.full():
            try:
                self._queue.get_nowait()
                self.dropped_frames += 1
            except queue.Empty:
                pass
        
        try:
            self._queue.put_nowait(item)
            return True
        except queue.Full:
            self.dropped_frames += 1
            return False

    def get(self, timeout: Optional[float] = 1.0) -> Optional[Tuple[np.ndarray, float, dict]]:
        try:
            return self._queue.get(timeout=timeout)
        except queue.Empty:
            return None

    def clear(self):
        with self._queue.mutex:
            self._queue.queue.clear()

    @property
    def size(self) -> int:
        return self._queue.qsize()

    @property
    def drop_rate(self) -> float:
        if self.total_frames == 0:
            return 0.0
        return (self.dropped_frames / self.total_frames) * 100.0
