'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { drawFirstRound, generateNextRound, type CompletedMatch } from '@/lib/bracket/engine'

interface TeamLite { id: string; label: string }
interface MatchRow {
  id: string
  round_number: number
  stage: 'pool' | 'knockout'
  team_a_id: string | null
  team_b_id: string | null
  team_a_losses_before: number
  team_b_losses_before: number
  score: string | null
  winner_team_id: string | null
}
interface BracketRow { id: string; status: string }

interface Props {
  tournamentId: string
  categoryId: number
  categoryName: string
  teams: TeamLite[]
  bracket: BracketRow | null
  matches: MatchRow[]
}

export function BracketManager({ tournamentId, categoryId, categoryName, teams, bracket, matches }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [winners, setWinners] = useState<Record<string, string>>({})

  const teamLabel = (id: string | null) => teams.find((t) => t.id === id)?.label ?? '—'

  const currentRound = matches.length > 0 ? Math.max(...matches.map((m) => m.round_number)) : 0
  const currentMatches = matches.filter((m) => m.round_number === currentRound)
  const allCurrentDecided = currentMatches.length > 0 && currentMatches.every((m) => m.winner_team_id)

  async function handleDraw() {
    setLoading(true); setError(null)
    const supabase = createClient()

    let bracketId = bracket?.id
    if (!bracketId) {
      const { data, error } = await supabase
        .from('brackets')
        .insert({ tournament_id: tournamentId, category_id: categoryId, status: 'drawn' })
        .select('id')
        .single()
      if (error) { setLoading(false); return setError(error.message) }
      bracketId = data.id
    }

    const firstRound = drawFirstRound(teams.map((t) => t.id))
    const rows = firstRound.map((m) => ({
      bracket_id: bracketId,
      round_number: 1,
      stage: m.stage,
      team_a_id: m.teamAId,
      team_b_id: m.teamBId,
      team_a_losses_before: m.teamALossesBefore,
      team_b_losses_before: m.teamBLossesBefore,
      winner_team_id: m.teamBId === null ? m.teamAId : null,
    }))

    const { error } = await supabase.from('bracket_matches').insert(rows)
    setLoading(false)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function handleSaveResult(matchId: string) {
    const winnerId = winners[matchId]
    if (!winnerId) { setError('Selecione o vencedor.'); return }
    setLoading(true); setError(null)
    const { error } = await createClient()
      .from('bracket_matches')
      .update({ score: scores[matchId] || null, winner_team_id: winnerId, updated_at: new Date().toISOString() })
      .eq('id', matchId)
    setLoading(false)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function handleNextRound() {
    setLoading(true); setError(null)
    const completed: CompletedMatch[] = currentMatches.map((m) => ({
      teamAId: m.team_a_id!,
      teamBId: m.team_b_id,
      teamALossesBefore: m.team_a_losses_before,
      teamBLossesBefore: m.team_b_losses_before,
      winnerTeamId: m.winner_team_id,
      stage: m.stage,
    }))

    const result = generateNextRound(completed)
    const supabase = createClient()

    if (result.finished) {
      await supabase.from('brackets').update({ status: 'finished' }).eq('id', bracket!.id)
      setLoading(false)
      router.refresh()
      return
    }

    const rows = result.matches.map((m) => ({
      bracket_id: bracket!.id,
      round_number: currentRound + 1,
      stage: m.stage,
      team_a_id: m.teamAId,
      team_b_id: m.teamBId,
      team_a_losses_before: m.teamALossesBefore,
      team_b_losses_before: m.teamBLossesBefore,
      winner_team_id: m.teamBId === null ? m.teamAId : null,
    }))

    const { error } = await supabase.from('bracket_matches').insert(rows)
    setLoading(false)
    if (error) return setError(error.message)
    router.refresh()
  }

  const champion = bracket?.status === 'finished' && currentMatches.length === 1 ? currentMatches[0].winner_team_id : null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">Chaveamento — {categoryName}</p>

      {!bracket && (
        teams.length >= 2 ? (
          <button onClick={handleDraw} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm disabled:opacity-60">
            {loading ? 'Sorteando...' : 'Sortear chaves'}
          </button>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">É preciso pelo menos 2 duplas formadas para sortear.</p>
        )
      )}

      {champion && (
        <p className="text-sm text-[var(--color-primary)] font-medium">🏆 Campeão: {teamLabel(champion)}</p>
      )}

      {bracket && bracket.status !== 'finished' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            Rodada {currentRound}{currentMatches[0]?.stage === 'knockout' ? ' · mata-mata' : ''}
          </p>
          {currentMatches.map((m) => (
            <div key={m.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 p-3">
              {m.team_b_id === null ? (
                <p className="text-sm">{teamLabel(m.team_a_id)} — bye, avança direto</p>
              ) : m.winner_team_id ? (
                <p className="text-sm">
                  {teamLabel(m.team_a_id)} <span className="text-[var(--color-text-muted)]">vs</span> {teamLabel(m.team_b_id)}
                  {' — '}<span className="font-medium">{teamLabel(m.winner_team_id)} venceu</span>
                  {m.score && ` (${m.score})`}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm">{teamLabel(m.team_a_id)} vs {teamLabel(m.team_b_id)}</p>
                  <input
                    placeholder="Placar (ex: 2x1)"
                    value={scores[m.id] ?? ''}
                    onChange={(e) => setScores((s) => ({ ...s, [m.id]: e.target.value }))}
                    className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
                  />
                  <select
                    value={winners[m.id] ?? ''}
                    onChange={(e) => setWinners((w) => ({ ...w, [m.id]: e.target.value }))}
                    className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="">Quem venceu?</option>
                    <option value={m.team_a_id ?? ''}>{teamLabel(m.team_a_id)}</option>
                    <option value={m.team_b_id ?? ''}>{teamLabel(m.team_b_id)}</option>
                  </select>
                  <button onClick={() => handleSaveResult(m.id)} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white py-2 text-sm disabled:opacity-60">
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

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
