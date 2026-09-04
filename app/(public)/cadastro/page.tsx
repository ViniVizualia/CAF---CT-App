'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resizeImageToWebp } from '@/lib/images/resize-image'

const categoryOptions = [
  { id: 1, label: 'Estreante' },
  { id: 2, label: 'Iniciante' },
  { id: 3, label: 'Intermediário' },
  { id: 4, label: 'Amador C' },
  { id: 5, label: 'Amador B' },
  { id: 6, label: 'Amador A' },
  { id: 7, label: 'Qualifier' },
]

const inputClass =
  'rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-white/10 px-3 py-2 text-[var(--color-text-primary)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm flex-1">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  )
}

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [instagram, setInstagram] = useState('')
  const [categoryId, setCategoryId] = useState(1)
  const [photo, setPhoto] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!photo) {
      setError('Envie uma foto de identificação.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) throw signUpError

      if (!signUpData.session) {
        setError('Conta criada! Confirme seu e-mail e depois entre para concluir o cadastro.')
        setLoading(false)
        return
      }

      const userId = signUpData.session.user.id

      const [profileBlob, thumbBlob] = await Promise.all([
        resizeImageToWebp(photo, 600, 0.85),
        resizeImageToWebp(photo, 200, 0.75),
      ])

      const photoPath = `${userId}.webp`

      const { error: photoError } = await supabase.storage
        .from('athlete-photos')
        .upload(photoPath, profileBlob, { upsert: true, contentType: 'image/webp' })
      if (photoError) throw photoError

      const { error: thumbError } = await supabase.storage
        .from('athlete-thumbnails')
        .upload(photoPath, thumbBlob, { upsert: true, contentType: 'image/webp' })
      if (thumbError) throw thumbError

      const { error: rpcError } = await supabase.rpc('create_athlete_profile', {
        p_full_name: fullName,
        p_email: email,
        p_whatsapp: whatsapp,
        p_birth_date: birthDate,
        p_city: city,
        p_state: state,
        p_instagram: instagram || null,
        p_declared_category_id: categoryId,
        p_photo_path: photoPath,
      })
      if (rpcError) throw rpcError

      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/IMG_0348.png" alt="CAF" className="w-14 mb-4" />

      <h1 className="text-2xl font-semibold mb-1">Criar meu cadastro CAF</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Depois de enviado, seu cadastro fica em análise até ser aprovado.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="E-mail">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Senha">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Nome completo">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="WhatsApp">
          <input required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Data de nascimento">
          <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
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
        <Field label="Categoria declarada">
          <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} className={inputClass}>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Foto de identificação">
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Foto atual, de frente, rosto visível, sem óculos escuros ou boné.
          </p>
        </Field>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white py-3 font-medium disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar cadastro'}
        </button>
      </form>
    </main>
  )
}
