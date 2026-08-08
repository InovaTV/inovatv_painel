"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { formatBytes, formatDate } from "@/lib/utils";

type AssetType = "apk" | "icon" | "banner";
type UploadState = "idle" | "uploading" | "done" | "error";

interface CurrentAsset {
  size: number;
  modifiedAt: string;
}

interface Props {
  appId: string;
  type: AssetType;
  label: string;
  accept: string;
  current?: CurrentAsset | null;
  previewUrl?: string | null;
}

export default function AssetUploadField({
  appId,
  type,
  label,
  accept,
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

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
    formData.append("type", type);
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

    xhr.open("POST", `/api/apps/${appId}/upload`);
    xhr.send(formData);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const busy = state === "uploading";

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {label}
        </span>

        {current && !busy && (
          <span className="text-xs text-muted-foreground">
            {formatBytes(current.size)} · {formatDate(new Date(current.modifiedAt))}
          </span>
        )}
      </div>

      {previewUrl && current && !busy && (
        // eslint-disable-next-line @next/next/no-img-element -- thumbnail vem de fora do domínio do app (Hostinger), sem next/image configurado para esse host
        <img
          src={`${previewUrl}?v=${encodeURIComponent(current.modifiedAt)}`}
          alt={`Preview de ${label}`}
          className="mt-2 h-16 w-16 rounded-md border object-cover"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={busy}
        onChange={handleFileChange}
        className="mt-2 block w-full text-sm disabled:cursor-not-allowed disabled:opacity-50"
      />

      {busy && (
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {stage} — {formatBytes(sentBytes)} / {formatBytes(totalBytes)} ({progress}%)
          </p>
        </div>
      )}

      {state === "done" && (
        <p className="mt-2 text-xs text-success">
          Enviado com sucesso.
        </p>
      )}

      {state === "error" && (
        <p className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
