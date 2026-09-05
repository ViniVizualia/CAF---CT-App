import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrizeEditor } from '@/components/organizer/PrizeEditor'

export const dynamic = 'force-dynamic'

const categoryLabel: Record<string, string> = {
  sugestao: 'Sugestão',
  reclamacao: 'Reclamação',
  duvida: 'Dúvida',
  outro: 'Outro',
}

export default async function OrganizerTournamentPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament) notFound()

  const [{ data: athletes }, { data: feedback }] = await Promise.all([
    supabase
      .from('tournament_athletes_public')
      .select('caf_number, full_name, status')
      .eq('tournament_id', tournamentId),
    supabase
      .from('tournament_feedback_organizer_view')
      .select('id, category, message, is_anonymous, athlete_name, created_at')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <a href="/meus-torneios" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <h1 className="text-2xl font-semibold mt-4 mb-1">{tournament.name}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        {tournament.city}/{tournament.state} · {tournament.start_date} a {tournament.end_date}
      </p>

      <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-4">
        <p className="text-sm text-[var(--color-text-muted)] mb-3">{(athletes ?? []).length} atletas neste torneio</p>
        <Link
          href={`/meus-torneios/${tournamentId}/modo-torneio`}
          className="inline-block rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium"
        >
          Abrir Modo Torneio →
        </Link>
      </div>

      <PrizeEditor tournamentId={tournamentId} initialPrizeInfo={tournament.prize_info} />

      <h2 className="text-lg font-medium mb-3">Atletas</h2>
      <div className="flex flex-col gap-2 mb-8">
        {(athletes ?? []).map((a: any, i: number) => (
          <div key={i} className="flex justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-2 text-sm">
            <span>{a.full_name}</span>
            <span className="text-[var(--color-text-muted)]">{a.caf_number ? String(a.caf_number).padStart(6, '0') : '—'}</span>
          </div>
        ))}
        {(!athletes || athletes.length === 0) && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta vinculado.</p>}
      </div>

      <h2 className="text-lg font-medium mb-3">Mensagens dos atletas</h2>
      <div className="flex flex-col gap-2">
        {(feedback ?? []).map((f: any) => (
          <div key={f.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3 text-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium">{f.is_anonymous ? 'Anônimo' : f.athlete_name}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{categoryLabel[f.category] ?? f.category}</span>
            </div>
            <p className="text-[var(--color-text-muted)]">{f.message}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{new Date(f.created_at).toLocaleString('pt-BR')}</p>
          </div>
        ))}
        {(!feedback || feedback.length === 0) && <p className="text-sm text-[var(--color-text-muted)]">Nenhuma mensagem recebida ainda.</p>}
      </div>
    </main>
  )
}
