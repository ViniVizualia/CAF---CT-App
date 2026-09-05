import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentAssignments } from '@/components/admin/TournamentAssignments'

export const dynamic = 'force-dynamic'

const CATEGORY_ORDER = [
  'Estreante',
  'Iniciante',
  'Intermediário',
  'Amador C',
  'Amador B',
  'Amador A',
  'Qualifier',
]

function formatInstagram(handle: string) {
  const clean = handle.replace('@', '').trim()
  return { display: `@${clean}`, url: `https://instagram.com/${clean}` }
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament) notFound()

  const [{ data: allOrganizers }, { data: linkedOrganizers }, { data: allAthletes }, { data: linkedAthletes }, { data: categories }] = await Promise.all([
    supabase.from('organizers').select('id, name').eq('status', 'active'),
    supabase.from('tournament_organizers').select('organizer_id, organizers(id, name)').eq('tournament_id', tournamentId),
    supabase.from('athletes').select('id, full_name, caf_number').eq('status', 'ativo'),
    supabase.from('tournament_athletes').select('athlete_id, category_at_tournament, athletes(id, full_name, caf_number)').eq('tournament_id', tournamentId),
    supabase.from('categories').select('id, name').order('order_index'),
  ])

  const linkedOrganizerIds = (linkedOrganizers ?? []).map((r: any) => r.organizer_id)
  const linkedAthleteIds = (linkedAthletes ?? []).map
