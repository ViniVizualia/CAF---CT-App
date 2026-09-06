// Calcula a data "de hoje" no fuso de Brasília, não no fuso do servidor (que roda em UTC).
// Evita que torneios sumam/apareçam errado perto da meia-noite.
export function todayInBrazil(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}
