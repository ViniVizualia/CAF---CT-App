export interface TeamLite { id: string; label: string }
export interface MatchRow {
  round_number: number
  stage: 'pool' | 'knockout'
  team_a_id: string | null
  team_b_id: string | null
  score: string | null
  winner_team_id: string | null
}
export interface RenderMatch {
  teamALabel: string
  teamBLabel: string | null
  score: string | null
  winnerLabel: string | null
}
export interface RenderRound {
  roundNumber: number
  stage: 'pool' | 'knockout'
  matches: RenderMatch[]
}

export function getRoundsSummary(teams: TeamLite[], matches: MatchRow[]) {
  const teamLabel = (id: string | null) => teams.find((t) => t.id === id)?.label ?? '—'
  const roundNumbers = [...new Set(matches.map((m) => m.round_number))].sort((a, b) => a - b)

  const rounds: RenderRound[] = roundNumbers.map((roundNumber) => {
    const roundMatches = matches.filter((m) => m.round_number === roundNumber)
    return {
      roundNumber,
      stage: roundMatches[0]?.stage ?? 'pool',
      matches: roundMatches.map((m) => ({
        teamALabel: teamLabel(m.team_a_id),
        teamBLabel: m.team_b_id ? teamLabel(m.team_b_id) : null,
        score: m.score,
        winnerLabel: m.winner_team_id ? teamLabel(m.winner_team_id) : null,
      })),
    }
  })

  const lastRound = rounds[rounds.length - 1] ?? null
  const championLabel = lastRound && lastRound.matches.length === 1 ? lastRound.matches[0].winnerLabel : null

  return { rounds, current: lastRound, championLabel }
}
