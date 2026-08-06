# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §1.1 (Ambiente
> Local), `ROADMAP.md`, `DEFINITION_OF_DONE.md`, `STORAGE.md` e
> ADR-007/ADR-008/ADR-009/ADR-010.

## Último commit

Ver `git log` — commit desta sessão adiciona `.env.example`, ADR-010
e a seção "Ambiente Local" no `PROJECT_MASTER.md`. O anterior,
`fbcda81`, adicionou ADR-009 e `src/lib/supabase/admin.ts`.

## Objetivo da próxima sessão

Ainda bloqueado no mesmo ponto: `.env.local` só tem
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
(confirmado via `grep`). Faltam `SUPABASE_SERVICE_ROLE_KEY` e
`SUPABASE_ACCESS_TOKEN`.

Assim que o usuário adicionar os dois:
1. Rodar `npx supabase login --token "$SUPABASE_ACCESS_TOKEN"` (token
   lido do `.env.local`, exportado só dentro do comando — nunca
   digitado no chat).
2. `npx supabase link --project-ref deovfultywlftlvdzukc`.
3. `npx supabase db push` — aplica
   `supabase/migrations/20260806140000_add_banner_path_fix_storage_folder.sql`.
4. Criar o bucket `apps` via `createAdminClient()`
   (`src/lib/supabase/admin.ts`) — script one-off, não uma rota
   permanente.
5. Só então implementar upload de APK/Ícone/Banner (Server Actions
   normais, via `src/lib/supabase/server.ts`, não `admin.ts` — ADR-009).

## Arquivos que serão alterados

- Script/comando one-off para criar o bucket (ainda não decidido se
  vira um arquivo versionado em `scripts/` ou um comando único
  rodado e descartado).
- `src/lib/supabase/storage.ts` (novo) — helpers de upload/URL
  assinada, usando `server.ts`.
- `src/app/(dashboard)/apps/actions.ts` — Server Actions de upload.
- `src/components/apps/AppForm.tsx` — inputs de arquivo reais.
- `src/services/app.service.ts` — `AppData`/`App` incorporando
  `storage_path`/`icon_path`/`banner_path`/`asset_folder`/`storage_folder`.

## Riscos

- `SUPABASE_ACCESS_TOKEN` é de conta (todos os projetos Supabase do
  usuário), não só deste projeto — usar só para
  login/link/db push, nunca em runtime da aplicação (ADR-010).
  Lembrar o usuário de revogá-lo quando não precisar mais da CLI.
- `SUPABASE_SERVICE_ROLE_KEY` só entra em `src/lib/supabase/admin.ts`,
  nunca em Server Action de CRUD normal (ADR-009).
- Nenhum dos dois pode ir para `NEXT_PUBLIC_*`, `README.md`,
  documentação ou chat — só `.env.local` (já no `.gitignore`).

## Primeiro passo

Confirmar com o usuário se `SUPABASE_SERVICE_ROLE_KEY` e
`SUPABASE_ACCESS_TOKEN` já estão no `.env.local`. Se sim, rodar a
sequência login → link → db push → criar bucket, nessa ordem.
