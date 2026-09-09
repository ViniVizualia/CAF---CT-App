import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreateTournamentForm } from '@/components/admin/CreateTournamentForm'

export const dynamic = 'force-dynamic'

const statusLabel: Record<string, string> = { draft: 'Rascunho', active: 'Ativo', finished: 'Finalizado', canceled: 'Cancelado' }

export default async function MeusTorneiosPage() {
  const supabase = await createClient()

  const [{ data: tournaments }, { data: athleteRows }, { data: pendingRows }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('id, name, city, state, start_date, end_date, status')
      .order('start_date', { ascending: false }),
    supabase.from('tournament_athletes_public').select('tournament_id'),
    supabase.from('tournament_registration_requests').select('id, tournament_id').eq('status', 'pendente'),
  ])

  const athleteCountByTournament = new Map<string, number>()
  for (const row of athleteRows ?? []) {
    athleteCountByTournament.set(row.tournament_id, (athleteCountByTournament.get(row.tournament_id) ?? 0) + 1)
  }

  const pendingCountByTournament = new Map<string, number>()
  for (const row of pendingRows ?? []) {
    pendingCountByTournament.set(row.tournament_id, (pendingCountByTournament.get(row.tournament_id) ?? 0) + 1)
  }

  const totalTournaments = (tournaments ?? []).length
  const totalAthletes = athleteRows?.length ?? 0
  const totalPending = pendingRows?.length ?? 0

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Meus Torneios</h1>

      {totalTournaments > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 text-center">
            <p className="text-2xl font-semibold">{totalTournaments}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Torneios</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 text-center">
            <p className="text-2xl font-semibold">{totalAthletes}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Atletas inscritos</p>
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 text-center">
            <p className="text-2xl font-semibold" style={{ color: totalPending > 0 ? 'var(--color-accent)' : undefined }}>
              {totalPending}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Solicitações pendentes</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-10">
        {(tournaments ?? []).map((t) => {
          const athleteCount = athleteCountByTournament.get(t.id) ?? 0
          const pendingCount = pendingCountByTournament.get(t.id) ?? 0
          return (
            <Link key={t.id} href={`/meus-torneios/${t.id}`} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{t.city}/{t.state} · {t.start_date} a {t.end_date}</p>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{statusLabel[t.status]}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-[var(--color-text-muted)]">{athleteCount} {athleteCount === 1 ? 'atleta' : 'atletas'}</span>
                {pendingCount > 0 && (
                  <span className="text-xs font-medium text-[var(--color-accent)]">
                    ● {pendingCount} {pendingCount === 1 ? 'solicitação pendente' : 'solicitações pendentes'}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
        {(!tournaments || tournaments.length === 0) && (
          <p className="text-sm text-[var(--color-text-muted)]">Nenhum torneio autorizado ainda.</p>
        )}
      </div>

      <h2 className="text-lg font-medium mb-3">Criar torneio</h2>
      <CreateTournamentForm />
    </main>
  )
}
