import { createClient } from '@/lib/supabase/client'
import { offlineDB } from './db'

export async function prepareTournamentOffline(tournamentId: string, tournamentName: string) {
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

  await offlineDB.tournamentMeta.put({
    tournamentId,
    name: tournamentName,
    snapshotGeneratedAt: new Date().toISOString(),
    athleteCount: (athletes ?? []).length,
  })

  return (athletes ?? []).length
}

export async function getTournamentMeta(tournamentId: string) {
  return offlineDB.tournamentMeta.get(tournamentId)
}
