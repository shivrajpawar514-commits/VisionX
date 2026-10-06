import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { LiveFeed } from '@/components/LiveFeed'
import { TelemetryStrip } from '@/components/TelemetryStrip'
import { EventFeed } from '@/components/EventFeed'
import { Heatmap } from '@/components/Heatmap'
import { HistoricalChart } from '@/components/HistoricalChart'
import { AskVideo } from '@/components/AskVideo'
import { Grid, Layout, Radio, ShieldAlert, Cpu, Activity } from 'lucide-react'

export function Dashboard() {
  const [gridMode, setGridMode] = useState<'single' | 'matrix'>('single')

  return (
    <>
      <TopBar title="Overview" subtitle="Real-time multi-camera inference, spatial telemetry, and generative AI search" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Camera Streams
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-ink">3 / 4</span>
                <span className="font-mono text-xs text-live flex items-center gap-1">
                  <Radio className="h-3 w-3 animate-pulse" /> Online
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-live/30 bg-live/10 text-live">
              <Radio className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Detections (24h)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-cyber">1,420</span>
                <span className="font-mono text-xs text-cyber">+14.2%</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyber/30 bg-cyber/10 text-cyber">
              <Cpu className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Critical Alerts
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-alert">3</span>
                <span className="font-mono text-xs text-alert">Action required</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-alert/30 bg-alert/10 text-alert">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                TensorRT P95 Latency
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-live">4.2</span>
                <span className="font-mono text-xs text-muted">ms</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-live/30 bg-live/10 text-live">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Main Grid View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Live Feed Header & Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-live animate-pulse" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-bright">
                  LIVE VIDEO INFERENCE FEED
                </h2>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
                <button
                  onClick={() => setGridMode('single')}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-mono transition-colors ${
                    gridMode === 'single' ? 'bg-cyber/20 text-cyber border border-cyber/30' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Layout className="h-3.5 w-3.5" />
                  <span>Hero View</span>
                </button>
                <button
                  onClick={() => setGridMode('matrix')}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-mono transition-colors ${
                    gridMode === 'matrix' ? 'bg-cyber/20 text-cyber border border-cyber/30' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>2x2 Matrix</span>
                </button>
              </div>
            </div>

            {/* Video Streams */}
            {gridMode === 'single' ? (
              <LiveFeed cameraName="CAM-01 · Main Entrance" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <LiveFeed cameraName="CAM-01 · Main Entrance" />
                <LiveFeed cameraName="CAM-02 · Loading Bay" />
                <LiveFeed cameraName="CAM-03 · North Fence" />
                <LiveFeed cameraName="CAM-04 · Server Room" />
              </div>
            )}

            {/* Live Telemetry Bar */}
            <TelemetryStrip />

            {/* Natural Language Search */}
            <Panel label="NATURAL LANGUAGE VIDEO QUERY ENGINE">
              <AskVideo />
            </Panel>

            {/* Traffic Analytics */}
            <Panel label="TRAFFIC & OBJECT COUNT · PAST 24 HOURS">
              <HistoricalChart />
            </Panel>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Panel label="SECURITY & EVENT FEED" className="max-h-[500px] overflow-y-auto">
              <EventFeed limit={15} />
            </Panel>

            <Panel label="OCCUPANCY SPATIAL HEATMAP · CAM-01">
              <Heatmap />
            </Panel>
          </div>
        </div>
      </div>
    </>
  )
}
