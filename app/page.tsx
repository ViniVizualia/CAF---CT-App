import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/IMG_0347.png" alt="CAF — Cadastro do Atleta de Futevôlei" className="w-48" />

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
    </main>
  );
}
