from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.session import get_db
import src.database.crud as crud
from src.video.stream_manager import stream_manager
from src.api.deps import require_role

router = APIRouter(prefix="/cameras", tags=["Cameras"])

class ROIConfig(BaseModel):
    id: str
    name: str
    type: str = "restricted_zone" # restricted_zone, intrusion, ppe_inspection, loitering
    points: List[List[float]]
    alert_on_classes: Optional[List[str]] = None
    required_ppe: Optional[List[str]] = None

class TripwireConfig(BaseModel):
    id: str
    name: str
    line: List[List[float]]
    direction: str = "inbound"
    target_classes: Optional[List[str]] = None

class CameraCreate(BaseModel):
    id: str
    name: str
    source: str = "synthetic"
    location: Optional[str] = None
    target_fps: int = 25
    enabled: bool = True
    model_id: str = "yolov8n-general"
    rois: List[ROIConfig] = Field(default_factory=list)
    tripwires: List[TripwireConfig] = Field(default_factory=list)

class CameraResponse(BaseModel):
    id: str
    name: str
    source: str
    location: Optional[str]
    target_fps: int
    enabled: bool
    model_id: str
    rois: List[Dict[str, Any]]
    tripwires: List[Dict[str, Any]]
    status: str
    fps: float
    resolution: str
    dropped_frames: int

@router.get("", response_model=List[Dict[str, Any]])
async def list_cameras(db: AsyncSession = Depends(get_db)):
    db_cameras = await crud.get_cameras(db)
    health_map = stream_manager.get_all_health()

    res = []
    for c in db_cameras:
        h = health_map.get(c.id)
        res.append({
            "id": c.id,
            "name": c.name,
            "source": c.source,
            "location": c.location,
            "target_fps": c.target_fps,
            "enabled": c.enabled,
            "model_id": c.model_id,
            "rois": c.rois or [],
            "tripwires": c.tripwires or [],
            "status": h.status if h else ("connected" if c.enabled else "offline"),
            "fps": h.fps if h else float(c.target_fps),
            "resolution": h.resolution if h else "1280x720",
            "dropped_frames": h.dropped_frames if h else 0
        })
    return res

@router.get("/{camera_id}")
async def get_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    camera = await crud.get_camera_by_id(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    health = stream_manager.get_all_health().get(camera_id)
    return {
        "id": camera.id,
        "name": camera.name,
        "source": camera.source,
        "location": camera.location,
        "target_fps": camera.target_fps,
        "enabled": camera.enabled,
        "model_id": camera.model_id,
        "rois": camera.rois or [],
        "tripwires": camera.tripwires or [],
        "health": health.model_dump() if health else None
    }

@router.post("", response_model=Dict[str, Any])
async def create_camera(payload: CameraCreate, db: AsyncSession = Depends(get_db)):
    cam_data = payload.model_dump()
    cam = await crud.create_or_update_camera(db, cam_data)
    stream_manager.register_camera(cam.id, cam.source, cam.target_fps)
    return {"status": "created", "camera": cam_data}

@router.put("/{camera_id}")
async def update_camera(camera_id: str, payload: CameraCreate, db: AsyncSession = Depends(get_db)):
    cam_data = payload.model_dump()
    cam_data["id"] = camera_id
    cam = await crud.create_or_update_camera(db, cam_data)
    stream_manager.register_camera(cam.id, cam.source, cam.target_fps)
    return {"status": "updated", "camera": cam_data}
