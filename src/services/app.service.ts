import { createClient } from "@/lib/supabase/server";
import { storage } from "@/lib/storage/provider";

export interface AppData {
  name: string;
  slug: string;
  version: string;
  platform: string;
  description: string;
  display_order: number;
  is_active: boolean;
  asset_folder: string;
}

export interface App extends AppData {
  id: string;
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

export async function uploadAppAsset(app: App, type: AssetType, file: File): Promise<string> {
  const config = ASSET_CONFIG[type];

  if (file.size > config.maxBytes) {
    throw new Error(
      `Arquivo muito grande para ${type}: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo ${config.maxBytes / 1024 / 1024}MB).`
    );
  }

  const path = `apps/${app.asset_folder}/${app.platform}/${config.folder}/${config.filename}`;
  const data = Buffer.from(await file.arrayBuffer());

  await storage.replace({ path, data });

  const supabase = await createClient();

  const { error } = await supabase
    .from("apps")
    .update({ [config.column]: path })
    .eq("id", app.id);

  if (error) {
    console.error(error);
    throw error;
  }

  return path;
}

export async function getApps(): Promise<App[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .order("display_order", {
      ascending: true,
    });

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

export async function createApp(
  app: AppData
): Promise<App> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apps")
    .insert({
      name: app.name,
      slug: app.slug,
      version: app.version,
      platform: app.platform,
      description: app.description,
      display_order: app.display_order,
      is_active: app.is_active,
      asset_folder: app.asset_folder,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as App;
}

export async function updateApp(
  id: string,
  app: AppData
): Promise<App> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apps")
    .update({
      name: app.name,
      slug: app.slug,
      version: app.version,
      platform: app.platform,
      description: app.description,
      display_order: app.display_order,
      is_active: app.is_active,
      asset_folder: app.asset_folder,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as App;
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
