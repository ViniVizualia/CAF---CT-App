'use client'

import { useState } from 'react'
import { BehaviorReportsPanel } from './BehaviorReportsPanel'

export function BehaviorReportsAthleteBox({ athleteId }: { athleteId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-[var(--radius-md)] border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 text-sm text-[var(--color-text-muted)] flex justify-between items-center"
      >
        <span>Relatos sobre meu comportamento</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <BehaviorReportsPanel athleteId={athleteId} canFile={false} />
        </div>
      )}
    </div>
  )
}
