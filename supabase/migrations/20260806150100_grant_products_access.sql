-- A tabela `products` (migração anterior) foi criada sem os grants que
-- `apps` já tinha (configurados via dashboard, fora de migração — não
-- visível para inspecionar diretamente neste ambiente, sem Docker local
-- para `supabase db dump`). Réplica do padrão observado: leitura aberta,
-- escrita só para sessão autenticada (Server Actions rodam logadas).
grant select on public.products to anon, authenticated;
grant insert on public.products to authenticated;
