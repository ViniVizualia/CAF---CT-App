'use client'

import { useState } from 'react'
import { buildMatchesCsv, downloadCsv } from '@/lib/bracket/csv'
import { drawRoundImage, canvasToDownload, loadImage } from '@/lib/bracket/canvasRender'
import { getRoundsSummary, type TeamLite, type MatchRow } from '@/lib/bracket/summarize'

interface Props {
  tournamentName: string
  logoUrl: string | null
  categoryName: string
  teams: TeamLite[]
  matches: MatchRow[]
  bracketFinished: boolean
}

export function BracketExportPanel({ tournamentName, logoUrl, categoryName, teams, matches, bracketFinished }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileBase = `${tournamentName}-${categoryName}`.replace(/[^\w-]+/g, '_')

  function handleDownloadCsv() {
    const csv = buildMatchesCsv(categoryName, teams, matches)
    downloadCsv(`${fileBase}.csv`, csv)
  }

  async function handleDownloadImage(format: 'story' | 'feed') {
    setLoading(format); setError(null)
    try {
      const logoImg = logoUrl ? await loadImage(logoUrl).catch(() => null) : null
      const summary = getRoundsSummary(teams, matches)
      const dims = format === 'story' ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 }
      const canvas = document.createElement('canvas')
      drawRoundImage(canvas, {
        ...dims,
        tournamentName,
        categoryName,
        logoImg,
        roundNumber: summary.current?.roundNumber ?? null,
        stage: summary.current?.stage ?? null,
        matches: summary.current?.matches ?? [],
        championLabel: bracketFinished ? summary.championLabel : null,
      })
      canvasToDownload(canvas, `${fileBase}-${format}.png`)
    } catch {
      setError('Não foi possível gerar a imagem.')
    } finally {
      setLoading(null)
    }
  }

  async function handleDownloadPdf() {
    setLoading('pdf'); setError(null)
    try {
      const { jsPDF } = await import('jspdf')
      const logoImg = logoUrl ? await loadImage(logoUrl).catch(() => null) : null
      const summary = getRoundsSummary(teams, matches)
      const width = 1000
      const height = 1400
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [width, height] })

      const pages: { roundNumber: number | null; stage: 'pool' | 'knockout' | null; matches: any[]; championLabel: string | null }[] =
        summary.rounds.map((r) => ({ roundNumber: r.roundNumber, stage: r.stage, matches: r.matches, championLabel: null }))
      if (bracketFinished && summary.championLabel) {
        pages.push({ roundNumber: null, stage: null, matches: [], championLabel: summary.championLabel })
      }

      pages.forEach((page, i) => {
        const canvas = document.createElement('canvas')
        drawRoundImage(canvas, {
          width, height, tournamentName, categoryName, logoImg,
          roundNumber: page.roundNumber, stage: page.stage, matches: page.matches, championLabel: page.championLabel,
        })
        const dataUrl = canvas.toDataURL('image/png')
        if (i > 0) pdf.addPage([width, height])
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
      })

      pdf.save(`${fileBase}.pdf`)
    } catch {
      setError('Não foi possível gerar o PDF.')
    } finally {
      setLoading(null)
    }
  }

  if (matches.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mt-3">
      <p className="text-sm font-medium mb-3">Exportar — {categoryName}</p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleDownloadCsv} className="rounded-[var(--radius-sm)] border border-white/15 py-2 text-sm">
          Planilha (CSV)
        </button>
        <button onClick={handleDownloadPdf} disabled={loading === 'pdf'} className="rounded-[var(--radius-sm)] border border-white/15 py-2 text-sm disabled:opacity-60">
          {loading === 'pdf' ? 'Gerando...' : 'PDF completo'}
        </button>
        <button onClick={() => handleDownloadImage('story')} disabled={loading === 'story'} className="rounded-[var(--radius-sm)] border border-white/15 py-2 text-sm disabled:opacity-60">
          {loading === 'story' ? 'Gerando...' : 'Imagem Story'}
        </button>
        <button onClick={() => handleDownloadImage('feed')} disabled={loading === 'feed'} className="rounded-[var(--radius-sm)] border border-white/15 py-2 text-sm disabled:opacity-60">
          {loading === 'feed' ? 'Gerando...' : 'Imagem Feed'}
        </button>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
