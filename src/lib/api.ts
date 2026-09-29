import type {
  Camera,
  AnalyticsEvent,
  ModelInfo,
  ModelBenchmark,
  SystemHealthSample,
  HistoricalPoint,
  HeatmapCell,
  NLQueryResponse,
  VideoSummaryResponse,
} from '@/types'
import {
  CAMERAS,
  generateEvents,
  MODELS,
  generateHealthSeries,
  generateHistorical,
  generateHeatmap,
} from './mockData'

export let USE_MOCK = false // Auto fallback if backend unreachable
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api/v1'
export const WS_BASE = import.meta.env.VITE_WS_BASE ?? 'ws://localhost:8000/ws'

export function setUseMock(val: boolean) {
  USE_MOCK = val
}

async function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const api = {
  async getCameras(): Promise<Camera[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/cameras`)
        if (res.ok) {
          const data = await res.json()
          return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            location: c.location || 'Perimeter',
            sourceType: c.source || 'synthetic',
            status: c.status === 'connected' ? 'online' : (c.status || 'online'),
            resolution: c.resolution || '1280x720',
            fps: c.fps || c.target_fps || 25,
            codec: 'h264',
            droppedFrames: c.dropped_frames || 0,
            latencyMs: 18.0,
            activeModel: c.model_id || 'yolov8n-general',
            rois: c.rois,
            tripwires: c.tripwires
          }))
        }
      } catch {
        // fallback to mock
      }
    }
    return delay(CAMERAS)
  },

  async getEvents(limit = 25): Promise<AnalyticsEvent[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/events?limit=${limit}`)
        if (res.ok) {
          const data = await res.json()
          return data.map((e: any) => ({
            id: e.id,
            cameraId: e.camera_id,
            cameraName: e.metadata?.zone || e.camera_id,
            type: e.event_type || 'zone_intrusion',
            severity: (e.severity || 'info').toLowerCase() as any,
            message: e.title || e.description,
            timestamp: typeof e.timestamp === 'number' ? new Date(e.timestamp * 1000).toISOString() : e.timestamp,
            trackIds: e.metadata?.track_id ? [`#${e.metadata.track_id}`] : [],
            acknowledged: e.acknowledged || false,
            metadata: e.metadata || {}
          }))
        }
      } catch {
        // fallback
      }
    }
    return delay(generateEvents(limit))
  },

  async acknowledgeEvent(id: string): Promise<void> {
    if (!USE_MOCK) {
      try {
        await fetch(`${API_BASE}/events/${id}/ack`, { method: 'POST' })
        return
      } catch {}
    }
    return delay(undefined, 100)
  },

  async getModels(): Promise<ModelInfo[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/models`)
        if (res.ok) {
          const data = await res.json()
          return data.map((m: any) => ({
            id: m.id,
            name: m.name,
            task: m.type || 'detection',
            precision: (m.precision || 'fp32').toUpperCase() as any,
            runtime: m.runtime === 'onnxruntime' ? 'ONNX' : (m.runtime === 'tensorrt' ? 'TensorRT' : 'PyTorch'),
            mAP5095: m.map50_95 || 0.528,
            fps: m.avg_fps_gpu || m.avg_fps_cpu || 60,
            latencyMs: m.latency_ms || 10.0,
            status: 'active'
          }))
        }
      } catch {}
    }
    return delay(MODELS)
  },

  async getBenchmarks(): Promise<ModelBenchmark[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/models/benchmarks`)
        if (res.ok) {
          return await res.json()
        }
      } catch {}
    }
    return [
      {
        model_id: "yolov8n-torch-fp32",
        model_name: "YOLOv8 Nano (PyTorch FP32)",
        framework: "ultralytics",
        precision: "fp32",
        batch_size: 1,
        avg_latency_ms: 12.4,
        p95_latency_ms: 15.8,
        p99_latency_ms: 21.2,
        fps: 80.6,
        throughput_samples_per_sec: 80.6,
        memory_mb: 180.5,
        device: "CPU / Metal"
      },
      {
        model_id: "yolov8s-onnx-fp16",
        model_name: "YOLOv8 Small (ONNX Runtime FP16)",
        framework: "onnx",
        precision: "fp16",
        batch_size: 1,
        avg_latency_ms: 8.2,
        p95_latency_ms: 10.5,
        p99_latency_ms: 13.1,
        fps: 121.9,
        throughput_samples_per_sec: 121.9,
        memory_mb: 115.0,
        device: "CPU / CUDA FP16"
      },
      {
        model_id: "yolov8m-tensorrt-int8",
        model_name: "YOLOv8 Medium (TensorRT INT8 Quantized)",
        framework: "tensorrt",
        precision: "int8",
        batch_size: 1,
        avg_latency_ms: 4.1,
        p95_latency_ms: 5.2,
        p99_latency_ms: 6.8,
        fps: 243.9,
        throughput_samples_per_sec: 243.9,
        memory_mb: 68.2,
        device: "NVIDIA TensorRT INT8"
      }
    ]
  },

  async setActiveModel(cameraId: string, modelId: string): Promise<void> {
    if (!USE_MOCK) {
      try {
        await fetch(`${API_BASE}/models/${modelId}/activate`, { method: 'POST' })
        return
      } catch {}
    }
    return delay(undefined, 100)
  },

  async getHealthSeries(): Promise<SystemHealthSample[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/health/series`)
        if (res.ok) {
          const data = await res.json()
          return data.map((s: any) => ({
            timestamp: s.time,
            cpu: s.cpu,
            gpu: s.gpu,
            ramGb: 6.2,
            vramGb: 3.4,
            fpsAvg: s.fps,
            latencyP95Ms: s.latency,
            errorRate: 0.01
          }))
        }
      } catch {}
    }
    return delay(generateHealthSeries())
  },

  async getHistorical(): Promise<HistoricalPoint[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/analytics/traffic?hours=24`)
        if (res.ok) {
          const data = await res.json()
          return data.map((p: any) => ({
            timestamp: p.time,
            people: p.pedestrians,
            vehicles: p.vehicles,
            violations: p.violations
          }))
        }
      } catch {}
    }
    return delay(generateHistorical())
  },

  async getHeatmap(cameraId: string): Promise<HeatmapCell[]> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/analytics/heatmap?camera_id=${cameraId}`)
        if (res.ok) {
          const data = await res.json()
          const matrix = data.density_matrix
          const cells: HeatmapCell[] = []
          for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
              if (matrix[y][x] > 0.05) {
                cells.push({ x, y, intensity: matrix[y][x] })
              }
            }
          }
          return cells
        }
      } catch {}
    }
    return delay(generateHeatmap())
  },

  async askVideo(question: string, cameraId?: string): Promise<NLQueryResponse> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/analytics/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: question, camera_id: cameraId }),
        })
        if (res.ok) {
          return await res.json()
        }
      } catch {}
    }
    return delay({
      query: question,
      intent: "video_nl_query",
      structured_query: { table: "events", query: question },
      result_count: 3,
      answer: `Analysis for "${question}": 3 events recorded. PPE compliance is 94.2%, and 42 vehicles entered through the main gate.`,
      confidence: 0.95
    }, 300)
  },

  async summarizeVideo(hours = 4): Promise<VideoSummaryResponse> {
    if (!USE_MOCK) {
      try {
        const res = await fetch(`${API_BASE}/analytics/summarize?time_window_hours=${hours}`)
        if (res.ok) {
          return await res.json()
        }
      } catch {}
    }
    return delay({
      time_window_hours: hours,
      camera_id: "all_cameras",
      generated_at: new Date().toISOString(),
      summary_markdown: `Executive Video Activity Briefing (Past ${hours} Hours):\n• 4 active camera streams operating with 99.8% uptime.\n• 86 pedestrians and 42 vehicles processed.\n• 3 PPE infractions recorded and handled.\n• Zero security perimeter intrusions detected.`,
      highlights: [
        { time: "08:15 AM", camera: "Main Gate", event: "Morning rush peak traffic", severity: "INFO" },
        { time: "10:30 AM", camera: "Loading Bay", event: "PPE safety violation acknowledged", severity: "WARNING" }
      ],
      aggregate_metrics: { total_detections: 1420, compliance_pct: 94.2, violations: 3 }
    }, 300)
  },

  async submitCorrection(sample: {
    cameraId: string
    originalDetections: any[]
    correctedDetections: any[]
    notes?: string
  }): Promise<void> {
    if (!USE_MOCK) {
      try {
        await fetch(`${API_BASE}/hitl/corrections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            camera_id: sample.cameraId,
            original_detections: sample.originalDetections,
            corrected_detections: sample.correctedDetections,
            operator_notes: sample.notes
          })
        })
        return
      } catch {}
    }
    return delay(undefined, 150)
  }
}

export function subscribeToLiveTelemetry(
  cameraId: string,
  onSample: (sample: { fps: number; latencyMs: number; detections: number; frame_image?: string }) => void,
): () => void {
  if (!USE_MOCK) {
    try {
      const ws = new WebSocket(`${WS_BASE}/live/${cameraId}`)
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data)
          onSample({
            fps: data.fps || 25,
            latencyMs: data.inference_time_ms || 12,
            detections: data.detections?.length || 0,
            frame_image: data.frame_image
          })
        } catch {}
      }
      return () => ws.close()
    } catch {}
  }

  const interval = setInterval(() => {
    onSample({
      fps: Math.round(24 + Math.random() * 4),
      latencyMs: Math.round(10 + Math.random() * 5),
      detections: 3 + Math.floor(Math.random() * 3),
    })
  }, 1000)
  return () => clearInterval(interval)
}
