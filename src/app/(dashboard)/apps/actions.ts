"use server";

import { revalidatePath } from "next/cache";

import { deleteApp } from "@/services/app.service";

export async function deleteAppAction(id: string) {
  await deleteApp(id);

  revalidatePath("/apps");
}
