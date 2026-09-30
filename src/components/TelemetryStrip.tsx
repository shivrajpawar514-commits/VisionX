import { useEffect, useState } from 'react'
import { subscribeToLiveTelemetry } from '@/lib/api'

function Stat({ label, value, unit, tone = 'text-ink' }: { label: string; value: string; unit?: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span className={`font-mono text-xl tabular ${tone}`}>
        {value}
        {unit && <span className="ml-1 text-sm text-muted">{unit}</span>}
      </span>
    </div>
  )
}

export function TelemetryStrip({ cameraId = 'cam-01' }: { cameraId?: string }) {
  const [fps, setFps] = useState(0)
  const [latency, setLatency] = useState(0)
  const [detections, setDetections] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToLiveTelemetry(cameraId, (sample) => {
      setFps(sample.fps)
      setLatency(sample.latencyMs)
      setDetections(sample.detections)
    })
    return unsubscribe
  }, [cameraId])

  return (
    <div className="grid grid-cols-3 gap-6 rounded border border-line bg-panel px-5 py-4">
      <Stat label="FPS" value={fps.toFixed(1)} />
      <Stat
        label="Latency"
        value={latency.toFixed(0)}
        unit="ms"
        tone={latency > 130 ? 'text-warn' : 'text-ink'}
      />
      <Stat label="Detections / frame" value={String(detections)} />
    </div>
  )
}
