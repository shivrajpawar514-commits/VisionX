from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from src.hitl.correction_manager import hitl_manager, HITLCorrectionSample

router = APIRouter(prefix="/hitl", tags=["Human-in-the-Loop"])

class SubmitCorrectionRequest(BaseModel):
    camera_id: str
    original_detections: List[Dict[str, Any]]
    corrected_detections: List[Dict[str, Any]]
    correction_type: str = "box_adjustment"
    operator_notes: Optional[str] = None
    image_path: Optional[str] = None

@router.get("/samples")
async def list_samples(status: Optional[str] = None):
    return hitl_manager.list_samples(status=status)

@router.post("/corrections")
async def submit_correction(req: SubmitCorrectionRequest):
    sample = hitl_manager.submit_correction(
        camera_id=req.camera_id,
        original_detections=req.original_detections,
        corrected_detections=req.corrected_detections,
        correction_type=req.correction_type,
        operator_notes=req.operator_notes,
        image_path=req.image_path
    )
    return {"status": "recorded", "sample_id": sample.id, "sample": sample}

@router.post("/samples/{sample_id}/approve")
async def approve_sample(sample_id: str):
    ok = hitl_manager.approve_sample(sample_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Sample ID not found")
    return {"status": "approved", "sample_id": sample_id}
