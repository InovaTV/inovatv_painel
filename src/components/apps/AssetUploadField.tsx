"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AlertCircle, CheckCircle2, FileArchive, Upload } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatBytes, formatDate } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "done" | "error";

interface CurrentAsset {
  size: number;
  modifiedAt: string;
}

interface Props {
  /** Endpoint completo da rota de upload (ex.: `/api/apps/{id}/upload`) — cada chamador monta o próprio. */
  uploadUrl: string;
  /** Valor enviado no campo "type" do FormData — a rota de destino decide o que aceita. */
  formFieldType: string;
  label: string;
  accept: string;
  /** Legenda curta do tipo aceito, mostrada na dropzone (ex.: ".apk", "PNG, JPG"). */
  acceptCaption: string;
  /** Proporção do preview quando há imagem — "video" (16:9, object-cover) para banners/composições horizontais, "square" (object-contain) para ícones/logos. */
  previewAspect: "square" | "video";
  current?: CurrentAsset | null;
  previewUrl?: string | null;
}

export default function AssetUploadField({
  uploadUrl,
  formFieldType,
  label,
  accept,
  acceptCaption,
  previewAspect,
  current,
  previewUrl,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>("idle");
  const [stage, setStage] = useState("");
  const [progress, setProgress] = useState(0);
  const [sentBytes, setSentBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      upload(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!busy) {
      setIsDraggingOver(true);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDraggingOver(false);

    if (busy) return;

    const file = e.dataTransfer.files?.[0];

    if (file) {
      upload(file);
    }
  }

  function upload(file: File) {
    setState("uploading");
    setError(null);
    setProgress(0);
    setSentBytes(0);
    setTotalBytes(file.size);
    setStage("Enviando arquivo...");

    const formData = new FormData();
    formData.append("type", formFieldType);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    let parsedLength = 0;
    let finished = false;

    // A resposta é ndjson (uma linha de JSON por evento) enquanto o
    // servidor sobe o arquivo pro armazenamento remoto — sem isso a barra
    // fica travada em "processando" até a requisição inteira terminar, já
    // que essa etapa (servidor → FTP) é a mais lenta e não tem como o
    // XMLHttpRequest.upload enxergar (ele só cobre navegador → servidor).
    function consumeStream() {
      const text: string = xhr.responseText.slice(parsedLength);
      if (!text) return;

      // A última "linha" pode estar incompleta (chunk cortado no meio) —
      // slice(0, -1) sempre descarta ela, sobre ou não um "\n" final.
      const complete = text.split("\n").slice(0, -1);
      const consumedChars = complete.reduce((sum, line) => sum + line.length + 1, 0);
      parsedLength += consumedChars;

      for (const line of complete) {
        if (!line) continue;

        let event: {
          stage?: string;
          sentBytes?: number;
          totalBytes?: number;
          done?: boolean;
          path?: string;
          error?: string;
        };

        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }

        if (event.stage === "storage" && typeof event.sentBytes === "number") {
          const total = event.totalBytes ?? file.size;
          setSentBytes(event.sentBytes);
          setTotalBytes(total);
          setProgress(total ? Math.round((event.sentBytes / total) * 100) : 100);
          setStage("Enviando para o armazenamento...");
        } else if (event.done) {
          finished = true;

          if (event.error) {
            setState("error");
            setError(event.error);
          } else {
            setState("done");
            setStage("Concluído");
            router.refresh();
          }
        }
      }
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setSentBytes(event.loaded);
        setTotalBytes(event.total);
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.upload.addEventListener("load", () => {
      setStage("Enviando para o armazenamento...");
      setProgress(0);
      setSentBytes(0);
    });

    xhr.addEventListener("progress", consumeStream);

    xhr.addEventListener("load", () => {
      consumeStream();

      if (finished) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        // Stream terminou sem um evento "done" — não deveria acontecer,
        // mas evita deixar a UI travada em "uploading" pra sempre.
        setState("done");
        setStage("Concluído");
        router.refresh();
      } else {
        setState("error");

        try {
          const body = JSON.parse(xhr.responseText);
          setError(body?.error ?? "Falha no upload.");
        } catch {
          setError("Falha no upload.");
        }
      }
    });

    xhr.addEventListener("error", () => {
      setState("error");
      setError("Erro de conexão durante o upload.");
    });

    xhr.open("POST", uploadUrl);
    xhr.send(formData);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const busy = state === "uploading";

  return (
    <Card>
      <CardContent className="space-y-3">
        <span className="text-sm font-medium">
          {label}
        </span>

        {current && !busy && (
          previewUrl ? (
            <Card className="gap-0 overflow-hidden py-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail vem de fora do domínio do app (Hostinger), sem next/image configurado para esse host */}
              <img
                src={`${previewUrl}?v=${encodeURIComponent(current.modifiedAt)}`}
                alt={`Preview de ${label}`}
                className={
                  previewAspect === "video"
                    ? "aspect-video w-full object-cover"
                    : "aspect-square w-full bg-muted object-contain p-6"
                }
              />

              <CardContent className="border-t py-2">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatBytes(current.size)} · {formatDate(new Date(current.modifiedAt))}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileArchive className="size-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {label}
                </p>

                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatBytes(current.size)} · {formatDate(new Date(current.modifiedAt))}
                </p>
              </div>
            </div>
          )
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={busy}
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            busy
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-primary/50",
            isDraggingOver ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <Upload className="size-8 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Clique ou arraste o arquivo aqui
          </p>

          <p className="text-xs text-muted-foreground/70">
            {acceptCaption}
          </p>
        </div>

        {busy && (
          <div className="space-y-1">
            <Progress value={progress} />

            <p className="text-xs text-muted-foreground tabular-nums">
              {stage} — {formatBytes(sentBytes)} / {formatBytes(totalBytes)} ({progress}%)
            </p>
          </div>
        )}

        {state === "done" && (
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="size-3.5" />
            Enviado com sucesso.
          </p>
        )}

        {state === "error" && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
