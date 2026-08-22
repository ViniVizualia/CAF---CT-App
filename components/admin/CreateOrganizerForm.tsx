'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm'

export function CreateOrganizerForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await createClient().rpc('create_organizer', {
      p_email: email, p_name: name, p_responsible_name: responsibleName, p_whatsapp: whatsapp,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setEmail(''); setName(''); setResponsibleName(''); setWhatsapp('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="email" placeholder="E-mail da conta já criada" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      <input placeholder="Nome/empresa" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <input placeholder="Responsável" required value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} className={inputClass} />
      <input placeholder="WhatsApp" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
        {loading ? 'Cadastrando...' : 'Cadastrar organizador'}
      </button>
    </form>
  )
}
