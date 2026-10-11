import { useState, useEffect } from 'react'
import { generateNetworkStats, type CameraNetworkStats } from '@/lib/networkStats'
import { Wifi, X, Activity, Radio, HardDrive, ArrowDown, ArrowUp } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function NetworkBandwidthMonitorModal({ isOpen, onClose }: Props) {
  const [stats, setStats] = useState<CameraNetworkStats[]>([])

  useEffect(() => {
    if (isOpen) {
      setStats(generateNetworkStats())
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalBitrate = stats.reduce((acc, s) => acc + s.bitrateMbps, 0)
  const avgJitter = (stats.reduce((acc, s) => acc + s.jitterMs, 0) / (stats.length || 1)).toFixed(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-2xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Wifi className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                RTSP Stream Network Observability
              </h2>
              <p className="text-xs text-muted">Bitrate Mbps, Jitter, & Packet Loss Telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-line bg-void p-3">
              <span className="font-mono text-[10px] uppercase text-muted">Total Ingestion Rate</span>
              <div className="font-mono text-xl font-bold text-cyber mt-1">
                {totalBitrate.toFixed(1)} <span className="text-xs text-muted">Mbps</span>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <span className="font-mono text-[10px] uppercase text-muted">Avg Network Jitter</span>
              <div className="font-mono text-xl font-bold text-live mt-1">
                {avgJitter} <span className="text-xs text-muted">ms</span>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <span className="font-mono text-[10px] uppercase text-muted">Stream Health</span>
              <div className="font-mono text-xl font-bold text-live mt-1 flex items-center gap-1.5">
                <Radio className="h-4 w-4 animate-pulse" />
                <span>99.9%</span>
              </div>
            </div>
          </div>

          {/* Camera Table */}
          <div className="overflow-x-auto rounded-lg border border-line bg-void">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-line text-left text-muted font-semibold bg-raised/40">
                  <th className="p-3 font-normal uppercase">Camera Stream</th>
                  <th className="p-3 font-normal uppercase">Resolution</th>
                  <th className="p-3 text-right font-normal uppercase">FPS</th>
                  <th className="p-3 text-right font-normal uppercase">Bitrate</th>
                  <th className="p-3 text-right font-normal uppercase">Jitter</th>
                  <th className="p-3 text-right font-normal uppercase">Packet Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {stats.map((s) => (
                  <tr key={s.cameraId} className="hover:bg-raised/40 transition-colors">
                    <td className="p-3 font-semibold text-ink">{s.cameraName}</td>
                    <td className="p-3 text-muted">{s.resolution}</td>
                    <td className="p-3 text-right font-bold text-live">{s.fps}</td>
                    <td className="p-3 text-right text-cyber font-bold">{s.bitrateMbps.toFixed(1)} Mbps</td>
                    <td className="p-3 text-right text-slate-200">{s.jitterMs} ms</td>
                    <td className="p-3 text-right text-live">{(s.packetLossPct * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line px-5 py-3 text-right bg-raised/30">
          <button
            onClick={onClose}
            className="rounded-lg border border-line bg-void px-4 py-1.5 font-mono text-xs text-ink hover:bg-raised transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
