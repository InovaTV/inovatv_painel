import { createClient } from "@/lib/supabase/server";

export interface AppData {
  name: string;
  slug: string;
  version: string;
  platform: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface App extends AppData {
  id: string;
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
