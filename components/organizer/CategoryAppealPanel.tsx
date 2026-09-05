'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AthleteLite { athlete_id: string; full_name: string; category_name: string | null }
interface CategoryLite { id: number; name: string }
interface Appeal {
  id: string
  athlete_id: string
  message: string
  created_at: string
  category_at_time_name: string | null
  filed_by_name: string | null
  resolution_new_category_id: number | null
  resolution_note: string | null
  resolved_at: string | null
}

interface Props {
  tournamentId: string
  athletes: AthleteLite[]
  categories: CategoryLite[]
  appeals: Appeal[]
}

export function CategoryAppealPanel({ tournamentId, athletes, categories, appeals }: Props) {
  const router = useRouter()
  const [selectedAthlete, setSelectedAthlete] = useState(athletes[0]?.athlete_id ?? '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? '—'
  const athleteName = (id: string) => athletes.find((a) => a.athlete_id === id)?.full_name ?? '—'

  async function handleSubmit() {
    if (!selectedAthlete || !message.trim()) { setError('Selecione o atleta e descreva o motivo.'); return }
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return setError('Sessão expirada.') }

    const athlete = athletes.find((a) => a.athlete_id === selectedAthlete)

    const { error } = await supabase.from('category_appeals').insert({
      tournament_id: tournamentId,
      athlete_id: selectedAthlete,
      category_at_time_name: athlete?.category_name ?? null,
      filed_by_profile_id: user.id,
      message: message.trim(),
    })
    setLoading(false)
    if (error) return setError(error.message)
    setMessage('')
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Recurso de categoria</p>

      {athletes.length > 0 ? (
        <div className="flex flex-col gap-2 mb-6">
          <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm">
            {athletes.map((a) => <option key={a.athlete_id} value={a.athlete_id}>{a.full_name}</option>)}
          </select>
          <textarea
            placeholder="Descreva por que este atleta não corresponde à categoria dele..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm"
          />
          <button onClick={handleSubmit} disabled={loading} className="self-start rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
            {loading ? 'Enviando...' : 'Abrir recurso'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] mb-6">Nenhum atleta vinculado a este torneio.</p>
      )}

      <p className="text-xs text-[var(--color-text-muted)] mb-2">Histórico</p>
      <div className="flex flex-col gap-2">
        {appeals.map((a) => (
          <div key={a.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-3 text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{athleteName(a.athlete_id)}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              Categoria na época: {a.category_at_time_name ?? '—'} · Reportado por {a.filed_by_name ?? 'Organizador'}
            </p>
            <p className="text-[var(--color-text-muted)]">{a.message}</p>
            {a.resolved_at && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-xs text-[var(--color-primary)]">
                  Resolvido pelo Super Admin — nova categoria oficial: {categoryName(a.resolution_new_category_id)}
                </p>
                {a.resolution_note && <p className="text-xs text-[var(--color-text-muted)] mt-1">{a.resolution_note}</p>}
              </div>
            )}
          </div>
        ))}
        {appeals.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhum recurso registrado ainda.</p>}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
