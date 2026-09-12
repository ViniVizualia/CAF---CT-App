'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface RequestRow {
  id: string
  athlete_name: string
  athlete_caf: number | null
  category_name: string | null
  message: string | null
  status: 'pendente' | 'concedido' | 'recusado'
  created_at: string
}

const statusLabel: Record<string, string> = { pendente: 'Pendente', concedido: 'Concedido', recusado: 'Recusado' }
const statusColor: Record<string, string> = {
  pendente: 'var(--color-accent)',
  concedido: 'var(--color-success)',
  recusado: 'var(--color-danger)',
}

export function TrophyRequestsPanel({ requests }: { requests: RequestRow[] }) {
  const router = useRouter()
  const [medalChoice, setMedalChoice] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = requests.filter((r) => r.status === 'pendente')
  const reviewed = requests.filter((r) => r.status !== 'pendente')

  async function handleApprove(id: string) {
    const medal = medalChoice[id] ?? 'ouro'
    setLoading(id); setError(null)
    const { error } = await createClient().rpc('resolve_trophy_request', { p_request_id: id, p_approve: true, p_medal: medal })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function handleReject(id: string) {
    setLoading(id); setError(null)
    const { error } = await createClient().rpc('resolve_trophy_request', { p_request_id: id, p_approve: false })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  if (requests.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Solicitações de troféu</p>

      {pending.length === 0 && <p className="text-sm text-[var(--color-text-muted)] mb-4">Nenhuma solicitação pendente.</p>}

      <div className="flex flex-col gap-2 mb-4">
        {pending.map((r) => (
          <div key={r.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-3 text-sm">
            <p className="font-medium mb-1">{r.athlete_name} {r.athlete_caf ? `· CAF ${String(r.athlete_caf).padStart(6, '0')}` : ''}</p>
            <p className="text-xs text-[var(--color-text-muted)] mb-2">
              Categoria: {r.category_name ?? '—'} · {new Date(r.created_at).toLocaleDateString('pt-BR')}
            </p>
            {r.message && <p className="text-xs text-[var(--color-text-muted)] mb-2">"{r.message}"</p>}
            <div className="flex gap-2 items-center">
              <select
                value={medalChoice[r.id] ?? 'ouro'}
                onChange={(e) => setMedalChoice((s) => ({ ...s, [r.id]: e.target.value }))}
                className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-2 py-1.5 text-xs"
              >
                <option value="ouro">🥇 Ouro</option>
                <option value="prata">🥈 Prata</option>
                <option value="bronze">🥉 Bronze</option>
              </select>
              <button onClick={() => handleApprove(r.id)} disabled={loading === r.id} className="text-xs rounded-[var(--radius-sm)] bg-[var(--color-success)] text-white px-3 py-1.5 disabled:opacity-60">
                Conceder
              </button>
              <button onClick={() => handleReject(r.id)} disabled={loading === r.id} className="text-xs rounded-[var(--radius-sm)] border border-white/15 px-3 py-1.5 disabled:opacity-60">
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
                  <span>{r.athlete_name} · {r.category_name ?? '—'}</span>
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
