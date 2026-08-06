"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteApp, updateApp } from "@/services/app.service";
import { resolveProductAssetFolder } from "@/services/product.service";

export async function deleteAppAction(id: string) {
  await deleteApp(id);

  revalidatePath("/apps");
}

export async function updateAppAction(id: string, formData: FormData) {
  const asset_folder = await resolveProductAssetFolder(
    formData.get("product_id") as string,
    formData.get("new_product_name") as string | undefined
  );

  await updateApp(id, {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    version: formData.get("version") as string,
    platform: formData.get("platform") as string,
    description: formData.get("description") as string,
    is_active: formData.get("is_active") === "true",
    asset_folder,
  });

  revalidatePath("/apps");
  revalidatePath(`/apps/${id}/editar`);
  redirect("/apps");
}
