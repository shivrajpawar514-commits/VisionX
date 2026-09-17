import time
import math
import numpy as np
try:
    import cv2
except ImportError:
    cv2 = None

class SyntheticStreamGenerator:
    """Generates a realistic synthetic test video feed with animated pedestrians, vehicles, and zones."""
    
    def __init__(self, camera_id: str, width: int = 1280, height: int = 720, fps: int = 25):
        self.camera_id = camera_id
        self.width = width
        self.height = height
        self.fps = fps
        self.frame_index = 0
        self.start_time = time.time()

        # Simulated entities
        self.entities = [
            {"type": "worker_compliant", "x": 350.0, "y": 300.0, "vx": 1.2, "vy": 0.8, "w": 60, "h": 140, "helmet": True, "vest": True},
            {"type": "worker_violating", "x": 750.0, "y": 380.0, "vx": -1.0, "vy": 0.5, "w": 60, "h": 140, "helmet": False, "vest": False},
            {"type": "vehicle_fast", "x": 100.0, "y": 520.0, "vx": 4.5, "vy": 0.0, "w": 180, "h": 90, "speed": 45.0},
            {"type": "vehicle_normal", "x": 900.0, "y": 540.0, "vx": -2.2, "vy": 0.0, "w": 170, "h": 85, "speed": 24.0},
            {"type": "visitor", "x": 480.0, "y": 420.0, "vx": 0.4, "vy": -0.6, "w": 55, "h": 135, "helmet": True, "vest": False}
        ]

    def read_frame(self) -> np.ndarray:
        """Render a single synthesized frame with dark industrial background."""
        self.frame_index += 1
        t = self.frame_index / self.fps

        # Create dark control-room style background
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        frame[:, :, 0] = 18 # Dark Navy Blue
        frame[:, :, 1] = 22
        frame[:, :, 2] = 28

        if cv2 is not None:
            # Draw grid lines for perspective
            for y in range(100, self.height, 80):
                cv2.line(frame, (0, y), (self.width, y), (30, 36, 44), 1)
            for x in range(100, self.width, 100):
                cv2.line(frame, (x, 0), (x, self.height), (30, 36, 44), 1)

            # Draw simulated factory / road zones
            pts_restricted = np.array([[100, 200], [500, 200], [550, 650], [50, 650]], np.int32)
            cv2.polylines(frame, [pts_restricted], isClosed=True, color=(50, 50, 220), thickness=2)
            cv2.putText(frame, "RESTRICTED ZONE (ROI-01)", (110, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 255), 1)

            # Tripwire line
            cv2.line(frame, (200, 450), (700, 450), (255, 180, 50), 2)
            cv2.putText(frame, "TRIPWIRE ENTRY #1", (210, 440), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 180, 50), 1)

        # Update and draw entities
        for e in self.entities:
            # Move entities
            e["x"] += e["vx"]
            e["y"] += e["vy"]

            # Boundary bounce
            if e["x"] < 50 or e["x"] + e["w"] > self.width - 50:
                e["vx"] *= -1
            if e["y"] < 150 or e["y"] + e["h"] > self.height - 50:
                e["vy"] *= -1

            x, y, w, h = int(e["x"]), int(e["y"]), int(e["w"]), int(e["h"])

            if cv2 is not None:
                if "vehicle" in e["type"]:
                    color = (240, 140, 60) if e.get("speed", 0) > 35 else (80, 200, 120)
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                    cv2.rectangle(frame, (x, y - 22), (x + 110, y), color, -1)
                    speed_str = f"Car: {e.get('speed', 25):.1f} km/h"
                    cv2.putText(frame, speed_str, (x + 4, y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
                else:
                    is_compliant = e.get("helmet", False) and e.get("vest", False)
                    color = (80, 220, 140) if is_compliant else (60, 60, 240)
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                    tag = "Person: Safe" if is_compliant else "Person: NO PPE"
                    cv2.rectangle(frame, (x, y - 20), (x + 120, y), color, -1)
                    cv2.putText(frame, tag, (x + 4, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

        if cv2 is not None:
            # Add timestamp and telemetry HUD overlay
            timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, f"VISIONX AI ENGINE - {self.camera_id.upper()} | {timestamp_str}", (20, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (61, 220, 151), 2)
            cv2.putText(frame, f"FPS: {self.fps} | RES: {self.width}x{self.height} | STREAM: LIVE", (20, 65),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160, 170, 185), 1)

        return frame
