import { useState } from 'react'
import { Volume2, VolumeX, Bell, X, ShieldAlert, Sparkles } from 'lucide-react'
import { playCyberPing, playCriticalAlarm } from '@/lib/audioAlerts'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function AudioAlertSettingsModal({ isOpen, onClose }: Props) {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(80)
  const [voiceAlerts, setVoiceAlerts] = useState(true)
  const [criticalChime, setCriticalChime] = useState(true)

  if (!isOpen) return null

  function testSound() {
    playCyberPing()
  }

  function testAlarm() {
    playCriticalAlarm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-md flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                Audio Alarm & Chime Settings
              </h2>
              <p className="text-xs text-muted">Acoustic telemetry notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-line bg-void p-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              {enabled ? <Volume2 className="h-4 w-4 text-live" /> : <VolumeX className="h-4 w-4 text-muted" />}
              <span className="text-ink font-semibold">Master Audio Notification</span>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${
                enabled ? 'bg-live/20 text-live border border-live/40 shadow-glow-live' : 'bg-raised text-muted border border-line'
              }`}
            >
              {enabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">Alert Volume ({volume}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              disabled={!enabled}
              className="w-full accent-cyber"
            />
          </div>

          <div className="space-y-2 border-t border-line pt-3">
            <label className="flex items-center justify-between text-xs font-mono text-muted cursor-pointer">
              <span>Synthesized Voice Alerts ("Intrusion in Zone 1")</span>
              <input
                type="checkbox"
                checked={voiceAlerts}
                onChange={(e) => setVoiceAlerts(e.target.checked)}
                disabled={!enabled}
                className="accent-cyber rounded"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-mono text-muted cursor-pointer">
              <span>Critical Perimeter Breach Alarm</span>
              <input
                type="checkbox"
                checked={criticalChime}
                onChange={(e) => setCriticalChime(e.target.checked)}
                disabled={!enabled}
                className="accent-cyber rounded"
              />
            </label>
          </div>

          {/* Test Buttons */}
          <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={testSound}
              disabled={!enabled}
              className="flex-1 rounded-lg border border-line bg-void py-2 font-mono text-xs text-cyber hover:border-cyber/50 transition-colors"
            >
              Test Cyber Ping
            </button>
            <button
              type="button"
              onClick={testAlarm}
              disabled={!enabled}
              className="flex-1 rounded-lg border border-alert/40 bg-alert/10 py-2 font-mono text-xs text-alert hover:bg-alert/20 transition-colors"
            >
              Test Alarm Tone
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line px-5 py-3 text-right bg-raised/30">
          <button
            onClick={onClose}
            className="rounded-lg border border-line bg-void px-4 py-1.5 font-mono text-xs text-ink hover:bg-raised transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  )
}
