'use client'

import { useState } from 'react'
import { paymentLinks, uniformPrice, type Genero, type Tamanho } from '@/lib/loja/payment-links'

const generos: { value: Genero; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
]

const tamanhos: Tamanho[] = ['P', 'M', 'G', 'GG']

const priceLabel = uniformPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function UniformPurchase() {
  const [genero, setGenero] = useState<Genero>('masculino')
  const [tamanho, setTamanho] = useState<Tamanho>('M')

  const link = paymentLinks[genero][tamanho]

  return (
    <div className="flex flex-col gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/SEU_ARQUIVO_AQUI.png" alt="Uniforme oficial CAF" className="w-full rounded-[var(--radius-md)] bg-white p-4" />

      <div>
        <h1 className="text-xl font-semibold">Uniforme Oficial CAF</h1>
        <p className="text-2xl font-bold text-[var(--color-accent)] mt-1">{priceLabel}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">Camisa + calção</p>
      </div>

      <div>
        <p className="text-sm text-[var(--color-text-muted)] mb-2">Modelo</p>
        <div className="flex gap-2">
          {generos.map((g) => (
            <button
              key={g.value}
              onClick={() => setGenero(g.value)}
              className={`flex-1 rounded-[var(--radius-sm)] py-2 text-sm font-medium border ${
                genero === g.value
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'border-white/15 text-[var(--color-text-muted)]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-[var(--color-text-muted)] mb-2">Tamanho</p>
        <div className="flex gap-2">
          {tamanhos.map((t) => (
            <button
              key={t}
              onClick={() => setTamanho(t)}
              className={`flex-1 rounded-[var(--radius-sm)] py-2 text-sm font-medium border ${
                tamanho === t
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'border-white/15 text-[var(--color-text-muted)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium"
        >
          Continuar para pagamento
        </a>
      ) : (
        <div className="text-center rounded-[var(--radius-md)] border border-white/15 text-[var(--color-text-muted)] py-3 font-medium">
          Em breve disponível para compra
        </div>
      )}
    </div>
  )
}
