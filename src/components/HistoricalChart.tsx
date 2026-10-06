import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { api } from '@/lib/api'
import type { HistoricalPoint } from '@/types'

export function HistoricalChart() {
  const [data, setData] = useState<HistoricalPoint[]>([])

  useEffect(() => {
    api.getHistorical().then(setData)
  }, [])

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="people" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vehicles" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) => new Date(v).toLocaleTimeString('en-US', { hour: '2-digit' })}
            stroke="#64748B"
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            axisLine={{ stroke: '#1E293B' }}
            tickLine={false}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: '#0B1017',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
            labelFormatter={(v) => new Date(v).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="people"
            name="Pedestrians"
            stroke="#10B981"
            fill="url(#people)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="vehicles"
            name="Vehicles"
            stroke="#06B6D4"
            fill="url(#vehicles)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-6 font-mono text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-live" />
          <span>Pedestrians</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-cyber" />
          <span>Vehicles</span>
        </div>
      </div>
    </div>
  )
}
