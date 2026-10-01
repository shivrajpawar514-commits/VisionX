import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import type { SystemHealthSample } from '@/types'

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
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
        <CartesianGrid stroke="#24403D" strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="timestamp" hide />
        <YAxis
          stroke="#7A9490"
          tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{ background: '#182626', border: '1px solid #24403D', borderRadius: 4, fontSize: 12 }}
          formatter={(v: number) => [`${v.toFixed(1)}${unit}`, dataKey]}
          labelFormatter={(v) => new Date(v).toLocaleTimeString()}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function SystemHealth() {
  const [series, setSeries] = useState<SystemHealthSample[]>([])

  useEffect(() => {
    api.getHealthSeries().then(setSeries)
  }, [])

  const latest = series[series.length - 1]

  return (
    <>
      <TopBar title="System Health" subtitle="Infra + ML observability — feeds the Prometheus/Grafana stack in production" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 grid grid-cols-4 gap-4">
          {[
            { label: 'CPU', value: latest?.cpu, unit: '%' },
            { label: 'GPU', value: latest?.gpu, unit: '%' },
            { label: 'VRAM', value: latest?.vramGb, unit: ' GB' },
            { label: 'Error rate', value: latest?.errorRate, unit: '%' },
          ].map((s) => (
            <div key={s.label} className="rounded border border-line bg-panel px-4 py-3">
              <p className="font-mono text-[11px] text-muted">{s.label}</p>
              <p className="mt-1 font-mono text-lg tabular text-ink">
                {s.value !== undefined ? s.value.toFixed(1) : '—'}
                <span className="text-sm text-muted">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Panel label="CPU / GPU UTILIZATION">
            <MiniChart data={series} dataKey="gpu" color="#3DDC97" unit="%" />
          </Panel>
          <Panel label="P95 LATENCY">
            <MiniChart data={series} dataKey="latencyP95Ms" color="#5EEAD4" unit="ms" />
          </Panel>
          <Panel label="AVERAGE FPS">
            <MiniChart data={series} dataKey="fpsAvg" color="#3DDC97" unit=" fps" />
          </Panel>
          <Panel label="ERROR RATE">
            <MiniChart data={series} dataKey="errorRate" color="#FF6B4A" unit="%" />
          </Panel>
        </div>
      </div>
    </>
  )
}
