-- Fase 3 da auditoria de banco (2026-08-07): evolução de schema —
-- `updated_at` automático em `apps`.
--
-- Estado verificado antes de escrever esta migração: `apps` hoje só tem
-- `created_at` (preenchido na criação, nunca atualizado). Não existe
-- nenhuma função/trigger de `updated_at` em `public` no projeto ainda
-- (só a interna `storage.update_updated_at_column`, do schema gerenciado
-- pelo Supabase, que não é apropriada para reusar aqui).

-- 1. Nova coluna, obrigatória, com default `now()` — cobre tanto os
--    inserts futuros (sobrescrito pelo trigger em todo update) quanto o
--    valor inicial das linhas já existentes.
alter table public.apps
  add column updated_at timestamptz not null default now();

-- 2. Backfill: linhas existentes nunca foram "atualizadas" desde que
--    foram criadas, então `updated_at` começa igual a `created_at` em vez
--    de "agora" (o timestamp desta migração), que sugeriria falsamente
--    uma edição que não aconteceu.
update public.apps
  set updated_at = created_at;

-- 3. Função de trigger — só atualiza `updated_at`, não interfere em mais
--    nada da linha.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. Trigger: dispara em todo UPDATE em `apps`, inclusive updates feitos
--    fora da aplicação (SQL direto, outra migração, etc.) — mesmo
--    princípio das fases 1 e 2: a garantia vive no banco, não só na
--    camada de aplicação.
create trigger apps_set_updated_at
  before update on public.apps
  for each row
  execute function public.set_updated_at();
