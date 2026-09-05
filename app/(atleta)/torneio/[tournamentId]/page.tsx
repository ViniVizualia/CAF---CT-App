import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TournamentFeedbackForm } from '@/components/feedback/TournamentFeedbackForm'

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

      <TournamentFeedbackForm tournamentId={tournament.id} athleteId={athlete.id} />
    </main>
  )
}
