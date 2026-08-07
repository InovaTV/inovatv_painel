"use server";

import { redirect } from "next/navigation";

import { createApp, AppValidationError, type AppActionState } from "@/services/app.service";
import { resolveProductAssetFolder } from "@/services/product.service";

export async function createAppAction(
  _prevState: AppActionState,
  formData: FormData
): Promise<AppActionState> {
  let asset_folder: string;

  try {
    asset_folder = await resolveProductAssetFolder(
      formData.get("product_id") as string,
      formData.get("new_product_name") as string | undefined
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Produto inválido.";
    return { fieldErrors: { new_product_name: message } };
  }

  let app;

  try {
    app = await createApp({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      version: formData.get("version") as string,
      platform: formData.get("platform") as string,
      description: formData.get("description") as string,
      is_active: formData.get("is_active") === "true",
      asset_folder,
    });
  } catch (error) {
    if (error instanceof AppValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error(error);
    return { error: "Não foi possível criar o aplicativo. Tente novamente." };
  }

  redirect(`/apps/${app.id}/editar`);
}
