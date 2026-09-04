import type { ReactNode } from 'react'
import { AreaNav } from '@/components/nav/AreaNav'

const items = [
  { label: 'Home', href: '/home' },
  { label: 'Carteirinha', href: '/carteirinha' },
  { label: 'Perfil', href: '/perfil' },
]

export default function AtletaLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AreaNav items={items} />
      {children}
    </div>
  )
}
