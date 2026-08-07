# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, ADR-013 a ADR-020.

## Último commit

`8b4e9ca` — `fix(db): drop legacy download_url/downloader_code/
storage_folder from apps (audit phase 4/4)`. **Pushado para
`origin/main`** — `git fetch` confirma `main` local e `origin/main`
sincronizados (0 commits de diferença nos dois sentidos).

## Estado oficial do projeto

- **Módulo Aplicativos: funcionalmente concluído**, conforme
  `DEFINITION_OF_DONE.md` (download, preview, status, busca,
  ordenação, paginação, validação de formulário, tratamento de erro —
  ver `CHANGELOG_AI.md` entradas 25-26).
- **Auditoria de banco: concluída (4/4 fases)**, todas aplicadas em
  produção e verificadas ao vivo:
  - Fase 1 — Segurança (ADR-017): `apps` fechada para `anon`.
  - Fase 2 — Integridade (ADR-018): `UNIQUE`/`NOT NULL` em `slug`, FK
    `asset_folder → products.asset_folder`.
  - Fase 3 — Evolução de schema (ADR-019): `updated_at` + trigger
    automático em `apps`, via função genérica reutilizável
    `public.set_updated_at()` — pensada para ser reaproveitada em
    Banners/Notícias/FAQ/Tutoriais quando esses módulos também
    ganharem `updated_at` (só o trigger é por tabela, a função não).
  - Fase 4 — Limpeza (ADR-020): `download_url`, `downloader_code` e
    `storage_folder` removidas (colunas legadas do antigo Projeto
    Downloads `inovatv.pro` e da primeira representação de storage
    deste projeto). Backup dos valores em
    `supabase/backups/20260807_apps_legacy_columns_backup.csv`.
  - Ver `ROADMAP.md` para o resumo das 4 fases e `CHANGELOG_AI.md`
    entradas 27-30 para o detalhe completo de cada uma.
- `npx tsc --noEmit`, `npm run lint` e `npm run build` — limpos depois
  de cada fase.
- Servidor de dev **parado** ao encerrar (processo na porta 3900
  finalizado explicitamente nesta sessão).

## Próxima etapa combinada com o usuário

**Fase exclusiva de UI/UX** — antes de abrir qualquer módulo novo.
Regra fixada pelo usuário (ver `ROADMAP.md`): não iniciar Banners,
Notícias, FAQ, Tutoriais, Clientes ou qualquer outro módulo antes
disso. Escopo exato da fase de UI/UX ainda não definido — a definir na
próxima sessão com o usuário.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado,
  nome com caractere Unicode de Uso Privado): investigado nesta
  sessão, tudo indica ser artefato de terminal/shell, não dado do
  projeto. Usuário pediu para ignorar por enquanto — só investigar de
  novo se ele reaparecer em sessão futura.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ver ADR-007,
  supersedida pela ADR-011). Não removido, sem ação planejada.

## Primeiro passo

Perguntar ao usuário o escopo exato da fase de UI/UX antes de propor
qualquer mudança — este documento não define esse escopo.
