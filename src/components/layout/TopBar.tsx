import { useEffect, useState } from 'react'
import { VideoSummarizerModal } from '@/components/VideoSummarizerModal'
import { HITLCorrectionModal } from '@/components/HITLCorrectionModal'
import { CommandPalette } from '@/components/CommandPalette'
import { USE_MOCK, setUseMock } from '@/lib/api'
import {
  Sparkles,
  Target,
  Search,
  Radio,
  Clock,
  Bell,
  Sliders,
} from 'lucide-react'

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [now, setNow] = useState(new Date())
  const [summarizerOpen, setSummarizerOpen] = useState(false)
  const [hitlOpen, setHitlOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-panel/70 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-cyber font-semibold">
                VisionX Console
              </span>
              <span className="text-muted">/</span>
              <h1 className="text-sm font-semibold text-ink tracking-tight">{title}</h1>
            </div>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search / Command Palette */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-line bg-void/80 px-3 py-1.5 text-xs text-muted hover:border-cyber/50 hover:text-ink transition-all shadow-sm group"
          >
            <Search className="h-3.5 w-3.5 text-cyber group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search commands...</span>
            <kbd className="hidden md:inline-block rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-muted">
              ⌘K
            </kbd>
          </button>

          {/* AI Summarizer Button */}
          <button
            onClick={() => setSummarizerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-ai/40 bg-ai/10 px-3 py-1.5 font-mono text-xs text-ai hover:bg-ai/20 hover:border-ai/60 shadow-glow-ai transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Briefing</span>
          </button>

          {/* HITL Feedback Button */}
          <button
            onClick={() => setHitlOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-cyber/40 bg-cyber/10 px-3 py-1.5 font-mono text-xs text-cyber hover:bg-cyber/20 hover:border-cyber/60 transition-all"
          >
            <Target className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">HITL Feedback</span>
          </button>

          {/* Backend Mode Toggle */}
          <button
            onClick={toggleMock}
            title="Toggle between Live FastAPI/WebSocket backend and local mock mode"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-all ${
              !isMock
                ? 'border-live/50 bg-live/15 text-live shadow-glow-live'
                : 'border-warn/50 bg-warn/15 text-warn'
            }`}
          >
            <Radio className={`h-3 w-3 ${!isMock ? 'animate-pulse text-live' : 'text-warn'}`} />
            <span className="font-semibold">{!isMock ? 'LIVE API' : 'MOCK'}</span>
          </button>

          {/* Clock */}
          <div className="hidden border-l border-line pl-3 lg:flex items-center gap-2 font-mono text-xs text-muted tabular">
            <Clock className="h-3.5 w-3.5 text-cyber" />
            <span>{now.toLocaleTimeString('en-US', { hour12: false })}</span>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <VideoSummarizerModal isOpen={summarizerOpen} onClose={() => setSummarizerOpen(false)} />
      <HITLCorrectionModal isOpen={hitlOpen} onClose={() => setHitlOpen(false)} />
    </>
  )
}
