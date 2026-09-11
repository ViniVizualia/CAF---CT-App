'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function MarkReviewedButton({ athleteId }: { athleteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const { error } = await createClient().from('athletes').update({ pending_review: false }).eq('id', athleteId)
    setLoading(false)
    if (error) return setError(error.message)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={handleClick} disabled={loading} className="text-xs text-[var(--color-primary)] underline disabled:opacity-60">
        {loading ? 'Marcando...' : 'Marcar como revisado'}
      </button>
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </div>
  )
}
