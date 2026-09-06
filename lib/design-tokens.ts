/**
 * Arquitetura central de design tokens do CAF.
 * Cores oficiais aplicadas a partir da identidade visual enviada.
 * Fonte ainda é PLACEHOLDER (Poppins) até o arquivo da "Fb Sports" chegar.
 */

export const colors = {
  background: "#0B0F14",
  surface: "#141A21",
  primary: "#11378E", // azul oficial CAF
  accent: "#EBBA36", // dourado/amarelo oficial CAF
  brandGreen: "#0C511A", // verde oficial CAF
  textPrimary: "#F5F7FA",
  textMuted: "#8B98A5",
  danger: "#B3261E",
  success: "#0C511A", // reaproveita o verde oficial como "ativo"
} as const;

export const fonts = {
  display: "var(--font-display)", // TODO: trocar por Fb Sports quando o arquivo chegar
  body: "var(--font-body)", // TODO: trocar por Fb Sports quando o arquivo chegar
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
  premium: "0 4px 24px rgba(235,186,54,0.3)", // dourado oficial
} as const;

export type CategoryKey =
  | "pre_estreante" // reservado para uso futuro — nenhuma categoria usa ainda
  | "estreante"
  | "iniciante"
  | "intermediario" // fora da progressão principal — só usada em atribuição via torneio/recurso
  | "amador_c"
  | "amador_b"
  | "qualifier";

interface CategoryStyle {
  label: string;
  order: number;
  gradient: [string, string];
  textOnCard: string;
}

// Progressão inspirada em faixas de artes marciais: branca (reservada) → amarela →
// verde → azul → roxa → preta. Intermediário fica fora da progressão principal do
// atleta (categoria só de torneio), com um tom neutro próprio.
export const categoryStyles: Record<CategoryKey, CategoryStyle> = {
  pre_estreante: { label: "Pré-estreante", order: 0, gradient: ["#F2F3F5", "#D6DADF"], textOnCard: "#12161A" },
  estreante: { label: "Estreante", order: 1, gradient: ["#D9B54B", "#8F6F1E"], textOnCard: "#151107" },
  iniciante: { label: "Iniciante", order: 2, gradient: ["#2F7D52", "#0C511A"], textOnCard: "#F5F7FA" },
  intermediario: { label: "Intermediário", order: 3, gradient: ["#5A6472", "#2C3138"], textOnCard: "#F5F7FA" },
  amador_c: { label: "Amador C", order: 4, gradient: ["#2C5F7C", "#123247"], textOnCard: "#F5F7FA" },
  amador_b: { label: "Amador B", order: 5, gradient: ["#6B3FA0", "#331D42"], textOnCard: "#F5F7FA" },
  qualifier: { label: "Qualifier", order: 6, gradient: ["#2B2B2E", "#050505"], textOnCard: "#EBBA36" },
};

export const orderedCategories: CategoryKey[] = (
  Object.entries(categoryStyles) as [CategoryKey, CategoryStyle][]
)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key]) => key);
