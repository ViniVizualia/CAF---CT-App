import type { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/nav/LogoutButton'

export default async function OrganizadorLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let hasAthleteProfile = false
  if (user) {
    const { data: athleteRow } = await supabase
      .from('athletes')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()
    hasAthleteProfile = !!athleteRow
  }

  return (
    <div>
      <div className="flex items-center flex-wrap gap-y-1 border-b border-white/10 px-4 py-2 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/IMG_0348.png" alt="CAF" className="w-7 h-7 mr-2 flex-shrink-0" />
        <span className="text-sm font-medium text-[var(--color-text-muted)] mr-3">Organizador</span>
        <Link href="/buscar-atleta" className="text-sm text-[var(--color-text-muted)] mr-3">
          Buscar atleta
        </Link>
        {hasAthleteProfile && (
          <Link href="/home" className="text-sm text-[var(--color-text-muted)] mr-3">
            Minha carteirinha
          </Link>
        )}
        <Link href="/contato" className="text-sm text-[var(--color-text-muted)]">
          Contato
        </Link>
        <LogoutButton />
      </div>
      {children}
    </div>
  )
}
