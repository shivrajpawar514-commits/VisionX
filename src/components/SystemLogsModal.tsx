import { useState } from 'react'
import { Terminal, Download, X, Search, Filter, Trash2 } from 'lucide-react'

interface LogEntry {
  id: number
  time: string
  level: 'INFO' | 'WARN' | 'DEBUG' | 'ERROR'
  source: string
  message: string
}

const INITIAL_LOGS: LogEntry[] = [
  { id: 1, time: '18:45:00', level: 'INFO', source: 'InferenceEngine', message: 'NVIDIA TensorRT INT8 engine loaded on GPU:0 (3.02x acceleration)' },
  { id: 2, time: '18:45:04', level: 'DEBUG', source: 'StreamManager', message: 'RTSP connection established on CAM-01 (1080p60 H.264)' },
  { id: 3, time: '18:45:10', level: 'INFO', source: 'ByteTrack', message: 'Target #TRK-104 direction vector calculated (Heading: 42° East)' },
  { id: 4, time: '18:45:18', level: 'WARN', source: 'SafetyMonitor', message: 'PPE violation flagged on worker #TRK-308 (Hard Hat missing)' },
  { id: 5, time: '18:45:25', level: 'INFO', source: 'AnalyticsEngine', message: 'Spatial heatmap matrix updated (32 active density cells)' },
  { id: 6, time: '18:45:30', level: 'DEBUG', source: 'PrometheusExporter', message: 'Telemetry scrape request completed in 0.8ms' },
]

export function SystemLogsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('ALL')

  if (!isOpen) return null

  const filtered = logs.filter((l) => {
    const matchesLevel = levelFilter === 'ALL' || l.level === levelFilter
    const matchesSearch = l.message.toLowerCase().includes(search.toLowerCase()) || l.source.toLowerCase().includes(search.toLowerCase())
    return matchesLevel && matchesSearch
  })

  function exportLogs() {
    const text = logs.map((l) => `${l.time} [${l.level}] [${l.source}] ${l.message}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visionx-system-logs-${Date.now()}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                System Audit & Diagnostic Logs
              </h2>
              <p className="text-xs text-muted">Backend inference & stream worker console</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 bg-void/40">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by keyword..."
              className="w-full rounded-lg border border-line bg-void pl-8 pr-3 py-1.5 font-mono text-xs text-ink placeholder:text-muted focus:border-cyber focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono text-xs">
              {['ALL', 'INFO', 'WARN', 'DEBUG'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`rounded px-2.5 py-1 transition-colors ${
                    levelFilter === lvl ? 'bg-cyber text-void font-bold' : 'text-muted hover:text-ink bg-raised'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={exportLogs}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-raised px-3 py-1.5 font-mono text-xs text-muted hover:text-cyber hover:border-cyber/40 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Logs Terminal Body */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs space-y-2 bg-void">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted">No logs matched filter criteria.</div>
          ) : (
            filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded border border-line/40 bg-panel/60 p-2 text-xs">
                <span className="text-muted shrink-0">{log.time}</span>
                <span
                  className={`shrink-0 font-bold ${
                    log.level === 'WARN' ? 'text-warn' : log.level === 'INFO' ? 'text-cyber' : 'text-muted'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="shrink-0 text-live font-semibold">[{log.source}]</span>
                <span className="text-slate-200 flex-1">{log.message}</span>
              </div>
            ))
          )}
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
