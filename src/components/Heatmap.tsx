import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { HeatmapCell } from '@/types'

function mix(intensity: number): string {
  // cool teal -> warm alert as intensity rises, matching the palette rather
  // than a default red/yellow/green traffic-light gradient
  const stops = [
    { t: 0, c: [18, 28, 28] },
    { t: 0.5, c: [61, 220, 151] },
    { t: 1, c: [255, 107, 74] },
  ]
  let a = stops[0], b = stops[1]
  if (intensity > 0.5) { a = stops[1]; b = stops[2] }
  const localT = a === stops[0] ? intensity / 0.5 : (intensity - 0.5) / 0.5
  const r = a.c[0] + (b.c[0] - a.c[0]) * localT
  const g = a.c[1] + (b.c[1] - a.c[1]) * localT
  const bl = a.c[2] + (b.c[2] - a.c[2]) * localT
  return `rgb(${r},${g},${bl})`
}

export function Heatmap({ cameraId = 'cam-01' }: { cameraId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cells, setCells] = useState<HeatmapCell[]>([])

  useEffect(() => {
    api.getHeatmap(cameraId).then(setCells)
  }, [cameraId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || cells.length === 0) return
    const cols = Math.max(...cells.map((c) => c.x)) + 1
    const rows = Math.max(...cells.map((c) => c.y)) + 1
    const cw = canvas.width / cols
    const ch = canvas.height / rows
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const cell of cells) {
      ctx.fillStyle = mix(cell.intensity)
      ctx.globalAlpha = 0.25 + cell.intensity * 0.6
      ctx.fillRect(cell.x * cw, cell.y * ch, cw + 0.5, ch + 0.5)
    }
    ctx.globalAlpha = 1
  }, [cells])

  return (
    <div className="w-full overflow-hidden rounded border border-line">
      <canvas ref={canvasRef} width={480} height={270} className="block w-full" />
    </div>
  )
}
