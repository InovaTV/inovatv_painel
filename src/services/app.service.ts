import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage/provider";

// Erro de validação de negócio (formato de campo, slug duplicado etc.) —
// distinto de um erro de infraestrutura (Supabase fora do ar). Quem chama
// (Server Action) decide como mostrar cada um: fieldErrors vira mensagem por
// campo, outros erros viram uma mensagem genérica no topo do formulário.
export interface AppActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export class AppValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super("Dados do aplicativo inválidos.");
    this.name = "AppValidationError";
    this.fieldErrors = fieldErrors;
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// Aceita os formatos já usados nos apps reais (ex.: "1", "5", "012",
// "3.24.2", "4.19.1.00") — só dígitos e pontos, sem exigir semver estrito.
const VERSION_PATTERN = /^\d+(\.\d+)*$/;
const VALID_PLATFORMS = ["mobile", "tv"];

function validateAppFields(app: AppData): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = app.name.trim();
  const slug = app.slug.trim();
  const version = app.version.trim();

  if (!name) {
    errors.name = "Nome é obrigatório.";
  } else if (name.length < 2) {
    errors.name = "Nome deve ter pelo menos 2 caracteres.";
  }

  if (!slug) {
    errors.slug = "Slug é obrigatório.";
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Slug deve conter apenas letras minúsculas, números e hífen (ex.: unitv-mobile).";
  }

  if (!version) {
    errors.version = "Versão é obrigatória.";
  } else if (!VERSION_PATTERN.test(version)) {
    errors.version = "Versão deve conter apenas números e pontos (ex.: 3.24.2).";
  }

  if (!VALID_PLATFORMS.includes(app.platform)) {
    errors.platform = "Plataforma inválida.";
  }

  return errors;
}

// Rede de segurança para a corrida que a checagem isSlugTaken() sozinha não
// cobre: duas criações/edições simultâneas com o mesmo slug podem passar
// pela validação da aplicação ao mesmo tempo — quem perde a corrida esbarra
// na UNIQUE constraint do banco (apps_slug_key). Sem isso, a mensagem
// viraria um erro genérico em vez da mesma mensagem amigável de sempre.
function rethrowAsSlugConflict(error: { code?: string; message?: string }): never {
  if (error.code === "23505" && error.message?.includes("apps_slug_key")) {
    throw new AppValidationError({ slug: "Já existe um aplicativo com esse slug." });
  }

  console.error(error);
  throw error;
}

async function isSlugTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase.from("apps").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    console.error(error);
    throw error;
  }

  return (data?.length ?? 0) > 0;
}

export interface AppData {
  name: string;
  slug: string;
  version: string;
  platform: string;
  description: string;
  is_active: boolean;
  asset_folder: string;
}

export interface App extends AppData {
  id: string;
  display_order: number;
  storage_path: string | null;
  icon_path: string | null;
  banner_path: string | null;
}

export type AssetType = "apk" | "icon" | "banner";

interface AssetConfig {
  folder: string;
  filename: string;
  maxBytes: number;
  column: "storage_path" | "icon_path" | "banner_path";
}

// Nome e limite fixos por tipo — ver STORAGE.md. Adicionar "icon"/"banner"
// aqui é só isso; uploadAppAsset() já serve os três sem mudar nada mais.
const ASSET_CONFIG: Record<AssetType, AssetConfig> = {
  apk: { folder: "apk", filename: "app.apk", maxBytes: 300 * 1024 * 1024, column: "storage_path" },
  icon: { folder: "icon", filename: "icon.png", maxBytes: 5 * 1024 * 1024, column: "icon_path" },
  banner: { folder: "banner", filename: "banner.webp", maxBytes: 10 * 1024 * 1024, column: "banner_path" },
};

export async function uploadAppAsset(
  app: App,
  type: AssetType,
  file: File,
  onProgress?: (sentBytes: number) => void
): Promise<string> {
  const config = ASSET_CONFIG[type];

  if (file.size > config.maxBytes) {
    throw new Error(
      `Arquivo muito grande para ${type}: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo ${config.maxBytes / 1024 / 1024}MB).`
    );
  }

  const path = `apps/${app.asset_folder}/${app.platform}/${config.folder}/${config.filename}`;
  const startedAt = Date.now();
  const sizeMb = (file.size / 1024 / 1024).toFixed(2);

  const data = Buffer.from(await file.arrayBuffer());

  const replaceStartedAt = Date.now();
  await storage.replace({ path, data, onProgress });
  const replaceMs = Date.now() - replaceStartedAt;

  const supabase = await createClient();

  const { error } = await supabase
    .from("apps")
    .update({ [config.column]: path })
    .eq("id", app.id);

  if (error) {
    console.error(error);
    throw error;
  }

  console.log(
    `[upload] ${type} "${path}": ${sizeMb}MB — storage.replace() ${replaceMs}ms, total ${Date.now() - startedAt}ms`
  );

  return path;
}

