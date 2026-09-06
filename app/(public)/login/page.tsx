'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const faqItems = [
  {
    question: 'O que é o CAF?',
    answer:
      'O CAF (Cadastro do Atleta de Futevôlei) é a identificação digital oficial de atletas de futevôlei. Cada atleta recebe uma carteirinha digital com número CAF, foto e categoria, usada para participar de torneios e campeonatos de futevôlei.',
  },
  {
    question: 'Como funciona a carteirinha digital do CAF?',
    answer:
      'A carteirinha digital fica disponível direto no aplicativo, com QR Code próprio. No dia do torneio, o organizador escaneia o QR Code da carteirinha para confirmar a inscrição e a categoria do atleta na entrada do evento.',
  },
  {
    question: 'O que são as categorias de atleta no futevôlei?',
    answer:
      'O CAF organiza os atletas em categorias por nível técnico: Estreante, Iniciante, Amador C, Amador B e Qualifier. A categoria de cada atleta é usada para garantir que ele participe de torneios de futevôlei compatíveis com seu nível.',
  },
  {
    question: 'Como participar de torneios e campeonatos de futevôlei pelo CAF?',
    answer:
      'Atletas cadastrados no CAF podem visualizar os próximos torneios de futevôlei diretamente no aplicativo e solicitar inscrição informando a dupla. A organização do evento aprova a inscrição antes da confirmação da vaga.',
  },
  {
    question: 'Um atleta pode disputar uma categoria diferente da sua?',
    answer:
      'Um atleta do CAF pode competir na própria categoria ou em categorias mais avançadas, mas não pode se inscrever em uma categoria mais fácil do que a que já possui, o que garante mais equilíbrio nos torneios de futevôlei.',
  },
  {
    question: 'Quem pode criar um cadastro CAF?',
    answer:
      'Qualquer atleta de futevôlei pode criar seu cadastro CAF, informando dados pessoais, categoria e uma foto de identificação. Após o envio, o cadastro passa por análise antes da liberação da carteirinha digital.',
  },
]

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

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto gap-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/IMG_0348.png" alt="CAF" className="w-16 mx-auto" />

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

      <Link href="/recuperar-senha" className="text-sm text-center text-[var(--color-text-muted)] underline">
        Esqueci minha senha
      </Link>

      <p className="text-sm text-center text-[var(--color-text-muted)]">
        Ainda não tem cadastro?{' '}
        <Link href="/cadastro" className="text-[var(--color-primary)] underline">
          Criar cadastro CAF
        </Link>
      </p>

      <section className="mt-4 pt-6 border-t border-white/10">
        <h2 className="text-lg font-semibold mb-3">Perguntas frequentes sobre o CAF</h2>
        <div className="flex flex-col gap-2">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3"
            >
              <summary className="text-sm font-medium cursor-pointer">
                {item.question}
              </summary>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
