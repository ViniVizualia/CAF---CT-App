// Links de pagamento do uniforme oficial CAF.
// Preencha cada campo com o "Link de pagamento" gerado no Mercado Pago
// (ou outro gateway) assim que estiverem prontos. Enquanto ficar "",
// o botão de compra mostra "Em breve" em vez de redirecionar.

export type Genero = 'masculino' | 'feminino'
export type Tamanho = 'P' | 'M' | 'G' | 'GG'

export const uniformPrice = 99.0

export const paymentLinks: Record<Genero, Record<Tamanho, string>> = {
  masculino: {
    P: '',
    M: '',
    G: '',
    GG: '',
  },
  feminino: {
    P: '',
    M: '',
    G: '',
    GG: '',
  },
}
