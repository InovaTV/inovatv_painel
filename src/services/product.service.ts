import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  asset_folder: string;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Product;
}

export async function resolveProductAssetFolder(
  productId: string,
  newProductName?: string
): Promise<string> {
  if (productId === "__new__") {
    if (!newProductName?.trim()) {
      throw new Error("Nome do novo produto é obrigatório.");
    }

    const product = await createProduct(newProductName.trim());
    return product.asset_folder;
  }

  const product = await getProduct(productId);
  return product.asset_folder;
}

export async function createProduct(name: string): Promise<Product> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({ name, asset_folder: slugify(name) })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as Product;
}
