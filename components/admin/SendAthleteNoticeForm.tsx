'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MAX_LENGTH = 300

interface NoticeRow {
  id: string
  message: string
  created_at: string
  read_at: string | null
}

interface Props {
  athleteId: string
  notices: NoticeRow[]
}

export function SendAthleteNoticeForm({ athleteId, notices }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!message.trim()) { setError('Escreva a mensagem.'); return }
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return setError('Sessão expirada.') }

    const { error } = await supabase.from('athlete_notices').insert({
      athlete_id: athleteId,
      sender_profile_id: user.id,
      message: message.trim(),
    })
    setLoading(false)
    if (error) return setError(error.message)
    setMessage('')
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mt-6">
      <p className="text-sm font-medium mb-2">Enviar aviso para o atleta</p>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        Aparece como notificação assim que o atleta abrir o app.
      </p>
      <textarea
        value={message}
        maxLength={MAX_LENGTH}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ex: Por favor, atualize sua foto de perfil para uma foto de documento."
        rows={3}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-2"
      />
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-[var(--color-text-muted)]">{message.length}/{MAX_LENGTH}</span>
        <button onClick={handleSend} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
          {loading ? 'Enviando...' : 'Enviar aviso'}
        </button>
      </div>

      {notices.length > 0 && (
        <>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Histórico</p>
          <div className="flex flex-col gap-2">
            {notices.map((n) => (
              <div key={n.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--color-text-muted)]">{new Date(n.created_at).toLocaleString('pt-BR')}</span>
                  <span style={{ color: n.read_at ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
                    {n.read_at ? 'Lido' : 'Não lido'}
                  </span>
                </div>
                <p>{n.message}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
