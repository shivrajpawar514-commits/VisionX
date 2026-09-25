#!/usr/bin/env python3
"""Seed VisionX database with cameras, historical events, violations, and telemetry."""

import asyncio
import time
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.session import init_db, AsyncSessionLocal
from src.database.models import CameraModel, EventModel, DetectionLogModel
import src.database.crud as crud

async def seed():
    print("=== Seeding VisionX Database ===")
    await init_db()

    cameras_data = [
        {
            "id": "cam-main-gate",
            "name": "Main Entrance Gate",
            "source": "synthetic",
            "location": "Zone A - Perimeter",
            "target_fps": 25,
            "enabled": True,
            "model_id": "yolov8m-general",
            "rois": [
                {
                    "id": "roi-restricted-gate",
                    "name": "Restricted Vehicle Path",
                    "type": "restricted_zone",
                    "points": [[100, 200], [500, 200], [550, 650], [50, 650]],
                    "alert_on_classes": ["person", "car", "truck"]
                }
            ],
            "tripwires": [
                {
                    "id": "tripwire-entry",
                    "name": "Gate Inbound Counter",
                    "line": [[200, 450], [700, 450]],
                    "direction": "inbound",
                    "target_classes": ["person", "car"]
                }
            ]
        },
        {
            "id": "cam-warehouse",
            "name": "Warehouse Loading Bay",
            "source": "synthetic",
            "location": "Zone B - Logistics",
            "target_fps": 20,
            "enabled": True,
            "model_id": "yolov8s-ppe",
            "rois": [
                {
                    "id": "roi-hazard-zone",
                    "name": "Forklift Active Zone",
                    "type": "ppe_inspection",
                    "points": [[250, 150], [900, 150], [950, 600], [200, 600]],
                    "alert_on_classes": ["person"],
                    "required_ppe": ["helmet", "safety_vest"]
                }
            ],
            "tripwires": []
        },
        {
            "id": "cam-perimeter",
            "name": "North Fence Perimeter",
            "source": "synthetic",
            "location": "Zone C - Perimeter North",
            "target_fps": 15,
            "enabled": True,
            "model_id": "yolov8n-general",
            "rois": [
                {
                    "id": "roi-fence-buffer",
                    "name": "Fence Buffer Zone",
                    "type": "intrusion",
                    "points": [[50, 300], [1100, 300], [1100, 500], [50, 500]],
                    "alert_on_classes": ["person", "car"]
                }
            ],
            "tripwires": []
        },
        {
            "id": "cam-assembly",
            "name": "Assembly Line 4",
            "source": "synthetic",
            "location": "Zone D - Shopfloor",
            "target_fps": 30,
            "enabled": True,
            "model_id": "yolov8s-ppe",
            "rois": [
                {
                    "id": "roi-assembly-station",
                    "name": "Worker Safety Box",
                    "type": "crowd_and_ppe",
                    "points": [[300, 200], [800, 200], [800, 550], [300, 550]],
                    "alert_on_classes": ["person"]
                }
            ],
            "tripwires": []
        }
    ]

    events_data = [
        {
            "id": f"evt-{int(time.time())}-1",
            "camera_id": "cam-warehouse",
            "event_type": "ppe_safety_violation",
            "severity": "CRITICAL",
            "title": "PPE Violation: Missing Hard Hat & Vest",
            "description": "Worker #14 detected without required hard hat and high-vis safety vest in Forklift Active Zone.",
            "timestamp": time.time() - 360,
            "acknowledged": False,
            "metadata_json": {"track_id": 14, "missing_ppe": ["helmet", "safety_vest"], "zone": "Warehouse Loading Bay"}
        },
        {
            "id": f"evt-{int(time.time())}-2",
            "camera_id": "cam-main-gate",
            "event_type": "restricted_zone_intrusion",
            "severity": "CRITICAL",
            "title": "Restricted Zone Intrusion",
            "description": "Unauthorized pedestrian detected inside Restricted Vehicle Path during active transport window.",
            "timestamp": time.time() - 1200,
            "acknowledged": True,
            "metadata_json": {"track_id": 29, "dwell_time_sec": 5.4, "zone": "Restricted Vehicle Path"}
        },
        {
            "id": f"evt-{int(time.time())}-3",
            "camera_id": "cam-main-gate",
            "event_type": "overspeed_violation",
            "severity": "WARNING",
            "title": "Vehicle Overspeed Detected",
            "description": "Vehicle #41 clocked at 48.5 km/h in 30.0 km/h perimeter speed limit zone.",
            "timestamp": time.time() - 2400,
            "acknowledged": True,
            "metadata_json": {"track_id": 41, "speed_kmh": 48.5, "speed_limit_kmh": 30.0}
        },
        {
            "id": f"evt-{int(time.time())}-4",
            "camera_id": "cam-perimeter",
            "event_type": "loitering_alert",
            "severity": "WARNING",
            "title": "Perimeter Loitering Alert",
            "description": "Person #7 stationary for > 15 seconds near North Fence Buffer zone.",
            "timestamp": time.time() - 3800,
            "acknowledged": True,
            "metadata_json": {"track_id": 7, "dwell_time_sec": 16.2}
        },
        {
            "id": f"evt-{int(time.time())}-5",
            "camera_id": "cam-main-gate",
            "event_type": "line_crossing",
            "severity": "INFO",
            "title": "Gate Inbound Entry",
            "description": "Passenger car #55 crossed Gate Inbound Counter.",
            "timestamp": time.time() - 4200,
            "acknowledged": True,
            "metadata_json": {"track_id": 55, "direction": "inbound"}
        }
    ]

    async with AsyncSessionLocal() as session:
        for c in cameras_data:
            await crud.create_or_update_camera(session, c)
        for e in events_data:
            await crud.create_event(session, e)

    print("Successfully seeded 4 cameras and 5 baseline historical events into the database.")

if __name__ == "__main__":
    asyncio.run(seed())
