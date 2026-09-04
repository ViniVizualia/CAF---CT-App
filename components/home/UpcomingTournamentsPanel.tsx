interface Item {
  id: string
  name: string
  city: string
  state: string
  start_date: string
  status: string
}

export function UpcomingTournamentsPanel({ items }: { items: Item[] }) {
  if (items.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
        Próximos torneios
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
            <p className="font-medium text-sm">{t.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t.city}/{t.state} · {new Date(t.start_date).toLocaleDateString('pt-BR')}
              {t.status === 'active' && <span className="ml-2 text-[var(--color-success)] font-medium">● Ativo</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
