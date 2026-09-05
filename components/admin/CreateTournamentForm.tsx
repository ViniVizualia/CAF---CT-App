'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm'

const CATEGORIES = [
  'Estreante',
  'Iniciante',
  'Intermediário',
  'Amador C',
  'Amador B',
  'Amador A',
  'Qualifier',
] as const

type CategorySchedule = Record<string, { date: string; time: string }>

export function CreateTournamentForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [eventInstagram, setEventInstagram] = useState('')
  const [venueInstagram, setVenueInstagram] = useState('')
  const [categorySchedule, setCategorySchedule] = useState<CategorySchedule>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateCategorySchedule(category: string, field: 'date' | 'time', value: string) {
    setCategorySchedule((prev) => ({
      ...prev,
      [category]: {
        date: field === 'date' ? value : prev[category]?.date ?? '',
        time: field === 'time' ? value : prev[category]?.time ?? '',
      },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanSchedule = Object.fromEntries(
      Object.entries(categorySchedule).filter(([, v]) => v.date || v.time)
    )

    const { error } = await createClient().from('tournaments').insert({
      name,
      city,
      state,
      start_date: startDate,
      end_date: endDate,
      status: 'draft',
      responsible_name: responsibleName,
      venue_name: venueName || null,
      venue_address: venueAddress || null,
      maps_link: mapsLink || null,
      event_instagram: eventInstagram || null,
      venue_instagram: venueInstagram || null,
      category_schedule: cleanSchedule,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setName(''); setCity(''); setState(''); setStartDate(''); setEndDate('')
    setResponsibleName(''); setVenueName(''); setVenueAddress(''); setMapsLink('')
    setEventInstagram(''); setVenueInstagram(''); setCategorySchedule({})
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input placeholder="Nome do torneio" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

      <input
        placeholder="Nome do responsável pelo evento"
        required
        value={responsibleName}
        onChange={(e) => setResponsibleName(e.target.value)}
        className={inputClass}
      />

      <div className="flex gap-3">
        <input placeholder="Cidade" required value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} flex-1`} />
        <input placeholder="UF" required maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className={`${inputClass} w-16`} />
      </div>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Início
          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex-1 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Fim
          <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <p className="text-xs text-[var(--color-text-muted)]">Local do evento</p>
        <input
          placeholder="Nome do local / CT"
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Endereço completo"
          value={venueAddress}
          onChange={(e) => setVenueAddress(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Link do Google Maps"
          type="url"
          value={mapsLink}
          onChange={(e) => setMapsLink(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/10">
        <input
          placeholder="Instagram do evento"
          value={eventInstagram}
          onChange={(e) => setEventInstagram(e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <input
          placeholder="Instagram da rede/CT"
          value={venueInstagram}
          onChange={(e) => setVenueInstagram(e.target.value)}
          className={`${inputClass} flex-1`}
        />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <p className="text-xs text-[var(--color-text-muted)]">Dias e horários por categoria (pode preencher depois)</p>
        {CATEGORIES.map((category) => (
          <div key={category} className="flex items-center gap-2">
            <span className="text-xs w-28 shrink-0">{category}</span>
            <input
              type="date"
              value={categorySchedule[category]?.date ?? ''}
              onChange={(e) => updateCategorySchedule(category, 'date', e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="time"
              value={categorySchedule[category]?.time ?? ''}
              onChange={(e) => updateCategorySchedule(category, 'time', e.target.value)}
              className={`${inputClass} flex-1`}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
        {loading ? 'Criando...' : 'Criar torneio'}
      </button>
    </form>
  )
}
