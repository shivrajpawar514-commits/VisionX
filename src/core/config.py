import os
from typing import List, Dict, Any, Optional
import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings

class ServerConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = ["*"]
    jwt_secret: str = "visionx-super-secret-key-change-in-production-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

class SystemConfig(BaseModel):
    name: str = "VisionX Intelligent Video Analytics"
    version: str = "1.0.0"
    environment: str = "development"
    log_level: str = "INFO"
    device: str = "auto"
    max_fps: int = 30
    frame_width: int = 1280
    frame_height: int = 720

class DatabaseConfig(BaseModel):
    url: str = "sqlite+aiosqlite:///./visionx.db"
    echo: bool = False

class RedisConfig(BaseModel):
    url: str = "redis://localhost:6379/0"
    enabled: bool = False

class TrackingConfig(BaseModel):
    algorithm: str = "bytetrack"
    track_high_thresh: float = 0.5
    track_low_thresh: float = 0.1
    new_track_thresh: float = 0.6
    track_buffer: int = 30
    match_thresh: float = 0.8
    min_box_area: int = 10

class IntrusionAnalyticsConfig(BaseModel):
    dwell_grace_period_sec: float = 1.5

class LoiteringAnalyticsConfig(BaseModel):
    threshold_sec: float = 10.0

class CrowdAnalyticsConfig(BaseModel):
    density_threshold: int = 8

class SpeedAnalyticsConfig(BaseModel):
    default_speed_limit_kmh: float = 30.0
    pixels_per_meter: float = 25.0

class PPEAnalyticsConfig(BaseModel):
    required_classes: List[str] = ["helmet", "safety_vest"]
    alert_cooldown_sec: float = 5.0

class AnalyticsConfig(BaseModel):
    intrusion: IntrusionAnalyticsConfig = Field(default_factory=IntrusionAnalyticsConfig)
    loitering: LoiteringAnalyticsConfig = Field(default_factory=LoiteringAnalyticsConfig)
    crowd: CrowdAnalyticsConfig = Field(default_factory=CrowdAnalyticsConfig)
    speed: SpeedAnalyticsConfig = Field(default_factory=SpeedAnalyticsConfig)
    ppe: PPEAnalyticsConfig = Field(default_factory=PPEAnalyticsConfig)

class MonitoringConfig(BaseModel):
    prometheus_enabled: bool = True
    metrics_port: int = 8000

class Settings(BaseSettings):
    system: SystemConfig = Field(default_factory=SystemConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    redis: RedisConfig = Field(default_factory=RedisConfig)
    tracking: TrackingConfig = Field(default_factory=TrackingConfig)
    analytics: AnalyticsConfig = Field(default_factory=AnalyticsConfig)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig)

    class Config:
        env_file = ".env"
        extra = "allow"

def load_settings(config_path: str = "configs/config.yaml") -> Settings:
    """Load settings from YAML config file with environment variable fallback."""
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                data = yaml.safe_load(f) or {}
                # Allow env overrides
                if os.getenv("DATABASE_URL"):
                    data.setdefault("database", {})["url"] = os.getenv("DATABASE_URL")
                if os.getenv("REDIS_URL"):
                    data.setdefault("redis", {})["url"] = os.getenv("REDIS_URL")
                if os.getenv("PORT"):
                    data.setdefault("server", {})["port"] = int(os.getenv("PORT"))
                return Settings(**data)
        except Exception as e:
            print(f"Warning: Could not parse {config_path}: {e}. Using defaults.")
    return Settings()

# Global settings instance
settings = load_settings()
