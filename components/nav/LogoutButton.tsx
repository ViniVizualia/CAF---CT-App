'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="ml-auto whitespace-nowrap text-sm font-medium text-[var(--color-text-muted)] px-3 py-1.5"
    >
      Sair
    </button>
  )
}
