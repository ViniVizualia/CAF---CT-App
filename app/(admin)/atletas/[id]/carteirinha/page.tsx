import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AthleteCard } from '@/components/carteirinha/AthleteCard'

export const dynamic = 'force-dynamic'

export default async function AdminAthleteCarteirinhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*, category:official_category_id(name, style_key)')
    .eq('id', id)
    .single()

  if (!athlete) notFound()

  let photoUrl: string | null = null
  if (athlete.photo_path) {
    const { data } = await supabase.storage.from('athlete-photos').createSignedUrl(athlete.photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  const { data: trophiesRaw } = await supabase
    .from('athlete_trophies')
    .select('medal, category_name, tournaments(name)')
    .eq('athlete_id', id)
    .order('awarded_at', { ascending: false })

  const trophies = (trophiesRaw ?? []).map((t: any) => ({
    medal: t.medal,
    categoryName: t.category_name,
    tournamentName: t.tournaments?.name ?? null,
  }))

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10 gap-6">
      <a href={`/atletas/${id}`} className="self-start text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <AthleteCard
        fullName={athlete.full_name}
        cafNumber={athlete.caf_number}
        categoryStyleKey={(athlete.category as any)?.style_key ?? 'estreante'}
        categoryLabel={(athlete.category as any)?.name ?? '—'}
        validityDate={athlete.validity_date}
        publicToken={athlete.public_token}
        photoUrl={photoUrl}
        trophies={trophies}
      />
    </main>
  )
}
