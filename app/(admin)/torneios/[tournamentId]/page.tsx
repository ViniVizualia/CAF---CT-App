import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentAssignments } from '@/components/admin/TournamentAssignments'
import { TournamentTeams } from '@/components/admin/TournamentTeams'
import { CategoryAppealAdminPanel } from '@/components/admin/CategoryAppealAdminPanel'
import { BracketManager } from '@/components/bracket/BracketManager'

export const dynamic = 'force-dynamic'

function formatInstagram(handle: string) {
  const clean = handle.replace('@', '').trim()
  return { display: `@${clean}`, url: `https://instagram.com/${clean}` }
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament) notFound()

  const [
    { data: allOrganizers },
    { data: linkedOrganizers },
    { data: allAthletes },
    { data: linkedAthletes },
    { data: categories },
    { data: teams },
    { data: brackets },
  ] = await Promise.all([
    supabase.from('organizers').select('id, name').eq('status', 'active'),
    supabase.from('tournament_organizers').select('organizer_id, organizers(id, name)').eq('tournament_id', tournamentId),
    supabase.from('athletes').select('id, full_name, caf_number, declared_category_id').eq('status', 'ativo'),
    supabase.from('tournament_athletes').select('athlete_id, category_at_tournament, athletes(id, full_name, caf_number)').eq('tournament_id', tournamentId),
    supabase.from('categories').select('id, name, order_index').order('order_index'),
    supabase
      .from('tournament_teams')
      .select('id, category_id, athlete_1:athletes!tournament_teams_athlete_id_1_fkey(id, full_name, caf_number), athlete_2:athletes!tournament_teams_athlete_id_2_fkey(id, full_name, caf_number)')
      .eq('tournament_id', tournamentId),
    supabase.from('brackets').select('id, category_id, status').eq('tournament_id', tournamentId),
  ])

  const linkedOrganizerIds = (linkedOrganizers ?? []).map((r: any) => r.organizer_id)
  const linkedAthleteIds = (linkedAthletes ?? []).map((r: any) => r.athlete_id)
  const linkedAthletesWithCategory = (linkedAthletes ?? []).map((r: any) => ({ ...r.athletes, category_at_tournament: r.category_at_tournament }))
  const allTeams = (teams ?? []).map((t: any) => ({ id: t.id, category_id: t.category_id, athlete_1: t.athlete_1, athlete_2: t.athlete_2 }))

  const bracketIds = (brackets ?? []).map((b: any) => b.id)
  const { data: bracketMatches } = bracketIds.length
    ? await supabase.from('bracket_matches').select('*').in('bracket_id', bracketIds)
    : { data: [] as any[] }

  const categorySchedule = (tournament.category_schedule ?? {}) as Record<string, { date?: string; time?: string }>
  const scheduledCategories = Object.keys(categorySchedule)
    .filter((c) => categorySchedule[c]?.date || categorySchedule[c]?.time)
    .sort((a, b) => {
      const keyA = `${categorySchedule[a]?.date ?? ''}${categorySchedule[a]?.time ?? ''}`
      const keyB = `${categorySchedule[b]?.date ?? ''}${categorySchedule[b]?.time ?? ''}`
      return keyA.localeCompare(keyB)
    })

  const hasVenueInfo = tournament.venue_name || tournament.venue_address || tournament.maps_link
  const hasInstagrams = tournament.event_instagram || tournament.venue_instagram

  const categoriesWithTeams = (categories ?? []).filter((c: any) => allTeams.some((t) => t.category_id === c.id))

  const { data: appealsRaw } = linkedAthleteIds.length
    ? await supabase.from('category_appeals').select('*').in('athlete_id', linkedAthleteIds).order('created_at', { ascending: false })
    : { data: [] as any[] }

  const filedByIds = [...new Set((appealsRaw ?? []).map((a: any) => a.filed_by_profile_id))]
  const [{ data: organizersData }, { data: athleteFilersData }] = await Promise.all([
    filedByIds.length
      ? supabase.from('organizers').select('profile_id, name').in('profile_id', filedByIds)
      : Promise.resolve({ data: [] as any[] }),
    filedByIds.length
      ? supabase.rpc('get_athlete_names_by_profile', { p_profile_ids: filedByIds })
      : Promise.resolve({ data: [] as any[] }),
  ])
  const nameByProfile = new Map<string, string>()
  for (const o of organizersData ?? []) nameByProfile.set(o.profile_id, o.name)
  for (const a of athleteFilersData ?? []) if (!nameByProfile.has(a.profile_id)) nameByProfile.set(a.profile_id, a.full_name)
  const athleteNameById = new Map(linkedAthletesWithCategory.map((a: any) => [a.id, a.full_name]))

  const appeals = (appealsRaw ?? []).map((a: any) => ({
    ...a,
    filed_by_name: nameByProfile.get(a.filed_by_profile_id) ?? null,
    athlete_name: athleteNameById.get(a.athlete_id) ?? '—',
  }))

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <a href="/torneios" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <h1 className="text-2xl font-semibold mt-4 mb-1">{tournament.name}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-1">
        {tournament.city}/{tournament.state} · {tournament.start_date} a {tournament.end_date} · {tournament.status}
      </p>
      {tournament.responsible_name && (
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Responsável pelo evento: <span className="text-white">{tournament.responsible_name}</span>
        </p>
      )}

      {hasVenueInfo && (
        <div className="mb-6 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Local do evento</p>
          {tournament.venue_name && <p className="text-sm">{tournament.venue_name}</p>}
          {tournament.venue_address && <p className="text-sm text-[var(--color-text-muted)]">{tournament.venue_address}</p>}
          {tournament.maps_link && (
            <a href={tournament.maps_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] underline">
              Ver no Google Maps
            </a>
          )}
        </div>
      )}

      {hasInstagrams && (
        <div className="mb-6 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3 flex flex-col gap-1">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Instagram</p>
          {tournament.event_instagram && (
            <a href={formatInstagram(tournament.event_instagram).url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] underline">
              Evento: {formatInstagram(tournament.event_instagram).display}
            </a>
          )}
          {tournament.venue_instagram && (
            <a href={formatInstagram(tournament.venue_instagram).url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] underline">
              Rede/CT: {formatInstagram(tournament.venue_instagram).display}
            </a>
          )}
        </div>
      )}

      {scheduledCategories.length > 0 && (
        <div className="mb-8 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Dias e horários por categoria</p>
          <div className="flex flex-col gap-1">
            {scheduledCategories.map((category) => {
              const entry = categorySchedule[category]
              return (
                <div key={category} className="flex justify-between text-sm">
                  <span>{category}</span>
                  <span className="text-[var(--color-text-muted)]">
                    {entry.date ?? '—'} {entry.time ?? ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <TournamentAssignments
        tournamentId={tournamentId}
        allOrganizers={allOrganizers ?? []}
        linkedOrganizers={(linkedOrganizers ?? []).map((r: any) => r.organizers)}
        allAthletes={allAthletes ?? []}
        linkedAthletes={linkedAthletesWithCategory}
        categories={categories ?? []}
        linkedOrganizerIds={linkedOrganizerIds}
        linkedAthleteIds={linkedAthleteIds}
      />

      <div className="mt-10 pt-10 border-t border-white/10">
        <TournamentTeams
          tournamentId={tournamentId}
          categories={categories ?? []}
          linkedAthletes={linkedAthletesWithCategory}
          teams={allTeams}
        />
      </div>

      <div className="mt-10 pt-10 border-t border-white/10">
        <CategoryAppealAdminPanel categories={categories ?? []} appeals={appeals} />
      </div>

      <div className="mt-10 pt-10 border-t border-white/10 flex flex-col gap-6">
        <h2 className="text-lg font-medium">Chaveamento</h2>
        {categoriesWithTeams.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">Forme duplas em alguma categoria para liberar o sorteio.</p>
        )}
        {categoriesWithTeams.map((category: any) => {
          const categoryTeams = allTeams
            .filter((t) => t.category_id === category.id)
            .map((t) => ({ id: t.id, label: `${t.athlete_1.full_name} / ${t.athlete_2.full_name}` }))
          const bracket = (brackets ?? []).find((b: any) => b.category_id === category.id) ?? null
          const matches = (bracketMatches ?? []).filter((m: any) => m.bracket_id === bracket?.id)
          return (
            <BracketManager
              key={category.id}
              tournamentId={tournamentId}
              categoryId={category.id}
              categoryName={category.name}
              teams={categoryTeams}
              bracket={bracket}
              matches={matches}
            />
          )
        })}
      </div>
    </main>
  )
}
