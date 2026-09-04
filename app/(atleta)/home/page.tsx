import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AthleteCard } from '@/components/carteirinha/AthleteCard'

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

  let photoUrl: string | null = null
  if (athlete.photo_path) {
    const { data } = await supabase.storage.from('athlete-photos').createSignedUrl(athlete.photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10 gap-6">
      <div className="text-center">
        <p className="text-sm text-[var(--color-text-muted)]">Olá,</p>
        <h1 className="text-xl font-semibold">{athlete.full_name.split(' ')[0]}</h1>
      </div>
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
