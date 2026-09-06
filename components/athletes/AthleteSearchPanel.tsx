'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BehaviorReportsPanel } from '@/components/behavior/BehaviorReportsPanel'

interface AthleteResult {
  id: string
  full_name: string
  caf_number: number | null
  category_name: string | null
  status: string
}

interface Props {
  canFile: boolean
}

export function AthleteSearchPanel({ canFile }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AthleteResult[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('search_athletes', { search_term: query.trim() })
    setLoading(false)
    if (error) return setError(error.message)
    setResults(data ?? [])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          placeholder="Nome ou número CAF"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
        />
        <button onClick={handleSearch} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 text-sm disabled:opacity-60">
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex flex-col gap-2">
        {results.map((a) => (
          <div key={a.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 p-3">
            <button
              onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
              className="w-full flex justify-between items-center text-left text-sm"
            >
              <div>
                <p className="font-medium">{a.full_name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {a.caf_number ? `CAF ${String(a.caf_number).padStart(6, '0')}` : '—'} · {a.category_name ?? '—'}
                </p>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">{expandedId === a.id ? '▲' : '▼'}</span>
            </button>
            {expandedId === a.id && (
              <div className="mt-3">
                <BehaviorReportsPanel athleteId={a.id} canFile={canFile} />
              </div>
            )}
          </div>
        ))}
        {results.length === 0 && !loading && <p className="text-sm text-[var(--color-text-muted)]">Busque um atleta pelo nome ou número CAF.</p>}
      </div>
    </div>
  )
}
