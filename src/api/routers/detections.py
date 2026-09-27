import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.session import get_db

router = APIRouter(prefix="/detections", tags=["Detections"])

@router.get("/latest")
async def get_latest_detections(camera_id: str = "cam-main-gate"):
    """Fetch simulated or cached latest detections for quick frontend polling fallback."""
    now = time.time()
    return {
        "camera_id": camera_id,
        "timestamp": now,
        "detections": [
            {
                "bbox": {"x1": 380, "y1": 290, "x2": 445, "y2": 440},
                "class_name": "person",
                "class_id": 0,
                "confidence": 0.94,
                "track_id": 14,
                "attributes": {"has_helmet": True, "has_vest": True, "speed_kmh": 3.4}
            },
            {
                "bbox": {"x1": 650, "y1": 340, "x2": 710, "y2": 485},
                "class_name": "person",
                "class_id": 0,
                "confidence": 0.88,
                "track_id": 22,
                "attributes": {"has_helmet": False, "has_vest": False, "speed_kmh": 4.1}
            },
            {
                "bbox": {"x1": 150, "y1": 500, "x2": 330, "y2": 590},
                "class_name": "car",
                "class_id": 1,
                "confidence": 0.96,
                "track_id": 31,
                "attributes": {"speed_kmh": 24.5}
            }
        ]
    }
