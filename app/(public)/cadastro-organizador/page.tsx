'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-[var(--color-text-primary)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  )
}

export default function CadastroOrganizadorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    try {
      let userId: string

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        const alreadyRegistered = signUpError.message.toLowerCase().includes('already registered')
        if (!alreadyRegistered) throw signUpError

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

        if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            throw new Error('Este e-mail já tem uma conta criada, mas ainda não confirmada. Verifique sua caixa de entrada para confirmar antes de continuar.')
          }
          throw new Error('Este e-mail já possui uma conta. Se a senha não confere, use "Esqueci minha senha" na tela de login, ou fale com o suporte.')
        }

        userId = signInData.user.id

        const { data: existingOrganizer } = await supabase
          .from('organizers')
          .select('id')
          .eq('profile_id', userId)
          .maybeSingle()

        if (existingOrganizer) {
          setError('Você já tem uma conta de organizador. Faça login normalmente.')
          setLoading(false)
          return
        }
      } else {
        if (!signUpData.session) {
          setError('Conta criada! Confirme seu e-mail e depois entre para concluir o cadastro.')
          setLoading(false)
          return
        }
        userId = signUpData.session.user.id
      }

      const { error: rpcError } = await supabase.rpc('create_organizer_self', {
        p_email: email,
        p_name: name,
        p_responsible_name: responsibleName,
        p_whatsapp: whatsapp,
      })
      if (rpcError) throw rpcError

      router.push('/meus-torneios')
    } catch (err) {
      console.error('Erro no cadastro de organizador:', err)
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as any).message)
          : 'Algo deu errado. Tente novamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/IMG_0348.png" alt="CAF" className="w-14 mb-4" />

      <h1 className="text-2xl font-semibold mb-1">Criar conta de organizador</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Para organizar torneios de futevôlei pelo CAF. Seu acesso é liberado imediatamente após o envio.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="E-mail">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Senha">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Nome / Empresa (CT, rede, etc.)">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Responsável">
          <input required value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="WhatsApp">
          <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
        </Field>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Criar conta de organizador'}
        </button>
      </form>

      <a href="/login" className="block text-sm text-center text-[var(--color-text-muted)] underline mt-4">← Voltar ao login</a>
    </main>
  )
}
