import type { TeamLite, MatchRow } from './summarize'

export function buildMatchesCsv(categoryName: string, teams: TeamLite[], matches: MatchRow[]): string {
  const teamLabel = (id: string | null) => teams.find((t) => t.id === id)?.label ?? '—'
  const rows = [
    ['Categoria', 'Rodada', 'Fase', 'Dupla A', 'Dupla B', 'Placar', 'Vencedor'],
    ...[...matches]
      .sort((a, b) => a.round_number - b.round_number)
      .map((m) => [
        categoryName,
        String(m.round_number),
        m.stage === 'knockout' ? 'Mata-mata' : 'Pontos corridos',
        teamLabel(m.team_a_id),
        m.team_b_id ? teamLabel(m.team_b_id) : 'BYE',
        m.score ?? '',
        m.winner_team_id ? teamLabel(m.winner_team_id) : '',
      ]),
  ]
  return rows.map((r) => r.map(escapeCsvCell).join(',')).join('\n')
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadCsv(filename: string, csv: string) {
  // BOM no início garante que o Excel abra acentos corretamente
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
