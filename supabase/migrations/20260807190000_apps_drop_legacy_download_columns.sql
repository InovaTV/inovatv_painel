-- Fase 4 da auditoria de banco (2026-08-07): limpeza — remove as 3
-- colunas legadas do sistema `inovatv.pro` (Projeto Downloads),
-- descontinuado desde a migração para o armazenamento em Hostinger.
--
-- Backup dos valores atuais das 3 colunas, tirado antes desta migração:
-- `supabase/backups/20260807_apps_legacy_columns_backup.csv`.
--
-- Contexto (ver ADR-020 para o detalhe completo): `download_url` e
-- `downloader_code` vêm do `inovatv.pro`, um site/serviço externo
-- anterior a este painel, que hospedava os APKs e gerava um link/código
-- de download próprio. `storage_folder` foi a primeira tentativa deste
-- projeto de representar onde o arquivo do app fica armazenado — antes
-- de `asset_folder` (ligado a `products`) virar o padrão real depois da
-- migração para a Hostinger (ADR-011). As 3 colunas pararam de ser
-- escritas pela aplicação faz tempo (`app.service.ts` não seta nenhuma
-- das três em `createApp`/`updateApp`) e não aparecem em nenhuma UI do
-- painel — puro dado morto mantido só por inércia do schema.

alter table public.apps
  drop column download_url,
  drop column downloader_code,
  drop column storage_folder;
