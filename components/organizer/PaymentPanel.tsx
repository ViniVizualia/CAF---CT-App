'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AthleteRow {
  athlete_id: string
  full_name: string
  caf_number: number | null
  payment_confirmed: boolean
}

export function PaymentPanel({ tournamentId, rows }: { tournamentId: string; rows: AthleteRow[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const paidCount = rows.filter((r) => r.payment_confirmed).length

  async function handleToggle(athleteId: string, current: boolean) {
    setLoading(athleteId); setError(null)
    const { error } = await createClient().rpc('mark_athlete_payment', {
      p_tournament_id: tournamentId,
      p_athlete_id: athleteId,
      p_paid: !current,
    })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  if (rows.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium">Pagamento da inscrição</p>
        <span className="text-xs text-[var(--color-text-muted)]">{paidCount}/{rows.length} pagos</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.athlete_id} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm">
            <div>
              <p>{r.full_name}</p>
              <p className="text-xs" style={{ color: r.payment_confirmed ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {r.payment_confirmed ? 'Pago' : 'Pendente'}
              </p>
            </div>
            <button
              onClick={() => handleToggle(r.athlete_id, r.payment_confirmed)}
              disabled={loading === r.athlete_id}
              className={`text-xs rounded-[var(--radius-sm)] px-3 py-1.5 border disabled:opacity-60 ${
                r.payment_confirmed
                  ? 'border-white/15 text-[var(--color-text-muted)]'
                  : 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
              }`}
            >
              {loading === r.athlete_id ? '...' : r.payment_confirmed ? 'Desmarcar' : 'Marcar como pago'}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
