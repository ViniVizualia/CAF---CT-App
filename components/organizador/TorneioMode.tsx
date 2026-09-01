'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { createClient } from '@/lib/supabase/client'

type View = 'hub' | 'scanner' | 'busca' | 'validacao' | 'historico'
type ResultStatus = 'liberado' | 'vencido' | 'bloqueado' | 'nao_encontrado'

interface AthleteResult {
  athlete_id: string | null
  full_name: string
  caf_number: number | null
  category_name: string | null
  status: string | null
  validity_date: string | null
  thumbnail_path: string | null
  resultStatus: ResultStatus
}

interface HistoryItem {
  id: string
  scanned_at: string
  method: string
  result_status: string
  full_name: string | null
  caf_number: number | null
}

function computeResultStatus(row: { status: string; validity_date: string | null } | null): ResultStatus {
  if (!row) return 'nao_encontrado'
  if (row.status === 'bloqueado') return 'bloqueado'
  if (row.validity_date && new Date(row.validity_date) < new Date()) return 'vencido'
  if (row.status !== 'ativo') return 'vencido'
  return 'liberado'
}

const resultLabel: Record<ResultStatus, string> = {
  liberado: 'ATLETA LIBERADO',
  vencido: 'CADASTRO VENCIDO',
  bloqueado: 'CADASTRO BLOQUEADO',
  nao_encontrado: 'ATLETA NÃO ENCONTRADO',
}

const resultColor: Record<ResultStatus, string> = {
  liberado: 'var(--color-success)',
  vencido: '#B45309',
  bloqueado: 'var(--color-danger)',
  nao_encontrado: 'var(--color-text-muted)',
}

