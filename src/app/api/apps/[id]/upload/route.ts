import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getApp, uploadAppAsset, type AssetType } from "@/services/app.service";

const VALID_TYPES: AssetType[] = ["apk", "icon", "banner"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const type = formData.get("type");
  const file = formData.get("file");

  if (typeof type !== "string" || !VALID_TYPES.includes(type as AssetType)) {
    return NextResponse.json({ error: "Tipo de arquivo inválido." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  try {
    const app = await getApp(id);
    const path = await uploadAppAsset(app, type as AssetType, file);

    revalidatePath(`/apps/${id}/editar`);
    revalidatePath("/apps");

    return NextResponse.json({ path });
  } catch (error) {
    console.error(error);

    const message = error instanceof Error ? error.message : "Falha no upload.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
