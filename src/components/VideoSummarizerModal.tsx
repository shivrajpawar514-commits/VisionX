import { useState } from 'react'
import { api } from '@/lib/api'
import type { VideoSummaryResponse } from '@/types'
import { Sparkles, Clock, X, FileText, CheckCircle2, ShieldAlert, AlertTriangle, Info } from 'lucide-react'

export function VideoSummarizerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [hours, setHours] = useState(4)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<VideoSummaryResponse | null>(null)

  if (!isOpen) return null

  async function generate() {
    setLoading(true)
    try {
      const res = await api.summarizeVideo(hours)
      setSummary(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-ai/10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ai/40 bg-ai/10 text-ai shadow-glow-ai">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold tracking-tight text-ink uppercase">
                AI Video Activity Briefing
              </h2>
              <p className="text-xs text-muted">Generative multi-camera timeline synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-void/60 p-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyber" />
                <span>Time Window:</span>
              </span>
              {[1, 4, 12, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`rounded-md px-3 py-1 font-mono text-xs transition-all ${
                    hours === h
                      ? 'bg-ai text-void font-bold shadow-glow-ai'
                      : 'bg-raised text-muted hover:text-ink border border-line'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-ai/40 bg-ai/20 px-4 py-2 font-mono text-xs font-semibold text-ai hover:bg-ai/30 disabled:opacity-50 transition-all shadow-glow-ai"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? 'Synthesizing…' : 'Generate Briefing'}</span>
            </button>
          </div>

          {!summary && !loading && (
            <div className="py-12 text-center text-xs text-muted space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted/40" />
              <p>Select a time window and click "Generate Briefing" to synthesize multi-camera activity.</p>
            </div>
          )}

          {summary && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-xl border border-ai/30 bg-void/80 p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ai">
                    Executive Summary
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Past {summary.time_window_hours} Hours
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                  {summary.summary_markdown}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Key Timeline Highlights
                </h3>
                <div className="space-y-2">
                  {summary.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-line bg-raised/40 p-3 text-xs"
                    >
                      <span className="shrink-0 font-mono text-cyber font-medium">{h.time}</span>
                      <span className="shrink-0 font-mono font-semibold text-ink">[{h.camera}]</span>
                      <span className="flex-1 text-slate-300">{h.event}</span>
                      <span
                        className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] uppercase ${
                          h.severity === 'CRITICAL'
                            ? 'bg-alert/20 text-alert border border-alert/30'
                            : h.severity === 'WARNING'
                            ? 'bg-warn/20 text-warn border border-warn/30'
                            : 'bg-live/20 text-live border border-live/30'
                        }`}
                      >
                        {h.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
