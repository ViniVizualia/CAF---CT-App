'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const categoryOptions = [
  { id: 1, label: 'Estreante' }, { id: 2, label: 'Iniciante' }, { id: 3, label: 'Intermediário' },
  { id: 4, label: 'Amador C' }, { id: 5, label: 'Amador B' }, { id: 6, label: 'Amador A' }, { id: 7, label: 'Qualifier' },
]

function defaultValidityDate() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export function ApprovalActions({ athleteId, declaredCategoryId, currentStatus }: { athleteId: string; declaredCategoryId: number | null; currentStatus: string }) {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState(declaredCategoryId ?? 1)
  const [validityDate, setValidityDate] = useState(defaultValidityDate())
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    setLoading('approve'); setError(null)
    const { error } = await createClient().rpc('approve_athlete', { p_athlete_id: athleteId, p_category_id: categoryId, p_validity_date: validityDate })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function reject() {
    setLoading('reject'); setError(null)
    const { error } = await createClient().rpc('reject_athlete', { p_athlete_id: athleteId })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function changeCategory() {
    if (!reason.trim()) return setError('Informe o motivo da alteração de categoria.')
    setLoading('change'); setError(null)
    const { error } = await createClient().rpc('change_athlete_category', { p_athlete_id: athleteId, p_new_category_id: categoryId, p_reason: reason })
    setLoading(null)
    if (error) return setError(error.message)
    setReason('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--color-text-muted)]">Categoria</span>
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2">
          {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </label>

      {currentStatus === 'em_analise' && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-text-muted)]">Validade</span>
          <input type="date" value={validityDate} onChange={(e) => setValidityDate(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2" />
        </label>
      )}

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {currentStatus === 'em_analise' ? (
        <div className="flex gap-3">
          <button onClick={approve} disabled={loading !== null} className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
            {loading === 'approve' ? 'Aprovando...' : 'Aprovar'}
          </button>
          <button onClick={reject} disabled={loading !== null} className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-danger)] text-[var(--color-danger)] py-3 font-medium disabled:opacity-60">
            {loading === 'reject' ? 'Rejeitando...' : 'Rejeitar'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-text-muted)]">Motivo da alteração</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2" />
          </label>
          <button onClick={changeCategory} disabled={loading !== null} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
            {loading === 'change' ? 'Salvando...' : 'Alterar categoria'}
          </button>
        </div>
      )}
    </div>
  )
}
