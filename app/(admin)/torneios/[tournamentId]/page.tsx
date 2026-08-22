import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentAssignments } from '@/components/admin/TournamentAssignments'

export const dynamic = 'force-dynamic'

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
  const linkedAthleteIds = (linkedAthletes ?? []).map((r: any) => r.athlete_id)

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <a href="/torneios" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <h1 className="text-2xl font-semibold mt-4 mb-1">{tournament.name}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        {tournament.city}/{tournament.state} · {tournament.start_date} a {tournament.end_date} · {tournament.status}
      </p>
      <TournamentAssignments
        tournamentId={tournamentId}
        allOrganizers={allOrganizers ?? []}
        linkedOrganizers={(linkedOrganizers ?? []).map((r: any) => r.organizers)}
        allAthletes={allAthletes ?? []}
        linkedAthletes={(linkedAthletes ?? []).map((r: any) => ({ ...r.athletes, category_at_tournament: r.category_at_tournament }))}
        categories={categories ?? []}
        linkedOrganizerIds={linkedOrganizerIds}
        linkedAthleteIds={linkedAthleteIds}
      />
    </main>
  )
}
