import time
import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Query, Body
from src.analytics.nl_analytics import nl_engine
from src.analytics.summarizer import video_summarizer
from src.alerts.alert_manager import alert_manager

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

class NLQueryRequest(BaseModel):
    query: str
    camera_id: Optional[str] = None
    time_window_hours: Optional[int] = 24

@router.post("/ask")
async def ask_video(payload: NLQueryRequest):
    """Natural-language video analytics query parser ('Ask Your Video What Happened')."""
    alerts_ctx = [a.model_dump() for a in alert_manager.get_recent_alerts(limit=50)]
    result = nl_engine.process_query(payload.query, alerts_ctx)
    return result

@router.get("/summarize")
async def summarize_video(time_window_hours: int = 4, camera_id: Optional[str] = None):
    """Generate executive AI summary of detected events, violations, and traffic."""
    summary = video_summarizer.generate_summary(time_window_hours=time_window_hours, camera_id=camera_id)
    return summary

@router.get("/heatmap")
async def get_heatmap(camera_id: str = "cam-main-gate"):
    """Returns spatial 2D occupancy grid."""
    gw, gh = 64, 36
    grid = [[0.0 for _ in range(gw)] for _ in range(gh)]

    # Generate smooth realistic heat distributions around paths
    t = time.time() * 0.05
    centers = [(20, 18), (42, 22), (32, 10), (12, 28)]

    for gy in range(gh):
        for gx in range(gw):
            val = 0.0
            for cx, cy in centers:
                d2 = (gx - cx)**2 + (gy - cy)**2
                val += math.exp(-d2 / 18.0) * 0.8
            # Add subtle road sweep
            if 20 <= gy <= 30:
                val += 0.3 * math.exp(-((gy - 25)**2) / 10.0)
            grid[gy][gx] = round(min(1.0, val), 3)

    return {
        "camera_id": camera_id,
        "grid_width": gw,
        "grid_height": gh,
        "density_matrix": grid,
        "timestamp": time.time()
    }

@router.get("/traffic")
async def get_traffic_series(hours: int = 24):
    """Returns historical hourly traffic count for Recharts."""
    data = []
    base_time = int(time.time()) - (hours * 3600)
    for i in range(hours):
        hour_stamp = base_time + (i * 3600)
        hour_label = time.strftime("%H:00", time.localtime(hour_stamp))
        h_int = int(time.strftime("%H", time.localtime(hour_stamp)))

        # Traffic curve peaking at morning (8-9am) and evening (5-6pm)
        morning_peak = math.exp(-((h_int - 9)**2) / 4.0) * 85
        evening_peak = math.exp(-((h_int - 17)**2) / 6.0) * 75
        base_ped = 15 + morning_peak + evening_peak + (i % 5) * 3
        base_veh = 8 + (morning_peak * 0.7) + (evening_peak * 0.8) + (i % 3) * 2

        data.append({
            "timestamp": hour_stamp,
            "time": hour_label,
            "pedestrians": int(base_ped),
            "vehicles": int(base_veh),
            "violations": int(1 if (h_int in [10, 14, 16]) else 0)
        })
    return data
