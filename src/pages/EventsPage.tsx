import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { EventFeed } from '@/components/EventFeed'
import { api } from '@/lib/api'
import type { AnalyticsEvent, EventSeverity } from '@/types'
import { ShieldAlert, AlertTriangle, Info, Download, CheckCircle2, Search, Filter } from 'lucide-react'

const severities: EventSeverity[] = ['critical', 'warning', 'info']

export function EventsPage() {
  const [all, setAll] = useState<AnalyticsEvent[]>([])
  const [filter, setFilter] = useState<EventSeverity | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.getEvents(50).then(setAll)
  }, [])

  const counts = severities.reduce<Record<EventSeverity, number>>(
    (acc, s) => ({ ...acc, [s]: all.filter((e) => e.severity === s).length }),
    { critical: 0, warning: 0, info: 0 },
  )

  function exportEvents() {
    const jsonStr = JSON.stringify(all, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visionx-events-audit-${Date.now()}.json`
    a.click()
  }

  return (
    <>
      <TopBar title="Events & Threats" subtitle="Real-time perimeter intrusion, PPE non-compliance, and anomaly logs" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Counter Header Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`glass-panel p-4 rounded-xl border transition-all text-left ${
              filter === 'all' ? 'border-cyber bg-cyber/10 shadow-glow-cyber' : 'border-line hover:border-line-bright'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted">Total Events</span>
              <Filter className="h-4 w-4 text-cyber" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-ink">{all.length}</div>
          </button>

          <button
            onClick={() => setFilter('critical')}
            className={`glass-panel p-4 rounded-xl border transition-all text-left ${
              filter === 'critical' ? 'border-alert bg-alert/10 shadow-glow-alert' : 'border-line hover:border-line-bright'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-alert font-semibold uppercase">Critical</span>
              <ShieldAlert className="h-4 w-4 text-alert" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-alert">{counts.critical}</div>
          </button>

          <button
            onClick={() => setFilter('warning')}
            className={`glass-panel p-4 rounded-xl border transition-all text-left ${
              filter === 'warning' ? 'border-warn bg-warn/10 shadow-glow-alert' : 'border-line hover:border-line-bright'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-warn font-semibold uppercase">Warning</span>
              <AlertTriangle className="h-4 w-4 text-warn" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-warn">{counts.warning}</div>
          </button>

          <button
            onClick={() => setFilter('info')}
            className={`glass-panel p-4 rounded-xl border transition-all text-left ${
              filter === 'info' ? 'border-cyber bg-cyber/10 shadow-glow-cyber' : 'border-line hover:border-line-bright'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyber font-semibold uppercase">Info Log</span>
              <Info className="h-4 w-4 text-cyber" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-cyber">{counts.info}</div>
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event description, camera ID, or tags..."
              className="w-full rounded-lg border border-line bg-void/80 pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted focus:border-cyber focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={exportEvents}
              className="flex items-center gap-2 rounded-lg border border-line bg-void px-3 py-2 font-mono text-xs text-muted hover:text-cyber hover:border-cyber/50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Log</span>
            </button>
          </div>
        </div>

        {/* Event Feed List Panel */}
        <Panel label="REAL-TIME AUDIT LOG FEED">
          <EventFeed limit={50} severity={filter} />
        </Panel>
      </div>
    </>
  )
}
