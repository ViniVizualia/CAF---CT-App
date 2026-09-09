'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCpf } from '@/lib/validation/cpf'

type SearchMethod = 'caf' | 'cpf' | 'nome'

interface AthleteResult {
  id: string
  full_name: string
  caf_number: number | null
}

interface Props {
  tournamentId: string
  categoryOptions: string[]
}

export function TournamentRegistrationForm({ tournamentId, categoryOptions }: Props) {
  const router = useRouter()
  const [categoryName, setCategoryName] = useState(categoryOptions[0] ?? '')
  const [soloRegistration, setSoloRegistration] = useState(false)
  const [method, setMethod] = useState<SearchMethod>('caf')
  const [value, setValue] = useState('')
  const [nameResults, setNameResults] = useState<AthleteResult[]>([])
  const [selectedPartner, setSelectedPartner] = useState<AthleteResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleMethodChange(next: SearchMethod) {
    setMethod(next)
    setValue('')
    setNameResults([])
    setSelectedPartner(null)
    setError(null)
  }

  function handleValueChange(v: string) {
    setSelectedPartner(null)
    setValue(method === 'cpf' ? formatCpf(v) : v)
  }

  async function handleNameSearch() {
    if (!value.trim()) return
    setSearching(true); setError(null)
    const { data, error } = await createClient().rpc('search_athletes', { search_term: value.trim() })
    setSearching(false)
    if (error) return setError(error.message)
    setNameResults(data ?? [])
  }

  async function handleSubmit() {
    if (!categoryName) { setError('Selecione a categoria do torneio.'); return }
    if (!soloRegistration) {
      if (method === 'nome' && !selectedPartner) { setError('Selecione o parceiro na lista de busca.'); return }
      if (method !== 'nome' && !value.trim()) { setError('Informe o parceiro, ou marque "Vou sozinho(a)".'); return }
    }

    setLoading(true); setError(null)
    const params: any = { p_tournament_id: tournamentId, p_custom_category_name: categoryName }

    if (!soloRegistration) {
      if (method === 'caf') params.p_partner_caf_number = Number(value)
      else if (method === 'cpf') params.p_partner_cpf = value
      else params.p_partner_athlete_id = selectedPartner!.id
    }

    const { error } = await createClient().rpc('request_tournament_registration', params)
    setLoading(false)
    if (error) return setError(error.message)
    setValue(''); setSelectedPartner(null); setNameResults([])
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4">
      <p className="text-sm font-medium mb-2">Quero me inscrever neste torneio</p>

      {categoryOptions.length > 0 ? (
        <select
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm mb-3"
        >
          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      ) : (
        <p className="text-xs text-[var(--color-danger)] mb-3">Nenhuma categoria cadastrada ainda pelo organizador.</p>
      )}

      <label className="flex items-center gap-2 text-sm mb-3">
        <input type="checkbox" checked={soloRegistration} onChange={(e) => setSoloRegistration(e.target.checked)} />
        Vou sozinho(a) — ainda não tenho dupla
      </label>

      {!soloRegistration && (
        <>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">
            Informe seu parceiro de dupla por número CAF, CPF ou nome completo.
          </p>
          <div className="flex gap-2 mb-2">
            {(['caf', 'cpf', 'nome'] as SearchMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMethodChange(m)}
                className={`text-xs rounded-[var(--radius-sm)] px-3 py-1.5 border ${method === m ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-white/15 text-[var(--color-text-muted)]'}`}
              >
                {m === 'caf' ? 'Número CAF' : m === 'cpf' ? 'CPF' : 'Nome completo'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <input
              inputMode={method === 'caf' ? 'numeric' : 'text'}
              placeholder={method === 'caf' ? 'Número CAF do parceiro' : method === 'cpf' ? '000.000.000-00' : 'Nome completo do parceiro'}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="flex-1 rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-sm"
            />
            {method === 'nome' && (
              <button type="button" onClick={handleNameSearch} disabled={searching} className="rounded-[var(--radius-sm)] border border-white/15 px-3 text-sm disabled:opacity-60">
                {searching ? '...' : 'Buscar'}
              </button>
            )}
          </div>

          {method === 'nome' && nameResults.length > 0 && !selectedPartner && (
            <div className="flex flex-col gap-1 mb-2">
              {nameResults.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedPartner(a)}
                  className="text-left text-sm rounded-[var(--radius-sm)] bg-[var(--color-bg)] border border-white/10 px-3 py-2"
                >
                  {a.full_name} {a.caf_number ? `· CAF ${String(a.caf_number).padStart(6, '0')}` : ''}
                </button>
              ))}
            </div>
          )}

          {selectedPartner && (
            <p className="text-xs text-[var(--color-success)] mb-2">Parceiro selecionado: {selectedPartner.full_name}</p>
          )}
        </>
      )}

      {soloRegistration && (
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Sua inscrição fica pendente até o organizador formar sua dupla com outro atleta.
        </p>
      )}

      <button onClick={handleSubmit} disabled={loading} className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-2 text-sm font-medium disabled:opacity-60">
        {loading ? 'Enviando...' : 'Solicitar inscrição'}
      </button>

      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
