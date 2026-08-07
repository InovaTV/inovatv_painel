-- Fase 2 da auditoria de banco (2026-08-07): integridade de `apps.slug`
-- e `apps.asset_folder`, alinhando o schema com regras já aplicadas hoje
-- só na camada de aplicação.
--
-- Pré-condições verificadas antes de escrever esta migração:
-- - Nenhum slug duplicado em `apps` (0 linhas em GROUP BY slug HAVING
--   count(*) > 1).
-- - Nenhum `apps.asset_folder` órfão (todos batem com um
--   `products.asset_folder` existente).
-- - Nenhum NULL em `apps.slug` nem `apps.asset_folder` hoje (count = 0
--   para os dois).

-- 1. slug: obrigatório e único. A aplicação (validateAppFields +
--    isSlugTaken em app.service.ts) já trata slug como obrigatório e
--    único — esta constraint fecha a mesma regra contra qualquer acesso
--    que não passe pela aplicação (e contra corrida entre duas criações
--    simultâneas, que a validação da aplicação sozinha não cobre).
alter table public.apps
  alter column slug set not null;

alter table public.apps
  add constraint apps_slug_key unique (slug);

-- 2. asset_folder: obrigatório e com integridade referencial real contra
--    `products.asset_folder` (hoje só uma convenção de código em
--    resolveProductAssetFolder). RESTRICT nos dois lados porque
--    asset_folder é literalmente um componente do caminho físico de
--    armazenamento na Hostinger (apps/{asset_folder}/{platform}/...) —
--    um CASCADE atualizaria o valor no banco mas nunca moveria os
--    arquivos já enviados, deixando o caminho salvo divergente do
--    caminho real no FTP. RESTRICT força uma decisão explícita antes de
--    apagar/renomear um produto que já tenha apps associados.
alter table public.apps
  alter column asset_folder set not null;

alter table public.apps
  add constraint apps_asset_folder_fkey
  foreign key (asset_folder) references public.products (asset_folder)
  on update restrict
  on delete restrict;
