'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const categoryOptions = [
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'reclamacao', label: 'Reclamação' },
  { value: 'duvida', label: 'Dúvida' },
  { value: 'outro', label: 'Outro' },
] as const

export function FeedbackForm() {
  const [category, setCategory] = useState<typeof categoryOptions[number]['value']>('sugestao')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sessão expirada. Entre novamente.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('feedback_messages').insert({
      profile_id: user.id,
      category,
      message,
    })

    setLoading(false)
    if (error) {
      setError('Não foi possível enviar. Tente novamente.')
      return
    }
    setSuccess(true)
    setMessage('')
  }

  if (success) {
    return (
      <div className="rounded-[var(--radius-md)] border border-white/10 p-5">
        <p className="text-sm text-[var(--color-success)]">
          Recebemos sua mensagem, obrigado! Se precisar de resposta rápida, use o WhatsApp abaixo.
        </p>
        <button onClick={() => setSuccess(false)} className="text-sm text-[var(--color-primary)] underline mt-3">
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[var(--radius-md)] border border-white/10 p-5 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
        Sugestões e reclamações
      </h2>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as typeof category)}
        className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
      >
        {categoryOptions.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <textarea
        required
        rows={4}
        placeholder="Conte pra gente o que você pensa..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm resize-none"
      />
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2.5 font-medium text-sm disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  )
}
