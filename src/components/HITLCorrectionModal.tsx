import { useState } from 'react'
import { api } from '@/lib/api'
import { Target, X, CheckCircle2, Sliders, Database, ArrowRight } from 'lucide-react'

export function HITLCorrectionModal({
  isOpen,
  onClose,
  cameraId = 'cam-main-gate',
}: {
  isOpen: boolean
  onClose: () => void
  cameraId?: string
}) {
  const [correctionType, setCorrectionType] = useState('box_adjustment')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.submitCorrection({
        cameraId,
        originalDetections: [{ class_name: 'person', confidence: 0.88, bbox: [100, 200, 160, 340] }],
        correctedDetections: [{ class_name: 'person', has_helmet: true, has_vest: true, bbox: [100, 200, 160, 340] }],
        notes,
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-lg flex-col rounded-xl border border-line bg-panel shadow-2xl shadow-cyber/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-raised/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyber/40 bg-cyber/10 text-cyber shadow-glow-cyber">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-mono text-sm font-bold text-ink uppercase tracking-tight">
                Human-in-the-Loop Feedback
              </h2>
              <p className="text-xs text-muted">Submit operator ground-truth sample for retraining</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-void hover:text-ink transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-live/20 text-live border border-live/40 mx-auto shadow-glow-live">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="font-semibold text-live font-mono text-sm">Sample Queued for ML Pipeline</div>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Sample logged into DVC dataset registry & staged for next model fine-tuning cycle.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Correction Type</label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value)}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-xs text-ink focus:border-cyber focus:outline-none"
              >
                <option value="box_adjustment">Bounding Box Adjustment</option>
                <option value="false_positive">False Positive (Ghost Detection)</option>
                <option value="false_negative">False Negative (Missed Object)</option>
                <option value="class_correction">Class / PPE Attribute Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">Operator Notes / Ground Truth</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe ground truth (e.g. Worker was wearing white helmet not detected due to glare)..."
                rows={3}
                className="w-full rounded-lg border border-line bg-void px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-cyber focus:outline-none"
              />
            </div>

            <div className="rounded-lg border border-line bg-void/60 p-3 text-xs text-muted space-y-1">
              <div className="flex items-center gap-1.5 text-cyber font-mono font-medium">
                <Database className="h-3.5 w-3.5" />
                <span>MLOps Continuous Active Learning Loop</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Corrections are versioned with DVC and benchmarked against MLflow registry before automatic deployment to edge nodes.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line bg-void px-4 py-2 font-mono text-xs text-ink hover:bg-raised transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-cyber/40 bg-cyber/20 px-4 py-2 font-mono text-xs font-semibold text-cyber hover:bg-cyber/30 disabled:opacity-50 transition-all shadow-glow-cyber"
              >
                <span>{loading ? 'Submitting…' : 'Submit Sample'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