export function TorneioMode({ tournamentId, organizerId }: { tournamentId: string; organizerId: string }) {
  const [view, setView] = useState<View>('hub')
  const [result, setResult] = useState<AthleteResult | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)

  async function lookupByToken(token: string) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data } = await supabase
      .from('tournament_athletes_public')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('public_token', token)
      .maybeSingle()

    await handleLookupResult(data)
  }

  async function lookupByText(text: string) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const asNumber = Number(text)
    let query = supabase.from('tournament_athletes_public').select('*').eq('tournament_id', tournamentId)
    query = !isNaN(asNumber) && text.trim() !== ''
      ? query.eq('caf_number', asNumber)
      : query.ilike('full_name', `%${text}%`)

    const { data } = await query.limit(1).maybeSingle()
    await handleLookupResult(data)
  }

  async function handleLookupResult(data: any) {
    const resultStatus = computeResultStatus(data)
    const athleteResult: AthleteResult = {
      athlete_id: data?.athlete_id ?? null,
      full_name: data?.full_name ?? 'Atleta não encontrado',
      caf_number: data?.caf_number ?? null,
      category_name: data?.category_name ?? null,
      status: data?.status ?? null,
      validity_date: data?.validity_date ?? null,
      thumbnail_path: data?.thumbnail_path ?? null,
      resultStatus,
    }
    setResult(athleteResult)

    if (data?.thumbnail_path) {
      const supabase = createClient()
      const { data: signed } = await supabase.storage.from('athlete-thumbnails').createSignedUrl(data.thumbnail_path, 600)
      setPhotoUrl(signed?.signedUrl ?? null)
    } else {
      setPhotoUrl(null)
    }

    await logScan(athleteResult, data ? 'qr' : 'manual')
    setLoading(false)
    setView('validacao')
  }

  async function logScan(athleteResult: AthleteResult, method: 'qr' | 'manual') {
    const supabase = createClient()
    const { error } = await supabase.from('scan_logs').insert({
      client_event_id: crypto.randomUUID(),
      tournament_id: tournamentId,
      athlete_id: athleteResult.athlete_id,
      organizer_profile_id: organizerId,
      scanned_at: new Date().toISOString(),
      method,
      result_status: athleteResult.resultStatus,
    })
    if (error) setError('Validação exibida, mas o registro no histórico falhou: ' + error.message)
  }

  async function startScanner() {
    setView('scanner')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      scanningRef.current = true
      requestAnimationFrame(scanFrame)
    } catch (e) {
      setError('Não foi possível acessar a câmera.')
      setView('hub')
    }
  }

  function stopScanner() {
    scanningRef.current = false
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  function scanFrame() {
    if (!scanningRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code?.data) {
          scanningRef.current = false
          stopScanner()
          lookupByToken(code.data)
          return
        }
      }
    }
    requestAnimationFrame(scanFrame)
  }

  async function loadHistory() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('scan_logs')
      .select('id, scanned_at, method, result_status, athlete_id')
      .eq('tournament_id', tournamentId)
      .order('scanned_at', { ascending: false })
      .limit(30)

    const athleteIds = [...new Set((data ?? []).map((r) => r.athlete_id).filter(Boolean))]
    let namesMap = new Map<string, { full_name: string; caf_number: number | null }>()
    if (athleteIds.length > 0) {
      const { data: athletesData } = await supabase
        .from('tournament_athletes_public')
        .select('athlete_id, full_name, caf_number')
        .eq('tournament_id', tournamentId)
        .in('athlete_id', athleteIds)
      for (const a of athletesData ?? []) namesMap.set(a.athlete_id, { full_name: a.full_name, caf_number: a.caf_number })
    }

    setHistory((data ?? []).map((r) => ({
      id: r.id,
      scanned_at: r.scanned_at,
      method: r.method,
      result_status: r.result_status,
      full_name: r.athlete_id ? namesMap.get(r.athlete_id)?.full_name ?? null : null,
      caf_number: r.athlete_id ? namesMap.get(r.athlete_id)?.caf_number ?? null : null,
    })))
    setLoading(false)
    setView('historico')
  }

  useEffect(() => () => stopScanner(), [])

  function backToHub() {
    stopScanner()
    setResult(null)
    setError(null)
    setView('hub')
  }

  if (view === 'hub') {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-2 text-xs text-[var(--color-text-muted)] flex justify-between">
          <span>ONLINE</span>
          <span>Modo offline chega na próxima etapa</span>
        </div>
        <button onClick={startScanner} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-5 text-lg font-medium">
          Escanear Carteirinha
        </button>
        <button onClick={() => setView('busca')} className="rounded-[var(--radius-md)] border border-white/15 py-4 font-medium">
          Buscar Atleta
        </button>
        <button onClick={loadHistory} className="text-sm text-[var(--color-text-muted)] underline mt-2">
          Ver histórico de validações
        </button>
      </div>
    )
  }

  if (view === 'scanner') {
    return (
      <div className="flex flex-col gap-4">
        <video ref={videoRef} className="w-full rounded-[var(--radius-md)] bg-black" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button onClick={backToHub} className="rounded-[var(--radius-md)] border border-white/15 py-3 font-medium">Cancelar</button>
      </div>
    )
  }

  if (view === 'busca') {
    return (
      <div className="flex flex-col gap-4">
        <input
          autoFocus
          placeholder="Nome ou número CAF"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-3"
        />
        <button
          onClick={() => lookupByText(searchText)}
          disabled={loading || !searchText.trim()}
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button onClick={backToHub} className="text-sm text-[var(--color-text-muted)] underline">Cancelar</button>
      </div>
    )
  }

  if (view === 'validacao' && result) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={result.full_name} className="w-32 h-32 rounded-full object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-[var(--color-surface)] border border-white/10" />
        )}
        <h2 className="text-xl font-semibold">{result.full_name}</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {result.caf_number ? `CAF ${String(result.caf_number).padStart(6, '0')}` : '—'} · {result.category_name ?? '—'}
        </p>
        <p className="text-lg font-bold px-4 py-2 rounded-full" style={{ backgroundColor: resultColor[result.resultStatus], color: 'white' }}>
          {resultLabel[result.resultStatus]}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Base atualizada em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </p>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button onClick={backToHub} className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium mt-4">
          Nova validação
        </button>
      </div>
    )
  }

  if (view === 'historico') {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Histórico de validações</h2>
        {history.map((h) => (
          <div key={h.id} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{h.full_name ?? 'Não encontrado'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {h.caf_number ? String(h.caf_number).padStart(6, '0') : '—'} · {new Date(h.scanned_at).toLocaleString('pt-BR')} · {h.method === 'qr' ? 'QR' : 'Manual'}
              </p>
            </div>
            <span className="text-xs" style={{ color: resultColor[h.result_status as ResultStatus] }}>
              {resultLabel[h.result_status as ResultStatus]}
            </span>
          </div>
        ))}
        {history.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhuma validação registrada ainda.</p>}
        <button onClick={backToHub} className="rounded-[var(--radius-md)] border border-white/15 py-3 font-medium mt-2">← Voltar</button>
      </div>
    )
  }

  return null
}
