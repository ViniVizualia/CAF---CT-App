import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentFeedbackForm } from '@/components/feedback/TournamentFeedbackForm'
import { BracketView } from '@/components/bracket/BracketView'
import { CategoryAppealAthleteView } from '@/components/athlete/CategoryAppealAthleteView'
import { ReportCategoryAppealForm } from '@/components/athlete/ReportCategoryAppealForm'
import { TournamentMessagesBox } from '@/components/athlete/TournamentMessagesBox'
import { TournamentRegistrationForm } from '@/components/athlete/TournamentRegistrationForm'
import { TrophyRequestForm } from '@/components/athlete/TrophyRequestForm'
import { todayInBrazil } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function AthleteTournamentPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: athlete } = await supabase
    .from('athletes')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!athlete) redirect('/home')

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('id, name, city, state, start_date, end_date, status, prize_info, category_whatsapp_links, category_schedule, logo_path, venue_name, venue_address, maps_link, pix_key')
    .eq('id', tournamentId)
    .single()

  if (!tournament) notFound()

  const [
    { data: categories }, { data: teams }, { data: brackets }, { data: appealsRaw },
    { data: myEnrollments }, { data: messages }, { data: myRequests },
    { data: myTeams }, { data: myTrophies },
  ] = await Promise.all([
    supabase.from('categories').select('id, name').order('order_index'),
    supabase
      .from('tournament_teams')
      .select('id, category_id, athlete_1:athletes!tournament_teams_athlete_id_1_fkey(full_name), athlete_2:athletes!tournament_teams_athlete_id_2_fkey(full_name)')
      .eq('tournament_id', tournamentId),
    supabase.from('brackets').select('id, category_id, status').eq('tournament_id', tournamentId),
    supabase
      .from('category_appeals')
      .select('*')
      .eq('athlete_id', athlete.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tournament_athletes')
      .select('category_at_tournament, custom_category_name')
      .eq('tournament_id', tournamentId)
      .eq('athlete_id', athlete.id),
    supabase
      .from('tournament_messages')
      .select('id, message, created_at, read_at')
      .eq('tournament_id', tournamentId)
      .eq('athlete_id', athlete.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tournament_registration_requests')
      .select('id, status, request_type, custom_category_name, created_at')
      .eq('tournament_id', tournamentId)
      .or(`athlete_id_1.eq.${athlete.id},athlete_id_2.eq.${athlete.id}`)
      .order('created_at', { ascending: false }),
    supabase
      .from('tournament_teams')
      .select('category_id, categories(name)')
      .eq('tournament_id', tournamentId)
      .or(`athlete_id_1.eq.${athlete.id},athlete_id_2.eq.${athlete.id}`),
    supabase
      .from('athlete_trophies')
      .select('category_id')
      .eq('tournament_id', tournamentId)
      .eq('athlete_id', athlete.id),
  ])

  const allTeams = (teams ?? []).map((t: any) => ({
    id: t.id,
    category_id: t.category_id,
    label: `${t.athlete_1.full_name} / ${t.athlete_2.full_name}`,
  }))

  const bracketIds = (brackets ?? []).map((b: any) => b.id)
  const { data: bracketMatches } = bracketIds.length
    ? await supabase.from('bracket_matches').select('*').in('bracket_id', bracketIds)
    : { data: [] as any[] }

  const categoriesWithBrackets = (categories ?? []).filter((c: any) =>
    (brackets ?? []).some((b: any) => b.category_id === c.id)
  )

  const categorySchedule = (tournament.category_schedule ?? {}) as Record<string, { date?: string; time?: string }>
  const allCategoryNames = Object.keys(categorySchedule).sort((a, b) => {
    const keyA = `${categorySchedule[a]?.date ?? ''}${categorySchedule[a]?.time ?? ''}`
    const keyB = `${categorySchedule[b]?.date ?? ''}${categorySchedule[b]?.time ?? ''}`
    return keyA.localeCompare(keyB)
  })

  const whatsappLinks = (tournament.category_whatsapp_links ?? {}) as Record<string, string>

  const enrolledCategoryNames = new Set(
    (myEnrollments ?? []).map((e: any) => e.custom_category_name).filter(Boolean)
  )

  const latestRequestByCategory = new Map<string, { status: string; request_type: string }>()
  for (const r of myRequests ?? []) {
    if (r.custom_category_name && !latestRequestByCategory.has(r.custom_category_name)) {
      latestRequestByCategory.set(r.custom_category_name, { status: r.status, request_type: r.request_type })
    }
  }

  const pendingCategories = allCategoryNames
    .filter((name) => latestRequestByCategory.get(name)?.status === 'pendente')
    .map((name) => ({ name, requestType: latestRequestByCategory.get(name)!.request_type }))

  const rejectedCategories = allCategoryNames.filter(
    (name) => !enrolledCategoryNames.has(name) && latestRequestByCategory.get(name)?.status === 'recusado'
  )

  const availableCategoryOptions = allCategoryNames.filter((name) => {
    if (enrolledCategoryNames.has(name)) return false
    if (latestRequestByCategory.get(name)?.status === 'pendente') return false
    return true
  })

  const tournamentActive = !['finished', 'canceled'].includes(tournament.status)

  const logoUrl = tournament.logo_path
    ? supabase.storage.from('tournament-logos').getPublicUrl(tournament.logo_path).data.publicUrl
    : null

  const hasVenueInfo = tournament.venue_name || tournament.venue_address || tournament.maps_link

  const trophiedCategoryIds = new Set((myTrophies ?? []).map((t: any) => t.category_id))
  const trophyCategoryOptions = (myTeams ?? [])
    .filter((t: any) => !trophiedCategoryIds.has(t.category_id))
    .map((t: any) => ({ id: t.category_id, name: t.categories?.name ?? '—' }))
  const tournamentEnded = tournament.end_date < todayInBrazil()

  return (
    <main className="min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col gap-6">
      <a href="/home" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>

      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={`Logo ${tournament.name}`} className="w-20 h-20 rounded-[var(--radius-sm)] object-contain bg-black/20 self-center" />
      )}

      <div>
        <h1 className="text-2xl font-semibold">{tournament.name}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {tournament.city}/{tournament.state} · {new Date(tournament.start_date).toLocaleDateString('pt-BR')} a {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {hasVenueInfo && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
          <p className="text-sm font-medium mb-1">Local do evento</p>
          {tournament.venue_name && <p className="text-sm">{tournament.venue_name}</p>}
          {tournament.venue_address && <p className="text-sm text-[var(--color-text-muted)]">{tournament.venue_address}</p>}
          {tournament.maps_link && (
            <a href={tournament.maps_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] underline">
              Ver no Google Maps
            </a>
          )}
        </div>
      )}

      <TournamentMessagesBox messages={messages ?? []} />

      {(enrolledCategoryNames.size > 0 || pendingCategories.length > 0 || rejectedCategories.length > 0) && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 flex flex-col gap-3">
          <p className="text-sm font-medium">Minhas inscrições neste torneio</p>

          {[...enrolledCategoryNames].map((name) => (
            <div key={`enrolled-${name}`} className="flex justify-between items-center text-sm">
              <span>{name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-success)] font-medium">Inscrito</span>
                {whatsappLinks[name] && (
                  <a href={whatsappLinks[name]} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] underline">
                    Grupo
                  </a>
                )}
              </div>
            </div>
          ))}

          {pendingCategories.map(({ name, requestType }) => (
            <div key={`pending-${name}`} className="flex flex-col gap-1 text-sm border-t border-white/10 pt-2">
              <div className="flex justify-between items-center">
                <span>{name}</span>
                <span className="text-xs text-[var(--color-accent)] font-medium">
                  {requestType === 'interesse' ? 'Interesse registrado' : 'Aguardando aprovação'}
                </span>
              </div>
              {requestType !== 'interesse' && tournament.pix_key && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  Chave PIX pra pagar: <span className="font-medium text-[var(--color-text-primary)]">{tournament.pix_key}</span>
                </p>
              )}
            </div>
          ))}

          {rejectedCategories.map((name) => (
            <div key={`rejected-${name}`} className="flex justify-between items-center text-sm border-t border-white/10 pt-2">
              <span>{name}</span>
              <span className="text-xs text-[var(--color-danger)] font-medium">Recusado — pode tentar de novo</span>
            </div>
          ))}
        </div>
      )}

      {tournamentActive && availableCategoryOptions.length > 0 && (
        <TournamentRegistrationForm tournamentId={tournamentId} categoryOptions={availableCategoryOptions} pixKey={tournament.pix_key} />
      )}

      {tournament.prize_info && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
          <p className="text-sm font-medium mb-1">Premiação</p>
          <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-line">{tournament.prize_info}</p>
        </div>
      )}

      <CategoryAppealAthleteView categories={categories ?? []} appeals={appealsRaw ?? []} />

      {enrolledCategoryNames.size > 0 && <ReportCategoryAppealForm tournamentId={tournamentId} />}

      {tournamentEnded && trophyCategoryOptions.length > 0 && (
        <TrophyRequestForm tournamentId={tournamentId} categoryOptions={trophyCategoryOptions} />
      )}

      {categoriesWithBrackets.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Chaveamento</h2>
          {categoriesWithBrackets.map((category: any) => {
            const categoryTeams = allTeams.filter((t) => t.category_id === category.id)
            const bracket = (brackets ?? []).find((b: any) => b.category_id === category.id) ?? null
            const matches = (bracketMatches ?? []).filter((m: any) => m.bracket_id === bracket?.id)
            return (
              <BracketView
                key={category.id}
                categoryName={category.name}
                teams={categoryTeams}
                bracket={bracket}
                matches={matches}
              />
            )
          })}
        </div>
      )}

      <TournamentFeedbackForm tournamentId={tournament.id} athleteId={athlete.id} />
    </main>
  )
}
