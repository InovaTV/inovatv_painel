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

  // Resposta em streaming (ndjson, uma linha de JSON por evento): o upload
  // navegador→servidor já tem progresso via XMLHttpRequest.upload no
  // cliente, mas a etapa servidor→armazenamento remoto (a mais lenta, FTP
  // até a Hostinger) acontece inteira dentro desta única requisição — sem
  // isso o cliente só vê "processando" parado até o fim. Erros também vêm
  // como evento no corpo (não como status HTTP), porque depois que o stream
  // começa a resposta já tem status 200 fixado.
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        const app = await getApp(id);
        const path = await uploadAppAsset(app, type as AssetType, file, (sentBytes) => {
          send({ stage: "storage", sentBytes, totalBytes: file.size });
        });

        revalidatePath(`/apps/${id}/editar`);
        revalidatePath("/apps");

        send({ done: true, path });
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Falha no upload.";
        send({ done: true, error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
