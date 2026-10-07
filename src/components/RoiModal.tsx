import { useState } from 'react'
import { X, Sliders, Shield, Save, CheckCircle2, Target } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  cameraName: string
}

export function RoiModal({ isOpen, onClose, cameraName }: Props) {
  const [sensitivity, setSensitivity] = useState(85)
  const [tripwireType, setTripwireType] = useState('bidirectional')
  const [saved, setSaved] = useState(false)

  if (!isOpen) return null

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                ROI & Perimeter Tripwire Editor
              </h2>
              <p className="text-xs text-muted">{cameraName} · Virtual Fence Coordinates</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {saved ? (
          <div className="p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-live/20 text-live border border-live/40 mx-auto shadow-glow-live">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="font-semibold text-live font-mono text-sm">Perimeter Tripwire Parameters Updated</div>
            <p className="text-xs text-muted">Active detection matrix synced to edge stream worker node.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            {/* Interactive Canvas Canvas Mockup */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-void grid-pattern flex items-center justify-center">
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-cyber/80 border-t border-b border-cyber shadow-glow-cyber flex items-center justify-between px-4">
                <span className="font-mono text-[9px] bg-cyber text-void px-1.5 py-0.5 rounded font-bold">START: (x:0.1, y:0.5)</span>
                <span className="font-mono text-[9px] bg-cyber text-void px-1.5 py-0.5 rounded font-bold">END: (x:0.9, y:0.5)</span>
              </div>
              <div className="font-mono text-xs text-muted/60 bg-panel/80 px-3 py-1.5 rounded border border-line">
                Interactive Perimeter Tripwire Line #01
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Direction Crossing Rule</label>
                <select
                  value={tripwireType}
                  onChange={(e) => setTripwireType(e.target.value)}
                  className="w-full rounded-lg border border-line bg-void px-3 py-2 text-xs text-ink focus:border-cyber focus:outline-none"
                >
                  <option value="bidirectional">Bi-Directional (In & Out)</option>
                  <option value="ingress_only">Ingress / Entry Only</option>
                  <option value="egress_only">Egress / Exit Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">Detection Sensitivity ({sensitivity}%)</label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-cyber"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line bg-void px-4 py-2 font-mono text-xs text-ink hover:bg-raised transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-cyber/40 bg-cyber/20 px-4 py-2 font-mono text-xs font-semibold text-cyber hover:bg-cyber/30 transition-all shadow-glow-cyber"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Tripwire Config</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
