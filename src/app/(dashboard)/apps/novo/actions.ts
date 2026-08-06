"use server";

import { redirect } from "next/navigation";

import { createApp, uploadAppAsset } from "@/services/app.service";

export async function createAppAction(formData: FormData) {
  const app = await createApp({
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    version: formData.get("version") as string,
    platform: formData.get("platform") as string,
    description: formData.get("description") as string,
    display_order: Number(formData.get("display_order")),
    is_active: formData.get("is_active") === "true",
    asset_folder: formData.get("asset_folder") as string,
  });

  const apk = formData.get("apk") as File | null;

  if (apk && apk.size > 0) {
    await uploadAppAsset(app, "apk", apk);
  }

  redirect("/apps");
}
