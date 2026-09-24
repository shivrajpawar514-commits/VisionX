import time
import json
import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class HITLCorrectionSample(BaseModel):
    id: str
    camera_id: str
    timestamp: float = Field(default_factory=time.time)
    image_path: Optional[str] = None
    original_detections: List[Dict[str, Any]]
    corrected_detections: List[Dict[str, Any]]
    correction_type: str # "false_positive", "false_negative", "box_adjustment", "class_correction"
    operator_notes: Optional[str] = None
    status: str = "pending_review" # "pending_review", "approved", "incorporated"

class HITLManager:
    """Manages human-in-the-loop candidate dataset sample collection and annotation corrections."""

    def __init__(self, export_dir: str = "data/annotations"):
        self.export_dir = export_dir
        self.samples: List[HITLCorrectionSample] = []
        os.makedirs(self.export_dir, exist_ok=True)

    def submit_correction(
        self,
        camera_id: str,
        original_detections: List[Dict[str, Any]],
        corrected_detections: List[Dict[str, Any]],
        correction_type: str = "box_adjustment",
        operator_notes: Optional[str] = None,
        image_path: Optional[str] = None
    ) -> HITLCorrectionSample:
        sample_id = f"hitl-{int(time.time())}-{len(self.samples) + 1}"
        sample = HITLCorrectionSample(
            id=sample_id,
            camera_id=camera_id,
            timestamp=time.time(),
            image_path=image_path,
            original_detections=original_detections,
            corrected_detections=corrected_detections,
            correction_type=correction_type,
            operator_notes=operator_notes,
            status="pending_review"
        )
        self.samples.append(sample)

        # Save to annotation directory
        file_path = os.path.join(self.export_dir, f"{sample_id}.json")
        try:
            with open(file_path, "w") as f:
                f.write(sample.model_dump_json(indent=2))
        except Exception:
            pass

        return sample

    def list_samples(self, status: Optional[str] = None) -> List[HITLCorrectionSample]:
        if status:
            return [s for s in self.samples if s.status == status]
        return self.samples

    def approve_sample(self, sample_id: str) -> bool:
        for s in self.samples:
            if s.id == sample_id:
                s.status = "approved"
                return True
        return False

hitl_manager = HITLManager()
