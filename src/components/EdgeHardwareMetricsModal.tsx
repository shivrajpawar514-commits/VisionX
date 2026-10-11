import { useState, useEffect } from 'react'
import { getGpuSensors, type GpuSensorTelemetry } from '@/lib/hardwareTelemetry'
import { Cpu, X, Activity, Flame, Zap, Shield, HardDrive, RefreshCw } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function EdgeHardwareMetricsModal({ isOpen, onClose }: Props) {
  const [sensors, setSensors] = useState<GpuSensorTelemetry | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSensors(getGpuSensors())
    }
  }, [isOpen])

  if (!isOpen || !sensors) return null

  const vramPct = ((sensors.vramUsedMb / sensors.vramTotalMb) * 100).toFixed(1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                NVIDIA Edge Hardware Sensors
              </h2>
              <p className="text-xs text-muted">{sensors.gpuName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 font-mono">
          {/* Top Sensor Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-line bg-void p-3">
              <div className="flex items-center justify-between text-muted text-[10px] uppercase">
                <span>CUDA Core Load</span>
                <Activity className="h-3.5 w-3.5 text-live" />
              </div>
              <div className="text-xl font-bold text-live mt-1">{sensors.cudaUtilizationPct}%</div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-live" style={{ width: `${sensors.cudaUtilizationPct}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <div className="flex items-center justify-between text-muted text-[10px] uppercase">
                <span>GPU Temperature</span>
                <Flame className="h-3.5 w-3.5 text-warn" />
              </div>
              <div className="text-xl font-bold text-ink mt-1">{sensors.temperatureC}°C</div>
              <div className="mt-2 text-[10px] text-muted">Fan Speed: {sensors.fanSpeedPct}% PWM</div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <div className="flex items-center justify-between text-muted text-[10px] uppercase">
                <span>VRAM Allocation</span>
                <HardDrive className="h-3.5 w-3.5 text-cyber" />
              </div>
              <div className="text-xl font-bold text-cyber mt-1">
                {(sensors.vramUsedMb / 1024).toFixed(1)} <span className="text-xs text-muted">/ {(sensors.vramTotalMb / 1024).toFixed(0)} GB</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-raised overflow-hidden">
                <div className="h-full bg-cyber" style={{ width: `${vramPct}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <div className="flex items-center justify-between text-muted text-[10px] uppercase">
                <span>Power Draw</span>
                <Zap className="h-3.5 w-3.5 text-live" />
              </div>
              <div className="text-xl font-bold text-live mt-1">{sensors.powerDrawWatts} W</div>
              <div className="mt-2 text-[10px] text-muted">Clock: {sensors.clockSpeedMhz} MHz</div>
            </div>
          </div>

          {/* System Spec Banner */}
          <div className="rounded-lg border border-line bg-raised/40 p-3 text-xs text-muted flex items-center justify-between">
            <span>Driver Runtime:</span>
            <span className="text-cyber font-semibold">{sensors.driverVersion}</span>
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