export const APPS_PAGE_SIZE = 10;

export interface GetAppsOptions {
  /** Filtra por nome (case-insensitive, substring) — vazio/ausente retorna tudo. */
  q?: string;
  /** Página 1-based — vazio/ausente retorna a primeira página. */
  page?: number;
}

export interface PagedApps {
  apps: App[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getApps(options: GetAppsOptions = {}): Promise<PagedApps> {
  const supabase = await createClient();

  // PostgREST erra com PGRST103 ("Requested range not satisfiable") quando o
  // offset do .range() é >= à contagem real (mas não quando ambos são 0) —
  // por isso a contagem vem numa query separada, usada para grampear a
  // página antes de montar o range, em vez de arriscar um offset inválido.
  let countQuery = supabase
    .from("apps")
    .select("*", { count: "exact", head: true });

  if (options.q) {
    countQuery = countQuery.ilike("name", `%${options.q}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error(countError);
    throw countError;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / APPS_PAGE_SIZE));
  const page = options.page && options.page > 0 ? Math.min(options.page, totalPages) : 1;
  const from = (page - 1) * APPS_PAGE_SIZE;
  const to = from + APPS_PAGE_SIZE - 1;

  let query = supabase
    .from("apps")
    .select("*")
    .order("display_order", {
      ascending: true,
    })
    .range(from, to);

  if (options.q) {
    query = query.ilike("name", `%${options.q}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw error;
  }

  return {
    apps: (data ?? []) as App[],
    total,
    page,
    pageSize: APPS_PAGE_SIZE,
  };
}

// Sem paginação, de propósito — uso é popular um <Select> (ex.: escolher o
// app-alvo de um banner), não uma listagem. getApps() fica reservado para a
// tabela paginada de Aplicativos.
export async function getAllApps(): Promise<App[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []) as App[];
}

export async function getApp(id: string): Promise<App> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as App;
}

async function getNextDisplayOrder(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apps")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw error;
  }

  return (data?.display_order ?? 0) + 1;
}

export async function createApp(
  app: AppData
): Promise<App> {
  const supabase = await createClient();
  const fieldErrors = validateAppFields(app);
  const slug = app.slug.trim();

  if (!fieldErrors.slug && (await isSlugTaken(supabase, slug))) {
    fieldErrors.slug = "Já existe um aplicativo com esse slug.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppValidationError(fieldErrors);
  }

  const display_order = await getNextDisplayOrder();

  const { data, error } = await supabase
    .from("apps")
    .insert({
      name: app.name.trim(),
      slug,
      version: app.version.trim(),
      platform: app.platform,
      description: app.description,
      display_order,
      is_active: app.is_active,
      asset_folder: app.asset_folder,
    })
    .select()
    .single();

  if (error) {
    rethrowAsSlugConflict(error);
  }

  return data as App;
}

export async function updateApp(
  id: string,
  app: AppData
): Promise<App> {
  const supabase = await createClient();
  const fieldErrors = validateAppFields(app);
  const slug = app.slug.trim();

  if (!fieldErrors.slug && (await isSlugTaken(supabase, slug, id))) {
    fieldErrors.slug = "Já existe um aplicativo com esse slug.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new AppValidationError(fieldErrors);
  }

  const { data, error } = await supabase
    .from("apps")
    .update({
      name: app.name.trim(),
      slug,
      version: app.version.trim(),
      platform: app.platform,
      description: app.description,
      is_active: app.is_active,
      asset_folder: app.asset_folder,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    rethrowAsSlugConflict(error);
  }

  return data as App;
}

export async function setAppActive(
  id: string,
  is_active: boolean
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("apps")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

export interface OrderedApp {
  id: string;
  display_order: number;
}

// Primitiva de reordenação: troca o display_order entre dois apps. Não sabe
// nem precisa saber quem é "vizinho" — quem decide isso é quem chama (hoje,
// as setas ↑/↓; no futuro, um drag-and-drop poderia calcular o par a trocar
// de outro jeito sem mudar esta função).
export async function swapDisplayOrder(a: OrderedApp, b: OrderedApp): Promise<void> {
  const supabase = await createClient();

  const { error: errorA } = await supabase
    .from("apps")
    .update({ display_order: b.display_order })
    .eq("id", a.id);

  if (errorA) {
    console.error(errorA);
    throw errorA;
  }

  const { error: errorB } = await supabase
    .from("apps")
    .update({ display_order: a.display_order })
    .eq("id", b.id);

  if (errorB) {
    console.error(errorB);
    throw errorB;
  }
}

export async function deleteApp(
  id: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("apps")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
