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
}

export default function AssetUploadField({
  appId,
  type,
  label,
  accept,
  current,
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

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setSentBytes(event.loaded);
        setTotalBytes(event.total);
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.upload.addEventListener("load", () => {
      setStage("Processando no servidor...");
      setProgress(100);
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
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
        <p className="mt-2 text-xs text-emerald-600">
          Enviado com sucesso.
        </p>
      )}

      {state === "error" && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
