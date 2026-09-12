import QRCode from 'qrcode'

interface DrawCardOptions {
  fullName: string
  cafNumber: number | null
  categoryLabel: string
  validityDate: string | null
  publicToken: string
  photoUrl: string | null
  gradientFrom: string
  gradientTo: string
  textColor: string
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function formatValidity(date: string | null) {
  if (!date) return '—'
  const [year, month] = date.split('-')
  return `${month}/${year}`
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function drawAthleteCard(canvas: HTMLCanvasElement, opts: DrawCardOptions) {
  const width = 900
  const height = 560
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, opts.gradientFrom)
  gradient.addColorStop(1, opts.gradientTo)

  roundedRect(ctx, 0, 0, width, height, 32)
  ctx.fillStyle = gradient
  ctx.fill()

  const margin = 48
  ctx.fillStyle = opts.textColor

  ctx.textAlign = 'left'
  ctx.font = '600 20px sans-serif'
  ctx.globalAlpha = 0.85
  ctx.fillText('CAF', margin, margin + 10)
  ctx.font = '400 16px sans-serif'
  ctx.globalAlpha = 0.7
  ctx.fillText('Cadastro do Atleta de Futevôlei', margin, margin + 34)
  ctx.globalAlpha = 1

  ctx.textAlign = 'right'
  const badgeText = 'ATIVO'
  ctx.font = '600 16px sans-serif'
  const badgeWidth = ctx.measureText(badgeText).width + 32
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  roundedRect(ctx, width - margin - badgeWidth, margin - 20, badgeWidth, 36, 18)
  ctx.fill()
  ctx.fillStyle = opts.textColor
  ctx.fillText(badgeText, width - margin - 16, margin + 3)

  const photoSize = 130
  const photoX = margin
  const photoY = margin + 60

  ctx.save()
  ctx.beginPath()
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (opts.photoUrl) {
    try {
      const img = await loadImage(opts.photoUrl)
      ctx.drawImage(img, photoX, photoY, photoSize, photoSize)
    } catch {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(photoX, photoY, photoSize, photoSize)
    }
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(photoX, photoY, photoSize, photoSize)
  }
  ctx.restore()

  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = opts.textColor
  ctx.font = '600 30px sans-serif'
  ctx.fillText(opts.fullName, photoX + photoSize + 28, photoY + 55)
  ctx.globalAlpha = 0.9
  ctx.font = '400 22px sans-serif'
  ctx.fillText(opts.categoryLabel, photoX + photoSize + 28, photoY + 90)
  ctx.globalAlpha = 1

  const bottomY = height - margin - 130
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(margin, bottomY)
  ctx.lineTo(width - margin, bottomY)
  ctx.stroke()

  ctx.globalAlpha = 0.7
  ctx.font = '400 16px sans-serif'
  ctx.fillText('Nº CAF', margin, bottomY + 36)
  ctx.globalAlpha = 1
  ctx.font = '600 22px sans-serif'
  ctx.fillText(opts.cafNumber ? String(opts.cafNumber).padStart(6, '0') : '—', margin, bottomY + 64)

  ctx.globalAlpha = 0.7
  ctx.font = '400 16px sans-serif'
  ctx.fillText('Válido até', margin, bottomY + 96)
  ctx.globalAlpha = 1
  ctx.font = '600 22px sans-serif'
  ctx.fillText(formatValidity(opts.validityDate), margin, bottomY + 124)

  const qrSize = 130
  const qrDataUrl = await QRCode.toDataURL(opts.publicToken, { margin: 1, width: qrSize })
  const qrImg = await loadImage(qrDataUrl)
  const qrX = width - margin - qrSize - 16
  const qrY = bottomY + 20

  ctx.fillStyle = '#FFFFFF'
  roundedRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 12)
  ctx.fill()
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
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
