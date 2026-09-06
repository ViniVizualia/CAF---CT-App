'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AttendanceRow {
  athlete_id: string
  full_name: string
  caf_number: number | null
  presence_status: 'presente' | 'ausente' | 'pendente'
}

const statusLabel: Record<string, string> = {
  presente: 'Presente',
  ausente: 'Ausente',
  pendente: 'Pendente',
}

const statusColor: Record<string, string> = {
  presente: 'var(--color-success)',
  ausente: 'var(--color-danger)',
  pendente: 'var(--color-text-muted)',
}

export function AttendancePanel({ tournamentId, rows }: { tournamentId: string; rows: AttendanceRow[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleMark(athleteId: string, status: 'presente' | 'ausente') {
    setLoading(athleteId); setError(null)
    const { error } = await createClient().rpc('mark_athlete_attendance', {
      p_tournament_id: tournamentId,
      p_athlete_id: athleteId,
      p_status: status,
    })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Presença</p>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.athlete_id} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm">
            <div>
              <p>{r.full_name}</p>
              <p className="text-xs" style={{ color: statusColor[r.presence_status] }}>
                {statusLabel[r.presence_status]}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleMark(r.athlete_id, 'presente')}
                disabled={loading === r.athlete_id}
                className="text-xs rounded-[var(--radius-sm)] border border-white/15 px-2 py-1 disabled:opacity-50"
              >
                Presente
              </button>
              <button
                onClick={() => handleMark(r.athlete_id, 'ausente')}
                disabled={loading === r.athlete_id}
                className="text-xs rounded-[var(--radius-sm)] border border-white/15 px-2 py-1 disabled:opacity-50"
              >
                Ausente
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta vinculado.</p>}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-3">
        Presença marcada automaticamente ao escanear a carteirinha como liberado. Sem escaneamento e sem marcação manual, vira "Presente" 2 dias após o fim do torneio.
      </p>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
