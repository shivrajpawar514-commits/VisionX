import { useState } from 'react'
import { Camera, Download, X, Eye, ShieldAlert, Sparkles, Filter } from 'lucide-react'

interface SnapshotItem {
  id: string
  cameraName: string
  timestamp: string
  label: string
  confidence: number
  resolution: string
}

const MOCK_SNAPSHOTS: SnapshotItem[] = [
  { id: 'SNAP-001', cameraName: 'CAM-01 Main Entrance', timestamp: '18:30:12', label: 'person', confidence: 0.94, resolution: '1920x1080' },
  { id: 'SNAP-002', cameraName: 'CAM-02 Loading Bay', timestamp: '18:15:44', label: 'ppe_violation', confidence: 0.88, resolution: '1920x1080' },
  { id: 'SNAP-003', cameraName: 'CAM-03 North Fence', timestamp: '17:42:01', label: 'vehicle', confidence: 0.91, resolution: '1920x1080' },
  { id: 'SNAP-004', cameraName: 'CAM-04 Server Room', timestamp: '17:10:55', label: 'unauthorized_zone', confidence: 0.96, resolution: '1280x720' },
]

export function StreamSnapshotGalleryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>(MOCK_SNAPSHOTS)
  const [filter, setFilter] = useState('ALL')

  if (!isOpen) return null

  const filtered = filter === 'ALL' ? snapshots : snapshots.filter((s) => s.cameraName.includes(filter))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                Stream Snapshot Gallery
              </h2>
              <p className="text-xs text-muted">Captured bounding box crops & canvas snapshots</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-2.5 bg-void/40">
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <Filter className="h-3.5 w-3.5 text-cyber" />
            <span>Filter Camera:</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            {['ALL', 'CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'].map((cam) => (
              <button
                key={cam}
                onClick={() => setFilter(cam)}
                className={`rounded px-2.5 py-1 transition-colors ${
                  filter === cam ? 'bg-cyber text-void font-bold' : 'text-muted hover:text-ink bg-raised'
                }`}
              >
                {cam}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Snapshots */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-xl border border-line bg-void/80 hover:border-cyber/40 transition-all shadow-sm">
                <div className="relative aspect-video w-full bg-void grid-pattern flex items-center justify-center border-b border-line">
                  <div className="absolute inset-4 rounded border-2 border-cyber/80 flex items-start justify-between p-2">
                    <span className="font-mono text-[9px] bg-cyber text-void px-1.5 py-0.5 font-bold uppercase rounded">
                      #{item.id} {item.label} {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted/50">CANVAS FRAME SNAPSHOT</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-semibold text-ink">{item.cameraName}</div>
                    <div className="font-mono text-[10px] text-muted">{item.timestamp} · {item.resolution}</div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading snapshot ${item.id}`)}
                    className="flex items-center gap-1 rounded-lg border border-line bg-raised px-2.5 py-1 font-mono text-xs text-muted hover:text-cyber hover:border-cyber/40 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
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
