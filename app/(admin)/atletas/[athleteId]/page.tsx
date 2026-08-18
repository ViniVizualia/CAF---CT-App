import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApprovalActions } from '@/components/admin/ApprovalActions'

export default async function AthleteAnalysisPage({ params }: { params: Promise<{ athleteId: string }> }) {
  const { athleteId } = await params
  const supabase = await createClient()

  const { data: athlete } = await supabase
    .from('athletes')
    .select('*, declared:declared_category_id(name), official:official_category_id(name)')
    .eq('id', athleteId)
    .single()

  if (!athlete) notFound()

  let photoUrl: string | null = null
  if (athlete.photo_path) {
    const { data } = await supabase.storage.from('athlete-photos').createSignedUrl(athlete.photo_path, 600)
    photoUrl = data?.signedUrl ?? null
  }

  const { data: history } = await supabase
    .from('athlete_category_history')
    .select('reason, created_at, previous:previous_category_id(name), new:new_category_id(name)')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen px-6 py-10 max-w-md mx-auto">
      <a href="/atletas" className="text-sm text-[var(--color-text-muted)] underline">← Voltar</a>
      <div className="flex flex-col items-center mt-6 mb-6">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={athlete.full_name} className="w-32 h-32 rounded-full object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-[var(--color-surface)] border border-white/10" />
        )}
        <h1 className="text-xl font-semibold mt-3">{athlete.full_name}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">{athlete.city}/{athlete.state} · {athlete.whatsapp}</p>
      </div>
      <div className="flex flex-col gap-2 text-sm mb-6">
        <div className="flex justify-between border-b border-white/5 py-2">
          <span className="text-[var(--color-text-muted)]">Categoria declarada</span>
          <span>{(athlete.declared as any)?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 py-2">
          <span className="text-[var(--color-text-muted)]">Categoria oficial</span>
          <span>{(athlete.official as any)?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 py-2">
          <span className="text-[var(--color-text-muted)]">Número CAF</span>
          <span>{athlete.caf_number ? String(athlete.caf_number).padStart(6, '0') : '—'}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 py-2">
          <span className="text-[var(--color-text-muted)]">Status</span>
          <span>{athlete.status}</span>
        </div>
      </div>
      <ApprovalActions athleteId={athlete.id} declaredCategoryId={athlete.declared_category_id} currentStatus={athlete.status} />
      {history && history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium mb-2">Histórico de categoria</h2>
          <div className="flex flex-col gap-2 text-xs text-[var(--color-text-muted)]">
            {history.map((h: any, i: number) => (
              <div key={i} className="border-b border-white/5 pb-2">{h.previous?.name ?? '—'} → {h.new?.name} · {h.reason}</div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
