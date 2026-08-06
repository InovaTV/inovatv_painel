// Cria o bucket "apps" no Supabase Storage (ver STORAGE.md / ADR-007).
// Idempotente: não falha se o bucket já existir.
//
// Uso (precisa de SUPABASE_SERVICE_ROLE_KEY — ver ADR-009, só infra):
//   node --env-file=.env.local scripts/create-storage-bucket.mjs

import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "apps";
// Sem fileSizeLimit no bucket: o projeto (plano Free) tem um teto global de
// 50MB (Project Settings → Storage), abaixo do qual qualquer valor de bucket
// é irrelevante. Ver STORAGE.md — bloqueado até decisão sobre plano pago.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: buckets, error: listError } = await supabase.storage.listBuckets();

if (listError) {
  console.error("Erro ao listar buckets:", listError);
  process.exit(1);
}

if (buckets.some((bucket) => bucket.name === BUCKET_NAME)) {
  console.log(`Bucket "${BUCKET_NAME}" já existe — nada a fazer.`);
  process.exit(0);
}

const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
  public: false,
});

if (error) {
  console.error("Erro ao criar bucket:", error);
  process.exit(1);
}

console.log(`Bucket "${BUCKET_NAME}" criado:`, data);
