import { createClient } from '@/lib/supabase/client'
import { offlineDB } from './db'

const OFFLINE_BUFFER_DAYS = 1

export async function prepareTournamentOffline(tournamentId: string, tournamentName: string, tournamentEndDate: string) {
  const supabase = createClient()

  const { data: athletes, error } = await supabase
    .from('tournament_athletes_public')
    .select('*')
    .eq('tournament_id', tournamentId)

  if (error) throw error

  await offlineDB.athletesSnapshot.where('tournamentId').equals(tournamentId).delete()

  for (const a of athletes ?? []) {
    let thumbnailBlob: Blob | null = null
    if (a.thumbnail_path) {
      const { data: signed } = await supabase.storage.from('athlete-thumbnails').createSignedUrl(a.thumbnail_path, 3600)
      if (signed?.signedUrl) {
        const res = await fetch(signed.signedUrl)
        if (res.ok) thumbnailBlob = await res.blob()
      }
    }

    await offlineDB.athletesSnapshot.put({
      publicToken: a.public_token,
      tournamentId,
      athleteId: a.athlete_id,
      cafNumber: a.caf_number,
      fullName: a.full_name,
      categoryName: a.category_name,
      status: a.status,
      validityDate: a.validity_date,
      thumbnailBlob,
    })
  }

  await refreshBracketSnapshot(tournamentId)

  const expires = new Date(tournamentEndDate)
  expires.setDate(expires.getDate() + OFFLINE_BUFFER_DAYS)
  expires.setHours(23, 59, 59, 999)

  await offlineDB.tournamentMeta.put({
    tournamentId,
    name: tournamentName,
    snapshotGeneratedAt: new Date().toISOString(),
    athleteCount: (athletes ?? []).length,
    offlineExpiresAt: expires.toISOString(),
  })

  return (athletes ?? []).length
}

export async function getTournamentMeta(tournamentId: string) {
  return offlineDB.tournamentMeta.get(tournamentId)
}

// Baixa duplas, chaveamentos e partidas do servidor para uso offline.
// Preserva localmente qualquer resultado ainda não sincronizado (ex: lançado
// agora mesmo, sem internet) — só sobrescreve o que já está confirmado no servidor.
export async function refreshBracketSnapshot(tournamentId: string) {
  const supabase = createClient()

  const { data: teams } = await supabase
    .from('tournament_teams')
    .select(
      'id, category_id, categories(name), athlete_1:athletes!tournament_teams_athlete_id_1_fkey(full_name), athlete_2:athletes!tournament_teams_athlete_id_2_fkey(full_name)'
    )
    .eq('tournament_id', tournamentId)

  await offlineDB.teamsSnapshot.where('tournamentId').equals(tournamentId).delete()
  for (const t of teams ?? []) {
    await offlineDB.teamsSnapshot.put({
      id: (t as any).id,
      tournamentId,
      categoryId: (t as any).category_id,
      categoryName: (t as any).categories?.name ?? '',
      label: `${(t as any).athlete_1.full_name} / ${(t as any).athlete_2.full_name}`,
    })
  }

  const { data: brackets } = await supabase
    .from('brackets')
    .select('id, category_id, status')
    .eq('tournament_id', tournamentId)

  for (const b of brackets ?? []) {
    await offlineDB.bracketsSnapshot.put({
      tournamentId_categoryId: `${tournamentId}:${b.category_id}`,
      id: b.id,
      tournamentId,
      categoryId: b.category_id,
      status: b.status,
    })
  }

  const bracketIds = (brackets ?? []).map((b) => b.id)
  const { data: matches } = bracketIds.length
    ? await supabase.from('bracket_matches').select('*').in('bracket_id', bracketIds)
    : { data: [] as any[] }

  const existing = await offlineDB.bracketMatchesSnapshot.where('tournamentId').equals(tournamentId).toArray()
  const unsyncedIds = new Set(existing.filter((m) => !m.synced).map((m) => m.clientEventId))

  await offlineDB.bracketMatchesSnapshot
    .where('tournamentId').equals(tournamentId)
    .and((m) => m.synced)
    .delete()

  const categoryByBracket = new Map((brackets ?? []).map((b) => [b.id, b.category_id]))
  for (const m of matches ?? []) {
    const clientEventId = m.client_event_id ?? m.id
    if (unsyncedIds.has(clientEventId)) continue
    await offlineDB.bracketMatchesSnapshot.put({
      clientEventId,
      id: m.id,
      tournamentId,
      categoryId: categoryByBracket.get(m.bracket_id)!,
      roundNumber: m.round_number,
      stage: m.stage,
      teamAId: m.team_a_id,
      teamBId: m.team_b_id,
      teamALossesBefore: m.team_a_losses_before,
      teamBLossesBefore: m.team_b_losses_before,
      score: m.score,
      winnerTeamId: m.winner_team_id,
      synced: true,
    })
  }
}
