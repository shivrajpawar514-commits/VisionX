import { useState } from 'react'
import { calculateThreatScore, type ThreatAssessment } from '@/lib/threatScoring'
import { ShieldAlert, AlertTriangle, X, CheckCircle2, ShieldCheck, ArrowRight, Shield } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function ThreatMatrixModal({ isOpen, onClose }: Props) {
  const [assessment] = useState<ThreatAssessment>(calculateThreatScore())

  if (!isOpen) return null

  const levelColor =
    assessment.riskLevel === 'CRITICAL'
      ? 'text-alert bg-alert/20 border-alert/40 shadow-glow-alert'
      : assessment.riskLevel === 'HIGH'
      ? 'text-warn bg-warn/20 border-warn/40'
      : 'text-cyber bg-cyber/20 border-cyber/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-xl flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-alert/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-alert/40 bg-alert/10 text-alert shadow-glow-alert">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                Threat Matrix & Security Risk Index
              </h2>
              <p className="text-xs text-muted">Automated Multi-Stream Risk Assessment</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 font-mono">
          {/* Top Score Banner */}
          <div className="flex items-center justify-between rounded-lg border border-line bg-void p-4">
            <div>
              <span className="text-[10px] uppercase text-muted">Composite Threat Index</span>
              <div className="text-3xl font-bold text-ink mt-0.5">
                {assessment.overallRiskScore} <span className="text-xs text-muted">/ 100</span>
              </div>
            </div>

            <div className={`rounded-lg border px-3 py-1 text-xs font-bold uppercase ${levelColor}`}>
              {assessment.riskLevel} RISK
            </div>
          </div>

          {/* Sub-Risk Factor Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-line bg-void p-3">
              <span className="text-[10px] text-muted uppercase">Intrusions</span>
              <div className="text-lg font-bold text-alert mt-1">{assessment.activeIntrusions} Active</div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <span className="text-[10px] text-muted uppercase">PPE Violations</span>
              <div className="text-lg font-bold text-warn mt-1">{assessment.ppeViolations} Flagged</div>
            </div>

            <div className="rounded-lg border border-line bg-void p-3">
              <span className="text-[10px] text-muted uppercase">Loitering</span>
              <div className="text-lg font-bold text-cyber mt-1">{assessment.loiteringEvents} Tracks</div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="rounded-lg border border-line bg-raised/40 p-4 space-y-2">
            <span className="text-xs font-bold text-cyber uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Recommended Countermeasures</span>
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {assessment.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-cyber shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-line px-5 py-3 text-right bg-raised/30">
          <button
            onClick={onClose}
            className="rounded-lg border border-line bg-void px-4 py-1.5 font-mono text-xs text-ink hover:bg-raised transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
