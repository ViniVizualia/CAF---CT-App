export function ContactPanel() {
  return (
    <div className="rounded-[var(--radius-md)] border border-white/10 p-5 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
        Fale conosco
      </h2>
      <a
        href="https://wa.me/5513920079606"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-4 py-3 text-sm"
      >
        <span>WhatsApp</span>
        <span className="text-[var(--color-success)] font-medium">(13) 92007-9606</span>
      </a>
      <a
        href="mailto:caffutevolei@outlook.com"
        className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-4 py-3 text-sm"
      >
        <span>E-mail</span>
        <span className="text-[var(--color-accent)] font-medium">caffutevolei@outlook.com</span>
      </a>
    </div>
  )
}
