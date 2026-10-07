import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import type { SystemHealthSample } from '@/types'
import { Cpu, HardDrive, Activity, AlertCircle, Terminal, RefreshCcw } from 'lucide-react'

function MiniChart({
  data,
  dataKey,
  color,
  unit = '',
}: {
  data: SystemHealthSample[]
  dataKey: keyof SystemHealthSample
  color: string
  unit?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="timestamp" hide />
        <YAxis
          stroke="#64748B"
          tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            background: '#0B1017',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
          formatter={(v: number) => [`${v.toFixed(1)}${unit}`, dataKey]}
          labelFormatter={(v) => new Date(v).toLocaleTimeString()}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

const MOCK_LOGS = [
  { level: 'INFO', time: '18:42:01', msg: '[InferenceEngine] TensorRT FP16 engine initialized on CUDA:0' },
  { level: 'DEBUG', time: '18:42:04', msg: '[StreamManager] CAM-01 RTSP decoded at 1080p60 (0 dropped frames)' },
  { level: 'INFO', time: '18:42:08', msg: '[YOLOv8] Target #TRK-104 detected (cls: person, conf: 0.94)' },
  { level: 'WARN', time: '18:42:15', msg: '[SafetyMonitor] Zone intrusion warning triggered on CAM-03' },
  { level: 'INFO', time: '18:42:20', msg: '[AnalyticsEngine] Spatial density matrix recalculated (32 cells active)' },
  { level: 'DEBUG', time: '18:42:28', msg: '[PrometheusExporter] Telemetry metrics scraped (0.8ms duration)' },
]

export function SystemHealth() {
  const [series, setSeries] = useState<SystemHealthSample[]>([])
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN'>('ALL')

  useEffect(() => {
    api.getHealthSeries().then(setSeries)
  }, [])

  const latest = series[series.length - 1]
  const filteredLogs = logFilter === 'ALL' ? MOCK_LOGS : MOCK_LOGS.filter((l) => l.level === logFilter)

  return (
    <>
      <TopBar title="System Health" subtitle="Edge hardware telemetry, GPU VRAM utilization, and live backend logs" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Metric Cards Header */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                CPU Utilization
              </span>
              <div className="font-mono text-2xl font-bold text-ink mt-1">
                {latest?.cpu !== undefined ? latest.cpu.toFixed(1) : '18.4'}
                <span className="text-xs text-muted ml-1">%</span>
              </div>
            </div>
            <Cpu className="h-6 w-6 text-cyber" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                GPU Utilization
              </span>
              <div className="font-mono text-2xl font-bold text-live mt-1">
                {latest?.gpu !== undefined ? latest.gpu.toFixed(1) : '42.1'}
                <span className="text-xs text-muted ml-1">%</span>
              </div>
            </div>
            <Activity className="h-6 w-6 text-live" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                VRAM Memory
              </span>
              <div className="font-mono text-2xl font-bold text-cyber mt-1">
                {latest?.vramGb !== undefined ? latest.vramGb.toFixed(1) : '3.4'}
                <span className="text-xs text-muted ml-1">GB</span>
              </div>
            </div>
            <HardDrive className="h-6 w-6 text-cyber" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Inference Error Rate
              </span>
              <div className="font-mono text-2xl font-bold text-live mt-1">
                {latest?.errorRate !== undefined ? (latest.errorRate * 100).toFixed(2) : '0.01'}
                <span className="text-xs text-muted ml-1">%</span>
              </div>
            </div>
            <AlertCircle className="h-6 w-6 text-live" />
          </div>
        </div>

        {/* Observability Mini Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel label="GPU & CPU UTILIZATION CURVE">
            <MiniChart data={series} dataKey="gpu" color="#10B981" unit="%" />
          </Panel>
          <Panel label="LATENCY P95 (MILLISECONDS)">
            <MiniChart data={series} dataKey="latencyP95Ms" color="#06B6D4" unit="ms" />
          </Panel>
          <Panel label="AVERAGE FRAME RATE (FPS)">
            <MiniChart data={series} dataKey="fpsAvg" color="#10B981" unit=" FPS" />
          </Panel>
          <Panel label="SYSTEM ERROR RATE (%)">
            <MiniChart data={series} dataKey="errorRate" color="#EF4444" unit="%" />
          </Panel>
        </div>

        {/* Live Terminal Log Stream */}
        <Panel
          label="REAL-TIME INFERENCE LOG STREAM"
          action={
            <div className="flex items-center gap-1">
              {(['ALL', 'INFO', 'WARN'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
                    logFilter === lvl ? 'bg-cyber/20 text-cyber border border-cyber/30' : 'text-muted hover:text-ink'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          }
        >
          <div className="rounded-xl border border-line bg-void p-4 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
            {filteredLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-muted shrink-0">{log.time}</span>
                <span
                  className={`shrink-0 font-bold ${
                    log.level === 'WARN'
                      ? 'text-warn'
                      : log.level === 'INFO'
                      ? 'text-cyber'
                      : 'text-muted'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="text-slate-200">{log.msg}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
