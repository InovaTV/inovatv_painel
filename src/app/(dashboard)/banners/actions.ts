"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteBanner,
  setBannerActive,
  swapDisplayOrder,
  updateBanner,
  BannerValidationError,
  type BannerActionState,
  type BannerCategory,
  type BannerActionType,
  type OrderedBanner,
} from "@/services/banner.service";

export async function deleteBannerAction(id: string) {
  await deleteBanner(id);

  revalidatePath("/banners");
}

export async function toggleBannerStatusAction(id: string, is_active: boolean) {
  await setBannerActive(id, is_active);

  revalidatePath("/banners");
}

export async function swapBannerOrderAction(a: OrderedBanner, b: OrderedBanner) {
  await swapDisplayOrder(a, b);

  revalidatePath("/banners");
}

export async function updateBannerAction(
  id: string,
  _prevState: BannerActionState,
  formData: FormData
): Promise<BannerActionState> {
  try {
    await updateBanner(id, {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      category: formData.get("category") as BannerCategory,
      action_type: formData.get("action_type") as BannerActionType,
      action_target: formData.get("action_target") as string | null,
      is_active: formData.get("is_active") === "true",
    });
  } catch (error) {
    if (error instanceof BannerValidationError) {
      return { fieldErrors: error.fieldErrors };
    }

    console.error(error);
    return { error: "Não foi possível salvar as alterações. Tente novamente." };
  }

  revalidatePath("/banners");
  revalidatePath(`/banners/${id}/editar`);
  redirect("/banners");
}
