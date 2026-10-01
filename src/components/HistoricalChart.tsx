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
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="people" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DDC97" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3DDC97" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="vehicles" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#5EEAD4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#24403D" strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v) => new Date(v).toLocaleTimeString('en-US', { hour: '2-digit' })}
          stroke="#7A9490"
          tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          axisLine={{ stroke: '#24403D' }}
          tickLine={false}
        />
        <YAxis
          stroke="#7A9490"
          tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{ background: '#182626', border: '1px solid #24403D', borderRadius: 4, fontSize: 12 }}
          labelFormatter={(v) => new Date(v).toLocaleString()}
        />
        <Area type="monotone" dataKey="people" stroke="#3DDC97" fill="url(#people)" strokeWidth={1.5} />
        <Area type="monotone" dataKey="vehicles" stroke="#5EEAD4" fill="url(#vehicles)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
