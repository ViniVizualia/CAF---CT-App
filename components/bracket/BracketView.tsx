interface TeamLite { id: string; label: string }
interface MatchRow {
  id: string
  round_number: number
  stage: 'pool' | 'knockout'
  team_a_id: string | null
  team_b_id: string | null
  score: string | null
  winner_team_id: string | null
}
interface BracketRow { id: string; status: string }

interface Props {
  categoryName: string
  teams: TeamLite[]
  bracket: BracketRow | null
  matches: MatchRow[]
}

export function BracketView({ categoryName, teams, bracket, matches }: Props) {
  const teamLabel = (id: string | null) => teams.find((t) => t.id === id)?.label ?? '—'

  if (!bracket) {
    return (
      <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
        <p className="text-sm font-medium mb-1">{categoryName}</p>
        <p className="text-sm text-[var(--color-text-muted)]">Chaveamento ainda não sorteado.</p>
      </div>
    )
  }

  const rounds = [...new Set(matches.map((m) => m.round_number))].sort((a, b) => a - b)
  const lastRound = rounds[rounds.length - 1]
  const lastRoundMatches = matches.filter((m) => m.round_number === lastRound)
  const champion = bracket.status === 'finished' && lastRoundMatches.length === 1 ? lastRoundMatches[0].winner_team_id : null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-3">{categoryName}</p>

      {champion && (
        <p className="text-sm text-[var(--color-primary)] font-medium mb-4">🏆 Campeão: {teamLabel(champion)}</p>
      )}

      <div className="flex flex-col gap-4">
        {rounds.map((round) => {
          const roundMatches = matches.filter((m) => m.round_number === round)
          const isKnockout = roundMatches[0]?.stage === 'knockout'
          return (
            <div key={round}>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Rodada {round}{isKnockout ? ' · mata-mata' : ''}
              </p>
              <div className="flex flex-col gap-2">
                {roundMatches.map((m) => (
                  <div key={m.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm">
                    {m.team_b_id === null ? (
                      <p>{teamLabel(m.team_a_id)} — avançou (bye)</p>
                    ) : m.winner_team_id ? (
                      <p>
                        {teamLabel(m.team_a_id)} <span className="text-[var(--color-text-muted)]">vs</span> {teamLabel(m.team_b_id)}
                        {' — '}<span className="font-medium">{teamLabel(m.winner_team_id)} venceu</span>
                        {m.score && ` (${m.score})`}
                      </p>
                    ) : (
                      <p>{teamLabel(m.team_a_id)} vs {teamLabel(m.team_b_id)} <span className="text-[var(--color-text-muted)]">— a definir</span></p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
