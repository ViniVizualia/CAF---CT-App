import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentFeedbackForm } from '@/components/feedback/TournamentFeedbackForm'
import { BracketView } from '@/components/bracket/BracketView'
import { CategoryAppealAthleteView } from '@/components/athlete/CategoryAppealAthleteView'
import { TournamentMessagesBox } from '@/components/athlete/TournamentMessagesBox'

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
    .select('id, name, city, state, start_date, end_date, status, prize_info, category_whatsapp_links')
    .eq('id', tournamentId)
    .single()

  if (!tournament) notFound()

  const [{ data: categories }, { data: teams }, { data: brackets }, { data: appeals }, { data: myEnrollment }, { data: messages }] = await Promise.all([
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

  return (
    <main className="min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col gap-6">
      <a href="/home" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <div>
        <h1 className="text-2xl font-semibold">{tournament.name}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {tournament.city}/{tournament.state} · {new Date(tournament.start_date).toLocaleDateString('pt-BR')} a {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <TournamentMessagesBox messages={messages ?? []} />

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

      <CategoryAppealAthleteView categories={categories ?? []} appeals={appeals ?? []} />

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
