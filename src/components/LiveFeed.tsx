import { useEffect, useRef, useState } from 'react'
import { USE_MOCK } from '@/lib/api'
import { Camera, Eye, EyeOff, Maximize2, RefreshCw, ShieldAlert, Sparkles, Volume2, VolumeX } from 'lucide-react'

interface SimTarget {
  id: string
  x: number
  y: number
  w: number
  h: number
  cls: 'person' | 'vehicle' | 'ppe_violation' | 'unauthorized_zone'
  conf: number
  vx: number
  vy: number
  speed: number
}

function seedTargets(): SimTarget[] {
  return [
    { id: 'TRK-104', x: 0.18, y: 0.32, w: 0.14, h: 0.38, cls: 'person', conf: 0.94, vx: 0.0008, vy: 0.0004, speed: 4.2 },
    { id: 'TRK-219', x: 0.58, y: 0.25, w: 0.22, h: 0.45, cls: 'vehicle', conf: 0.91, vx: -0.0011, vy: 0.0002, speed: 28.5 },
    { id: 'TRK-308', x: 0.42, y: 0.55, w: 0.12, h: 0.32, cls: 'ppe_violation', conf: 0.88, vx: 0.0005, vy: -0.0003, speed: 3.1 },
  ]
}

export function LiveFeed({ cameraName = 'CAM-01 · Main Entrance' }: { cameraName?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const targetsRef = useRef<SimTarget[]>(seedTargets())
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle')
  const [showOverlay, setShowOverlay] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [syntheticMode, setSyntheticMode] = useState(true)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

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
        setSyntheticMode(false)
      } catch {
        setStatus('denied')
        setSyntheticMode(true)
      }
    }
    start()
    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // Canvas Rendering Loop (Both Real Video Overlay & Synthetic CCTV Mode)
  useEffect(() => {
    let raf: number
    function draw() {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const width = canvas.parentElement?.clientWidth || 800
      const height = canvas.parentElement?.clientHeight || 450
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Render Synthetic High-Tech CCTV Background if Real Camera is OFF/Denied
      if (syntheticMode || status !== 'granted') {
        // Dark background
        ctx.fillStyle = '#06090E'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
        ctx.lineWidth = 1
        const gridSize = 40
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }

        // Perspective tripwire line
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'
        ctx.setLineDash([8, 4])
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(canvas.width * 0.1, canvas.height * 0.7)
        ctx.lineTo(canvas.width * 0.9, canvas.height * 0.7)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = '#06B6D4'
        ctx.font = '10px "IBM Plex Mono", monospace'
        ctx.fillText('TRIPWIRE_PERIMETER_01', canvas.width * 0.1 + 8, canvas.height * 0.7 - 6)

        // Radar Crosshair in Center
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)'
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2)
        ctx.moveTo(canvas.width / 2 - 80, canvas.height / 2)
        ctx.lineTo(canvas.width / 2 + 80, canvas.height / 2)
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 80)
        ctx.lineTo(canvas.width / 2, canvas.height / 2 + 80)
        ctx.stroke()
      }

      // Draw Detection Bounding Boxes Overlay
      if (showOverlay) {
        for (const b of targetsRef.current) {
          b.x += b.vx
          b.y += b.vy
          if (b.x < 0.05 || b.x + b.w > 0.95) b.vx *= -1
          if (b.y < 0.05 || b.y + b.h > 0.95) b.vy *= -1

          const px = b.x * canvas.width
          const py = b.y * canvas.height
          const pw = b.w * canvas.width
          const ph = b.h * canvas.height

          const isAlert = b.cls === 'ppe_violation' || b.cls === 'unauthorized_zone'
          const boxColor = isAlert ? '#EF4444' : b.cls === 'vehicle' ? '#06B6D4' : '#10B981'

          // Bounding Box Corners
          ctx.strokeStyle = boxColor
          ctx.lineWidth = 2
          ctx.strokeRect(px, py, pw, ph)

          // Corner Reticles
          const cornerLen = 10
          ctx.lineWidth = 3
          // top-left
          ctx.beginPath()
          ctx.moveTo(px, py + cornerLen)
          ctx.lineTo(px, py)
          ctx.lineTo(px + cornerLen, py)
          ctx.stroke()
          // top-right
          ctx.beginPath()
          ctx.moveTo(px + pw - cornerLen, py)
          ctx.lineTo(px + pw, py)
          ctx.lineTo(px + pw, py + cornerLen)
          ctx.stroke()

          // Label Header
          const label = `#${b.id} ${b.cls.toUpperCase()} ${(b.conf * 100).toFixed(0)}%`
          ctx.font = '11px "IBM Plex Mono", monospace'
          const tw = ctx.measureText(label).width + 12
          ctx.fillStyle = boxColor
          ctx.fillRect(px, py - 20, tw, 20)

          ctx.fillStyle = '#070A0F'
          ctx.fillText(label, px + 6, py - 6)

          // Speed & Vector Sub-tag
          ctx.fillStyle = 'rgba(7, 10, 15, 0.85)'
          ctx.fillRect(px, py + ph, 110, 16)
          ctx.fillStyle = '#94A3B8'
          ctx.font = '9px "IBM Plex Mono", monospace'
          ctx.fillText(`VEL: ${b.speed} km/h`, px + 4, py + ph + 11)
        }
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [showOverlay, syntheticMode, status])

  function downloadSnapshot() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `visionx-snapshot-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-void shadow-2xl glass-panel"
    >
      {/* Video Tag for Webcam Stream */}
      {status === 'granted' && !syntheticMode && (
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
      )}

      {/* HTML5 Canvas Overlay (Real or Synthetic Stream) */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

      {/* Top Stream Header HUD Overlay */}
      <div className="pointer-events-none absolute left-3 top-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 rounded-lg border border-line/80 bg-void/80 px-3 py-1.5 backdrop-blur-md text-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
          </span>
          <span className="font-mono font-medium text-ink">{cameraName}</span>
          <span className="font-mono text-[10px] text-muted border-l border-line pl-2">
            1080p60 · H.264
          </span>
        </div>

        <div className="flex items-center gap-2">
          {syntheticMode && (
            <div className="rounded-lg border border-cyber/40 bg-cyber/15 px-2.5 py-1 font-mono text-[10px] text-cyber backdrop-blur-md flex items-center gap-1.5 shadow-glow-cyber">
              <Sparkles className="h-3 w-3" />
              <span>SYNTHETIC INFERENCE FEED</span>
            </div>
          )}

          {USE_MOCK && (
            <div className="rounded-lg border border-warn/40 bg-warn/15 px-2.5 py-1 font-mono text-[10px] text-warn backdrop-blur-md">
              MOCK BACKEND
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-void/80 p-1 backdrop-blur-md">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
              showOverlay ? 'bg-cyber/20 text-cyber border border-cyber/30' : 'text-muted hover:text-ink'
            }`}
          >
            {showOverlay ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showOverlay ? 'Overlays ON' : 'Overlays OFF'}</span>
          </button>

          <button
            onClick={() => setSyntheticMode(!syntheticMode)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
              syntheticMode ? 'bg-ai/20 text-ai border border-ai/30' : 'text-muted hover:text-ink'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{syntheticMode ? 'Synthetic Feed' : 'Live Webcam'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-line bg-void/80 p-1 backdrop-blur-md">
          <button
            onClick={downloadSnapshot}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono text-muted hover:text-cyber hover:bg-raised transition-colors"
            title="Download canvas snapshot"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Snapshot</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:text-ink hover:bg-raised transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
