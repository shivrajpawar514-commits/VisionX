import { useState } from 'react'
import { Navigation, ZoomIn, ZoomOut, RotateCcw, X, Target, Radio } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  cameraName: string
}

export function PtzControlsModal({ isOpen, onClose, cameraName }: Props) {
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [preset, setPreset] = useState('Preset 1 (Main Gate Ingress)')
  const [activeDir, setActiveDir] = useState<string | null>(null)

  if (!isOpen) return null

  function handlePanTilt(direction: string) {
    setActiveDir(direction)
    setTimeout(() => setActiveDir(null), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-lg flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                PTZ Pan-Tilt-Zoom Controller
              </h2>
              <p className="text-xs text-muted">{cameraName} · ONVIF Profile S</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Virtual Joystick */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-line bg-void/80 shadow-inner">
              {/* Up */}
              <button
                onClick={() => handlePanTilt('UP')}
                className={`absolute top-2 rounded-lg p-2 font-mono text-xs transition-colors ${
                  activeDir === 'UP' ? 'bg-cyber text-void' : 'bg-raised text-muted hover:text-ink border border-line'
                }`}
              >
                ▲ UP
              </button>
              {/* Down */}
              <button
                onClick={() => handlePanTilt('DOWN')}
                className={`absolute bottom-2 rounded-lg p-2 font-mono text-xs transition-colors ${
                  activeDir === 'DOWN' ? 'bg-cyber text-void' : 'bg-raised text-muted hover:text-ink border border-line'
                }`}
              >
                ▼ DOWN
              </button>
              {/* Left */}
              <button
                onClick={() => handlePanTilt('LEFT')}
                className={`absolute left-2 rounded-lg p-2 font-mono text-xs transition-colors ${
                  activeDir === 'LEFT' ? 'bg-cyber text-void' : 'bg-raised text-muted hover:text-ink border border-line'
                }`}
              >
                ◀ LEFT
              </button>
              {/* Right */}
              <button
                onClick={() => handlePanTilt('RIGHT')}
                className={`absolute right-2 rounded-lg p-2 font-mono text-xs transition-colors ${
                  activeDir === 'RIGHT' ? 'bg-cyber text-void' : 'bg-raised text-muted hover:text-ink border border-line'
                }`}
              >
                RIGHT ▶
              </button>

              {/* Center Home */}
              <button
                onClick={() => setZoomLevel(1.0)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cyber/40 bg-cyber/10 text-cyber hover:bg-cyber/20 transition-colors shadow-glow-cyber"
                title="Reset Position"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-4 rounded-lg border border-line bg-void px-4 py-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1.0, z - 0.5))}
                className="rounded p-1 text-muted hover:text-cyber transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono text-xs text-cyber font-bold w-16 text-center">
                {zoomLevel.toFixed(1)}x Zoom
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(5.0, z + 0.5))}
                className="rounded p-1 text-muted hover:text-cyber transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Presets Selector */}
          <div className="space-y-1.5 border-t border-line pt-4">
            <label className="block font-mono text-xs text-muted">PTZ Preset Positions</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="w-full rounded-lg border border-line bg-void px-3 py-2 text-xs text-ink focus:border-cyber focus:outline-none"
            >
              <option>Preset 1 (Main Gate Ingress)</option>
              <option>Preset 2 (Perimeter Fence North)</option>
              <option>Preset 3 (Loading Bay Ramp)</option>
              <option>Preset 4 (Wide Overview Target)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line px-5 py-3 text-right bg-raised/30">
          <button
            onClick={onClose}
            className="rounded-lg border border-line bg-void px-4 py-1.5 font-mono text-xs text-ink hover:bg-raised transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
