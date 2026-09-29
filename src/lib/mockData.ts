import type {
  Camera,
  AnalyticsEvent,
  EventType,
  EventSeverity,
  ModelInfo,
  SystemHealthSample,
  HistoricalPoint,
  HeatmapCell,
} from '@/types'

let seed = 42
function rand() {
  // small deterministic PRNG so first paint is stable, not flashing on reload
  seed = (seed * 9301 + 49297) % 233280
  return seed / 233280
}

export const CAMERAS: Camera[] = [
  {
    id: 'cam-01',
    name: 'CAM-01 · Main Entrance',
    location: 'North Gate',
    sourceType: 'webcam',
    status: 'online',
    resolution: '1280x720',
    fps: 24,
    codec: 'H.264',
    droppedFrames: 2,
    latencyMs: 118,
    activeModel: 'yolov8n-fp16',
  },
  {
    id: 'cam-02',
    name: 'CAM-02 · Loading Dock',
    location: 'Warehouse B',
    sourceType: 'rtsp',
    status: 'online',
    resolution: '1920x1080',
    fps: 15,
    codec: 'H.265',
    droppedFrames: 14,
    latencyMs: 240,
    activeModel: 'yolov8s-int8-trt',
  },
  {
    id: 'cam-03',
    name: 'CAM-03 · Parking Lane 4',
    location: 'Lot C',
    sourceType: 'rtsp',
    status: 'degraded',
    resolution: '1920x1080',
    fps: 9,
    codec: 'H.264',
    droppedFrames: 61,
    latencyMs: 410,
    activeModel: 'yolov8s-int8-trt',
  },
  {
    id: 'cam-04',
    name: 'CAM-04 · Assembly Floor',
    location: 'Plant 2',
    sourceType: 'upload',
    status: 'offline',
    resolution: '1280x720',
    fps: 0,
    codec: 'H.264',
    droppedFrames: 0,
    latencyMs: 0,
    activeModel: 'yolov8n-fp16',
  },
]

const EVENT_TEMPLATES: { type: EventType; severity: EventSeverity; message: (cam: string) => string }[] = [
  { type: 'zone_intrusion', severity: 'critical', message: (c) => `Person entered restricted zone at ${c}` },
  { type: 'line_crossing', severity: 'info', message: (c) => `Vehicle crossed count line at ${c}` },
  { type: 'loitering', severity: 'warning', message: (c) => `Loitering detected (4m12s) at ${c}` },
  { type: 'crowd_density', severity: 'warning', message: (c) => `Crowd density above threshold at ${c}` },
  { type: 'ppe_violation', severity: 'critical', message: (c) => `Missing hard hat detected at ${c}` },
  { type: 'overspeed', severity: 'warning', message: (c) => `Vehicle exceeded 25 km/h limit at ${c}` },
]

export function generateEvents(count = 18): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const cam = CAMERAS[Math.floor(rand() * CAMERAS.length)]
    const tmpl = EVENT_TEMPLATES[Math.floor(rand() * EVENT_TEMPLATES.length)]
    events.push({
      id: `evt-${i}`,
      cameraId: cam.id,
      cameraName: cam.name,
      type: tmpl.type,
      severity: tmpl.severity,
      message: tmpl.message(cam.name),
      timestamp: new Date(now - i * 1000 * 60 * (3 + rand() * 9)).toISOString(),
      trackIds: [`trk-${Math.floor(rand() * 900)}`],
      acknowledged: rand() > 0.7,
    })
  }
  return events
}

export const MODELS: ModelInfo[] = [
  { id: 'm-1', name: 'yolov8n-fp16', task: 'detection', precision: 'FP16', runtime: 'ONNX', mAP5095: 37.2, fps: 61, latencyMs: 16, status: 'active' },
  { id: 'm-2', name: 'yolov8s-int8-trt', task: 'detection', precision: 'INT8', runtime: 'TensorRT', mAP5095: 41.8, fps: 94, latencyMs: 10, status: 'active' },
  { id: 'm-3', name: 'yolov8m-ppe-fp32', task: 'detection', precision: 'FP32', runtime: 'PyTorch', mAP5095: 52.4, fps: 22, latencyMs: 44, status: 'staged' },
  { id: 'm-4', name: 'yolov8n-pose-fp16', task: 'pose', precision: 'FP16', runtime: 'ONNX', mAP5095: 33.9, fps: 55, latencyMs: 18, status: 'archived' },
]

export function generateHealthSeries(points = 30): SystemHealthSample[] {
  const out: SystemHealthSample[] = []
  const now = Date.now()
  for (let i = points; i >= 0; i--) {
    out.push({
      timestamp: new Date(now - i * 60000).toISOString(),
      cpu: 30 + rand() * 40,
      gpu: 45 + rand() * 45,
      ramGb: 6 + rand() * 3,
      vramGb: 4 + rand() * 3,
      fpsAvg: 18 + rand() * 10,
      latencyP95Ms: 90 + rand() * 120,
      errorRate: rand() * 0.8,
    })
  }
  return out
}

export function generateHistorical(points = 24): HistoricalPoint[] {
  const out: HistoricalPoint[] = []
  const now = Date.now()
  for (let i = points; i >= 0; i--) {
    out.push({
      timestamp: new Date(now - i * 3600000).toISOString(),
      people: Math.round(20 + rand() * 120),
      vehicles: Math.round(5 + rand() * 40),
      violations: Math.round(rand() * 6),
    })
  }
  return out
}

export function generateHeatmap(cols = 16, rows = 9): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  // a couple of "hot" focal points so the heatmap reads as plausible foot traffic
  const foci = [
    { x: 0.25, y: 0.6 },
    { x: 0.7, y: 0.3 },
    { x: 0.5, y: 0.8 },
  ]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c / cols
      const y = r / rows
      let intensity = 0.04 * rand()
      for (const f of foci) {
        const d = Math.hypot(x - f.x, y - f.y)
        intensity += Math.max(0, 0.9 - d * 2.2)
      }
      cells.push({ x: c, y: r, intensity: Math.min(1, intensity) })
    }
  }
  return cells
}
