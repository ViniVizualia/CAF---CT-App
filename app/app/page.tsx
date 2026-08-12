import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">CAF</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Cadastro do Atleta de Futevôlei</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/login"
          className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 text-center font-medium"
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          className="rounded-[var(--radius-md)] border border-white/15 py-3 text-center font-medium"
        >
          Criar meu cadastro CAF
        </Link>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
        Visual provisório — Etapa 1 (fundação). A identidade oficial entra quando você
        enviar logo, fontes e paleta.
      </p>
    </main>
  );
}
