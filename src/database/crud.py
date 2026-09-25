import time
from typing import List, Optional, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models import CameraModel, EventModel, DetectionLogModel, SystemMetricModel

async def get_cameras(db: AsyncSession) -> List[CameraModel]:
    result = await db.execute(select(CameraModel))
    return list(result.scalars().all())

async def get_camera_by_id(db: AsyncSession, camera_id: str) -> Optional[CameraModel]:
    result = await db.execute(select(CameraModel).filter(CameraModel.id == camera_id))
    return result.scalars().first()

async def create_or_update_camera(db: AsyncSession, camera_data: Dict[str, Any]) -> CameraModel:
    camera = await get_camera_by_id(db, camera_data["id"])
    if not camera:
        camera = CameraModel(**camera_data)
        db.add(camera)
    else:
        for k, v in camera_data.items():
            setattr(camera, k, v)
    await db.commit()
    await db.refresh(camera)
    return camera

async def get_events(
    db: AsyncSession,
    limit: int = 50,
    offset: int = 0,
    severity: Optional[str] = None,
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None
) -> List[EventModel]:
    query = select(EventModel).order_by(EventModel.timestamp.desc())
    if severity:
        query = query.filter(EventModel.severity == severity.upper())
    if camera_id:
        query = query.filter(EventModel.camera_id == camera_id)
    if event_type:
        query = query.filter(EventModel.event_type == event_type)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())

async def create_event(db: AsyncSession, event_data: Dict[str, Any]) -> EventModel:
    event = EventModel(**event_data)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

async def acknowledge_event(db: AsyncSession, event_id: str) -> Optional[EventModel]:
    result = await db.execute(select(EventModel).filter(EventModel.id == event_id))
    event = result.scalars().first()
    if event:
        event.acknowledged = True
        await db.commit()
        await db.refresh(event)
    return event

async def log_detection(db: AsyncSession, log_data: Dict[str, Any]) -> DetectionLogModel:
    log_entry = DetectionLogModel(**log_data)
    db.add(log_entry)
    await db.commit()
    return log_entry
