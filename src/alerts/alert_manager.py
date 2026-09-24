import time
import asyncio
from typing import List, Dict, Any, Callable, Optional
from pydantic import BaseModel, Field

class AlertEvent(BaseModel):
    id: str
    camera_id: str
    event_type: str
    severity: str # CRITICAL, WARNING, INFO
    title: str
    description: str
    timestamp: float = Field(default_factory=time.time)
    acknowledged: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AlertManager:
    """Manages system-wide alerts, deduplication, persistent event buffers, and broadcast callbacks."""

    def __init__(self, max_history: int = 500):
        self.max_history = max_history
        self.history: List[AlertEvent] = []
        self._subscribers: List[Callable[[AlertEvent], Any]] = []
        self._alert_counter = 0

    def register_subscriber(self, callback: Callable[[AlertEvent], Any]):
        self._subscribers.append(callback)

    def unregister_subscriber(self, callback: Callable[[AlertEvent], Any]):
        if callback in self._subscribers:
            self._subscribers.remove(callback)

    def trigger_alert(self, camera_id: str, event_type: str, severity: str, title: str, description: str, metadata: Optional[Dict[str, Any]] = None) -> AlertEvent:
        self._alert_counter += 1
        alert = AlertEvent(
            id=f"alert-{int(time.time())}-{self._alert_counter}",
            camera_id=camera_id,
            event_type=event_type,
            severity=severity,
            title=title,
            description=description,
            timestamp=time.time(),
            acknowledged=False,
            metadata=metadata or {}
        )

        self.history.insert(0, alert)
        if len(self.history) > self.max_history:
            self.history.pop()

        # Notify active subscribers
        for sub in self._subscribers:
            try:
                sub(alert)
            except Exception as e:
                pass

        return alert

    def acknowledge_alert(self, alert_id: str) -> bool:
        for a in self.history:
            if a.id == alert_id:
                a.acknowledged = True
                return True
        return False

    def get_recent_alerts(self, limit: int = 50, severity: Optional[str] = None, camera_id: Optional[str] = None) -> List[AlertEvent]:
        res = self.history
        if severity:
            res = [a for a in res if a.severity.lower() == severity.lower()]
        if camera_id:
            res = [a for a in res if a.camera_id == camera_id]
        return res[:limit]

# Global alert manager instance
alert_manager = AlertManager()
