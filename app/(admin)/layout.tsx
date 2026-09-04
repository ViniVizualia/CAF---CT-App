import type { ReactNode } from 'react'
import { AreaNav } from '@/components/nav/AreaNav'

const items = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Atletas', href: '/atletas' },
  { label: 'Organizadores', href: '/organizadores' },
  { label: 'Torneios', href: '/torneios' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AreaNav items={items} />
      {children}
    </div>
  )
}
