import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { AnalyticsEvent, EventSeverity } from '@/types'

const severityColor: Record<EventSeverity, string> = {
  critical: 'bg-alert',
  warning: 'bg-warn',
  info: 'bg-data',
}

function timeAgo(isoOrTimestamp: string | number) {
  const ts = typeof isoOrTimestamp === 'number' ? isoOrTimestamp * 1000 : new Date(isoOrTimestamp).getTime()
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  return `${Math.round(s / 3600)}h ago`
}

export function EventFeed({
  limit = 12,
  severity = 'all',
}: {
  limit?: number
  severity?: EventSeverity | 'all'
}) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    api.getEvents(limit).then(setEvents)
  }, [limit])

  const visible = severity === 'all' ? events : events.filter((e) => e.severity === severity)

  async function ack(id: string) {
    setEvents((evts) => evts.map((e) => (e.id === id ? { ...e, acknowledged: true } : e)))
    await api.acknowledgeEvent(id)
  }

  if (visible.length === 0) {
    return <p className="text-sm text-muted">No events in the current window.</p>
  }

  return (
    <ul className="flex flex-col divide-y divide-line">
      {visible.map((e) => (
        <li key={e.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${severityColor[e.severity] || 'bg-data'}`} />
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${e.acknowledged ? 'text-muted' : 'text-ink'}`}>{e.message || e.title || e.description}</p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">{timeAgo(e.timestamp)}</p>
          </div>
          {!e.acknowledged && (
            <button
              onClick={() => ack(e.id)}
              className="shrink-0 rounded border border-line px-2 py-1 text-[11px] text-muted hover:border-live hover:text-live font-mono"
            >
              Ack
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
