'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Athlete { id: string; full_name: string; caf_number: number | null; category_at_tournament: number }
interface Category { id: number; name: string }
interface Team {
  id: string
  category_id: number
  athlete_1: { id: string; full_name: string; caf_number: number | null }
  athlete_2: { id: string; full_name: string; caf_number: number | null }
}

interface Props {
  tournamentId: string
  categories: Category[]
  linkedAthletes: Athlete[]
  teams: Team[]
}

export function TournamentTeams({ tournamentId, categories, linkedAthletes, teams }: Props) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? 1)
  const [athlete1, setAthlete1] = useState('')
  const [athlete2, setAthlete2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pairedAthleteIds = teams
    .filter((t) => t.category_id === selectedCategory)
    .flatMap((t) => [t.athlete_1.id, t.athlete_2.id])

  const availableAthletes = linkedAthletes.filter(
    (a) => a.category_at_tournament === selectedCategory && !pairedAthleteIds.includes(a.id)
  )

  const teamsInCategory = teams.filter((t) => t.category_id === selectedCategory)

  async function createTeam() {
    if (!athlete1 || !athlete2 || athlete1 === athlete2) {
      setError('Selecione dois atletas diferentes.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await createClient().from('tournament_teams').insert({
      tournament_id: tournamentId,
      category_id: selectedCategory,
      athlete_id_1: athlete1,
      athlete_id_2: athlete2,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setAthlete1(''); setAthlete2('')
    router.refresh()
  }

  async function removeTeam(teamId: string) {
    setLoading(true)
    setError(null)
    const { error } = await createClient().from('tournament_teams').delete().eq('id', teamId)
    setLoading(false)
    if (error) return setError(error.message)
    router.refresh()
  }

  return (
    <section>
      <h2 className="text-lg font-medium mb-3">Duplas</h2>

      <select
        value={selectedCategory}
        onChange={(e) => { setSelectedCategory(Number(e.target.value)); setAthlete1(''); setAthlete2('') }}
        className="w-full rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm mb-4"
      >
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <div className="flex flex-col gap-2 mb-4">
        {teamsInCategory.map((t) => (
          <div key={t.id} className="flex justify-between items-center rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-4 py-2 text-sm">
            <span>{t.athlete_1.full_name} / {t.athlete_2.full_name}</span>
            <button onClick={() => removeTeam(t.id)} disabled={loading} className="text-xs text-[var(--color-danger)] disabled:opacity-60">
              Remover
            </button>
          </div>
        ))}
        {teamsInCategory.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Nenhuma dupla formada nesta categoria ainda.</p>}
      </div>

      {availableAthletes.length >= 2 ? (
        <div className="flex flex-col gap-2">
          <select value={athlete1} onChange={(e) => setAthlete1(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm">
            <option value="">Selecione o 1º atleta</option>
            {availableAthletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
          <select value={athlete2} onChange={(e) => setAthlete2(e.target.value)} className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm">
            <option value="">Selecione o 2º atleta</option>
            {availableAthletes.filter((a) => a.id !== athlete1).map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
          <button onClick={createTeam} disabled={loading || !athlete1 || !athlete2} className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm disabled:opacity-60">
            {loading ? 'Formando dupla...' : 'Formar dupla'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          É preciso pelo menos 2 atletas sem dupla nesta categoria para formar uma nova dupla.
        </p>
      )}

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </section>
  )
}
