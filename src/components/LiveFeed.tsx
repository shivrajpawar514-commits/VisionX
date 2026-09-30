import { useEffect, useRef, useState } from 'react'
import { USE_MOCK } from '@/lib/api'

interface SimBox {
  x: number
  y: number
  w: number
  h: number
  cls: string
  conf: number
  vx: number
  vy: number
}

function seedBoxes(): SimBox[] {
  return [
    { x: 0.15, y: 0.35, w: 0.16, h: 0.4, cls: 'person', conf: 0.94, vx: 0.0012, vy: 0.0006 },
    { x: 0.55, y: 0.22, w: 0.22, h: 0.5, cls: 'person', conf: 0.88, vx: -0.0009, vy: 0.0004 },
  ]
}

export function LiveFeed({ cameraName = 'CAM-01 · Main Entrance' }: { cameraName?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxesRef = useRef<SimBox[]>(seedBoxes())
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle')
  const [showOverlay, setShowOverlay] = useState(true)

  useEffect(() => {
    let stream: MediaStream | null = null
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStatus('granted')
      } catch {
        setStatus('denied')
      }
    }
    start()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // draw loop — simulated detection overlay until the WS detection stream is wired in
  useEffect(() => {
    let raf: number
    function draw() {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (canvas && video && video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          if (showOverlay) {
            for (const b of boxesRef.current) {
              b.x += b.vx
              b.y += b.vy
              if (b.x < 0 || b.x + b.w > 1) b.vx *= -1
              if (b.y < 0 || b.y + b.h > 1) b.vy *= -1
              const px = b.x * canvas.width
              const py = b.y * canvas.height
              const pw = b.w * canvas.width
              const ph = b.h * canvas.height
              ctx.strokeStyle = '#3DDC97'
              ctx.lineWidth = 2
              ctx.strokeRect(px, py, pw, ph)
              const label = `${b.cls} ${(b.conf * 100).toFixed(0)}%`
              ctx.font = '12px "IBM Plex Mono", monospace'
              const tw = ctx.measureText(label).width + 8
              ctx.fillStyle = '#3DDC97'
              ctx.fillRect(px, py - 18, tw, 18)
              ctx.fillStyle = '#0B1414'
              ctx.fillText(label, px + 4, py - 5)
            }
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [showOverlay])

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded border border-line bg-black">
      {status === 'granted' && (
        <>
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </>
      )}

      {status !== 'granted' && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-sm text-muted">
          {status === 'idle' && <p>Requesting camera access…</p>}
          {status === 'denied' && (
            <>
              <p className="text-alert">Camera access denied.</p>
              <p className="max-w-xs text-xs">
                Grant camera permission in your browser to preview a live feed here. Detection
                overlay is simulated until the YOLO inference backend is connected.
              </p>
            </>
          )}
          {status === 'unsupported' && <p>This browser does not support camera capture.</p>}
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded bg-black/60 px-2 py-1 font-mono text-[11px]">
        {status === 'granted' && <span className="h-1.5 w-1.5 rounded-full bg-live scan-pulse" />}
        <span className="text-ink">{cameraName}</span>
      </div>

      {USE_MOCK && (
        <div className="pointer-events-none absolute right-3 top-3 rounded bg-warn/15 px-2 py-1 font-mono text-[10px] text-warn">
          SIMULATED OVERLAY
        </div>
      )}

      <button
        onClick={() => setShowOverlay((s) => !s)}
        className="absolute bottom-3 right-3 rounded border border-line bg-panel/90 px-2.5 py-1 text-xs text-muted hover:text-ink"
      >
        {showOverlay ? 'Hide overlay' : 'Show overlay'}
      </button>
    </div>
  )
}
