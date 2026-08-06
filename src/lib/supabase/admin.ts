import { createClient } from "@supabase/supabase-js";

/**
 * Client com service_role — restrito a infraestrutura (Storage, buckets,
 * limpeza, migrações de dados). Nunca usar para CRUD do painel: ver ADR-009.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
