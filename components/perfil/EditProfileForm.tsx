'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resizeImageToWebp } from '@/lib/images/resize-image'

const inputClass = 'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-[var(--color-text-primary)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  )
}

interface Props {
  userId: string
  initialFullName: string
  initialWhatsapp: string
  initialCity: string
  initialState: string
  initialInstagram: string
  currentPhotoUrl: string | null
}

export function EditProfileForm({
  userId, initialFullName, initialWhatsapp, initialCity, initialState, initialInstagram, currentPhotoUrl,
}: Props) {
  const [fullName, setFullName] = useState(initialFullName)
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp)
  const [city, setCity] = useState(initialCity)
  const [state, setState] = useState(initialState)
  const [instagram, setInstagram] = useState(initialInstagram)
  const [newPhoto, setNewPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handlePhotoChange(file: File | null) {
    setNewPhoto(file)
    if (file) setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      let photoPath: string | null = null

      if (newPhoto) {
        const [profileBlob, thumbBlob] = await Promise.all([
          resizeImageToWebp(newPhoto, 600, 0.85),
          resizeImageToWebp(newPhoto, 200, 0.75),
        ])
        photoPath = `${userId}.webp`

        const { error: photoError } = await supabase.storage
          .from('athlete-photos')
          .upload(photoPath, profileBlob, { upsert: true, contentType: 'image/webp' })
        if (photoError) throw photoError

        const { error: thumbError } = await supabase.storage
          .from('athlete-thumbnails')
          .upload(photoPath, thumbBlob, { upsert: true, contentType: 'image/webp' })
        if (thumbError) throw thumbError
      }

      const { error: rpcError } = await supabase.rpc('update_own_athlete_profile', {
        p_full_name: fullName,
        p_whatsapp: whatsapp,
        p_city: city,
        p_state: state,
        p_instagram: instagram || null,
        p_photo_path: photoPath,
      })
      if (rpcError) throw rpcError

      setSuccess(true)
      setNewPhoto(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={fullName} className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--color-surface)] border border-white/10" />
        )}
        <label className="text-sm text-[var(--color-primary)] cursor-pointer">
          Trocar foto
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <Field label="Nome completo">
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </Field>
      <Field label="WhatsApp">
        <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
      </Field>
      <div className="flex gap-3">
        <Field label="Cidade">
          <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Estado">
          <input required maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} className={inputClass} />
        </Field>
      </div>
      <Field label="Instagram (opcional)">
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} />
      </Field>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {success && <p className="text-sm text-[var(--color-success)]">Perfil atualizado com sucesso.</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>

      <a href="/home" className="text-sm text-center text-[var(--color-text-muted)] underline">← Voltar</a>
    </form>
  )
}
