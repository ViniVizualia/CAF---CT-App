'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm text-[var(--color-text-primary)]'

interface CategoryScheduleRow {
  name: string
  date: string
  time: string
}

interface Props {
  tournamentId: string
  initialName: string
  initialResponsibleName: string | null
  initialCity: string
  initialState: string
  initialStartDate: string
  initialEndDate: string
  initialVenueName: string | null
  initialVenueAddress: string | null
  initialMapsLink: string | null
  initialEventInstagram: string | null
  initialVenueInstagram: string | null
  initialCategorySchedule: Record<string, { date?: string; time?: string }> | null
  initialVisibleToAthletes: boolean
}

export function EditTournamentForm({
  tournamentId, initialName, initialResponsibleName, initialCity, initialState,
  initialStartDate, initialEndDate, initialVenueName, initialVenueAddress, initialMapsLink,
  initialEventInstagram, initialVenueInstagram, initialCategorySchedule, initialVisibleToAthletes,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [responsibleName, setResponsibleName] = useState(initialResponsibleName ?? '')
  const [city, setCity] = useState(initialCity)
  const [state, setState] = useState(initialState)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [venueName, setVenueName] = useState(initialVenueName ?? '')
  const [venueAddress, setVenueAddress] = useState(initialVenueAddress ?? '')
  const [mapsLink, setMapsLink] = useState(initialMapsLink ?? '')
  const [eventInstagram, setEventInstagram] = useState(initialEventInstagram ?? '')
  const [venueInstagram, setVenueInstagram] = useState(initialVenueInstagram ?? '')
  const [visibleToAthletes, setVisibleToAthletes] = useState(initialVisibleToAthletes)
  const [categoryRows, setCategoryRows] = useState<CategoryScheduleRow[]>(() => {
    const entries = Object.entries(initialCategorySchedule ?? {})
    if (entries.length === 0) return [{ name: '', date: '', time: '' }]
    return entries.map(([catName, v]) => ({ name: catName, date: v.date ?? '', time: v.time ?? '' }))
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function updateCategoryRow(index: number, field: keyof CategoryScheduleRow, value: string) {
    setCategoryRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  function addCategoryRow() {
    setCategoryRows((prev) => [...prev, { name: '', date: '', time: '' }])
  }

  function removeCategoryRow(index: number) {
    setCategoryRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setLoading(true); setError(null); setSaved(false)

    const categorySchedule = Object.fromEntries(
      categoryRows
        .filter((row) => row.name.trim() && (row.date || row.time))
        .map((row) => [row.name.trim(), { date: row.date, time: row.time }])
    )

    const { error } = await createClient()
      .from('tournaments')
      .update({
        name,
        responsible_name: responsibleName,
        city,
        state,
        start_date: startDate,
        end_date: endDate,
        venue_name: venueName || null,
        venue_address: venueAddress || null,
        maps_link: mapsLink || null,
        event_instagram: eventInstagram || null,
        venue_instagram: venueInstagram || null,
        category_schedule: categorySchedule,
        visible_to_athletes: visibleToAthletes,
      })
      .eq('id', tournamentId)

    setLoading(false)
    if (error) return setError(error.message)
    setSaved(true)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-[var(--color-primary)] underline mb-4">
        Editar informações do torneio
      </button>
    )
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Editar torneio</p>
        <button onClick={() => setOpen(false)} className="text-xs text-[var(--color-text-muted)] underline">Fechar</button>
      </div>

      <input placeholder="Nome do torneio" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      <input placeholder="Responsável pelo evento" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} className={inputClass} />

      <div className="flex gap-3">
        <input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} flex-1`} />
        <input placeholder="UF" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className={`${inputClass} w-16`} />
      </div>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Início
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex-1 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Fim
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <p className="text-xs text-[var(--color-text-muted)]">Local do evento</p>
        <input placeholder="Nome do local / CT" value={venueName} onChange={(e) => setVenueName(e.target.value)} className={inputClass} />
        <input placeholder="Endereço completo" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} className={inputClass} />
        <input placeholder="Link do Google Maps" type="url" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} className={inputClass} />
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/10">
        <input placeholder="Instagram do evento" value={eventInstagram} onChange={(e) => setEventInstagram(e.target.value)} className={`${inputClass} flex-1`} />
        <input placeholder="Instagram da rede/CT" value={venueInstagram} onChange={(e) => setVenueInstagram(e.target.value)} className={`${inputClass} flex-1`} />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <p className="text-xs text-[var(--color-text-muted)]">Dias e horários por categoria</p>
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
              <button type="button" onClick={() => removeCategoryRow(index)} className="text-xs text-[var(--color-danger)] px-1">✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCategoryRow} className="self-start text-xs text-[var(--color-primary)] underline">
          + Adicionar categoria
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm pt-2 border-t border-white/10">
        <input type="checkbox" checked={visibleToAthletes} onChange={(e) => setVisibleToAthletes(e.target.checked)} />
        Mostrar em "Próximos torneios" na Home dos atletas
      </label>
      <p className="text-xs text-[var(--color-text-muted)]">
        Desmarcar não bloqueia inscrição — só tira o torneio da lista de descoberta. Quem já tiver o link continua acessando normalmente.
      </p>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-medium disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && <span className="text-xs text-[var(--color-text-muted)]">Salvo ✓</span>}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
