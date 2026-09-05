import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentFeedbackForm } from '@/components/feedback/TournamentFeedbackForm'
import { BracketView } from '@/components/bracket/BracketView'

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
    .select('id, name, city, state, start_date, end_date, status, prize_info')
    .eq('id', tournamentId)
    .single()

  if (!tournament) notFound()

  const [{ data: categories }, { data: teams }, { data: brackets }] = await Promise.all([
    supabase.from('categories').select('id, name').order('order_index'),
    supabase
      .from('tournament_teams')
      .select('id, category_id, athlete_1:athletes!tournament_teams_athlete_id_1_fkey(full_name), athlete_2:athletes!tournament_teams_athlete_id_2_fkey(full_name)')
      .eq('tournament_id', tournamentId),
    supabase.from('brackets').select('id, category_id, status').eq('tournament_id', tournamentId),
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

  return (
    <main className="min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col gap-6">
      <a href="/home" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <div>
        <h1 className="text-2xl font-semibold">{tournament.name}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {tournament.city}/{tournament.state} · {new Date(tournament.start_date).toLocaleDateString('pt-BR')} a {new Date(tournament.end_date).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {tournament.prize_info && (
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
          <p className="text-sm font-medium mb-1">Premiação</p>
          <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-line">{tournament.prize_info}</p>
        </div>
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
