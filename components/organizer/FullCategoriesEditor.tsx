'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Estreante',
  'Iniciante',
  'Intermediário',
  'Amador C',
  'Amador B',
  'Qualifier',
] as const

interface Props {
  tournamentId: string
  initialFull: Record<string, boolean> | null
}

export function FullCategoriesEditor({ tournamentId, initialFull }: Props) {
  const router = useRouter()
  const [full, setFull] = useState<Record<string, boolean>>(initialFull ?? {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function toggle(category: string) {
    setFull((prev) => ({ ...prev, [category]: !prev[category] }))
    setSaved(false)
  }

  async function handleSave() {
    setLoading(true); setError(null); setSaved(false)
    const { error } = await createClient()
      .from('tournaments')
      .update({ full_categories: full })
      .eq('id', tournamentId)
    setLoading(false)
    if (error) return setError(error.message)
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-4">
      <p className="text-sm font-medium mb-2">Vagas preenchidas por categoria</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Marque as categorias já esgotadas. Novas solicitações nelas entram como "interesse" em vez de inscrição.
      </p>
      <div className="flex flex-col gap-2 mb-3">
        {CATEGORIES.map((category) => (
          <label key={category} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!full[category]} onChange={() => toggle(category)} />
            {category}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        {saved && <span className="text-xs text-[var(--color-text-muted)]">Salvo ✓</span>}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
