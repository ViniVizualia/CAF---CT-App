// Calcula a data "de hoje" no fuso de Brasília, não no fuso do servidor (que roda em UTC).
// Evita que torneios sumam/apareçam errado perto da meia-noite.
export function todayInBrazil(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

// Data N meses à frente de hoje, no fuso de Brasília.
export function monthsAheadInBrazil(months: number): string {
  const future = new Date()
  future.setMonth(future.getMonth() + months)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(future)
}
