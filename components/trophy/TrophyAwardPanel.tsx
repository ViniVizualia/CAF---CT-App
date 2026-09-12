'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const medalLabel: Record<string, string> = { ouro: '🥇 Ouro', prata: '🥈 Prata', bronze: '🥉 Bronze' }

interface TeamLite { id: string; label: string }

interface Props {
  categoryName: string
  teams: TeamLite[]
  trophiesByTeam: Record<string, string>
}

export function TrophyAwardPanel({ categoryName, teams, trophiesByTeam }: Props) {
  const router = useRouter()
  const [selectedMedal, setSelectedMedal] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAward(teamId: string) {
    const medal = selectedMedal[teamId] ?? trophiesByTeam[teamId] ?? 'ouro'
    setLoading(teamId); setError(null)
    const { error } = await createClient().rpc('award_trophy', { p_team_id: teamId, p_medal: medal })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  async function handleRemove(teamId: string) {
    setLoading(teamId); setError(null)
    const { error } = await createClient().rpc('remove_trophy', { p_team_id: teamId })
    setLoading(null)
    if (error) return setError(error.message)
    router.refresh()
  }

  if (teams.length === 0) return null

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mt-3">
      <p className="text-sm font-medium mb-3">Troféus — {categoryName}</p>
      <div className="flex flex-col gap-2">
        {teams.map((t) => {
          const currentMedal = trophiesByTeam[t.id]
          return (
            <div key={t.id} className="flex flex-col gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2">
              <div className="flex justify-between items-center text-sm">
                <span>{t.label}</span>
                {currentMedal && <span className="text-xs font-medium">{medalLabel[currentMedal]}</span>}
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedMedal[t.id] ?? currentMedal ?? 'ouro'}
                  onChange={(e) => setSelectedMedal((s) => ({ ...s, [t.id]: e.target.value }))}
                  className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-2 py-1.5 text-xs"
                >
                  <option value="ouro">🥇 Ouro</option>
                  <option value="prata">🥈 Prata</option>
                  <option value="bronze">🥉 Bronze</option>
                </select>
                <button
                  onClick={() => handleAward(t.id)}
                  disabled={loading === t.id}
                  className="text-xs rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-3 py-1.5 disabled:opacity-60"
                >
                  {currentMedal ? 'Atualizar' : 'Conceder'}
                </button>
                {currentMedal && (
                  <button
                    onClick={() => handleRemove(t.id)}
                    disabled={loading === t.id}
                    className="text-xs rounded-[var(--radius-sm)] border border-[var(--color-danger)] text-[var(--color-danger)] px-3 py-1.5 disabled:opacity-60"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
