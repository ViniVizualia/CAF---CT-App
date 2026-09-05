import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from '@/components/perfil/EditProfileForm'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { ContactPanel } from '@/components/feedback/ContactPanel'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!athlete) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-[var(--color-text-muted)]">Você ainda não tem um cadastro CAF.</p>
      </main>
    )
  }

  let photoUrl: string | null = null
  if (athlete.photo_path) {
    const { data } = await supabase.storage.from('athlete-photos').createSignedUrl(athlete.photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Meu perfil</h1>
      <EditProfileForm
        userId={user.id}
        initialFullName={athlete.full_name}
        initialWhatsapp={athlete.whatsapp}
        initialCity={athlete.city}
        initialState={athlete.state}
        initialInstagram={athlete.instagram ?? ''}
        currentPhotoUrl={photoUrl}
      />
      <FeedbackForm />
      <ContactPanel />
    </main>
  )
}
