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
    .select('id, name, city, state, start_date, end_date, status, prize_info, category_whatsapp_links, category_schedule, logo_path, venue_name, venue_address, maps_link')
    .eq('id', tournamentId)
    .single()

  if (!tournament) notFound()

  const [
    { data: categories }, { data: teams }, { data: brackets }, { data: appealsRaw },
    { data: myEnrollment }, { data: messages }, { data: myLatestRequest },
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
      .select('category_at_tournament')
      .eq('tournament_id', tournamentId)
      .eq('athlete_id', athlete.id)
      .maybeSingle(),
    supabase
      .from('tournament_messages')
      .select('id, message, created_at, read_at')
      .eq('tournament_id', tournamentId)
      .eq('athlete_id', athlete.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tournament_registration_requests')
      .select('id, status, request_type')
      .eq('tournament_id', tournamentId)
      .or(`athlete_id_1.eq.${athlete.id},athlete_id_2.eq.${athlete.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
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

  const myCategoryName = (categories ?? []).find((c: any) => c.id === myEnrollment?.category_at_tournament)?.name
  const whatsappLinks = (tournament.category_whatsapp_links ?? {}) as Record<string, string>
  const myWhatsappLink = myCategoryName ? whatsappLinks[myCategoryName] : null

  const showRegistrationSection = !myEnrollment && !['finished', 'canceled'].includes(tournament.status)

  const categorySchedule = (tournament.category_schedule ?? {}) as Record<string, { date?: string; time?: string }>
  const categoryOptions = Object.keys(categorySchedule).sort((a, b) => {
    const keyA = `${categorySchedule[a]?.date ?? ''}${categorySchedule[a]?.time ?? ''}`
    const keyB = `${categorySchedule[b]?.date ?? ''}${categorySchedule[b]?.time ?? ''}`
    return keyA.localeCompare(keyB)
  })

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

      {showRegistrationSection && (
        myLatestRequest?.status === 'pendente' ? (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
            <p className="text-sm">
              {myLatestRequest.request_type === 'interesse'
                ? 'Seu interesse foi registrado — a categoria está com vagas preenchidas no momento. O organizador entra em contato se abrir vaga.'
                : 'Sua solicitação de inscrição foi enviada e está aguardando aprovação do organizador.'}
            </p>
          </div>
        ) : (
          <>
            {myLatestRequest?.status === 'recusado' && (
              <p className="text-sm text-[var(--color-danger)]">Sua última solicitação foi recusada pelo organizador. Você pode tentar novamente:</p>
            )}
            <TournamentRegistrationForm tournamentId={tournamentId} categoryOptions={categoryOptions} />
          </>
        )
      )}

      {tournament.prize_info && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
          <p className="text-sm font-medium mb-1">Premiação</p>
          <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-line">{tournament.prize_info}</p>
        </div>
      )}

      {myWhatsappLink && (
        <a
          href={myWhatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[var(--radius-md)] bg-[var(--color-success)] text-white px-4 py-3 text-sm font-medium text-center"
        >
          Entrar no grupo do WhatsApp da minha categoria
        </a>
      )}

      <CategoryAppealAthleteView categories={categories ?? []} appeals={appealsRaw ?? []} />

      {myEnrollment && <ReportCategoryAppealForm tournamentId={tournamentId} />}

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
