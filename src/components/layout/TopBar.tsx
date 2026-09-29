import { useEffect, useState } from 'react'
import { VideoSummarizerModal } from '@/components/VideoSummarizerModal'
import { HITLCorrectionModal } from '@/components/HITLCorrectionModal'
import { USE_MOCK, setUseMock } from '@/lib/api'

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [now, setNow] = useState(new Date())
  const [summarizerOpen, setSummarizerOpen] = useState(false)
  const [hitlOpen, setHitlOpen] = useState(false)
  const [isMock, setIsMock] = useState(USE_MOCK)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function toggleMock() {
    const next = !isMock
    setIsMock(next)
    setUseMock(next)
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-line px-6 py-3.5 bg-panel/50 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-semibold text-ink tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSummarizerOpen(true)}
            className="flex items-center gap-1.5 rounded border border-line bg-raised px-3 py-1.5 font-mono text-xs text-ink hover:border-live/60 hover:text-live transition-colors"
          >
            <span>⚡</span>
            <span>AI Summarizer</span>
          </button>

          <button
            onClick={() => setHitlOpen(true)}
            className="flex items-center gap-1.5 rounded border border-line bg-raised px-3 py-1.5 font-mono text-xs text-ink hover:border-live/60 hover:text-live transition-colors"
          >
            <span>🎯</span>
            <span>HITL Feedback</span>
          </button>

          <button
            onClick={toggleMock}
            title="Toggle between Live FastAPI/WebSocket backend and local mock mode"
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-xs transition-colors ${
              !isMock
                ? 'border-live/50 bg-live/15 text-live'
                : 'border-warn/50 bg-warn/15 text-warn'
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${!isMock ? 'bg-live animate-pulse' : 'bg-warn'}`} />
            <span>{!isMock ? 'LIVE API' : 'MOCK MODE'}</span>
          </button>

          <div className="border-l border-line pl-3 font-mono text-xs tabular text-muted">
            {now.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      <VideoSummarizerModal isOpen={summarizerOpen} onClose={() => setSummarizerOpen(false)} />
      <HITLCorrectionModal isOpen={hitlOpen} onClose={() => setHitlOpen(false)} />
    </>
  )
}
