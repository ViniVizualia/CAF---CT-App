// Lógica pura do chaveamento (sem acesso a banco), para poder rodar tanto
// online quanto offline (Etapa 5) sem duplicar regras.

export type BracketStage = 'pool' | 'knockout'

export interface RoundMatch {
  teamAId: string
  teamBId: string | null // null = bye, teamA avança direto sem jogar
  teamALossesBefore: number
  teamBLossesBefore: number
  stage: BracketStage
}

export interface CompletedMatch {
  teamAId: string
  teamBId: string | null
  teamALossesBefore: number
  teamBLossesBefore: number
  winnerTeamId: string | null
  stage: BracketStage
}

export interface NextRoundGenerated {
  finished: false
  matches: RoundMatch[]
}

export interface BracketFinished {
  finished: true
  championTeamId: string
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// A partir de quantas duplas ativas restam, vira mata-mata direto
// (4 = semifinal + final).
const KNOCKOUT_THRESHOLD = 4

export function drawFirstRound(teamIds: string[]): RoundMatch[] {
  const stage: BracketStage = teamIds.length <= KNOCKOUT_THRESHOLD ? 'knockout' : 'pool'
  const shuffled = shuffle(teamIds)
  const matches: RoundMatch[] = []
  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({
      teamAId: shuffled[i],
      teamBId: shuffled[i + 1] ?? null,
      teamALossesBefore: 0,
      teamBLossesBefore: 0,
      stage,
    })
  }
  return matches
}

export function generateNextRound(completedMatches: CompletedMatch[]): NextRoundGenerated | BracketFinished {
  const active: { id: string; losses: number }[] = []

  for (const m of completedMatches) {
    // Bye: avança sem jogar, mantém a contagem de derrotas de antes.
    if (m.teamBId === null) {
      active.push({ id: m.teamAId, losses: m.teamALossesBefore })
      continue
    }

    const winnerId = m.winnerTeamId!
    const loserId = winnerId === m.teamAId ? m.teamBId : m.teamAId
    const winnerLosses = winnerId === m.teamAId ? m.teamALossesBefore : m.teamBLossesBefore
    active.push({ id: winnerId, losses: winnerLosses })

    if (m.stage === 'knockout') {
      // Mata-mata direto: perdeu, já era.
      continue
    }

    // Fase de pontos corridos: só elimina na 2ª derrota.
    const loserLosses = (loserId === m.teamAId ? m.teamALossesBefore : m.teamBLossesBefore) + 1
    if (loserLosses < 2) {
      active.push({ id: loserId, losses: loserLosses })
    }
  }

  if (active.length === 1) {
    return { finished: true, championTeamId: active[0].id }
  }

  if (active.length <= KNOCKOUT_THRESHOLD) {
    const shuffled = shuffle(active)
    const matches: RoundMatch[] = []
    for (let i = 0; i < shuffled.length; i += 2) {
      matches.push({
        teamAId: shuffled[i].id,
        teamBId: shuffled[i + 1]?.id ?? null,
        teamALossesBefore: shuffled[i].losses,
        teamBLossesBefore: shuffled[i + 1]?.losses ?? 0,
        stage: 'knockout',
      })
    }
    return { finished: false, matches }
  }

  // Agrupa por número de derrotas (0 ou 1) e sorteia dentro de cada grupo.
  const groups = new Map<number, { id: string; losses: number }[]>()
  for (const team of active) {
    const group = groups.get(team.losses) ?? []
    group.push(team)
    groups.set(team.losses, group)
  }

  const matches: RoundMatch[] = []
  for (const group of groups.values()) {
    const shuffled = shuffle(group)
    for (let i = 0; i < shuffled.length; i += 2) {
      matches.push({
        teamAId: shuffled[i].id,
        teamBId: shuffled[i + 1]?.id ?? null,
        teamALossesBefore: shuffled[i].losses,
        teamBLossesBefore: shuffled[i + 1]?.losses ?? 0,
        stage: 'pool',
      })
    }
  }
  return { finished: false, matches }
}
