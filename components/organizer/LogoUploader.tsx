'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tournamentId: string
  initialLogoPath: string | null
}

export function LogoUploader({ tournamentId, initialLogoPath }: Props) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoPath, setLogoPath] = useState(initialLogoPath)

  const supabase = createClient()
  const previewUrl = logoPath ? supabase.storage.from('tournament-logos').getPublicUrl(logoPath).data.publicUrl : null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const ext = file.name.split('.').pop()
    const path = `${tournamentId}/logo.${ext}`

    const { error: uploadError } = await supabase.storage.from('tournament-logos').upload(path, file, { upsert: true })
    if (uploadError) { setUploading(false); return setError(uploadError.message) }

    const { error: updateError } = await supabase.from('tournaments').update({ logo_path: path }).eq('id', tournamentId)
    setUploading(false)
    if (updateError) return setError(updateError.message)
    setLogoPath(path)
    router.refresh()
  }

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 p-4 mb-4">
      <p className="text-sm font-medium mb-2">Logo do torneio</p>
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Logo do torneio" className="w-20 h-20 rounded-[var(--radius-sm)] object-contain bg-black/20 mb-2" />
      )}
      <label className="inline-block rounded-[var(--radius-sm)] border border-white/15 px-4 py-2 text-sm cursor-pointer">
        {uploading ? 'Enviando...' : previewUrl ? 'Trocar logo' : 'Enviar logo'}
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
      </label>
      <p className="text-xs text-[var(--color-text-muted)] mt-2">Usada nas imagens e PDFs de divulgação do chaveamento.</p>
      {error && <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>}
    </div>
  )
}
