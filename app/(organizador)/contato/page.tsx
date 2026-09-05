import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { ContactPanel } from '@/components/feedback/ContactPanel'

export default function ContatoOrganizadorPage() {
  return (
    <main className="min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-semibold mb-2">Contato</h1>
      <FeedbackForm />
      <ContactPanel />
    </main>
  )
}
