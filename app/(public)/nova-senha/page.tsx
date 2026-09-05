'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NovaSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('Não foi possível atualizar a senha. O link pode ter expirado — solicite um novo.')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/IMG_0348.png" alt="CAF" className="w-16 mx-auto" />

      <div>
        <h1 className="text-2xl font-semibold">Criar nova senha</h1>
      </div>

      {success ? (
        <p className="text-sm text-[var(--color-success)]">Senha atualizada! Redirecionando para o login...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nova senha"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2"
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2"
          />
          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      )}
    </main>
  )
}
