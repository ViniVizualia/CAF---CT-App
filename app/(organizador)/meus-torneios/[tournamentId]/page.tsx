import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OrganizerTournamentPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const supabase = await createClient()

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament) notFound()

  const { data: athletes } = await supabase
    .from('tournament_athletes_public')
    .select('caf_number, full_name, status')
    .eq('tournament_id', tournamentId)

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <a href="/meus-torneios" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <h1 className="text-2xl font-semibold mt-4 mb-1">{tournament.name}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        {tournament.city}/{tournament.state} · {tournament.start_date} a {tournament.end_date}
      </p>

      <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-8">
        <p className="text-sm text-[var(--color-text-muted)] mb-1">{(athletes ?? []).length} atletas neste torneio</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Preparação para uso offline e Modo Torneio chegam nas próximas etapas.
        </p>
      </div>

      <h2 className="text-lg font-medium mb-3">Atletas</h2>
      <div className="flex flex-col gap-2">
        {(athletes ?? []).map((a: any, i: number) => (
          <div key={i} className="flex justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-2 text-sm">
            <span>{a.full_name}</span>
            <span className="text-[var(--color-text-muted)]">{a.caf_number ? String(a.caf_number).padStart(6, '0') : '—'}</span>
          </div>
        ))}
        {(!athletes || athletes.length === 0) && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta vinculado.</p>}
      </div>
    </main>
  )
}
