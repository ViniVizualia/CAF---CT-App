'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notice {
  id: string
  message: string
  created_at: string
}

export function AthleteNoticeBanner({ notices }: { notices: Notice[] }) {
  const [visibleIds, setVisibleIds] = useState(notices.map((n) => n.id))

  async function handleDismiss(id: string) {
    setVisibleIds((prev) => prev.filter((v) => v !== id))
    await createClient().from('athlete_notices').update({ read_at: new Date().toISOString() }).eq('id', id)
  }

  const visible = notices.filter((n) => visibleIds.includes(n.id))
  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-4">
      {visible.map((n) => (
        <div key={n.id} className="rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)] px-4 py-3 flex flex-col gap-2">
          <p className="text-sm text-[var(--color-text-primary)]">{n.message}</p>
          <button onClick={() => handleDismiss(n.id)} className="self-start text-xs text-[var(--color-accent)] font-medium underline">
            Ok, entendi
          </button>
        </div>
      ))}
    </div>
  )
}
