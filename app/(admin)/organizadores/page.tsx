import { createClient } from '@/lib/supabase/server'
import { CreateOrganizerForm } from '@/components/admin/CreateOrganizerForm'

export const dynamic = 'force-dynamic'

export default async function OrganizadoresPage() {
  const supabase = await createClient()
  const { data: organizers } = await supabase
    .from('organizers')
    .select('id, name, responsible_name, email, whatsapp, status')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Organizadores</h1>
      <div className="flex flex-col gap-2 mb-8">
        {(organizers ?? []).map((o) => (
          <div key={o.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-3">
            <p className="font-medium">{o.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{o.responsible_name} · {o.email} · {o.whatsapp}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{o.status === 'active' ? 'Ativo' : 'Bloqueado'}</p>
          </div>
        ))}
        {(!organizers || organizers.length === 0) && (
          <p className="text-sm text-[var(--color-text-muted)]">Nenhum organizador cadastrado.</p>
        )}
      </div>
      <h2 className="text-lg font-medium mb-3">Cadastrar organizador</h2>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        A conta precisa já existir em Authentication → Users no Supabase antes de vincular aqui.
      </p>
      <CreateOrganizerForm />
    </main>
  )
}
