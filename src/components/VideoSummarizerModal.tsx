import { useState } from 'react'
import { api } from '@/lib/api'
import type { VideoSummaryResponse } from '@/types'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-line bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-live animate-pulse" />
            <h2 className="font-mono text-base font-semibold text-ink">AI Video Activity Summarizer</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-raised hover:text-ink font-mono"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded border border-line bg-raised p-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">Time Window:</span>
              {[1, 4, 12, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`rounded px-2.5 py-1 font-mono text-xs transition-colors ${
                    hours === h ? 'bg-live text-black font-semibold' : 'bg-panel text-muted hover:text-ink'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="rounded border border-live/40 bg-live/15 px-4 py-1.5 font-mono text-xs text-live hover:bg-live/25 disabled:opacity-50"
            >
              {loading ? 'Synthesizing…' : 'Generate Briefing'}
            </button>
          </div>

          {!summary && !loading && (
            <div className="py-8 text-center text-sm text-muted">
              Select a time window and click "Generate Briefing" to synthesize multi-camera activity.
            </div>
          )}

          {summary && (
            <div className="space-y-4">
              <div className="rounded border border-line bg-raised/50 p-4">
                <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-live">Executive Summary</h3>
                <pre className="whitespace-pre-wrap font-sans text-sm text-ink leading-relaxed">
                  {summary.summary_markdown}
                </pre>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted">Timeline Highlights</h3>
                <div className="space-y-2">
                  {summary.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 rounded border border-line bg-panel p-2.5 text-xs">
                      <span className="shrink-0 font-mono text-muted">{h.time}</span>
                      <span className="shrink-0 font-medium text-ink">[{h.camera}]</span>
                      <span className="flex-1 text-muted">{h.event}</span>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] ${
                        h.severity === 'CRITICAL' ? 'bg-alarm/20 text-alarm' :
                        h.severity === 'WARNING' ? 'bg-warn/20 text-warn' : 'bg-live/20 text-live'
                      }`}>
                        {h.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line px-5 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded border border-line bg-raised px-4 py-1.5 font-mono text-xs text-ink hover:bg-raised/70"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
