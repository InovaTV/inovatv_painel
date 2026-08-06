"use server";

import { redirect } from "next/navigation";

import { createApp } from "@/services/app.service";
import { resolveProductAssetFolder } from "@/services/product.service";

export async function createAppAction(formData: FormData) {
  const asset_folder = await resolveProductAssetFolder(
    formData.get("product_id") as string,
    formData.get("new_product_name") as string | undefined
  );

  const app = await createApp({
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    version: formData.get("version") as string,
    platform: formData.get("platform") as string,
    description: formData.get("description") as string,
    is_active: formData.get("is_active") === "true",
    asset_folder,
  });

  redirect(`/apps/${app.id}/editar`);
}
