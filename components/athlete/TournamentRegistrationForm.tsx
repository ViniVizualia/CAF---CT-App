'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function TournamentRegistrationForm({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const [partnerCaf, setPartnerCaf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const caf = Number(partnerCaf)
    if (!caf) { setError('Informe o número CAF do seu parceiro.'); return }
    setLoading(true); setError(null)
    const { error } = await createClient().rpc('request_tournament_registration', {
      p_tournament_id: tournamentId,
      p_partner_caf_number: caf,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setPartnerCaf('')
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-2">Quero me inscrever neste torneio</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Informe o número CAF do seu parceiro de dupla. A categoria da dupla é definida automaticamente pela mais alta entre vocês dois.
      </p>
      <div className="flex flex-col gap-2">
        <input
          inputMode="numeric"
          placeholder="Número CAF do parceiro"
          value={partnerCaf}
          onChange={(e) => setPartnerCaf(e.target.value)}
          className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm"
        />
        <button onClick={handleSubmit} disabled={loading} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm font-medium disabled:opacity-60">
          {loading ? 'Enviando...' : 'Solicitar inscrição'}
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
