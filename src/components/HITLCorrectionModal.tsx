import { useState } from 'react'
import { api } from '@/lib/api'

export function HITLCorrectionModal({
  isOpen,
  onClose,
  cameraId = 'cam-main-gate'
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
        notes
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col rounded-lg border border-line bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-live">HITL</span>
            <h2 className="font-mono text-base font-semibold text-ink">Annotation Correction / Feedback</h2>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted hover:text-ink font-mono">✕</button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-2xl">✓</div>
            <div className="font-semibold text-live">Candidate Sample Submitted</div>
            <p className="text-xs text-muted">Queued for review & DVC retraining dataset incorporation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1">Correction Type</label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value)}
                className="w-full rounded border border-line bg-raised px-3 py-2 text-sm text-ink focus:border-live focus:outline-none"
              >
                <option value="box_adjustment">Bounding Box Adjustment</option>
                <option value="false_positive">False Positive (Ghost Detection)</option>
                <option value="false_negative">False Negative (Missed Object)</option>
                <option value="class_correction">Class / PPE Attribute Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1">Operator Notes / Ground Truth</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe ground truth (e.g. Worker was wearing white helmet not detected due to glare)..."
                rows={3}
                className="w-full rounded border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-live focus:outline-none"
              />
            </div>

            <div className="rounded border border-line bg-raised/40 p-3 text-xs text-muted">
              <span className="font-mono text-ink">Continuous MLOps Retraining Loop:</span>
              <p className="mt-1 text-[11px]">Corrections will be verified by human reviewer, versioned with DVC, and evaluated against the MLflow model registry.</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-line bg-raised px-4 py-1.5 font-mono text-xs text-ink hover:bg-raised/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded border border-live/40 bg-live/20 px-4 py-1.5 font-mono text-xs text-live hover:bg-live/30 disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Sample'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
