interface ReminderCategory { categoryName: string }

export function TrophyReminderBanner({ categories }: { categories: ReminderCategory[] }) {
  if (categories.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)] px-4 py-3 mb-6">
      <p className="text-sm text-[var(--color-accent)] font-medium">
        🏆 Este torneio já terminou e {categories.length === 1 ? 'a categoria abaixo ainda não recebeu troféu' : 'as categorias abaixo ainda não receberam troféu'}:
      </p>
      <p className="text-sm text-[var(--color-text-primary)] mt-1">
        {categories.map((c) => c.categoryName).join(', ')}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-2">
        Role até "Troféus" na categoria correspondente para premiar os campeões.
      </p>
    </div>
  )
}
