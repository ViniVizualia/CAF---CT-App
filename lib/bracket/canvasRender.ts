import type { RenderMatch } from './summarize'

interface DrawRoundImageOptions {
  width: number
  height: number
  tournamentName: string
  categoryName: string
  logoImg: HTMLImageElement | null
  roundNumber: number | null
  stage: 'pool' | 'knockout' | null
  matches: RenderMatch[]
  championLabel: string | null
}

const CAF_GOLD = '#EBBA36'
const CAF_GREEN_LIGHT = '#3FBF6F'

export function drawRoundImage(canvas: HTMLCanvasElement, opts: DrawRoundImageOptions) {
  const { width, height, tournamentName, categoryName, logoImg, roundNumber, stage, matches, championLabel } = opts
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0B0F1A'
  ctx.fillRect(0, 0, width, height)

  const margin = width * 0.06
  let y = margin

  if (logoImg) {
    const logoSize = width * 0.26
    ctx.drawImage(logoImg, (width - logoSize) / 2, y, logoSize, logoSize)
    y += logoSize + margin * 0.5
  } else {
    y += margin * 0.3
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${width * 0.045}px sans-serif`
  ctx.fillText(tournamentName, width / 2, y)
  y += width * 0.06

  ctx.fillStyle = CAF_GOLD
  ctx.font = `${width * 0.032}px sans-serif`
  ctx.fillText(categoryName, width / 2, y)
  y += width * 0.09

  if (championLabel) {
    ctx.fillStyle = CAF_GOLD
    ctx.font = `bold ${width * 0.04}px sans-serif`
    ctx.fillText(`🏆 Campeão: ${championLabel}`, width / 2, y)
    y += width * 0.1
  } else if (roundNumber !== null) {
    ctx.fillStyle = '#8A93A6'
    ctx.font = `${width * 0.03}px sans-serif`
    ctx.fillText(`Rodada ${roundNumber}${stage === 'knockout' ? ' · mata-mata' : ''}`, width / 2, y)
    y += width * 0.08
  }

  ctx.textAlign = 'left'
  for (const m of matches) {
    const cardHeight = width * 0.1
    if (y + cardHeight > height - margin * 1.5) break

    ctx.fillStyle = '#161D2E'
    ctx.fillRect(margin, y, width - margin * 2, cardHeight)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = `${width * 0.03}px sans-serif`
    const line = m.teamBLabel ? `${m.teamALabel}  vs  ${m.teamBLabel}` : `${m.teamALabel} — avançou (bye)`
    ctx.fillText(line, margin + width * 0.02, y + cardHeight * 0.4)

    if (m.winnerLabel) {
      ctx.fillStyle = CAF_GREEN_LIGHT
      ctx.font = `bold ${width * 0.026}px sans-serif`
      const resultLine = m.score ? `${m.winnerLabel} venceu (${m.score})` : `${m.winnerLabel} venceu`
      ctx.fillText(resultLine, margin + width * 0.02, y + cardHeight * 0.78)
    }

    y += cardHeight + width * 0.025
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#5A6478'
  ctx.font = `${width * 0.022}px sans-serif`
  ctx.fillText('Chaveamento gerado pelo CAF', width / 2, height - margin * 0.6)
}

export function canvasToDownload(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
