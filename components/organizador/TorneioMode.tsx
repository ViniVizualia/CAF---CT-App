'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { createClient } from '@/lib/supabase/client'
import { prepareTournamentOffline, getTournamentMeta } from '@/lib/offline/snapshot'
import { syncPendingScanLogs, countPendingScanLogs, syncPendingBracketMatches, countPendingBracketMatches } from '@/lib/offline/sync'
import { offlineDB, type TournamentMeta, type AthleteSnapshot } from '@/lib/offline/db'
import { BracketOfflineManager } from '@/components/bracket/BracketOfflineManager'

type View = 'hub' | 'scanner' | 'busca' | 'validacao' | 'historico' | 'chaveamento'
type ResultStatus = 'liberado' | 'vencido' | 'bloqueado' | 'nao_encontrado'

interface AthleteResult {
  athlete_id: string | null
  full_name: string
  caf_number: number | null
  category_name: string | null
  status: string | null
  validity_date: string | null
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

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

export function TorneioMode({ tournamentId, tournamentName, tournamentEndDate, organizerId }: { tournamentId: string; tournamentName: string; tournamentEndDate: string; organizerId: string }) {
  const [view, setView] = useState<View>('hub')
  const [result, setResult] = useState<AthleteResult | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isOnline, setIsOnline] = useState(true)
  const [offlineMeta, setOfflineMeta] = useState<TournamentMeta | undefined>(undefined)
  const [preparing, setPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingBracketCount, setPendingBracketCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [bracketCategories, setBracketCategories] = useState<{ categoryId: number; categoryName: string }[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)

  const offlineExpired = offlineMeta ? new Date() > new Date(offlineMeta.offlineExpiresAt) : false
  const offlineBlocked = !isOnline && (!offlineMeta || offlineExpired)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    getTournamentMeta(tournamentId).then(setOfflineMeta)
    countPendingScanLogs(tournamentId).then(setPendingCount)
    countPendingBracketMatches(tournamentId).then(setPendingBracketCount)
  }, [tournamentId])

  useEffect(() => {
    if (isOnline) handleSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  async function handleSync() {
    setSyncing(true)
    await syncPendingScanLogs(tournamentId)
    await syncPendingBracketMatches(tournamentId)
    const remainingScans = await countPendingScanLogs(tournamentId)
    const remainingBrackets = await countPendingBracketMatches(tournamentId)
    setPendingCount(remainingScans)
    setPendingBracketCount(remainingBrackets)
    setSyncing(false)
  }

  async function handlePrepareOffline() {
    setPreparing(true)
    setPrepareError(null)
    try {
      await prepareTournamentOffline(tournamentId, tournamentName, tournamentEndDate)
      const meta = await getTournamentMeta(tournamentId)
      setOfflineMeta(meta)
    } catch (e) {
      setPrepareError(e instanceof Error ? e.message : 'Falha ao preparar torneio offline.')
    } finally {
      setPreparing(false)
    }
  }

  async function loadBracketCategories() {
    setLoading(true)
    if (isOnline) {
      const supabase = createClient()
      const { data } = await supabase.from('tournament_teams').select('category_id, categories(name)').eq('tournament_id', tournamentId)
      const seen = new Map<number, string>()
      for (const row of data ?? []) seen.set((row as any).category_id, (row as any).categories?.name ?? '')
      setBracketCategories([...seen.entries()].map(([categoryId, categoryName]) => ({ categoryId, categoryName })))
    } else {
      const rows = await offlineDB.teamsSnapshot.where('tournamentId').equals(tournamentId).toArray()
      const seen = new Map<number, string>()
      for (const r of rows) seen.set(r.categoryId, r.categoryName)
      setBracketCategories([...seen.entries()].map(([categoryId, categoryName]) => ({ categoryId, categoryName })))
    }
    setLoading(false)
    setView('chaveamento')
  }

  async function finalizeResult(athleteResult: AthleteResult, method: 'qr' | 'manual') {
    setResult(athleteResult)
    await logScan(athleteResult, method)
    setLoading(false)
    setView('validacao')
  }

  async function logScan(athleteResult: AthleteResult, method: 'qr' | 'manual') {
    const clientEventId = crypto.randomUUID()
    const scannedAt = new Date().toISOString()

    if (isOnline) {
      const supabase = createClient()
      const { error } = await supabase.from('scan_logs').insert({
        client_event_id: clientEventId,
        tournament_id: tournamentId,
        athlete_id: athleteResult.athlete_id,
        organizer_profile_id: organizerId,
        scanned_at: scannedAt,
        method,
        result_status: athleteResult.resultStatus,
      })
      if (error) setError('Validação exibida, mas o registro no histórico falhou: ' + error.message)
    } else {
      await offlineDB.pendingScanLogs.put({
        clientEventId, tournamentId, athleteId: athleteResult.athlete_id,
        organizerProfileId: organizerId, scannedAt, method, resultStatus: athleteResult.resultStatus,
      })
      setPendingCount((c) => c + 1)
    }
  }

  async function handleOnlineResult(data: any, method: 'qr' | 'manual') {
    const resultStatus = computeResultStatus(data)
    const athleteResult: AthleteResult = {
      athlete_id: data?.athlete_id ?? null, full_name: data?.full_name ?? 'Atleta não encontrado',
      caf_number: data?.caf_number ?? null, category_name: data?.category_name ?? null,
      status: data?.status ?? null, validity_date: data?.validity_date ?? null, resultStatus,
    }
    if (data?.thumbnail_path) {
      const supabase = createClient()
      const { data: signed } = await supabase.storage.from('athlete-thumbnails').createSignedUrl(data.thumbnail_path, 600)
      setPhotoUrl(signed?.signedUrl ?? null)
    } else {
      setPhotoUrl(null)
    }
    await finalizeResult(athleteResult, method)
  }

  async function handleOfflineResult(local: AthleteSnapshot | null, method: 'qr' | 'manual') {
    const resultStatus = computeResultStatus(local ? { status: local.status, validity_date: local.validityDate } : null)
    const athleteResult: AthleteResult = {
      athlete_id: local?.athleteId ?? null, full_name: local?.fullName ?? 'Atleta não encontrado',
      caf_number: local?.cafNumber ?? null, category_name: local?.categoryName ?? null,
      status: local?.status ?? null, validity_date: local?.validityDate ?? null, resultStatus,
    }
    setPhotoUrl(local?.thumbnailBlob ? URL.createObjectURL(local.thumbnailBlob) : null)
    await finalizeResult(athleteResult, method)
  }

  async function lookupByToken(token: string) {
    if (offlineBlocked) { setError('Sessão offline expirada ou não preparada.'); return }
    setLoading(true)
    setError(null)
    if (isOnline) {
      const supabase = createClient()
      const { data } = await supabase.from('tournament_athletes_public').select('*')
        .eq('tournament_id', tournamentId).eq('public_token', token).maybeSingle()
      await handleOnlineResult(data, 'qr')
    } else {
      const local = await offlineDB.athletesSnapshot.get(token)
      await handleOfflineResult(local && local.tournamentId === tournamentId ? local : null, 'qr')
    }
  }

  async function lookupByText(text: string) {
    if (offlineBlocked) { setError('Sessão offline expirada ou não preparada.'); return }
    setLoading(true)
    setError(null)
    const asNumber = Number(text)
    if (isOnline) {
      const supabase = createClient()
      let query = supabase.from('tournament_athletes_public').select('*').eq('tournament_id', tournamentId)
      query = !isNaN(asNumber) && text.trim() !== '' ? query.eq('caf_number', asNumber) : query.ilike('full_name', `%${text}%`)
      const { data } = await query.limit(1).maybeSingle()
      await handleOnlineResult(data, 'manual')
    } else {
      const all = await offlineDB.athletesSnapshot.where('tournamentId').equals(tournamentId).toArray()
      const local = !isNaN(asNumber) && text.trim() !== ''
        ? all.find((a) => a.cafNumber === asNumber)
        : all.find((a) => a.fullName.toLowerCase().includes(text.toLowerCase()))
      await handleOfflineResult(local ?? null, 'manual')
    }
  }

  async function startScanner() {
    if (offlineBlocked) return
    setView('scanner')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
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
    const { data } = await supabase.from('scan_logs').select('id, scanned_at, method, result_status, athlete_id')
      .eq('tournament_id', tournamentId).order('scanned_at', { ascending: false }).limit(30)

    const athleteIds = [...new Set((data ?? []).map((r) => r.athlete_id).filter(Boolean))]
    let namesMap = new Map<string, { full_name: string; caf_number: number | null }>()
    if (athleteIds.length > 0) {
      const { data: athletesData } = await supabase.from('tournament_athletes_public')
        .select('athlete_id, full_name, caf_number').eq('tournament_id', tournamentId).in('athlete_id', athleteIds)
      for (const a of athletesData ?? []) namesMap.set(a.athlete_id, { full_name: a.full_name, caf_number: a.caf_number })
    }

    setHistory((data ?? []).map((r) => ({
      id: r.id, scanned_at: r.scanned_at, method: r.method, result_status: r.result_status,
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

  const statusBar = (() => {
    if (isOnline) return { text: 'ONLINE', color: 'var(--color-success)' }
    if (offlineMeta && !offlineExpired) return { text: 'OFFLINE — UTILIZANDO BASE LOCAL', color: '#B45309' }
    if (offlineMeta && offlineExpired) return { text: 'SESSÃO OFFLINE EXPIRADA — CONECTE-SE', color: 'var(--color-danger)' }
    return { text: 'BASE OFFLINE NÃO PREPARADA', color: 'var(--color-danger)' }
  })()

  let content: React.ReactNode = null

  if (view === 'hub') {
    content = (
      <div className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
          <p className="text-sm font-medium mb-1">{tournamentName}</p>
          {offlineMeta ? (
            <>
              <p className="text-xs text-[var(--color-text-muted)]">{offlineMeta.athleteCount} atletas · fotos disponíveis offline</p>
              <p className="text-xs text-[var(--color-text-muted)]">Última sincronização: {formatDateTime(offlineMeta.snapshotGeneratedAt)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Acesso offline válido até: {formatDateTime(offlineMeta.offlineExpiresAt)}</p>
            </>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">Ainda não preparado para uso offline.</p>
          )}
          {prepareError && <p className="text-xs text-[var(--color-danger)] mt-1">{prepareError}</p>}
          <button onClick={handlePrepareOffline} disabled={preparing || !isOnline}
            className="w-full mt-3 rounded-[var(--radius-sm)] border border-white/15 py-2 text-sm font-medium disabled:opacity-60">
            {preparing ? 'Preparando...' : offlineMeta ? 'Atualizar dados offline' : 'Preparar Torneio Offline'}
          </button>
          {!isOnline && <p className="text-xs text-[var(--color-text-muted)] mt-2">Conecte-se à internet para preparar ou atualizar.</p>}
        </div>

        {(pendingCount > 0 || pendingBracketCount > 0) && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3 flex flex-col gap-1 text-sm">
            {pendingCount > 0 && <span>{pendingCount} validações pendentes de sincronizar</span>}
            {pendingBracketCount > 0 && <span>{pendingBracketCount} resultados de chaveamento pendentes de sincronizar</span>}
            <button onClick={handleSync} disabled={!isOnline || syncing} className="self-start text-[var(--color-primary)] underline disabled:opacity-50 disabled:no-underline">
              {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
          </div>
        )}

        <button onClick={startScanner} disabled={offlineBlocked} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-5 text-lg font-medium disabled:opacity-60">
          Escanear Carteirinha
        </button>
        <button onClick={() => setView('busca')} disabled={offlineBlocked} className="rounded-[var(--radius-md)] border border-white/15 py-4 font-medium disabled:opacity-60">
          Buscar Atleta
        </button>
        <button onClick={loadBracketCategories} disabled={loading} className="rounded-[var(--radius-md)] border border-white/15 py-4 font-medium disabled:opacity-60">
          Chaveamento
        </button>
        {offlineBlocked && (
          <p className="text-xs text-[var(--color-danger)] text-center">
            {offlineExpired ? 'A sessão offline deste torneio expirou. Conecte-se à internet para continuar.' : 'Prepare o torneio para uso offline enquanto ainda há conexão.'}
          </p>
        )}
        <button onClick={loadHistory} className="text-sm text-[var(--color-text-muted)] underline mt-2">
          Ver histórico de validações
        </button>
      </div>
    )
  } else if (view === 'scanner') {
    content = (
      <div className="flex flex-col gap-4">
        <video ref={videoRef} className="w-full rounded-[var(--radius-md)] bg-black" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button onClick={backToHub} className="rounded-[var(--radius-md)] border border-white/15 py-3 font-medium">Cancelar</button>
      </div>
    )
  } else if (view === 'busca') {
    content = (
      <div className="flex flex-col gap-4">
        <input autoFocus placeholder="Nome ou número CAF" value={searchText} onChange={(e) => setSearchText(e.target.value)}
          className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-3" />
        <button onClick={() => lookupByText(searchText)} disabled={loading || !searchText.trim()}
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button onClick={backToHub} className="text-sm text-[var(--color-text-muted)] underline">Cancelar</button>
      </div>
    )
  } else if (view === 'validacao' && result) {
    content = (
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
          Base {isOnline ? 'em tempo real' : `atualizada em ${offlineMeta ? formatDateTime(offlineMeta.snapshotGeneratedAt) : '—'}`}
        </p>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button onClick={backToHub} className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium mt-4">
          Nova validação
        </button>
      </div>
    )
  } else if (view === 'historico') {
    content = (
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
  } else if (view === 'chaveamento') {
    content = (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Chaveamento</h2>
        {bracketCategories.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">Nenhuma dupla formada ainda nesta base.</p>
        )}
        {bracketCategories.map((c) => (
          <BracketOfflineManager
            key={c.categoryId}
            tournamentId={tournamentId}
            categoryId={c.categoryId}
            categoryName={c.categoryName}
            isOnline={isOnline}
            offlineReady={!!offlineMeta && !offlineExpired}
          />
        ))}
        <button onClick={backToHub} className="rounded-[var(--radius-md)] border border-white/15 py-3 font-medium mt-2">← Voltar</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[var(--radius-sm)] px-4 py-2 text-xs font-semibold text-center" style={{ backgroundColor: statusBar.color, color: 'white' }}>
        {statusBar.text}
      </div>
      {content}
    </div>
  )
}
