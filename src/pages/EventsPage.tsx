import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { EventFeed } from '@/components/EventFeed'
import { api } from '@/lib/api'
import type { AnalyticsEvent, EventSeverity } from '@/types'

const severities: EventSeverity[] = ['critical', 'warning', 'info']

export function EventsPage() {
  const [all, setAll] = useState<AnalyticsEvent[]>([])
  const [filter, setFilter] = useState<EventSeverity | 'all'>('all')

  useEffect(() => {
    api.getEvents(40).then(setAll)
  }, [])

  const counts = severities.reduce<Record<EventSeverity, number>>(
    (acc, s) => ({ ...acc, [s]: all.filter((e) => e.severity === s).length }),
    { critical: 0, warning: 0, info: 0 },
  )

  return (
    <>
      <TopBar title="Events" subtitle="Zone intrusion, PPE, loitering, crowd and traffic events across all cameras" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded border px-3 py-1.5 text-xs ${
              filter === 'all' ? 'border-live text-live' : 'border-line text-muted'
            }`}
          >
            All ({all.length})
          </button>
          {severities.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded border px-3 py-1.5 text-xs capitalize ${
                filter === s ? 'border-live text-live' : 'border-line text-muted'
              }`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>
        <Panel label="EVENT LOG">
          <EventFeed limit={40} severity={filter} />
        </Panel>
      </div>
    </>
  )
}
