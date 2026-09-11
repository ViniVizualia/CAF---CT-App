import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MarkReviewedButton } from '@/components/admin/MarkReviewedButton'

export const dynamic = 'force-dynamic'
const statusLabel: Record<string, string> = {
  em_analise: 'Em análise', ativo: 'Ativo', rejeitado: 'Rejeitado', bloqueado: 'Bloqueado', inativo: 'Inativo',
}

export default async function AtletasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('athletes')
    .select('id, full_name, caf_number, status, declared_category_id, pending_review, categories:declared_category_id(name)')
    .order('created_at', { ascending: false })

  if (q) query = query.or(`full_name.ilike.%${q}%,caf_number.eq.${Number(q) || 0}`)

  const { data: athletes } = await query

  const pendingCount = (athletes ?? []).filter((a: any) => a.pending_review).length

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Atletas</h1>

      {pendingCount > 0 && (
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)] px-4 py-3 mb-6">
          <p className="text-sm text-[var(--color-accent)] font-medium">
            {pendingCount} {pendingCount === 1 ? 'cadastro aguardando revisão' : 'cadastros aguardando revisão'}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Esses atletas já estão ativos no app (aprovação automática) — revise a foto e os dados quando puder.
          </p>
        </div>
      )}

      <form className="mb-6">
        <input
          type="text" name="q" defaultValue={q ?? ''} placeholder="Buscar por nome ou número CAF"
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
        />
      </form>
      <div className="flex flex-col gap-2">
        {(athletes ?? []).map((a: any) => (
          <div key={a.id} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
            <Link href={`/atletas/${a.id}`} className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{a.full_name}</p>
                {a.pending_review && (
                  <span className="text-[10px] font-medium text-[var(--color-accent)] border border-[var(--color-accent)] rounded-full px-2 py-0.5">
                    Revisar
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                {a.caf_number ? `CAF ${String(a.caf_number).padStart(6, '0')}` : 'Sem número'} · {a.categories?.name ?? '—'}
              </p>
            </Link>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3">
                <Link href={`/atletas/${a.id}/carteirinha`} className="text-xs text-[var(--color-primary)] underline">
                  Ver carteirinha
                </Link>
                <span className="text-xs text-[var(--color-text-muted)]">{statusLabel[a.status] ?? a.status}</span>
              </div>
              {a.pending_review && <MarkReviewedButton athleteId={a.id} />}
            </div>
          </div>
        ))}
        {(!athletes || athletes.length === 0) && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta encontrado.</p>}
      </div>
    </main>
  )
}
