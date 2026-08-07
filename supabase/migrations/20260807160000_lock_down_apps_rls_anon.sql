-- Fase 1 da auditoria de banco (2026-08-07): fecha `apps` para `anon`.
--
-- Achado: RLS estava habilitado em `apps`, mas as 4 policies (SELECT/
-- INSERT/UPDATE/DELETE) tinham `qual`/`with_check` = true para o role
-- `public` (que inclui `anon`), combinado com grants completos pra `anon`.
-- Na prática, a chave anônima (pública, embutida no bundle do navegador
-- como NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) permitia ler/criar/editar/
-- apagar qualquer app diretamente via API REST do Supabase, sem precisar
-- logar no painel — o login/proxy.ts protegia só a UI do Next.js, não o
-- banco em si.
--
-- Decisão do usuário: fechar completamente para `anon` (nem SELECT).
-- O painel é o único consumidor de `apps` hoje — sem portal público, sem
-- API pública. Regra do projeto (ADR-008): não construir pensando em
-- compatibilidade futura. Se/quando existir um portal público, criar uma
-- policy/view específica para esse caso então.
--
-- Todo tráfego de escrita/leitura do painel já roda com sessão logada
-- (createClient() usa o cookie de sessão do Supabase Auth, chegando como
-- `authenticated`) — esta migração não deveria quebrar nada do fluxo atual.

drop policy if exists "Enable read access for all users" on public.apps;
drop policy if exists "Enable insert for all users" on public.apps;
drop policy if exists "Enable update for all users" on public.apps;
drop policy if exists "Enable delete for all users" on public.apps;

create policy "Authenticated users can select apps"
  on public.apps for select
  to authenticated
  using (true);

create policy "Authenticated users can insert apps"
  on public.apps for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update apps"
  on public.apps for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete apps"
  on public.apps for delete
  to authenticated
  using (true);

revoke select, insert, update, delete on public.apps from anon;
