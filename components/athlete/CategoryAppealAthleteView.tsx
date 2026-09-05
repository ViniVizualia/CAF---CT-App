interface CategoryLite { id: number; name: string }
interface Appeal {
  id: string
  message: string
  created_at: string
  category_at_time_name: string | null
  resolution_new_category_id: number | null
  resolution_note: string | null
  resolved_at: string | null
}

interface Props {
  categories: CategoryLite[]
  appeals: Appeal[]
}

export function CategoryAppealAthleteView({ categories, appeals }: Props) {
  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? '—'

  if (appeals.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-2">Recursos sobre sua categoria</p>
      <div className="flex flex-col gap-2">
        {appeals.map((a) => (
          <div key={a.id} className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-3 text-sm">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              {new Date(a.created_at).toLocaleDateString('pt-BR')} · categoria na época: {a.category_at_time_name ?? '—'}
            </p>
            <p className="text-[var(--color-text-muted)]">{a.message}</p>
            {a.resolved_at && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-xs text-[var(--color-primary)]">
                  Categoria oficial atualizada para: {categoryName(a.resolution_new_category_id)}
                </p>
                {a.resolution_note && <p className="text-xs text-[var(--color-text-muted)] mt-1">{a.resolution_note}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
