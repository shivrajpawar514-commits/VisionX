import { useState } from 'react'
import { api } from '@/lib/api'
import type { NLQueryResponse } from '@/types'

const SUGGESTIONS = [
  'What PPE safety violations occurred today?',
  'How many vehicles entered through the main gate?',
  'Did any vehicle exceed the speed limit?',
  'Show me restricted zone intrusions at North Fence',
]

export function AskVideo() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<NLQueryResponse | null>(null)
  const [loading, setLoading] = useState(false)

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
        answer: 'Failed to process query against analytics backend.',
        confidence: 0.0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(question)
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask what happened in the video… (e.g., 'What safety violations occurred today?')"
          className="flex-1 rounded border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-live focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded border border-live/40 bg-live/10 px-4 py-2 font-mono text-sm text-live hover:bg-live/20 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Querying Engine…' : 'Ask Video'}
        </button>
      </form>

      {!result && !loading && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuestion(s)
                ask(s)
              }}
              className="rounded-full border border-line bg-panel/60 px-3 py-1 text-xs text-muted hover:border-live/60 hover:text-live transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2 rounded border border-live/30 bg-raised/80 p-4 text-sm text-ink">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-live">AI Video Answer</span>
              <span className="rounded bg-panel px-2 py-0.5 font-mono text-[10px] text-muted">
                Intent: {result.intent}
              </span>
            </div>
            <span className="font-mono text-xs text-muted">
              Confidence: {Math.round(result.confidence * 100)}%
            </span>
          </div>

          <p className="leading-relaxed text-sm">{result.answer}</p>

          {result.details && result.details.length > 0 && (
            <div className="mt-2 space-y-1.5 border-t border-line/60 pt-2">
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Grounding Records</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {result.details.map((d, i) => (
                  <div key={i} className="rounded border border-line bg-panel p-2 text-xs">
                    {Object.entries(d).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-0.5">
                        <span className="text-muted capitalize">{k.replace('_', ' ')}:</span>
                        <span className="font-mono font-medium">{String(v)}</span>
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
