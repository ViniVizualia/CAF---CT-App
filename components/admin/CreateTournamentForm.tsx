'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm'

export function CreateTournamentForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await createClient().from('tournaments').insert({
      name, city, state, start_date: startDate, end_date: endDate, status: 'draft',
    })
    setLoading(false)
    if (error) return setError(error.message)
    setName(''); setCity(''); setState(''); setStartDate(''); setEndDate('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input placeholder="Nome do torneio" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <div className="flex gap-3">
        <input placeholder="Cidade" required value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} flex-1`} />
        <input placeholder="UF" required maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className={`${inputClass} w-16`} />
      </div>
      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Início
          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex-1 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Fim
          <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </label>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
        {loading ? 'Criando...' : 'Criar torneio'}
      </button>
    </form>
  )
}
