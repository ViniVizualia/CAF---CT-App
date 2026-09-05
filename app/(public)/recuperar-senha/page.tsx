'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })

    setLoading(false)
    if (error) {
      setError('Não foi possível enviar o e-mail. Tente novamente.')
      return
    }
    setSent(true)
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/IMG_0348.png" alt="CAF" className="w-16 mx-auto" />

      <div>
        <h1 className="text-2xl font-semibold">Recuperar senha</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Enviaremos um link para você criar uma nova senha.
        </p>
      </div>

      {sent ? (
        <p className="text-sm text-[var(--color-success)]">
          Se esse e-mail estiver cadastrado, você vai receber um link em instantes. Confira também a caixa de spam.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2"
          />
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
      )}

      <Link href="/login" className="text-sm text-center text-[var(--color-text-muted)] underline">
        ← Voltar para o login
      </Link>
    </main>
  )
}
