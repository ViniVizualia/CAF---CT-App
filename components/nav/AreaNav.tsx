'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
}

export function AreaNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/10 px-4 py-2 mb-2">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium ${
              active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
