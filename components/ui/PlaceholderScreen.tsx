interface PlaceholderScreenProps {
  title: string;
  etapa: string;
}

/**
 * Tela provisória usada nas rotas ainda não implementadas, só para
 * confirmar que a rota e os tokens de tema estão funcionando.
 * Cada uma será substituída pela implementação real na etapa indicada.
 */
export function PlaceholderScreen({ title, etapa }: PlaceholderScreenProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-medium text-[var(--color-text-primary)]">{title}</h1>
      <p className="text-sm text-[var(--color-text-muted)]">{etapa}</p>
    </main>
  );
}
