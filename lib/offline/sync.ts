import { createClient } from '@/lib/supabase/client'
import { offlineDB } from './db'

export async function syncPendingScanLogs(tournamentId: string): Promise<{ synced: number; failed: number }> {
  const supabase = createClient()
  const pending = await offlineDB.pendingScanLogs.where('tournamentId').equals(tournamentId).toArray()

  let synced = 0
  let failed = 0

  for (const log of pending) {
    const { error } = await supabase.from('scan_logs').insert({
      client_event_id: log.clientEventId,
      tournament_id: log.tournamentId,
      athlete_id: log.athleteId,
      organizer_profile_id: log.organizerProfileId,
      scanned_at: log.scannedAt,
      method: log.method,
      result_status: log.resultStatus,
    })

    if (!error || error.code === '23505') {
      await offlineDB.pendingScanLogs.delete(log.clientEventId)
      synced++
    } else {
      failed++
    }
  }

  return { synced, failed }
}

export async function countPendingScanLogs(tournamentId: string): Promise<number> {
  return offlineDB.pendingScanLogs.where('tournamentId').equals(tournamentId).count()
}

// Envia para o servidor os resultados de chaveamento lançados offline.
// Usa client_event_id como chave de idempotência (upsert), então rodar de novo
// em caso de falha parcial nunca duplica partida.
export async function syncPendingBracketMatches(tournamentId: string): Promise<{ synced: number; failed: number }> {
  const supabase = createClient()
  const all = await offlineDB.bracketMatchesSnapshot.where('tournamentId').equals(tournamentId).toArray()
  const pending = all.filter((m) => !m.synced)

  let synced = 0
  let failed = 0

  for (const m of pending) {
    const bracketKey = `${m.tournamentId}:${m.categoryId}`
    let bracketRow = await offlineDB.bracketsSnapshot.get(bracketKey)
    let bracketId = bracketRow?.id ?? null

    if (!bracketId) {
      const { data, error } = await supabase
        .from('brackets')
        .upsert({ tournament_id: m.tournamentId, category_id: m.categoryId, status: 'drawn' }, { onConflict: 'tournament_id,category_id' })
        .select('id, status')
        .single()
      if (error) { failed++; continue }
      bracketId = data.id
      bracketRow = { tournamentId_categoryId: bracketKey, id: data.id, tournamentId: m.tournamentId, categoryId: m.categoryId, status: data.status }
      await offlineDB.bracketsSnapshot.put(bracketRow)
    }

    const { data, error } = await supabase
      .from('bracket_matches')
      .upsert(
        {
          client_event_id: m.clientEventId,
          bracket_id: bracketId,
          round_number: m.roundNumber,
          stage: m.stage,
          team_a_id: m.teamAId,
          team_b_id: m.teamBId,
          team_a_losses_before: m.teamALossesBefore,
          team_b_losses_before: m.teamBLossesBefore,
          score: m.score,
          winner_team_id: m.winnerTeamId,
        },
        { onConflict: 'client_event_id' }
      )
      .select('id')
      .single()

    if (error) { failed++; continue }
    await offlineDB.bracketMatchesSnapshot.put({ ...m, id: data.id, synced: true })
    synced++
  }

  const bracketKeys = [...new Set(pending.map((m) => `${m.tournamentId}:${m.categoryId}`))]
  for (const key of bracketKeys) {
    const b = await offlineDB.bracketsSnapshot.get(key)
    if (b?.id) await supabase.from('brackets').update({ status: b.status }).eq('id', b.id)
  }

  return { synced, failed }
}

export async function countPendingBracketMatches(tournamentId: string): Promise<number> {
  const all = await offlineDB.bracketMatchesSnapshot.where('tournamentId').equals(tournamentId).toArray()
  return all.filter((m) => !m.synced).length
}
