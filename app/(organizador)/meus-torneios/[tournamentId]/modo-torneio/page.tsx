import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TorneioMode } from '@/components/organizador/TorneioMode'

export const dynamic = 'force-dynamic'

export default async function ModoTorneioPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournament } = await supabase.from('tournaments').select('id, name, end_date').eq('id', tournamentId).single()
  if (!tournament) notFound()

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto">
      <a href={`/meus-torneios/${tournamentId}`} className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <h1 className="text-2xl font-semibold mt-4 mb-6">{tournament.name}</h1>
      <TorneioMode tournamentId={tournamentId} tournamentName={tournament.name} tournamentEndDate={tournament.end_date} organizerId={user.id} />
    </main>
  )
}
