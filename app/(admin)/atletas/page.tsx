import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
const statusLabel: Record<string, string> = {
  em_analise: 'Em análise', ativo: 'Ativo', rejeitado: 'Rejeitado', bloqueado: 'Bloqueado', inativo: 'Inativo',
}

export default async function AtletasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('athletes')
    .select('id, full_name, caf_number, status, declared_category_id, categories:declared_category_id(name)')
    .order('created_at', { ascending: false })

  if (q) query = query.or(`full_name.ilike.%${q}%,caf_number.eq.${Number(q) || 0}`)

  const { data: athletes } = await query

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Atletas</h1>
      <form className="mb-6">
        <input
          type="text" name="q" defaultValue={q ?? ''} placeholder="Buscar por nome ou número CAF"
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
        />
      </form>
      <div className="flex flex-col gap-2">
        {(athletes ?? []).map((a: any) => (
          <Link key={a.id} href={`/atletas/${a.id}`} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
            <div>
              <p className="font-medium">{a.full_name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {a.caf_number ? `CAF ${String(a.caf_number).padStart(6, '0')}` : 'Sem número'} · {a.categories?.name ?? '—'}
              </p>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{statusLabel[a.status] ?? a.status}</span>
          </Link>
        ))}
        {(!athletes || athletes.length === 0) && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta encontrado.</p>}
      </div>
    </main>
  )
}
