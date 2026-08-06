-- service_role bypassa RLS, mas não os GRANTs de tabela — precisa ser
-- explícito para tabelas criadas via migração (diferente de tabelas
-- criadas pelo dashboard, que já ganham isso automaticamente).
grant all on public.products to service_role;
