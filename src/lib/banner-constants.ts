// Vocabulário controlado de Banners (categoria/tipo de ação) — extraído de
// banner.service.ts porque este arquivo precisa ser importável por
// Client Components (BannerForm, BannersTableRow) sem puxar junto o
// createClient() de banner.service.ts (que depende de next/headers,
// server-only). Mesmos valores dos CHECKs de banco (migração 20260808200000).

export type BannerCategory =
  | "home"
  | "promocao"
  | "novidade"
  | "black_friday"
  | "destaque";

export type BannerActionType = "none" | "app" | "url";

export const BANNER_CATEGORIES: BannerCategory[] = [
  "home",
  "promocao",
  "novidade",
  "black_friday",
  "destaque",
];

export const BANNER_CATEGORY_LABELS: Record<BannerCategory, string> = {
  home: "Home",
  promocao: "Promoção",
  novidade: "Novidade",
  black_friday: "Black Friday",
  destaque: "Destaque",
};

export const BANNER_ACTION_TYPES: BannerActionType[] = ["none", "app", "url"];

export const BANNER_ACTION_TYPE_LABELS: Record<BannerActionType, string> = {
  none: "Nenhuma",
  app: "Abrir aplicativo",
  url: "Abrir URL",
};
