import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.session import get_db
import src.database.crud as crud
from src.alerts.alert_manager import alert_manager

router = APIRouter(prefix="/events", tags=["Events & Alerts"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_events(
    limit: int = Query(50, ge=1, le=200),
    severity: Optional[str] = None,
    camera_id: Optional[str] = None,
    event_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    # Retrieve from DB with alert manager fallback
    db_events = await crud.get_events(db, limit=limit, severity=severity, camera_id=camera_id, event_type=event_type)
    if db_events:
        return [
            {
                "id": e.id,
                "camera_id": e.camera_id,
                "event_type": e.event_type,
                "severity": e.severity,
                "title": e.title,
                "description": e.description,
                "timestamp": e.timestamp,
                "acknowledged": e.acknowledged,
                "metadata": e.metadata_json or {}
            }
            for e in db_events
        ]

    # In-memory alert manager history fallback
    mem_alerts = alert_manager.get_recent_alerts(limit=limit, severity=severity, camera_id=camera_id)
    return [a.model_dump() for a in mem_alerts]

@router.post("/{event_id}/ack")
async def acknowledge_event(event_id: str, db: AsyncSession = Depends(get_db)):
    # Acknowledge in DB
    event = await crud.acknowledge_event(db, event_id)
    # Acknowledge in memory
    alert_manager.acknowledge_alert(event_id)

    return {"status": "acknowledged", "event_id": event_id}
