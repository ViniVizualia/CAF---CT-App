import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { categoryStyles, type CategoryKey } from '@/lib/design-tokens'
import { TournamentHistoryPanel } from '@/components/home/TournamentHistoryPanel'
import { UpcomingTournamentsPanel } from '@/components/home/UpcomingTournamentsPanel'
import { SponsorsPanel } from '@/components/home/SponsorsPanel'
import { InstagramPanel } from '@/components/home/InstagramPanel'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*, category:official_category_id(name, style_key)')
    .eq('profile_id', user.id)
    .single()

  if (!athlete) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-[var(--color-text-muted)]">Você ainda não tem um cadastro CAF.</p>
        <Link href="/cadastro" className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white px-6 py-3 font-medium">
          Criar meu cadastro CAF
        </Link>
      </main>
    )
  }

  if (athlete.status !== 'ativo') {
    const statusMessage: Record<string, string> = {
      em_analise: 'Seu cadastro está em análise. Assim que for aprovado, sua carteirinha aparece aqui.',
      rejeitado: 'Seu cadastro foi rejeitado. Entre em contato com o Super Admin CAF.',
      bloqueado: 'Seu cadastro está bloqueado.',
      inativo: 'Seu cadastro está inativo.',
    }
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-[var(--color-text-muted)]">{statusMessage[athlete.status] ?? 'Cadastro pendente.'}</p>
      </main>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  const [{ data: historyRows }, { data: upcoming }] = await Promise.all([
    supabase
      .from('tournament_athletes')
      .select('tournaments(id, name, city, state, start_date, end_date, status)')
      .eq('athlete_id', athlete.id),
    supabase
      .from('tournaments')
      .select('id, name, city, state, start_date, status')
      .gte('end_date', today)
      .order('start_date', { ascending: true })
      .limit(5),
  ])

  const history = (historyRows ?? [])
    .map((r: any) => r.tournaments)
    .filter(Boolean)
    .sort((a: any, b: any) => (a.start_date < b.start_date ? 1 : -1))

  const styleKey = ((athlete.category as any)?.style_key ?? 'estreante') as CategoryKey
  const cardStyle = categoryStyles[styleKey]

  return (
    <main className="min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col gap-8">
      <div className="text-center">
        <p className="text-sm text-[var(--color-text-muted)]">Olá,</p>
        <h1 className="text-2xl font-semibold">{athlete.full_name.split(' ')[0]}</h1>
      </div>

      <Link
        href="/carteirinha"
        className="rounded-[var(--radius-md)] px-5 py-5 flex items-center justify-between font-medium"
        style={{
          background: `linear-gradient(135deg, ${cardStyle.gradient[0]}, ${cardStyle.gradient[1]})`,
          color: cardStyle.textOnCard,
        }}
      >
        <span>Ver minha carteirinha</span>
        <span>→</span>
      </Link>

      <Link
        href="/loja"
        className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/40 px-5 py-4 flex items-center justify-between font-medium"
      >
        <span>Comprar uniforme oficial CAF</span>
        <span className="text-[var(--color-accent)]">→</span>
      </Link>

      <TournamentHistoryPanel items={history} />
      <UpcomingTournamentsPanel items={upcoming ?? []} />
      <SponsorsPanel />
      <InstagramPanel />
    </main>
  )
}
