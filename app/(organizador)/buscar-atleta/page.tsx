import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AthleteSearchPanel } from '@/components/athletes/AthleteSearchPanel'

export const dynamic = 'force-dynamic'

export default async function OrganizerSearchAthletePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <a href="/meus-torneios" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <h1 className="text-2xl font-semibold mt-4 mb-6">Buscar atleta</h1>
      <AthleteSearchPanel canFile />
    </main>
  )
}
