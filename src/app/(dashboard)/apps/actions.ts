"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteApp,
  setAppActive,
  swapDisplayOrder,
  updateApp,
  AppValidationError,
  type AppActionState,
  type OrderedApp,
} from "@/services/app.service";
import { resolveProductAssetFolder } from "@/services/product.service";

export async function deleteAppAction(id: string) {
  await deleteApp(id);

  revalidatePath("/apps");
}

export async function toggleAppStatusAction(id: string, is_active: boolean) {
  await setAppActive(id, is_active);

  revalidatePath("/apps");
}

export async function swapAppOrderAction(a: OrderedApp, b: OrderedApp) {
  await swapDisplayOrder(a, b);

  revalidatePath("/apps");
}

export async function updateAppAction(
  id: string,
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

  try {
    await updateApp(id, {
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
    return { error: "Não foi possível salvar as alterações. Tente novamente." };
  }

  revalidatePath("/apps");
  revalidatePath(`/apps/${id}/editar`);
  redirect("/apps");
}
