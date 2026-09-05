import type { ReactNode } from 'react'
import Link from 'next/link'
import { LogoutButton } from '@/components/nav/LogoutButton'

export default function OrganizadorLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center border-b border-white/10 px-4 py-2 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/IMG_0348.png" alt="CAF" className="w-7 h-7 mr-2 flex-shrink-0" />
        <span className="text-sm font-medium text-[var(--color-text-muted)] mr-3">Organizador</span>
        <Link href="/contato" className="text-sm text-[var(--color-text-muted)]">
          Contato
        </Link>
        <LogoutButton />
      </div>
      {children}
    </div>
  )
}
