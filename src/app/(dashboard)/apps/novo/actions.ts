"use server";

import { createApp } from "@/services/app.service";
import { redirect } from "next/navigation";

export async function createAppAction(formData: FormData) {
  await createApp({
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    version: formData.get("version") as string,
    platform: formData.get("platform") as string,
    description: formData.get("description") as string,
    display_order: Number(formData.get("display_order")),
    is_active: formData.get("is_active") === "true",
  });

  redirect("/apps");
}