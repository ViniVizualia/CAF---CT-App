'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MAX_LENGTH = 300

interface AthleteLite { athlete_id: string; full_name: string }
interface MessageRow {
  id: string
  athlete_id: string
  message: string
  created_at: string
  read_at: string | null
}

interface Props {
  tournamentId: string
  athletes: AthleteLite[]
  messages: MessageRow[]
}

export function TournamentMessagesPanel({ tournamentId, athletes, messages }: Props) {
  const router = useRouter()
  const [selectedAthlete, setSelectedAthlete] = useState(athletes[0]?.athlete_id ?? '')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const athleteName = (id: string) => athletes.find((a) => a.athlete_id === id)?.full_name ?? '—'

  async function handleSend() {
    if (!selectedAthlete || !text.trim()) { setError('Selecione o atleta e escreva a mensagem.'); return }
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return setError('Sessão expirada.') }

    const { error } = await supabase.from('tournament_messages').insert({
      tournament_id: tournamentId,
      athlete_id: selectedAthlete,
      sender_profile_id: user.id,
      message: text.trim(),
    })
    setLoading(false)
    if (error) return setError(error.message)
    setText('')
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Mensagens para atletas</p>

      {athletes.length > 0 ? (
        <div className="flex flex-col gap-2 mb-6">
          <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm">
            {athletes.map((a) => <option key={a.athlete_id} value={a.athlete_id}>{a.full_name}</option>)}
          </select>
          <textarea
            value={text}
            maxLength={MAX_LENGTH}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Pendência de pagamento da inscrição, favor regularizar até sexta."
            rows={3}
            className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--color-text-muted)]">{text.length}/{MAX_LENGTH}</span>
            <button onClick={handleSend} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
              {loading ? 'Enviando...' : 'Enviar mensagem'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] mb-6">Nenhum atleta vinculado a este torneio.</p>
      )}

      <p className="text-xs text-[var(--color-text-muted)] mb-2">Histórico</p>
      <div className="flex flex-col gap-2">
        {messages.map((m) => (
          <div key={m.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-3 text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{athleteName(m.athlete_id)}</span>
              <span className="text-xs" style={{ color: m.read_at ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
                {m.read_at ? 'Lida' : 'Não lida'}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{new Date(m.created_at).toLocaleDateString('pt-BR')}</p>
            <p className="text-[var(--color-text-muted)]">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhuma mensagem enviada ainda.</p>}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
