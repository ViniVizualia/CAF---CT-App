'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setError('E-mail ou senha incorretos.')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (profile?.role === 'super_admin') {
      router.push('/dashboard')
    } else if (profile?.role === 'organizer') {
      router.push('/meus-torneios')
    } else {
      router.push('/home')
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Acesse sua conta CAF</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="E-mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Senha"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2"
        />

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-sm text-center text-[var(--color-text-muted)]">
        Ainda não tem cadastro?{' '}
        <Link href="/cadastro" className="text-[var(--color-primary)] underline">
          Criar cadastro CAF
        </Link>
      </p>
    </main>
  )
}
