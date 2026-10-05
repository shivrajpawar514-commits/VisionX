import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  LayoutDashboard,
  ShieldAlert,
  Camera,
  Cpu,
  Activity,
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowRight,
} from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else setQuery('')
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const items = [
    {
      label: 'Overview Dashboard',
      subtitle: 'Main camera grid, telemetry, and live analytics',
      icon: LayoutDashboard,
      action: () => {
        navigate('/')
        onClose()
      },
    },
    {
      label: 'Events & Threats Feed',
      subtitle: 'Zone intrusion, PPE, loitering, and perimeter alerts',
      icon: ShieldAlert,
      action: () => {
        navigate('/events')
        onClose()
      },
    },
    {
      label: 'Camera Management',
      subtitle: '4 connected RTSP streams, resolution & ROI config',
      icon: Camera,
      action: () => {
        navigate('/cameras')
        onClose()
      },
    },
    {
      label: 'AI Models & Benchmarks',
      subtitle: 'YOLOv8, TensorRT INT8, ONNX Runtime acceleration',
      icon: Cpu,
      action: () => {
        navigate('/models')
        onClose()
      },
    },
    {
      label: 'System Health Observability',
      subtitle: 'GPU utilization, VRAM, latency P95, dropped frames',
      icon: Activity,
      action: () => {
        navigate('/health')
        onClose()
      },
    },
  ]

  const filtered = items.filter(
    (i) =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.subtitle.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-void/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 bg-raised/50">
          <Search className="h-5 w-5 text-cyber" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search pages... (e.g. 'cameras', 'models', 'events')"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-line bg-void px-2 py-0.5 font-mono text-[10px] text-muted sm:inline-block">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No command matched "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-cyber/10 hover:border-cyber/30 border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-void group-hover:border-cyber/40 group-hover:text-cyber transition-colors">
                        <Icon className="h-4 w-4 text-muted group-hover:text-cyber" />
                      </div>
                      <div>
                        <div className="font-medium text-ink group-hover:text-cyber transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-muted">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 group-hover:text-cyber transition-all -translate-x-1 group-hover:translate-x-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 bg-void/50 text-[11px] font-mono text-muted">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-ai" />
            <span>VisionX Engine v0.1.0</span>
          </div>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  )
}
