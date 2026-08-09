"use server";

import { redirect } from "next/navigation";

import {
  createBanner,
  BannerValidationError,
  type BannerActionState,
  type BannerCategory,
  type BannerActionType,
} from "@/services/banner.service";

export async function createBannerAction(
  _prevState: BannerActionState,
  formData: FormData
): Promise<BannerActionState> {
  try {
    await createBanner({
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
    return { error: "Não foi possível criar o banner. Tente novamente." };
  }

  redirect("/banners");
}
