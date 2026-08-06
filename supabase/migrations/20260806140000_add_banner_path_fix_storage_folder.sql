-- Migração: adiciona banner_path e corrige dado sujo em storage_folder
--
-- Contexto: a tabela `apps` já tem storage_path (APK), icon_path (Ícone),
-- asset_folder (produto) e storage_folder (raiz física) com dados reais de
-- produção (UniTV Mobile, UniTV TV Box). Decisão explícita do usuário:
-- NÃO renomear/reestruturar essas colunas, apenas adicionar o que falta
-- (banner_path) e corrigir o bug de dado em storage_folder.
--
-- Esta migração precisa ser aplicada manualmente (SQL Editor do Supabase
-- ou `supabase db push`) — este ambiente só tem a chave anônima
-- (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY), que não executa DDL.

-- 1. Nova coluna para o banner promocional do app.
alter table public.apps
  add column if not exists banner_path text;

comment on column public.apps.banner_path is
  'Caminho do arquivo de banner do app dentro do bucket privado "apps" do Supabase Storage (ex.: unitv/mobile/banner/banner.webp). Nulo até o primeiro upload.';

-- 2. Corrige bug de dado: storage_folder foi salvo com o nome do próprio
--    campo colado no valor ("storage_folder = <path>") em vez de só <path>.
--    Confirmado nas 2 linhas reais (unitv-mobile, unitv-tv); WHERE garante
--    que a migração é idempotente (não afeta linhas já corrigidas ou nulas).
update public.apps
set storage_folder = regexp_replace(storage_folder, '^storage_folder\s*=\s*', '')
where storage_folder ~ '^storage_folder\s*=\s*';
