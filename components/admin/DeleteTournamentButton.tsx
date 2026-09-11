'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function DeleteTournamentButton({ tournamentId, tournamentName }: { tournamentId: string; tournamentName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true); setError(null)
    const { error } = await createClient().from('tournaments').delete().eq('id', tournamentId)
    setLoading(false)
    if (error) {
      setError(
        error.message.includes('escaneadas')
          ? error.message
          : 'Não foi possível excluir este torneio.'
      )
      return
    }
    router.push('/torneios')
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-xs text-[var(--color-danger)] underline">
        Excluir torneio
      </button>
    )
  }

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 flex flex-col gap-2">
      <p className="text-sm text-[var(--color-danger)] font-medium">
        Excluir "{tournamentName}" apaga tudo relacionado a ele (atletas vinculados, duplas, chaveamento, mensagens, recursos) e some do histórico de todo mundo que jogou nele. Não pode ser desfeito.
      </p>
      <div className="flex gap-2">
        <button onClick={handleDelete} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-danger)] text-white px-3 py-1.5 text-xs font-medium disabled:opacity-60">
          {loading ? 'Excluindo...' : 'Sim, excluir definitivamente'}
        </button>
        <button onClick={() => setConfirming(false)} disabled={loading} className="text-xs text-[var(--color-text-muted)] underline">
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}
