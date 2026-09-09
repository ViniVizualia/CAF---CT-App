'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tournamentId: string
  categoryNames: string[]
  initialLinks: Record<string, string> | null
}

export function WhatsAppLinksEditor({ tournamentId, categoryNames, initialLinks }: Props) {
  const router = useRouter()
  const [links, setLinks] = useState<Record<string, string>>(initialLinks ?? {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function updateLink(category: string, value: string) {
    setLinks((prev) => ({ ...prev, [category]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setLoading(true); setError(null); setSaved(false)
    const cleanLinks = Object.fromEntries(Object.entries(links).filter(([, v]) => v.trim()))
    const { error } = await createClient()
      .from('tournaments')
      .update({ category_whatsapp_links: cleanLinks })
      .eq('id', tournamentId)
    setLoading(false)
    if (error) return setError(error.message)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-4">
      <p className="text-sm font-medium mb-2">Grupos do WhatsApp por categoria</p>
      {categoryNames.length > 0 ? (
        <div className="flex flex-col gap-2 mb-3">
          {categoryNames.map((category) => (
            <label key={category} className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
              {category}
              <input
                type="url"
                placeholder="https://chat.whatsapp.com/..."
                value={links[category] ?? ''}
                onChange={(e) => updateLink(category, e.target.value)}
                className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm text-[var(--color-text-primary)]"
              />
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Nenhuma categoria cadastrada ainda — preencha "Dias e horários por categoria" na criação do torneio primeiro.
        </p>
      )}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading || categoryNames.length === 0} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar links'}
        </button>
        {saved && <span className="text-xs text-[var(--color-text-muted)]">Salvo ✓</span>}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
