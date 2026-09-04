interface Item {
  id: string
  name: string
  city: string
  state: string
  start_date: string
  end_date: string
}

function formatRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('pt-BR')
  const e = new Date(end).toLocaleDateString('pt-BR')
  return s === e ? s : `${s} a ${e}`
}

export function TournamentHistoryPanel({ items }: { items: Item[] }) {
  const today = new Date()

  return (
    <section>
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
        Meu histórico
      </h2>
      {items.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)]">Você ainda não participou de nenhum torneio.</p>
      )}
      <div className="flex flex-col gap-2">
        {items.map((t) => {
          const played = new Date(t.end_date) < today
          return (
            <div
              key={t.id}
              className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t.city}/{t.state} · {formatRange(t.start_date, t.end_date)}
                </p>
              </div>
              <span className={`text-xs font-medium ${played ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-accent)]'}`}>
                {played ? 'Disputado' : 'Inscrito'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
