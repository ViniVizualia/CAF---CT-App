'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_LENGTH = 240

interface Report {
  id: string
  message: string
  created_at: string
  filed_by_name: string | null
}

interface Props {
  athleteId: string
  canFile: boolean
}

export function BehaviorReportsPanel({ athleteId, canFile }: Props) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadReports() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('athlete_behavior_reports')
      .select('id, message, created_at, filed_by_profile_id')
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false })

    const filedByIds = [...new Set((data ?? []).map((r) => r.filed_by_profile_id))]
    const nameByProfile = new Map<string, string>()
    if (filedByIds.length > 0) {
      const { data: organizersData } = await supabase.from('organizers').select('profile_id, name').in('profile_id', filedByIds)
      for (const o of organizersData ?? []) nameByProfile.set(o.profile_id, o.name)
    }

    setReports((data ?? []).map((r) => ({
      id: r.id,
      message: r.message,
      created_at: r.created_at,
      filed_by_name: nameByProfile.get(r.filed_by_profile_id) ?? null,
    })))
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId])

  async function handleSubmit() {
    if (!message.trim()) { setError('Descreva a ocorrência.'); return }
    setSubmitting(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return setError('Sessão expirada.') }

    const { error } = await supabase.from('athlete_behavior_reports').insert({
      athlete_id: athleteId,
      filed_by_profile_id: user.id,
      message: message.trim(),
    })
    setSubmitting(false)
    if (error) return setError(error.message)
    setMessage('')
    loadReports()
  }

  return (
    <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 p-3">
      <p className="text-xs font-medium mb-2">Relatos de comportamento</p>

      {canFile && (
        <div className="flex flex-col gap-1 mb-3">
          <textarea
            value={message}
            maxLength={MAX_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Descreva a ocorrência (ex: desrespeito com árbitro, agressividade com adversário)"
            rows={2}
            className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-sm"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--color-text-muted)]">{message.length}/{MAX_LENGTH}</span>
            <button onClick={handleSubmit} disabled={submitting} className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white px-3 py-1.5 text-xs font-medium disabled:opacity-60">
              {submitting ? 'Enviando...' : 'Registrar relato'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-[var(--color-text-muted)]">Carregando...</p>
      ) : reports.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">Nenhum relato registrado.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((r) => (
            <div key={r.id} className="text-xs border-t border-white/10 pt-2">
              <p className="text-[var(--color-text-muted)] mb-1">
                {new Date(r.created_at).toLocaleDateString('pt-BR')} · {r.filed_by_name ?? 'Organizador'}
              </p>
              <p>{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
