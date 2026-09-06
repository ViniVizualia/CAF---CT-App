'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface RequestRow {
  id: string
  category_name: string
  athlete_1_name: string
  athlete_1_caf: number | null
  athlete_2_name: string
  athlete_2_caf: number | null
  request_type: 'inscricao' | 'interesse'
  status: 'pendente' | 'aprovado' | 'recusado'
  created_at: string
}

const typeLabel: Record<string, string> = { inscricao: 'Inscrição', interesse: 'Interesse' }
const statusLabel: Record<string, string> = { pendente: 'Pendente', aprovado: 'Aprovado', recusado: 'Recusado' }
const statusColor: Record<string, string> = {
  pendente: 'var(--color-accent)',
  aprovado: 'var(--color-success)',
  recusado: 'var(--color-danger)',
}

export function RegistrationRequestsPanel({ requests }: { requests: RequestRow[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = requests.filter((r) => r.status === 'pendente')
  const reviewed = requests.filter((r) => r.status !== 'pendente')

  async function handleReview(id: string, approve: boolean) {
    setLoading(id); setError(null)
    const { error } = await createClient().rpc('review_tournament_registration_request', {
      p_request_id: id,
      p_approve: approve,
    })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Solicitações de inscrição</p>

      {pending.length === 0 && <p className="text-sm text-[var(--color-text-muted)] mb-4">Nenhuma solicitação pendente.</p>}

      <div className="flex flex-col gap-2 mb-4">
        {pending.map((r) => (
          <div key={r.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-3 text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{r.athlete_1_name} / {r.athlete_2_name}</span>
              <span className="text-xs font-medium" style={{ color: r.request_type === 'interesse' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                {typeLabel[r.request_type]}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Categoria: {r.category_name} · {new Date(r.created_at).toLocaleDateString('pt-BR')}
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleReview(r.id, true)} disabled={loading === r.id} className="text-xs rounded-[var(--radius-sm)] bg-[var(--color-success)] text-white px-3 py-1.5 disabled:opacity-60">
                Aprovar
              </button>
              <button onClick={() => handleReview(r.id, false)} disabled={loading === r.id} className="text-xs rounded-[var(--radius-sm)] border border-white/15 px-3 py-1.5 disabled:opacity-60">
                Recusar
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviewed.length > 0 && (
        <>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Histórico</p>
          <div className="flex flex-col gap-2">
            {reviewed.map((r) => (
              <div key={r.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-xs">
                <div className="flex justify-between">
                  <span>{r.athlete_1_name} / {r.athlete_2_name} · {r.category_name}</span>
                  <span style={{ color: statusColor[r.status] }}>{statusLabel[r.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
