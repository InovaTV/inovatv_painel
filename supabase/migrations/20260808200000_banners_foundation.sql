-- Fase 3 (Banners/Marketing), Sprint 1 — fundação de banco.
--
-- Decisões aprovadas pelo usuário (relatório de diagnóstico da Fase 3
-- + revisão final, 2026-08-08):
-- 1. RLS: manter SELECT público, adicionar INSERT/UPDATE/DELETE só
--    para `authenticated` — mesmo padrão do ADR-017 (apps).
-- 3. `action_type` vira vocabulário controlado: none/app/url.
-- 4. `app_slug` NÃO é removido nesta fase (ver análise de uso, fora
--    deste arquivo).
-- 5. Nova coluna `category`, classificando a linha existente como
--    'novidade' e fechando NOT NULL — todo banner futuro exige
--    categoria explícita.
-- 7. `updated_at` + trigger, reaproveitando public.set_updated_at()
--    (já existe, criada na migração de apps — create or replace é
--    idempotente).
--
-- Pré-condições verificadas antes de escrever esta migração:
-- - banners tem exatamente 1 linha (id 5c227147-3e77-47de-a26c-b25c61f4e170).
-- - action_type dessa linha já é 'app' (não nulo) — compatível com o
--   novo NOT NULL/CHECK.
-- - action_target dessa linha é 'unitv-mobile' (não nulo) — compatível
--   com a nova regra de consistência action_type/action_target, e
--   confirmado nesta sessão que bate exatamente com apps.slug
--   'unitv-mobile' (id b3a8ba0a-63a4-4ae3-acc9-88e33a092c57).

-- 1. RLS — policies de escrita para authenticated. A policy de SELECT
--    público ("Enable read access for all users") já existe e é a
--    decisão correta (banners de marketing precisam ser lidos
--    publicamente no futuro) — não mexer nela.
create policy "Authenticated users can insert banners"
  on public.banners for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update banners"
  on public.banners for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete banners"
  on public.banners for delete
  to authenticated
  using (true);

-- Grants brutos de INSERT/UPDATE/DELETE/TRUNCATE para anon existem
-- hoje mas são inertes (RLS sem policy = zero linhas afetadas).
-- Removidos por defesa em profundidade, mesmo princípio do ADR-017 —
-- sem alterar o SELECT de anon, que continua necessário.
revoke insert, update, delete on public.banners from anon;

-- 2. updated_at + trigger — mesma função já usada por `apps`.
alter table public.banners
  add column updated_at timestamptz not null default now();

update public.banners
  set updated_at = created_at;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger banners_set_updated_at
  before update on public.banners
  for each row
  execute function public.set_updated_at();

-- 3. category — tipo/placement do banner (Home, Promoção, Novidade,
--    Black Friday, Destaque). Sem DEFAULT de propósito: o usuário quer
--    que todo INSERT futuro seja obrigado a informar uma categoria
--    explícita, não herdar uma silenciosamente.
alter table public.banners
  add column category text;

alter table public.banners
  add constraint banners_category_check
  check (category in ('home', 'promocao', 'novidade', 'black_friday', 'destaque'));

-- Backfill da única linha existente — conteúdo "Nova versão
-- disponível" / "Atualize agora o UniTV Mobile." classificado como
-- 'novidade' (decisão do usuário).
update public.banners
  set category = 'novidade'
  where id = '5c227147-3e77-47de-a26c-b25c61f4e170';

alter table public.banners
  alter column category set not null;

-- 4. action_type — vocabulário controlado. NOT NULL com default
--    'none': elimina o estado ambíguo de NULL coexistindo com o valor
--    explícito 'none' pra "nenhuma ação". A linha existente já tem
--    action_type = 'app' (não nulo), então o NOT NULL não quebra nada.
alter table public.banners
  alter column action_type set default 'none';

update public.banners
  set action_type = 'none'
  where action_type is null;

alter table public.banners
  alter column action_type set not null;

alter table public.banners
  add constraint banners_action_type_check
  check (action_type in ('none', 'app', 'url'));

-- 5. Consistência action_type/action_target — mesmo princípio já
--    registrado na migração de apps ("a garantia vive no banco, não
--    só na camada de aplicação"): se a ação é 'none', não faz sentido
--    ter um alvo; se é 'app'/'url', o alvo é obrigatório. A linha
--    existente (action_type='app', action_target='unitv-mobile') já
--    satisfaz essa regra.
alter table public.banners
  add constraint banners_action_target_consistency
  check (
    (action_type = 'none' and action_target is null)
    or (action_type in ('app', 'url') and action_target is not null)
  );

-- Não incluído nesta migração (decisões explícitas):
-- - Nenhum DROP em app_slug — ver análise de uso separada.
-- - Nenhuma FK entre banners.action_target/app_slug e apps.slug —
--   verificado nesta sessão que o valor bate exatamente, mas nenhuma
--   FK foi criada, por instrução explícita.
-- - Nenhum índice novo além do existente (PK). Tabela de baixíssimo
--   volume (banners de marketing, não é tabela transacional em
--   escala) — nenhum padrão de consulta hoje justifica índice em
--   category/display_order/is_active.
-- - Nenhuma mudança em image_path/Storage — path (assets/banners/{id}/
--   image.webp) é decisão de aplicação do Sprint 3, não de schema.
