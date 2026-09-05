'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CategoryLite { id: number; name: string }
interface Appeal {
  id: string
  athlete_id: string
  athlete_name: string
  message: string
  created_at: string
  category_at_time_name: string | null
  filed_by_name: string | null
  resolution_new_category_id: number | null
  resolution_note: string | null
  resolved_at: string | null
}

interface Props {
  categories: CategoryLite[]
  appeals: Appeal[]
}

export function CategoryAppealAdminPanel({ categories, appeals }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? '—'

  async function handleResolve(appeal: Appeal) {
    const categoryId = newCategory[appeal.id]
    if (!categoryId) { setError('Selecione a categoria oficial correta.'); return }
    setLoading(appeal.id); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(null); return setError('Sessão expirada.') }

    const { error: athleteError } = await supabase
      .from('athletes')
      .update({ official_category_id: categoryId })
      .eq('id', appeal.athlete_id)
    if (athleteError) { setLoading(null); return setError(athleteError.message) }

    const { error: appealError } = await supabase
      .from('category_appeals')
      .update({
        resolution_new_category_id: categoryId,
        resolution_note: notes[appeal.id] || null,
        resolved_by_profile_id: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', appeal.id)
    setLoading(null)
    if (appealError) return setError(appealError.message)
    router.refresh()
  }

  if (appeals.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Recursos de categoria</p>
      <div className="flex flex-col gap-3">
        {appeals.map((a) => (
          <div key={a.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-3 text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{a.athlete_name}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              Categoria na época: {a.category_at_time_name ?? '—'} · Reportado por {a.filed_by_name ?? 'Organizador'}
            </p>
            <p className="text-[var(--color-text-muted)] mb-2">{a.message}</p>

            {a.resolved_at ? (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-[var(--color-primary)]">
                  Resolvido — nova categoria oficial: {categoryName(a.resolution_new_category_id)}
                </p>
                {a.resolution_note && <p className="text-xs text-[var(--color-text-muted)] mt-1">{a.resolution_note}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <select
                  value={newCategory[a.id] ?? ''}
                  onChange={(e) => setNewCategory((s) => ({ ...s, [a.id]: Number(e.target.value) }))}
                  className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
                >
                  <option value="">Categoria oficial correta...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                  placeholder="Observação (opcional)"
                  value={notes[a.id] ?? ''}
                  onChange={(e) => setNotes((s) => ({ ...s, [a.id]: e.target.value }))}
                  className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleResolve(a)}
                  disabled={loading === a.id}
                  className="self-start rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm disabled:opacity-60"
                >
                  {loading === a.id ? 'Salvando...' : 'Confirmar categoria oficial'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
