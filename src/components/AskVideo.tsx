import { useState } from 'react'
import { api } from '@/lib/api'
import type { NLQueryResponse } from '@/types'
import { Sparkles, Terminal, ArrowRight, CheckCircle2, Code2, ShieldAlert } from 'lucide-react'

const SUGGESTIONS = [
  'What PPE safety violations occurred today?',
  'How many vehicles entered through main gate?',
  'Did any vehicle exceed the speed limit?',
  'Show restricted zone intrusions at North Fence',
]

export function AskVideo() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<NLQueryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)

  async function ask(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await api.askVideo(q)
      setResult(res)
    } catch {
      setResult({
        query: q,
        intent: 'general_query',
        structured_query: {},
        result_count: 0,
        answer: 'Failed to process query against analytics engine.',
        confidence: 0.0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(question)
        }}
        className="relative flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask AI what happened in the video streams..."
            className="w-full rounded-lg border border-line bg-void/80 pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ai focus:outline-none focus:ring-1 focus:ring-ai/50 shadow-inner"
          />
          <Sparkles className="absolute left-3 top-3 h-4 w-4 text-ai" />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 rounded-lg border border-ai/40 bg-ai/15 px-4 py-2.5 font-mono text-xs font-semibold text-ai hover:bg-ai/25 disabled:opacity-40 transition-all shadow-glow-ai"
        >
          <span>{loading ? 'Synthesizing…' : 'Query Engine'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Suggestion Chips */}
      {!result && !loading && (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="font-mono text-[11px] text-muted self-center mr-1">Suggested:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuestion(s)
                ask(s)
              }}
              className="rounded-lg border border-line bg-raised/60 px-3 py-1 text-xs text-muted hover:border-ai/50 hover:text-ai hover:bg-ai/10 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-ai/30 bg-raised/70 p-4 text-sm text-ink backdrop-blur-md shadow-glow-ai">
          <div className="flex items-center justify-between border-b border-line/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-ai/20 text-ai font-mono text-xs font-bold">
                AI
              </div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ai">
                Natural Language Result
              </span>
              <span className="rounded-full bg-void px-2 py-0.5 font-mono text-[10px] text-muted border border-line">
                Intent: {result.intent}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-1 font-mono text-[11px] text-muted hover:text-cyber transition-colors"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{showJson ? 'Hide JSON' : 'Inspect AST'}</span>
              </button>
              <span className="font-mono text-xs text-live font-medium">
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>
          </div>

          <p className="leading-relaxed text-sm text-slate-200">{result.answer}</p>

          {showJson && (
            <pre className="overflow-x-auto rounded-lg border border-line bg-void p-3 font-mono text-xs text-cyber">
              {JSON.stringify(result.structured_query, null, 2)}
            </pre>
          )}

          {result.details && result.details.length > 0 && (
            <div className="mt-1 space-y-2 border-t border-line/60 pt-2.5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider font-semibold">
                Grounding Video Events
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.details.map((d, i) => (
                  <div key={i} className="rounded-lg border border-line bg-void/80 p-2.5 text-xs font-mono space-y-1">
                    {Object.entries(d).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted capitalize">{k.replace('_', ' ')}:</span>
                        <span className="text-ink font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
