import { useState } from 'react'
import { Filter, User, Car, ShieldAlert, HardHat } from 'lucide-react'

export interface DetectionClassFilter {
  person: boolean
  vehicle: boolean
  ppeViolation: boolean
  intrusion: boolean
}

interface Props {
  onChange: (filters: DetectionClassFilter) => void
}

export function DetectionFilterBar({ onChange }: Props) {
  const [filters, setFilters] = useState<DetectionClassFilter>({
    person: true,
    vehicle: true,
    ppeViolation: true,
    intrusion: true,
  })

  function toggle(key: keyof DetectionClassFilter) {
    const next = { ...filters, [key]: !filters[key] }
    setFilters(next)
    onChange(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
      <span className="flex items-center gap-1 text-muted mr-1">
        <Filter className="h-3.5 w-3.5 text-cyber" />
        <span>Filter Class:</span>
      </span>

      <button
        onClick={() => toggle('person')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
          filters.person
            ? 'bg-live/20 text-live border border-live/40 shadow-glow-live'
            : 'bg-void text-muted border border-line opacity-50'
        }`}
      >
        <User className="h-3 w-3" />
        <span>Person</span>
      </button>

      <button
        onClick={() => toggle('vehicle')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
          filters.vehicle
            ? 'bg-cyber/20 text-cyber border border-cyber/40 shadow-glow-cyber'
            : 'bg-void text-muted border border-line opacity-50'
        }`}
      >
        <Car className="h-3 w-3" />
        <span>Vehicle</span>
      </button>

      <button
        onClick={() => toggle('ppeViolation')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
          filters.ppeViolation
            ? 'bg-warn/20 text-warn border border-warn/40'
            : 'bg-void text-muted border border-line opacity-50'
        }`}
      >
        <HardHat className="h-3 w-3" />
        <span>PPE Violation</span>
      </button>

      <button
        onClick={() => toggle('intrusion')}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
          filters.intrusion
            ? 'bg-alert/20 text-alert border border-alert/40 shadow-glow-alert'
            : 'bg-void text-muted border border-line opacity-50'
        }`}
      >
        <ShieldAlert className="h-3 w-3" />
        <span>Intrusion</span>
      </button>
    </div>
  )
}
