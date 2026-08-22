'use client'

import { QRCodeSVG } from 'qrcode.react'
import { categoryStyles, type CategoryKey } from '@/lib/design-tokens'

interface AthleteCardProps {
  fullName: string
  cafNumber: number | null
  categoryStyleKey: string
  categoryLabel: string
  validityDate: string | null
  publicToken: string
  photoUrl: string | null
}

function formatValidity(date: string | null) {
  if (!date) return '—'
  const [year, month] = date.split('-')
  return `${month}/${year}`
}

export function AthleteCard({
  fullName, cafNumber, categoryStyleKey, categoryLabel, validityDate, publicToken, photoUrl,
}: AthleteCardProps) {
  const style = categoryStyles[categoryStyleKey as CategoryKey] ?? categoryStyles.estreante

  return (
    <div
      className="w-full max-w-sm rounded-[var(--radius-lg)] p-6 flex flex-col gap-4"
      style={{
        background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
        color: style.textOnCard,
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80">CAF</p>
          <p className="text-xs opacity-70">Cadastro do Atleta de Futevôlei</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/15">ATIVO</span>
      </div>

      <div className="flex items-center gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={fullName} className="w-20 h-20 rounded-full object-cover border-2 border-white/30" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-black/15 border-2 border-white/30" />
        )}
        <div>
          <p className="font-semibold text-lg leading-tight">{fullName}</p>
          <p className="text-sm opacity-90">{style.label}</p>
        </div>
      </div>

      <div className="flex justify-between items-end pt-2 border-t border-white/20">
        <div className="text-xs">
          <p className="opacity-70">Nº CAF</p>
          <p className="font-medium">{cafNumber ? String(cafNumber).padStart(6, '0') : '—'}</p>
          <p className="opacity-70 mt-2">Válido até</p>
          <p className="font-medium">{formatValidity(validityDate)}</p>
        </div>
        <div className="bg-white p-2 rounded-[var(--radius-sm)]">
          <QRCodeSVG value={publicToken} size={88} />
        </div>
      </div>
    </div>
  )
}
