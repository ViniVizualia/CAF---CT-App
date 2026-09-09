'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm'

interface CategoryScheduleRow {
  name: string
  date: string
  time: string
}

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
  const [categoryRows, setCategoryRows] = useState<CategoryScheduleRow[]>([{ name: '', date: '', time: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateCategoryRow(index: number, field: keyof CategoryScheduleRow, value: string) {
    setCategoryRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addCategoryRow() {
    setCategoryRows((prev) => [...prev, { name: '', date: '', time: '' }])
  }

  function removeCategoryRow(index: number) {
    setCategoryRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const categorySchedule = Object.fromEntries(
      categoryRows
        .filter((row) => row.name.trim() && (row.date || row.time))
        .map((row) => [row.name.trim(), { date: row.date, time: row.time }])
    )

    const { error } = await supabase.from('tournaments').insert({
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
      category_schedule: categorySchedule,
      created_by: user?.id ?? null,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setName(''); setCity(''); setState(''); setStartDate(''); setEndDate('')
    setResponsibleName(''); setVenueName(''); setVenueAddress(''); setMapsLink('')
    setEventInstagram(''); setVenueInstagram(''); setCategoryRows([{ name: '', date: '', time: '' }])
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
        <p className="text-xs text-[var(--color-text-muted)]">
          Dias e horários por categoria (pode preencher depois — crie quantas categorias quiser, inclusive combinadas, ex: "Misto Estreante")
        </p>
        {categoryRows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              placeholder="Nome da categoria"
              value={row.name}
              onChange={(e) => updateCategoryRow(index, 'name', e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="date"
              value={row.date}
              onChange={(e) => updateCategoryRow(index, 'date', e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="time"
              value={row.time}
              onChange={(e) => updateCategoryRow(index, 'time', e.target.value)}
              className={`${inputClass} flex-1`}
            />
            {categoryRows.length > 1 && (
              <button type="button" onClick={() => removeCategoryRow(index)} className="text-xs text-[var(--color-danger)] px-1">
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCategoryRow} className="self-start text-xs text-[var(--color-primary)] underline">
          + Adicionar categoria
        </button>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60">
        {loading ? 'Criando...' : 'Criar torneio'}
      </button>
    </form>
  )
}
