import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { AnalyticsEvent, EventSeverity } from '@/types'
import { AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react'

const severityConfig: Record<EventSeverity, { badgeStyle: string; icon: any }> = {
  critical: { badgeStyle: 'bg-alert/20 text-alert border-alert/30', icon: ShieldAlert },
  warning: { badgeStyle: 'bg-warn/20 text-warn border-warn/30', icon: AlertTriangle },
  info: { badgeStyle: 'bg-cyber/20 text-cyber border-cyber/30', icon: Info },
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
    return <p className="py-6 text-center text-xs text-muted">No security events recorded in window.</p>
  }

  return (
    <div className="space-y-2.5">
      {visible.map((e) => {
        const config = severityConfig[e.severity] || severityConfig.info
        const Icon = config.icon
        return (
          <div
            key={e.id}
            className={`group relative flex items-start gap-3 rounded-lg border p-3 transition-all ${
              e.acknowledged
                ? 'border-line/60 bg-void/40 opacity-60'
                : 'border-line bg-void/80 hover:border-line-bright shadow-sm'
            }`}
          >
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${config.badgeStyle}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold text-ink">
                  {e.cameraName || 'CAM-01'}
                </span>
                <span className="font-mono text-[10px] text-muted">{timeAgo(e.timestamp)}</span>
              </div>
              <p className={`mt-0.5 text-xs ${e.acknowledged ? 'text-muted line-through' : 'text-slate-200'}`}>
                {e.message || e.title || e.description}
              </p>
            </div>

            {!e.acknowledged && (
              <button
                onClick={() => ack(e.id)}
                className="shrink-0 rounded border border-line bg-raised px-2 py-1 font-mono text-[10px] text-muted hover:border-live hover:text-live transition-colors flex items-center gap-1"
                title="Acknowledge alert"
              >
                <Check className="h-3 w-3" />
                <span>Ack</span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
