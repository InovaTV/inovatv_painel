-- Migração: corrige o comentário da coluna banner_path
--
-- Contexto: a migração 20260806140000_add_banner_path_fix_storage_folder.sql
-- criou banner_path com um comentário descrevendo o Supabase Storage
-- (bucket privado "apps") como destino do arquivo. Isso já estava
-- desatualizado desde a ADR-011 (2026-08-06, pivô para Hostinger) e
-- ficou definitivamente incorreto em 2026-08-11, quando os buckets
-- apps/apks do Supabase Storage foram excluídos por completo (ver
-- MAPA_DA_INFRAESTRUTURA_E_FONTES.md, inovatv_central).
--
-- Não altera a migração original (histórico não se reescreve) — só
-- atualiza o comentário da coluna para descrever a realidade atual.
-- A coluna em si e seu uso não mudam.

comment on column public.apps.banner_path is
  'Caminho relativo do arquivo de banner do app dentro de assets/ na Hostinger (ex.: apps/unitv/mobile/banner/banner.webp). Nulo até o primeiro upload.';
