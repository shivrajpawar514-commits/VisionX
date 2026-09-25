import time
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class CameraModel(Base):
    __tablename__ = "cameras"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    source = Column(String(256), nullable=False, default="synthetic")
    location = Column(String(128), nullable=True)
    target_fps = Column(Integer, default=25)
    enabled = Column(Boolean, default=True)
    model_id = Column(String(64), default="yolov8n-general")
    rois = Column(JSON, default=list)
    tripwires = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class EventModel(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, index=True)
    camera_id = Column(String(64), ForeignKey("cameras.id"), index=True, nullable=False)
    event_type = Column(String(64), index=True, nullable=False) # restricted_zone_intrusion, line_crossing, ppe_safety_violation, overspeed_violation, crowd_density_alert, loitering_alert
    severity = Column(String(32), index=True, default="INFO") # CRITICAL, WARNING, INFO
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(Float, default=time.time, index=True)
    acknowledged = Column(Boolean, default=False, index=True)
    evidence_image_path = Column(String(512), nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DetectionLogModel(Base):
    __tablename__ = "detection_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    camera_id = Column(String(64), index=True, nullable=False)
    frame_id = Column(Integer, index=True)
    timestamp = Column(Float, default=time.time, index=True)
    detections_count = Column(Integer, default=0)
    inference_time_ms = Column(Float, default=0.0)
    class_distribution = Column(JSON, default=dict) # {"person": 3, "car": 2}
    detections_detail = Column(JSON, default=list)

class SystemMetricModel(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(Float, default=time.time, index=True)
    cpu_usage_pct = Column(Float, default=0.0)
    memory_usage_mb = Column(Float, default=0.0)
    gpu_usage_pct = Column(Float, default=0.0)
    vram_usage_mb = Column(Float, default=0.0)
    avg_fps = Column(Float, default=0.0)
    avg_latency_ms = Column(Float, default=0.0)
    dropped_frames_total = Column(Integer, default=0)
