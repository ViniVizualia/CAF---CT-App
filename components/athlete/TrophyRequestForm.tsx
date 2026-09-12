'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CategoryOption { id: number; name: string }

export function TrophyRequestForm({ tournamentId, categoryOptions }: { tournamentId: string; categoryOptions: CategoryOption[] }) {
  const [categoryId, setCategoryId] = useState(categoryOptions[0]?.id ?? 0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!categoryId) { setError('Selecione a categoria.'); return }
    setLoading(true); setError(null); setSuccess(false)
    const { error } = await createClient().rpc('request_trophy', {
      p_tournament_id: tournamentId,
      p_category_id: categoryId,
      p_message: message.trim() || null,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setSuccess(true)
    setMessage('')
  }

  if (categoryOptions.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-2">Esqueceram do meu troféu?</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Se você foi campeão(ã), 2º ou 3º lugar e o organizador ainda não registrou, solicite aqui.
      </p>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-2"
      >
        {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <textarea
        placeholder="Detalhe (opcional): ex: fomos campeões da categoria e o troféu ainda não apareceu"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-2"
      />
      <button onClick={handleSubmit} disabled={loading} className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm font-medium disabled:opacity-60">
        {loading ? 'Enviando...' : 'Solicitar troféu'}
      </button>
      {success && <p className="text-sm text-[var(--color-success)] mt-2">Solicitação enviada! O organizador vai revisar.</p>}
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
