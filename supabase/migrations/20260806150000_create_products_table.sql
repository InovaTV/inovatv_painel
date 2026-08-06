-- Tabela mínima de produtos: só o necessário para o select "Produto" no
-- AppForm gerar/gerenciar asset_folder internamente (o admin nunca digita
-- nome de pasta). Sem FK em apps.asset_folder por enquanto — products é só
-- a lista controlada de onde o valor vem; ver conversa de 2026-08-06 sobre
-- a revisão funcional da tela de Aplicativos.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  asset_folder text not null unique,
  created_at timestamptz not null default now()
);

-- Alinha com o asset_folder "unitv" já usado pelos 2 apps reais.
insert into public.products (name, asset_folder)
values ('UniTV', 'unitv')
on conflict (asset_folder) do nothing;
