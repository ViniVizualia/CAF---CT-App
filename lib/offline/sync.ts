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

    // Se já existir (mesmo client_event_id), considera sincronizado — evita duplicar em nova tentativa.
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
