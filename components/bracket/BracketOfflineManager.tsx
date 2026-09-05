'use client'

import { useEffect, useState } from 'react'
import { offlineDB, type TeamSnapshot, type BracketSnapshot, type BracketMatchSnapshot } from '@/lib/offline/db'
import { refreshBracketSnapshot } from '@/lib/offline/snapshot'
import { syncPendingBracketMatches } from '@/lib/offline/sync'
import { drawFirstRound, generateNextRound, type CompletedMatch } from '@/lib/bracket/engine'

interface Props {
  tournamentId: string
  categoryId: number
  categoryName: string
  isOnline: boolean
  offlineReady: boolean
}

export function BracketOfflineManager({ tournamentId, categoryId, categoryName, isOnline, offlineReady }: Props) {
  const [teams, setTeams] = useState<TeamSnapshot[]>([])
  const [bracket, setBracket] = useState<BracketSnapshot | null>(null)
  const [matches, setMatches] = useState<BracketMatchSnapshot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [winners, setWinners] = useState<Record<string, string>>({})

  const teamLabel = (id: string | null) => teams.find((t) => t.id === id)?.label ?? '—'

  async function loadLocal() {
    const [teamRows, bracketRow, matchRows] = await Promise.all([
      offlineDB.teamsSnapshot.where({ tournamentId, categoryId }).toArray(),
      offlineDB.bracketsSnapshot.get(`${tournamentId}:${categoryId}`),
      offlineDB.bracketMatchesSnapshot.where({ tournamentId, categoryId }).toArray(),
    ])
    setTeams(teamRows)
    setBracket(bracketRow ?? null)
    setMatches(matchRows.sort((a, b) => a.roundNumber - b.roundNumber))
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (isOnline) {
        try {
          await syncPendingBracketMatches(tournamentId)
          await refreshBracketSnapshot(tournamentId)
        } catch {
          // segue com o que já tem localmente
        }
      }
      await loadLocal()
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, categoryId, isOnline])

  async function maybeSync() {
    if (isOnline) await syncPendingBracketMatches(tournamentId)
  }

  async function ensureBracket(): Promise<BracketSnapshot> {
    if (bracket) return bracket
    const row: BracketSnapshot = {
      tournamentId_categoryId: `${tournamentId}:${categoryId}`,
      id: null,
      tournamentId,
      categoryId,
      status: 'drawn',
    }
    await offlineDB.bracketsSnapshot.put(row)
    setBracket(row)
    return row
  }

  const currentRound = matches.length > 0 ? Math.max(...matches.map((m) => m.roundNumber)) : 0
  const currentMatches = matches.filter((m) => m.roundNumber === currentRound)
  const allCurrentDecided = currentMatches.length > 0 && currentMatches.every((m) => m.winnerTeamId)

  async function handleDraw() {
    setLoading(true); setError(null)
    await ensureBracket()
    const firstRound = drawFirstRound(teams.map((t) => t.id))
    for (const m of firstRound) {
      await offlineDB.bracketMatchesSnapshot.put({
        clientEventId: crypto.randomUUID(),
        id: null,
        tournamentId,
        categoryId,
        roundNumber: 1,
        stage: m.stage,
        teamAId: m.teamAId,
        teamBId: m.teamBId,
        teamALossesBefore: m.teamALossesBefore,
        teamBLossesBefore: m.teamBLossesBefore,
        score: null,
        winnerTeamId: m.teamBId === null ? m.teamAId : null,
        synced: false,
      })
    }
    await loadLocal()
    await maybeSync()
    await loadLocal()
    setLoading(false)
  }

  async function handleSaveResult(clientEventId: string) {
    const winnerId = winners[clientEventId]
    if (!winnerId) { setError('Selecione o vencedor.'); return }
    setLoading(true); setError(null)
    const match = matches.find((m) => m.clientEventId === clientEventId)
    if (match) {
      await offlineDB.bracketMatchesSnapshot.put({ ...match, score: scores[clientEventId] || null, winnerTeamId: winnerId, synced: false })
    }
    await loadLocal()
    await maybeSync()
    await loadLocal()
    setLoading(false)
  }

  async function handleNextRound() {
    setLoading(true); setError(null)
    const completed: CompletedMatch[] = currentMatches.map((m) => ({
      teamAId: m.teamAId!,
      teamBId: m.teamBId,
      teamALossesBefore: m.teamALossesBefore,
      teamBLossesBefore: m.teamBLossesBefore,
      winnerTeamId: m.winnerTeamId,
      stage: m.stage,
    }))
    const result = generateNextRound(completed)

    if (result.finished) {
      const b = bracket ?? (await ensureBracket())
      await offlineDB.bracketsSnapshot.put({ ...b, status: 'finished' })
    } else {
      for (const m of result.matches) {
        await offlineDB.bracketMatchesSnapshot.put({
          clientEventId: crypto.randomUUID(),
          id: null,
          tournamentId,
          categoryId,
          roundNumber: currentRound + 1,
          stage: m.stage,
          teamAId: m.teamAId,
          teamBId: m.teamBId,
          teamALossesBefore: m.teamALossesBefore,
          teamBLossesBefore: m.teamBLossesBefore,
          score: null,
          winnerTeamId: m.teamBId === null ? m.teamAId : null,
          synced: false,
        })
      }
    }
    await loadLocal()
    await maybeSync()
    await loadLocal()
    setLoading(false)
  }

  const champion = bracket?.status === 'finished' && currentMatches.length === 1 ? currentMatches[0].winnerTeamId : null

  if (!offlineReady && !isOnline) {
    return (
      <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
        <p className="text-sm font-medium mb-1">{categoryName}</p>
        <p className="text-sm text-[var(--color-text-muted)]">Prepare o torneio offline enquanto há conexão para editar o chaveamento sem internet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">{categoryName}</p>

      {!bracket && (
        teams.length >= 2 ? (
          <button onClick={handleDraw} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm disabled:opacity-60">
            {loading ? 'Sorteando...' : 'Sortear chaves'}
          </button>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">É preciso pelo menos 2 duplas formadas para sortear.</p>
        )
      )}

      {champion && <p className="text-sm text-[var(--color-primary)] font-medium">🏆 Campeão: {teamLabel(champion)}</p>}

      {bracket && bracket.status !== 'finished' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Rodada {currentRound}{currentMatches[0]?.stage === 'knockout' ? ' · mata-mata' : ''}
          </p>
          {currentMatches.map((m) => (
            <div key={m.clientEventId} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 p-3">
              {m.teamBId === null ? (
                <p className="text-sm">{teamLabel(m.teamAId)} — bye, avança direto</p>
              ) : m.winnerTeamId ? (
                <p className="text-sm">
                  {teamLabel(m.teamAId)} <span className="text-[var(--color-text-muted)]">vs</span> {teamLabel(m.teamBId)}
                  {' — '}<span className="font-medium">{teamLabel(m.winnerTeamId)} venceu</span>
                  {m.score && ` (${m.score})`}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm">{teamLabel(m.teamAId)} vs {teamLabel(m.teamBId)}</p>
                  <input
                    placeholder="Placar (ex: 2x1)"
                    value={scores[m.clientEventId] ?? ''}
                    onChange={(e) => setScores((s) => ({ ...s, [m.clientEventId]: e.target.value }))}
                    className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
                  />
                  <select
                    value={winners[m.clientEventId] ?? ''}
                    onChange={(e) => setWinners((w) => ({ ...w, [m.clientEventId]: e.target.value }))}
                    className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="">Quem venceu?</option>
                    <option value={m.teamAId ?? ''}>{teamLabel(m.teamAId)}</option>
                    <option value={m.teamBId ?? ''}>{teamLabel(m.teamBId)}</option>
                  </select>
                  <button onClick={() => handleSaveResult(m.clientEventId)} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white py-2 text-sm disabled:opacity-60">
                    Salvar resultado
                  </button>
                </div>
              )}
            </div>
          ))}

          {allCurrentDecided && (
            <button onClick={handleNextRound} disabled={loading} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm font-medium disabled:opacity-60">
              {loading ? 'Gerando...' : 'Gerar próxima rodada'}
            </button>
          )}
        </div>
      )}

      {!isOnline && <p className="text-xs text-[var(--color-text-muted)] mt-3">Alterações salvas localmente — serão sincronizadas ao reconectar.</p>}
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
