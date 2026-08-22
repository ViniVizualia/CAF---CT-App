import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AthleteCard } from '@/components/carteirinha/AthleteCard'

export const dynamic = 'force-dynamic'

export default async function CarteirinhaPage() {
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
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-[var(--color-text-muted)]">Você ainda não tem um cadastro CAF.</p>
      </main>
    )
  }

  if (athlete.status !== 'ativo') {
    const statusMessage: Record<string, string> = {
      em_analise: 'Seu cadastro está em análise. A carteirinha aparece aqui assim que for aprovado.',
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

  let photoUrl: string | null = null
  if (athlete.photo_path) {
    const { data } = await supabase.storage.from('athlete-photos').createSignedUrl(athlete.photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <AthleteCard
        fullName={athlete.full_name}
        cafNumber={athlete.caf_number}
        categoryStyleKey={(athlete.category as any)?.style_key ?? 'estreante'}
        categoryLabel={(athlete.category as any)?.name ?? '—'}
        validityDate={athlete.validity_date}
        publicToken={athlete.public_token}
        photoUrl={photoUrl}
      />
    </main>
  )
}
