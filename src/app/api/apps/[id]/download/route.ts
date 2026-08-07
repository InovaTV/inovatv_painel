import { NextResponse } from "next/server";

import { getApp } from "@/services/app.service";
import { storage } from "@/lib/storage/provider";

// Redireciona para a URL pública do APK em vez de servir o arquivo
// diretamente. Indireção proposital (ver ADR-016): mesmo sem lógica
// extra hoje, qualquer download de app passa por este endpoint — dá
// pra adicionar contagem de downloads, auditoria ou controle de
// acesso depois sem mudar o client.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await getApp(id);

  if (!app.storage_path) {
    return NextResponse.json(
      { error: "Nenhum APK enviado para este aplicativo." },
      { status: 404 }
    );
  }

  return NextResponse.redirect(storage.getPublicUrl(app.storage_path));
}
