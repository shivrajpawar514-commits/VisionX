# VisionX MLOps & Continuous Training Pipeline

VisionX implements an active learning loop with Data Version Control (DVC), MLflow Model Registry, and Human-in-the-Loop (HITL) operator corrections.

## Active Learning Workflow

```
[HITL Correction Modal] --> [DVC Dataset Versioning] --> [YOLO Fine-Tuning Pass]
                                                                  |
[NVIDIA TensorRT INT8 Engine] <-- [Quality Gate Validation] <-- [MLflow Tracking]
```

## Quality Gates for Edge Deployment

Every fine-tuned model checkpoint must satisfy the following automated CI/CD quality gates before staging to production edge nodes:

- **Accuracy**: `mAP50-95` &ge; `0.80` (evaluated against held-out benchmark test set)
- **Inference Speed**: P95 Latency &le; `15.0 ms`
- **Memory Footprint**: GPU VRAM &le; `2.0 GB`
- **Safety Class Recall**: Hard Hat & Vest Recall &ge; `95.0%`
