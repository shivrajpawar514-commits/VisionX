# VisionX System Architecture & Technical Specification

## 1. High-Level Architecture

VisionX is designed as a distributed, high-throughput computer vision and video analytics platform optimized for both edge acceleration and cloud scalability.

```
┌─────────────────┐     ┌──────────────────────┐     ┌───────────────────────┐
│  Video Ingestion│ ──> │ YOLO Detection Engine│ ──> │  Multi-Object Tracking│
│  (RTSP/Webcam)  │     │ (PyTorch/ONNX/TensorRT)     │  (ByteTrack / BoT-SORT)│
└─────────────────┘     └──────────────────────┘     └───────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐     ┌──────────────────────┐     ┌───────────────────────┐
│ React Dashboard │ <── │  FastAPI / WebSocket │ <── │  Event & Analytics    │
│ (Control Room)  │     │  (REST, WSS, PubSub) │     │  (PPE, Zones, Speed)  │
└─────────────────┘     └──────────────────────┘     └───────────────────────┘
                                  │
                        ┌───────────────────┐
                        │ Database & Redis  │
                        │ (PostgreSQL/Timescale)
                        └───────────────────┘
```

## 2. Component Breakdown

### 2.1 Video Input & Ingestion Layer (`src/video/`)
- Multi-threaded frame grabber with drop-oldest buffer queue (`FrameBuffer`) to prevent pipeline latency accumulation.
- Dynamic stream health telemetry (`StreamHealthMonitor`) measuring actual FPS, frame drops, decoder latency, and auto-reconnection.
- Hardware-independent synthetic frame generator (`SyntheticStreamGenerator`) for zero-dependency CI and local development.

### 2.2 YOLO Detection Engine (`src/detection/`)
- Unified abstraction layer (`BaseDetector`) decoupling high-level event analytics from the underlying inference engine.
- Backends supported:
  - **Ultralytics YOLO (v8 / v9 / v11)**: Native PyTorch with GPU/Metal/MPS acceleration.
  - **ONNX Runtime**: Cross-platform optimized inference with dynamic batching.
  - **NVIDIA TensorRT**: INT8 quantized acceleration delivering sub-5ms latency on Jetson and server GPUs.
- Structured detection schemas (`Detection`, `BoundingBox`) with confidence filtering and classification attributes.

### 2.3 Multi-Object Tracking Engine (`src/tracking/`)
- Production implementation of **ByteTrack** with 8-dimensional Kalman filter state estimation `[x, y, aspect_ratio, height, vx, vy, va, vh]`.
- Two-stage association matching:
  - Associates high-score detections with active tracks using IoU distance and Hungarian assignment.
  - Recovers occluded objects by associating unmatched tracks with lower-score detections.
- Persistent track ID lifecycle (`New` -> `Tracked` -> `Lost` -> `Removed`).
- Historical trajectory memory, velocity vectors, heading angle calculation, and dwell-time tracking.

### 2.4 Event Intelligence & Spatial Analytics (`src/analytics/`, `src/events/`)
- **Restricted-Zone Intrusion**: Point-in-polygon checks with customizable grace periods.
- **Tripwire Line Crossing**: Vector intersection checks with directional (Inbound / Outbound) counting.
- **PPE & Workplace Safety**: Rules checking worker detections against required safety gear (helmet, safety vest, mask).
- **Vehicle Speed Estimation**: Pixel displacement converted to metric distance using camera homography calibration.
- **Spatial Heatmaps**: Continuous 2D Gaussian density accumulation tracking pedestrian and vehicle flow over time.

### 2.5 Natural-Language Video Analytics ("Ask Your Video What Happened")
- Converts unstructured user questions (e.g. *"What PPE violations occurred today?"*, *"How many vehicles entered?"*) into structured queries against the event database and telemetry logs.
- Synthesizes grounded, explainable answers with verifiable data citations and confidence scores.

### 2.6 MLOps & Observability
- MLflow experiment tracking and model registry.
- DVC data versioning.
- Prometheus `/metrics` endpoint and Grafana dashboards for monitoring system and ML drift metrics.
