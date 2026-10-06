import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { HeatmapCell } from '@/types'
import { Flame, Layers } from 'lucide-react'

function mix(intensity: number): string {
  const stops = [
    { t: 0, c: [11, 16, 23] },
    { t: 0.4, c: [6, 182, 212] },
    { t: 0.75, c: [16, 185, 129] },
    { t: 1, c: [239, 68, 68] },
  ]
  let a = stops[0],
    b = stops[1]
  if (intensity > 0.75) {
    a = stops[2]
    b = stops[3]
  } else if (intensity > 0.4) {
    a = stops[1]
    b = stops[2]
  }
  const range = b.t - a.t
  const localT = (intensity - a.t) / range
  const r = Math.round(a.c[0] + (b.c[0] - a.c[0]) * localT)
  const g = Math.round(a.c[1] + (b.c[1] - a.c[1]) * localT)
  const bl = Math.round(a.c[2] + (b.c[2] - a.c[2]) * localT)
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

    // Dark grid background
    ctx.fillStyle = '#070A0F'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const cell of cells) {
      ctx.fillStyle = mix(cell.intensity)
      ctx.globalAlpha = 0.3 + cell.intensity * 0.65
      ctx.fillRect(cell.x * cw, cell.y * ch, cw, ch)
    }

    // Grid stroke overlay
    ctx.globalAlpha = 0.15
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += cw) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += ch) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }, [cells])

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-void">
      <canvas ref={canvasRef} width={480} height={270} className="block w-full" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-md bg-void/80 border border-line px-2.5 py-1 text-[10px] font-mono text-muted backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-cyber">
          <Flame className="h-3 w-3 text-alert" />
          <span>Spatial Density Matrix</span>
        </div>
        <div className="flex items-center gap-2">
          <span>0%</span>
          <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-cyber via-live to-alert" />
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}
