import { useEffect, useState } from 'react'
import { subscribeToLiveTelemetry } from '@/lib/api'
import { Activity, Gauge, Cpu, ShieldCheck } from 'lucide-react'

function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'text-ink',
  trend,
}: {
  label: string
  value: string
  unit?: string
  icon: any
  tone?: string
  trend?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-void/60 p-3 shadow-sm hover:border-line-bright transition-colors">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-raised/60 text-cyber">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono text-lg font-bold tabular ${tone}`}>{value}</span>
          {unit && <span className="font-mono text-xs text-muted">{unit}</span>}
        </div>
      </div>
    </div>
  )
}

export function TelemetryStrip({ cameraId = 'cam-01' }: { cameraId?: string }) {
  const [fps, setFps] = useState(60.0)
  const [latency, setLatency] = useState(8.4)
  const [detections, setDetections] = useState(3)

  useEffect(() => {
    const unsubscribe = subscribeToLiveTelemetry(cameraId, (sample) => {
      setFps(sample.fps)
      setLatency(sample.latencyMs)
      setDetections(sample.detections)
    })
    return unsubscribe
  }, [cameraId])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <MetricCard
        label="Stream Ingestion FPS"
        value={fps.toFixed(1)}
        unit="fps"
        icon={Gauge}
        tone="text-live"
      />
      <MetricCard
        label="TensorRT Latency"
        value={latency.toFixed(1)}
        unit="ms"
        icon={Activity}
        tone={latency > 15 ? 'text-warn' : 'text-cyber'}
      />
      <MetricCard
        label="Detections / Frame"
        value={String(detections)}
        unit="objects"
        icon={Cpu}
        tone="text-ink"
      />
    </div>
  )
}
