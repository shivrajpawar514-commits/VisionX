# VisionX Model Card: YOLOv8 Video Analytics Suite

## 1. Model Details
- **Architecture**: Ultralytics YOLOv8 / YOLOv9 / YOLOv11 CNN/Transformer hybrid backbone.
- **Task**: Real-Time Object Detection, Worker PPE Compliance, Traffic & Speed Estimation.
- **Precision Modes**: FP32, FP16, and INT8 Post-Training Quantization (PTQ).
- **Inference Runtimes**: PyTorch CUDA/Metal, ONNX Runtime, NVIDIA TensorRT.

## 2. Performance Metrics

| Model | Framework | Precision | mAP@0.50 | mAP@0.50:0.95 | Latency (P95) | FPS (GPU) |
|---|---|---|---|---|---|---|
| YOLOv8n General | PyTorch | FP32 | 0.528 | 0.373 | 12.4 ms | 80.6 |
| YOLOv8s PPE Safety | PyTorch | FP16 | 0.824 | 0.638 | 8.2 ms | 121.9 |
| YOLOv8m ONNX | ONNX Runtime | FP16 | 0.692 | 0.502 | 7.5 ms | 133.3 |
| YOLOv8x TensorRT | TensorRT | INT8 | 0.741 | 0.548 | 4.1 ms | 243.9 |

## 3. Classes & Taxonomy
1. **Perimeter & Traffic**: `person`, `car`, `truck`, `bus`, `motorcycle`, `bicycle`.
2. **Workplace Safety & PPE**: `helmet`, `no-helmet`, `safety_vest`, `no-vest`, `mask`, `no-mask`.

## 4. Intended Use & Ethics
- Designed for industrial safety, automated traffic monitoring, and facility perimeter protection.
- Facial recognition is intentionally excluded to safeguard biometric privacy.
