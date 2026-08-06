"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteApp, updateApp } from "@/services/app.service";

export async function deleteAppAction(id: string) {
  await deleteApp(id);

  revalidatePath("/apps");
}

export async function updateAppAction(id: string, formData: FormData) {
  await updateApp(id, {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    version: formData.get("version") as string,
    platform: formData.get("platform") as string,
    description: formData.get("description") as string,
    display_order: Number(formData.get("display_order")),
    is_active: formData.get("is_active") === "true",
  });

  revalidatePath("/apps");
  redirect("/apps");
}
