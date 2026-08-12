/**
 * Arquitetura central de design tokens do CAF.
 *
 * IMPORTANTE: os valores de marca abaixo (cores, fontes) são PROVISÓRIOS,
 * escolhidos só para o app não ficar sem estilo nesta fase de fundação.
 * Quando a logo oficial, a paleta HEX e as fontes forem definidas, troque
 * os valores aqui (e no @theme de app/globals.css) — o resto do app
 * consome essas duas fontes, nunca cor "hardcoded" direto no componente.
 */

export const colors = {
  background: "#0B0F14", // TODO: cor oficial de fundo
  surface: "#141A21", // TODO
  primary: "#2E6F6A", // TODO — verde petróleo provisório
  accent: "#C9A227", // TODO — dourado provisório (reservado para "premium")
  textPrimary: "#F5F7FA",
  textMuted: "#8B98A5",
  danger: "#B3261E",
  success: "#2E7D32",
} as const;

export const fonts = {
  display: "var(--font-display)", // TODO: fonte oficial de display
  body: "var(--font-body)", // TODO: fonte oficial de texto
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
} as const;

export const borderRadius = {
  sm: "6px",
  md: "12px",
  lg: "20px",
  pill: "999px",
} as const;

export const shadows = {
  card: "0 2px 12px rgba(0,0,0,0.35)",
  premium: "0 4px 24px rgba(201,162,39,0.25)", // usado nas carteirinhas Amador A / Qualifier
} as const;

/**
 * Categorias oficiais do CAF, na ordem definida no escopo do produto.
 * O gradiente de cada categoria é uma primeira aproximação da direção
 * pedida (prata → dourado premium) — ajustar quando a paleta oficial
 * chegar, mas a ORDEM e as CHAVES devem se manter estáveis, pois o
 * banco (tabela categories) referencia esse mesmo style_key.
 */
export type CategoryKey =
  | "estreante"
  | "iniciante"
  | "intermediario"
  | "amador_c"
  | "amador_b"
  | "amador_a"
  | "qualifier";

interface CategoryStyle {
  label: string;
  order: number;
  gradient: [string, string];
  textOnCard: string;
}

export const categoryStyles: Record<CategoryKey, CategoryStyle> = {
  estreante: { label: "Estreante", order: 1, gradient: ["#C7CCD1", "#9AA3AB"], textOnCard: "#12161A" },
  iniciante: { label: "Iniciante", order: 2, gradient: ["#6E8CA0", "#3F5A6B"], textOnCard: "#F5F7FA" },
  intermediario: { label: "Intermediário", order: 3, gradient: ["#2E6F6A", "#184A46"], textOnCard: "#F5F7FA" },
  amador_c: { label: "Amador C", order: 4, gradient: ["#2E8B57", "#1C5A38"], textOnCard: "#F5F7FA" },
  amador_b: { label: "Amador B", order: 5, gradient: ["#1B2A4A", "#0D1830"], textOnCard: "#F5F7FA" },
  amador_a: { label: "Amador A", order: 6, gradient: ["#2B2B2E", "#0E0E10"], textOnCard: "#F5F7FA" },
  qualifier: { label: "Qualifier", order: 7, gradient: ["#D4AF37", "#8C6D1F"], textOnCard: "#151107" },
};

export const orderedCategories: CategoryKey[] = (
  Object.entries(categoryStyles) as [CategoryKey, CategoryStyle][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key]) => key);
