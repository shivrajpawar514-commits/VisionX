import os
import yaml
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from src.detection.benchmarks import run_model_benchmarks

router = APIRouter(prefix="/models", tags=["Models & Optimization"])

def load_models_yaml():
    path = "configs/models.yaml"
    if os.path.exists(path):
        with open(path, "r") as f:
            data = yaml.safe_load(f)
            return data.get("models", [])
    return []

@router.get("", response_model=List[Dict[str, Any]])
async def list_models():
    models = load_models_yaml()
    return models

@router.get("/benchmarks")
async def get_benchmarks():
    """Returns FP32 vs FP16 vs INT8 benchmark performance metrics."""
    benchmarks = run_model_benchmarks()
    return [b.model_dump() for b in benchmarks]

@router.post("/{model_id}/activate")
async def activate_model(model_id: str):
    models = load_models_yaml()
    target = next((m for m in models if m["id"] == model_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Model ID not found in registry")
    return {"status": "activated", "model": target}
