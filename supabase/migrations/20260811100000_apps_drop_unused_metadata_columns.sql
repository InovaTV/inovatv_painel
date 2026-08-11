-- Limpeza do Database (2026-08-11): remove 3 colunas nunca usadas da
-- tabela `apps` — `min_android_version`, `current_version_code`,
-- `requires_login`.
--
-- Contexto: essas colunas não são modeladas em `AppData`/`App`
-- (`src/services/app.service.ts`), não são lidas nem escritas por
-- nenhuma Server Action, não aparecem em nenhuma UI do painel, e em
-- todas as linhas reais do banco estavam sempre NULL/false — puro dado
-- morto de schema, sem relação com o legado `download_url`/
-- `downloader_code`/`storage_folder` já removido em
-- 20260807190000_apps_drop_legacy_download_columns.sql.
--
-- Verificado antes desta migração: nenhuma FK, índice, trigger ou RLS
-- policy referencia essas 3 colunas.

alter table public.apps
  drop column min_android_version,
  drop column current_version_code,
  drop column requires_login;
