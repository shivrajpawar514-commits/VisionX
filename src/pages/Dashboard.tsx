import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { LiveFeed } from '@/components/LiveFeed'
import { TelemetryStrip } from '@/components/TelemetryStrip'
import { EventFeed } from '@/components/EventFeed'
import { Heatmap } from '@/components/Heatmap'
import { HistoricalChart } from '@/components/HistoricalChart'
import { AskVideo } from '@/components/AskVideo'

export function Dashboard() {
  return (
    <>
      <TopBar title="Overview" subtitle="4 cameras configured · 3 online" />
      <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto p-6">
        <div className="col-span-2 flex flex-col gap-4">
          <LiveFeed />
          <TelemetryStrip />
          <Panel label="ASK YOUR VIDEO WHAT HAPPENED">
            <AskVideo />
          </Panel>
          <Panel label="TRAFFIC · LAST 24H">
            <HistoricalChart />
          </Panel>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <Panel label="EVENT FEED" className="max-h-[420px] overflow-y-auto">
            <EventFeed />
          </Panel>
          <Panel label="OCCUPANCY HEATMAP · CAM-01">
            <Heatmap />
          </Panel>
        </div>
      </div>
    </>
  )
}
