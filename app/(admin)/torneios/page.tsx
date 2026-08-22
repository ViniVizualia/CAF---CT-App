import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreateTournamentForm } from '@/components/admin/CreateTournamentForm'

export const dynamic = 'force-dynamic'

const statusLabel: Record<string, string> = { draft: 'Rascunho', active: 'Ativo', finished: 'Finalizado', canceled: 'Cancelado' }

export default async function TorneiosPage() {
  const supabase = await createClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, name, city, state, start_date, end_date, status')
    .order('start_date', { ascending: false })

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Torneios</h1>
      <div className="flex flex-col gap-2 mb-8">
        {(tournaments ?? []).map((t) => (
          <Link key={t.id} href={`/torneios/${t.id}`} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{t.city}/{t.state} · {t.start_date} a {t.end_date}</p>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{statusLabel[t.status]}</span>
          </Link>
        ))}
        {(!tournaments || tournaments.length === 0) && (
          <p className="text-sm text-[var(--color-text-muted)]">Nenhum torneio cadastrado.</p>
        )}
      </div>
      <h2 className="text-lg font-medium mb-3">Criar torneio</h2>
      <CreateTournamentForm />
    </main>
  )
}
