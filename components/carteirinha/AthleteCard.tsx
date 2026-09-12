'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { categoryStyles, type CategoryKey } from '@/lib/design-tokens'
import { drawAthleteCard, canvasToDownload } from '@/lib/carteirinha/canvasRender'

interface Trophy {
  medal: 'ouro' | 'prata' | 'bronze'
  categoryName: string | null
  tournamentName: string | null
}

interface AthleteCardProps {
  fullName: string
  cafNumber: number | null
  categoryStyleKey: string
  categoryLabel: string
  validityDate: string | null
  publicToken: string
  photoUrl: string | null
  trophies?: Trophy[]
}

const medalIcon: Record<string, string> = { ouro: '🥇', prata: '🥈', bronze: '🥉' }
const medalLabel: Record<string, string> = { ouro: 'Ouro', prata: 'Prata', bronze: 'Bronze' }

function formatValidity(date: string | null) {
  if (!date) return '—'
  const [year, month] = date.split('-')
  return `${month}/${year}`
}

export function AthleteCard({
  fullName, cafNumber, categoryStyleKey, categoryLabel, validityDate, publicToken, photoUrl, trophies = [],
}: AthleteCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const style = categoryStyles[categoryStyleKey as CategoryKey] ?? categoryStyles.estreante

  const counts = { ouro: 0, prata: 0, bronze: 0 }
  for (const t of trophies) counts[t.medal] = (counts[t.medal] ?? 0) + 1

  async function handleDownload() {
    setDownloading(true)
    setDownloadError(null)
    try {
      const canvas = document.createElement('canvas')
      await drawAthleteCard(canvas, {
        fullName,
        cafNumber,
        categoryLabel,
        validityDate,
        publicToken,
        photoUrl,
        gradientFrom: style.gradient[0],
        gradientTo: style.gradient[1],
        textColor: style.textOnCard,
      })
      canvasToDownload(canvas, `carteirinha-caf-${fullName.replace(/\s+/g, '_')}.png`)
    } catch {
      setDownloadError('Não foi possível gerar a imagem.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3">
      <div className="w-full" style={{ perspective: '1200px' }}>
        <div
          className="grid w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Frente */}
          <div
            className="col-start-1 row-start-1 rounded-[var(--radius-lg)] p-6 flex flex-col gap-4"
            style={{
              backfaceVisibility: 'hidden',
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

          {/* Verso */}
          <div
            className="col-start-1 row-start-1 rounded-[var(--radius-lg)] p-6 flex flex-col gap-3"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`,
              color: style.textOnCard,
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              minHeight: '260px',
            }}
          >
            <p className="text-sm font-semibold text-center">🏆 Meus Troféus</p>

            <div className="flex justify-center gap-4 text-sm pb-2 border-b border-white/20">
              <span>🥇 x{counts.ouro}</span>
              <span>🥈 x{counts.prata}</span>
              <span>🥉 x{counts.bronze}</span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-48">
              {trophies.length === 0 ? (
                <p className="text-xs opacity-80 text-center mt-4">Nenhum troféu ainda. Conquiste seu primeiro título!</p>
              ) : (
                trophies.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-black/10 rounded-[var(--radius-sm)] px-2 py-1.5">
                    <span className="text-base">{medalIcon[t.medal]}</span>
                    <div>
                      <p className="font-medium">{medalLabel[t.medal]} — {t.categoryName ?? '—'}</p>
                      <p className="opacity-70">{t.tournamentName ?? '—'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => setFlipped((f) => !f)} className="text-xs text-[var(--color-text-muted)] underline">
          {flipped ? '← Ver frente' : 'Ver troféus (verso) →'}
        </button>
        <button onClick={handleDownload} disabled={downloading} className="text-xs text-[var(--color-primary)] underline disabled:opacity-60">
          {downloading ? 'Gerando...' : 'Baixar carteirinha'}
        </button>
      </div>
      <p className="text-[10px] text-[var(--color-text-muted)] opacity-70">Apenas a frente da carteirinha é baixada.</p>
      {downloadError && <p className="text-xs text-[var(--color-danger)]">{downloadError}</p>}
    </div>
  )
}
