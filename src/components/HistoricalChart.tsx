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
import { TrendingUp, Users, Car, AlertTriangle } from 'lucide-react'

export function HistoricalChart() {
  const [data, setData] = useState<HistoricalPoint[]>([])
  const [timeWindow, setTimeWindow] = useState<'1H' | '6H' | '24H' | '7D'>('24H')
  const [showPedestrians, setShowPedestrians] = useState(true)
  const [showVehicles, setShowVehicles] = useState(true)

  useEffect(() => {
    api.getHistorical().then(setData)
  }, [])

  const totalPeople = data.reduce((acc, d) => acc + (d.people || 0), 0)
  const totalVehicles = data.reduce((acc, d) => acc + (d.vehicles || 0), 0)

  return (
    <div className="w-full space-y-3">
      {/* Header controls & time window selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPedestrians(!showPedestrians)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-all ${
              showPedestrians ? 'bg-live/20 text-live border border-live/40 shadow-glow-live' : 'text-muted bg-void opacity-50'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pedestrians ({totalPeople})</span>
          </button>

          <button
            onClick={() => setShowVehicles(!showVehicles)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-all ${
              showVehicles ? 'bg-cyber/20 text-cyber border border-cyber/40 shadow-glow-cyber' : 'text-muted bg-void opacity-50'
            }`}
          >
            <Car className="h-3.5 w-3.5" />
            <span>Vehicles ({totalVehicles})</span>
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-void p-1 font-mono text-xs">
          {(['1H', '6H', '24H', '7D'] as const).map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`rounded px-2.5 py-0.5 transition-colors ${
                timeWindow === tw ? 'bg-cyber text-void font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              {tw}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="people" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vehicles" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.45} />
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
          {showPedestrians && (
            <Area
              type="monotone"
              dataKey="people"
              name="Pedestrians"
              stroke="#10B981"
              fill="url(#people)"
              strokeWidth={2}
            />
          )}
          {showVehicles && (
            <Area
              type="monotone"
              dataKey="vehicles"
              name="Vehicles"
              stroke="#06B6D4"
              fill="url(#vehicles)"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
