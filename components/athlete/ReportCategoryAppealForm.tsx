'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AthleteResult {
  id: string
  full_name: string
  caf_number: number | null
  category_name: string | null
}

export function ReportCategoryAppealForm({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AthleteResult[]>([])
  const [selected, setSelected] = useState<AthleteResult | null>(null)
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true); setError(null)
    const { data, error } = await createClient().rpc('search_athletes', { search_term: query.trim() })
    setSearching(false)
    if (error) return setError(error.message)
    setResults(data ?? [])
  }

  async function handleSubmit() {
    if (!selected) { setError('Selecione o atleta que você quer reportar.'); return }
    if (!message.trim()) { setError('Descreva o motivo do recurso.'); return }
    setLoading(true); setError(null); setSuccess(false)
    const { error } = await createClient().rpc('file_category_appeal_as_athlete', {
      p_tournament_id: tournamentId,
      p_accused_athlete_id: selected.id,
      p_message: message.trim(),
      p_is_anonymous: anonymous,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setSuccess(true)
    setQuery(''); setResults([]); setSelected(null); setMessage(''); setAnonymous(false)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-2">Reportar categoria de outro atleta</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Viu alguém jogando numa categoria mais fácil do que deveria neste torneio? Reporte aqui.
      </p>

      {!selected ? (
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2">
            <input
              placeholder="Nome ou número CAF do atleta"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm"
            />
            <button onClick={handleSearch} disabled={searching} className="rounded-[var(--radius-sm)] border border-white/15 px-3 text-sm disabled:opacity-60">
              {searching ? '...' : 'Buscar'}
            </button>
          </div>
          {results.length > 0 && (
            <div className="flex flex-col gap-1">
              {results.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a)}
                  className="text-left text-sm rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2"
                >
                  {a.full_name} {a.caf_number ? `· CAF ${String(a.caf_number).padStart(6, '0')}` : ''} {a.category_name ? `· ${a.category_name}` : ''}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-3">
          <span>{selected.full_name}</span>
          <button onClick={() => setSelected(null)} className="text-xs text-[var(--color-text-muted)] underline">Trocar</button>
        </div>
      )}

      <textarea
        placeholder="Descreva o motivo (ex: joga habitualmente em categoria mais avançada em outros torneios)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-2"
      />

      <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
        Enviar de forma anônima (o atleta reportado não verá seu nome — organizador e Super Admin sempre veem)
      </label>

      <button onClick={handleSubmit} disabled={loading} className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm font-medium disabled:opacity-60">
        {loading ? 'Enviando...' : 'Enviar recurso'}
      </button>

      {success && <p className="text-sm text-[var(--color-success)] mt-2">Recurso enviado com sucesso.</p>}
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
