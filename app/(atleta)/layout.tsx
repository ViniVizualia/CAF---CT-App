import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AreaNav } from '@/components/nav/AreaNav'

export default async function AtletaLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const items = [
    { label: 'Home', href: '/home' },
    { label: 'Carteirinha', href: '/carteirinha' },
    { label: 'Loja', href: '/loja' },
    { label: 'Perfil', href: '/perfil' },
  ]

  if (user) {
    const { data: organizerRow } = await supabase
      .from('organizers')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (organizerRow) {
      items.push({ label: 'Meus Torneios', href: '/meus-torneios' })
    }
  }

  return (
    <div>
      <AreaNav items={items} />
      {children}
    </div>
  )
}
