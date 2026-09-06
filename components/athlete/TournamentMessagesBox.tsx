'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  message: string
  created_at: string
  read_at: string | null
}

interface Props {
  messages: Message[]
}

export function TournamentMessagesBox({ messages }: Props) {
  useEffect(() => {
    const unreadIds = messages.filter((m) => !m.read_at).map((m) => m.id)
    if (unreadIds.length === 0) return
    const supabase = createClient()
    supabase.from('tournament_messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds).then()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (messages.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-2">Avisos do organizador</p>
      <div className="flex flex-col gap-2">
        {messages.map((m) => (
          <div key={m.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{new Date(m.created_at).toLocaleString('pt-BR')}</p>
            <p>{m.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
