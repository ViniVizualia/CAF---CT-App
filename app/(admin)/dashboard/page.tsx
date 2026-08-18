import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalAtletas },
    { count: aguardando },
    { count: ativos },
    { count: torneiosAtivos },
    { count: organizadores },
    { data: categoriaData },
  ] = await Promise.all([
    supabase.from('athletes').select('*', { count: 'exact', head: true }),
    supabase.from('athletes').select('*', { count: 'exact', head: true }).eq('status', 'em_analise'),
    supabase.from('athletes').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('organizers').select('*', { count: 'exact', head: true }),
    supabase.from('athletes').select('official_category_id, categories:official_category_id(name)').eq('status', 'ativo'),
  ])

  const distribuicao = new Map<string, number>()
  for (const row of categoriaData ?? []) {
    const nome = (row as any).categories?.name ?? 'Sem categoria'
    distribuicao.set(nome, (distribuicao.get(nome) ?? 0) + 1)
  }

  const cards = [
    { label: 'Total de atletas', value: totalAtletas ?? 0 },
    { label: 'Aguardando aprovação', value: aguardando ?? 0 },
    { label: 'Atletas ativos', value: ativos ?? 0 },
    { label: 'Torneios ativos', value: torneiosAtivos ?? 0 },
    { label: 'Organizadores', value: organizadores ?? 0 },
  ]

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{c.label}</p>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-medium mb-3">Distribuição por categoria (ativos)</h2>
      <div className="flex flex-col gap-2">
        {distribuicao.size === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta ativo ainda.</p>}
        {[...distribuicao.entries()].map(([nome, qtd]) => (
          <div key={nome} className="flex justify-between text-sm border-b border-white/5 py-2">
            <span>{nome}</span>
            <span className="text-[var(--color-text-muted)]">{qtd}</span>
          </div>
        ))}
      </div>
      <a href="/atletas" className="inline-block mt-8 text-[var(--color-primary)] underline text-sm">Ver todos os atletas →</a>
    </main>
  )
}
