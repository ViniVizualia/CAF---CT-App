'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Organizer { id: string; name: string }
interface Athlete { id: string; full_name: string; caf_number: number | null }
interface Category { id: number; name: string }

interface Props {
  tournamentId: string
  allOrganizers: Organizer[]
  linkedOrganizers: Organizer[]
  allAthletes: Athlete[]
  linkedAthletes: Athlete[]
  categories: Category[]
  linkedOrganizerIds: string[]
  linkedAthleteIds: string[]
}

export function TournamentAssignments({
  tournamentId, allOrganizers, linkedOrganizers, allAthletes, linkedAthletes,
  categories, linkedOrganizerIds, linkedAthleteIds,
}: Props) {
  const router = useRouter()
  const availableOrganizers = allOrganizers.filter((o) => !linkedOrganizerIds.includes(o.id))
  const availableAthletes = allAthletes.filter((a) => !linkedAthleteIds.includes(a.id))

  const [selectedOrganizer, setSelectedOrganizer] = useState(availableOrganizers[0]?.id ?? '')
  const [selectedAthlete, setSelectedAthlete] = useState(availableAthletes[0]?.id ?? '')
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? 1)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function addOrganizer() {
    if (!selectedOrganizer) return
    setLoading('organizer'); setError(null)
    const { error } = await createClient().from('tournament_organizers').insert({ tournament_id: tournamentId, organizer_id: selectedOrganizer })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function addAthlete() {
    if (!selectedAthlete) return
    setLoading('athlete'); setError(null)
    const { error } = await createClient().from('tournament_athletes').insert({ tournament_id: tournamentId, athlete_id: selectedAthlete, category_at_tournament: selectedCategory })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-medium mb-3">Organizadores vinculados</h2>
        <div className="flex flex-col gap-2 mb-4">
          {linkedOrganizers.map((o) => (
            <div key={o.id} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-2 text-sm">{o.name}</div>
          ))}
          {linkedOrganizers.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhum organizador vinculado ainda.</p>}
        </div>
        {availableOrganizers.length > 0 && (
          <div className="flex gap-2">
            <select value={selectedOrganizer} onChange={(e) => setSelectedOrganizer(e.target.value)} className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm">
              {availableOrganizers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <button onClick={addOrganizer} disabled={loading !== null} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-4 text-sm disabled:opacity-60">
              {loading === 'organizer' ? '...' : 'Vincular'}
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Atletas vinculados ({linkedAthletes.length})</h2>
        <div className="flex flex-col gap-2 mb-4">
          {linkedAthletes.map((a) => (
            <div key={a.id} className="flex justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-2 text-sm">
              <span>{a.full_name}</span>
              <span className="text-[var(--color-text-muted)]">{a.caf_number ? String(a.caf_number).padStart(6, '0') : '—'}</span>
            </div>
          ))}
          {linkedAthletes.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhum atleta vinculado ainda.</p>}
        </div>
        {availableAthletes.length > 0 && (
          <div className="flex flex-col gap-2">
            <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm">
              {availableAthletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
            </select>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={addAthlete} disabled={loading !== null} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm disabled:opacity-60">
              {loading === 'athlete' ? 'Vinculando...' : 'Vincular atleta'}
            </button>
          </div>
        )}
      </section>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}
