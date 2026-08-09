import { createClient } from "@/lib/supabase/server";

import {
  BANNER_CATEGORIES,
  BANNER_ACTION_TYPES,
  type BannerCategory,
  type BannerActionType,
} from "@/lib/banner-constants";

export type { BannerCategory, BannerActionType } from "@/lib/banner-constants";
export {
  BANNER_CATEGORIES,
  BANNER_CATEGORY_LABELS,
  BANNER_ACTION_TYPES,
  BANNER_ACTION_TYPE_LABELS,
} from "@/lib/banner-constants";

// Mesmo padrão de AppActionState/AppValidationError em app.service.ts.
export interface BannerActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export class BannerValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super("Dados do banner inválidos.");
    this.name = "BannerValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const URL_PATTERN = /^https?:\/\/.+/i;

function validateBannerFields(banner: BannerData): Record<string, string> {
  const errors: Record<string, string> = {};

  const title = banner.title.trim();

  if (!title) {
    errors.title = "Título é obrigatório.";
  } else if (title.length < 2) {
    errors.title = "Título deve ter pelo menos 2 caracteres.";
  }

  if (!BANNER_CATEGORIES.includes(banner.category)) {
    errors.category = "Categoria é obrigatória.";
  }

  if (!BANNER_ACTION_TYPES.includes(banner.action_type)) {
    errors.action_type = "Tipo de ação inválido.";
  }

  if (banner.action_type !== "none") {
    const target = banner.action_target?.trim();

    if (!target) {
      errors.action_target =
        banner.action_type === "app"
          ? "Selecione um aplicativo."
          : "URL é obrigatória.";
    } else if (banner.action_type === "url" && !URL_PATTERN.test(target)) {
      errors.action_target = "URL inválida (deve começar com http:// ou https://).";
    }
  }

  return errors;
}

export interface BannerData {
  title: string;
  subtitle: string;
  category: BannerCategory;
  action_type: BannerActionType;
  action_target: string | null;
  is_active: boolean;
}

export interface Banner extends BannerData {
  id: string;
  created_at: string;
  updated_at: string;
  display_order: number;
  image_path: string | null;
  /** Legado, propósito ainda não decidido (ver diagnóstico da Fase 3) — não
   * escrito por esta camada, só lido/preservado. */
  app_slug: string | null;
}

export const BANNERS_PAGE_SIZE = 10;

export interface GetBannersOptions {
  /** Filtra por título (case-insensitive, substring) — vazio/ausente retorna tudo. */
  q?: string;
  /** Página 1-based — vazio/ausente retorna a primeira página. */
  page?: number;
}

export interface PagedBanners {
  banners: Banner[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getBanners(options: GetBannersOptions = {}): Promise<PagedBanners> {
  const supabase = await createClient();

  let countQuery = supabase
    .from("banners")
    .select("*", { count: "exact", head: true });

  if (options.q) {
    countQuery = countQuery.ilike("title", `%${options.q}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error(countError);
    throw countError;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / BANNERS_PAGE_SIZE));
  const page = options.page && options.page > 0 ? Math.min(options.page, totalPages) : 1;
  const from = (page - 1) * BANNERS_PAGE_SIZE;
  const to = from + BANNERS_PAGE_SIZE - 1;

  let query = supabase
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false })
    .range(from, to);

  if (options.q) {
    query = query.ilike("title", `%${options.q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw error;
  }

  return {
    banners: (data ?? []) as Banner[],
    total,
    page,
    pageSize: BANNERS_PAGE_SIZE,
  };
}

export async function getBanner(id: string): Promise<Banner> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Banner;
}

async function getNextDisplayOrder(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("banners")
    .select("display_order")
    .order("display_order", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  return (data?.display_order ?? 0) + 1;
}

// action_target sempre null quando action_type é 'none' — mesma regra do
// CHECK banners_action_target_consistency, replicada aqui para dar erro
// amigável de validação antes de bater no banco (e para nunca depender só
// do cliente ter limpado o campo corretamente).
function normalizeActionTarget(banner: BannerData): string | null {
  if (banner.action_type === "none") {
    return null;
  }

  return banner.action_target?.trim() || null;
}

export async function createBanner(banner: BannerData): Promise<Banner> {
  const supabase = await createClient();
  const fieldErrors = validateBannerFields(banner);

  if (Object.keys(fieldErrors).length > 0) {
    throw new BannerValidationError(fieldErrors);
  }

  const display_order = await getNextDisplayOrder();

  const { data, error } = await supabase
    .from("banners")
    .insert({
      title: banner.title.trim(),
      subtitle: banner.subtitle.trim() || null,
      category: banner.category,
      action_type: banner.action_type,
      action_target: normalizeActionTarget(banner),
      is_active: banner.is_active,
      display_order,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Banner;
}

export async function updateBanner(id: string, banner: BannerData): Promise<Banner> {
  const supabase = await createClient();
  const fieldErrors = validateBannerFields(banner);

  if (Object.keys(fieldErrors).length > 0) {
    throw new BannerValidationError(fieldErrors);
  }

  const { data, error } = await supabase
    .from("banners")
    .update({
      title: banner.title.trim(),
      subtitle: banner.subtitle.trim() || null,
      category: banner.category,
      action_type: banner.action_type,
      action_target: normalizeActionTarget(banner),
      is_active: banner.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Banner;
}

export async function setBannerActive(id: string, is_active: boolean): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("banners")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export interface OrderedBanner {
  id: string;
  display_order: number;
}

export async function swapDisplayOrder(a: OrderedBanner, b: OrderedBanner): Promise<void> {
  const supabase = await createClient();

  const { error: errorA } = await supabase
    .from("banners")
    .update({ display_order: b.display_order })
    .eq("id", a.id);

  if (errorA) {
    console.error(errorA);
    throw errorA;
  }

  const { error: errorB } = await supabase
    .from("banners")
    .update({ display_order: a.display_order })
    .eq("id", b.id);

  if (errorB) {
    console.error(errorB);
    throw errorB;
  }
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
