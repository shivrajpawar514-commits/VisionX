// VisionX Domain Types - Mirrored with FastAPI / Pydantic Schemas

export type CameraStatus = 'online' | 'offline' | 'degraded'
export type CameraSourceType = 'webcam' | 'upload' | 'rtsp' | 'drone' | 'synthetic'

export interface Camera {
  id: string
  name: string
  location: string
  sourceType: CameraSourceType
  status: CameraStatus
  resolution: string
  fps: number
  codec: string
  droppedFrames: number
  latencyMs: number
  activeModel: string
  rois?: any[]
  tripwires?: any[]
}

export type DetectionClass =
  | 'person'
  | 'vehicle'
  | 'car'
  | 'truck'
  | 'helmet'
  | 'no_helmet'
  | 'vest'
  | 'no_vest'
  | 'mask'

export interface Detection {
  id?: string
  cameraId?: string
  frameId?: number
  timestamp?: string
  class: string
  confidence: number
  bbox: [number, number, number, number] // x, y, w, h — normalized 0..1
  trackId?: string | number
  attributes?: Record<string, any>
}

export type EventType =
  | 'zone_intrusion'
  | 'restricted_zone_intrusion'
  | 'line_crossing'
  | 'loitering'
  | 'loitering_alert'
  | 'crowd_density'
  | 'crowd_density_alert'
  | 'ppe_violation'
  | 'ppe_safety_violation'
  | 'overspeed'
  | 'overspeed_violation'
  | 'abandoned_object'

export type EventSeverity = 'critical' | 'warning' | 'info'

export interface AnalyticsEvent {
  id: string
  cameraId: string
  cameraName?: string
  type: string
  event_type?: string
  severity: EventSeverity
  message?: string
  title?: string
  description?: string
  timestamp: string | number
  trackIds?: string[]
  acknowledged: boolean
  metadata?: Record<string, any>
}

export interface ModelInfo {
  id: string
  name: string
  task: 'detection' | 'segmentation' | 'pose' | 'classification'
  precision: 'FP32' | 'FP16' | 'INT8' | 'fp32' | 'fp16' | 'int8'
  runtime: 'PyTorch' | 'ONNX' | 'TensorRT' | 'torch' | 'onnxruntime' | 'tensorrt'
  mAP5095: number
  fps: number
  latencyMs: number
  status: 'active' | 'staged' | 'archived'
}

export interface ModelBenchmark {
  model_id: string
  model_name: string
  framework: string
  precision: string
  batch_size: number
  avg_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  fps: number
  throughput_samples_per_sec: number
  memory_mb: number
  device: string
}

export interface SystemHealthSample {
  timestamp: string | number
  cpu: number
  gpu: number
  ramGb: number
  vramGb: number
  fpsAvg: number
  latencyP95Ms: number
  errorRate: number
}

export interface HistoricalPoint {
  timestamp: string | number
  time?: string
  people?: number
  pedestrians?: number
  vehicles: number
  violations: number
}

export interface HeatmapCell {
  x: number
  y: number
  intensity: number // 0..1
}

export interface NLQueryResponse {
  query: string
  intent: string
  structured_query: Record<string, any>
  result_count: number
  answer: string
  details?: Array<Record<string, any>>
  confidence: number
}

export interface VideoSummaryResponse {
  time_window_hours: number
  camera_id: string
  generated_at: string
  summary_markdown: string
  highlights: Array<{
    time: string
    camera: string
    event: string
    severity: string
  }>
  aggregate_metrics: Record<string, any>
}
