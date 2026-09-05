'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tournamentId: string
  initialPrizeInfo: string | null
}

export function PrizeEditor({ tournamentId, initialPrizeInfo }: Props) {
  const router = useRouter()
  const [prizeInfo, setPrizeInfo] = useState(initialPrizeInfo ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSaved(false)
    const { error } = await createClient()
      .from('tournaments')
      .update({ prize_info: prizeInfo || null })
      .eq('id', tournamentId)
    setLoading(false)
    if (error) return setError(error.message)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-4">
      <p className="text-sm font-medium mb-2">Premiação</p>
      <textarea
        value={prizeInfo}
        onChange={(e) => { setPrizeInfo(e.target.value); setSaved(false) }}
        placeholder="Ex: 1º lugar leva troféu + kit produtos, 2º lugar leva medalha..."
        rows={3}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-2"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar premiação'}
        </button>
        {saved && <span className="text-xs text-[var(--color-text-muted)]">Salvo ✓</span>}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
