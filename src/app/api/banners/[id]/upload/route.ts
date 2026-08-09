import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getBanner, uploadBannerAsset } from "@/services/banner.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();

  const type = formData.get("type");
  const file = formData.get("file");

  if (type !== "image") {
    return NextResponse.json({ error: "Tipo de arquivo inválido." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  // Mesmo padrão de streaming ndjson de /api/apps/[id]/upload — a etapa
  // servidor → Hostinger é a mais lenta e não tem como o
  // XMLHttpRequest.upload enxergar (ele só cobre navegador → servidor).
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        const banner = await getBanner(id);
        const path = await uploadBannerAsset(banner, file, (sentBytes) => {
          send({ stage: "storage", sentBytes, totalBytes: file.size });
        });

        revalidatePath(`/banners/${id}/editar`);
        revalidatePath("/banners");

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
