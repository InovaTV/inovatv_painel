# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md`, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md` e ADR-007/ADR-008/ADR-009.

## Último commit

Ver `git log` — commit desta sessão adiciona ADR-009 (escopo da
service_role) e `src/lib/supabase/admin.ts`. O anterior, `8269105`,
depreciou `download_url` (ADR-008).

## Objetivo da próxima sessão

**Ainda bloqueado**, mas o desbloqueio agora depende de ações que o
usuário já concordou em fazer, não mais de decisão:

1. Usuário roda `npx supabase login` (via `!` no prompt, autentica
   pelo navegador), depois eu rodo
   `npx supabase link --project-ref deovfultywlftlvdzukc` e
   `npx supabase db push` para aplicar
   `supabase/migrations/20260806140000_add_banner_path_fix_storage_folder.sql`.
2. Usuário adiciona `SUPABASE_SERVICE_ROLE_KEY` ao `.env.local`
   (pega em Project Settings → API → service_role no Supabase) —
   **não deve ser colada no chat**, só adicionada diretamente no
   arquivo.

Confirmar os dois antes de prosseguir. Depois: usar
`createAdminClient()` (`src/lib/supabase/admin.ts`) **só** para criar
o bucket `apps` — não para nenhuma outra coisa (ADR-009). O upload em
si (Server Actions de escrita normal) continua usando
`src/lib/supabase/server.ts`, sessão do usuário autenticado.

## Arquivos que serão alterados

- Criação do bucket: provavelmente um script one-off ou uma pequena
  rota/Server Action temporária usando `createAdminClient()` — decidir
  se vira um script descartável (`scripts/create-bucket.ts` rodado uma
  vez) ou uma Server Action permanente de setup. Tendência: script
  one-off, já que criar bucket não é uma operação recorrente do
  painel.
- `src/lib/supabase/storage.ts` (novo) — helpers de upload/URL
  assinada, usando `server.ts` (sessão do usuário), não `admin.ts`.
- `src/app/(dashboard)/apps/actions.ts` — Server Actions de upload.
- `src/components/apps/AppForm.tsx` — inputs de arquivo reais.
- `src/services/app.service.ts` — `AppData`/`App` precisam incorporar
  `storage_path`/`icon_path`/`banner_path`/`asset_folder`/`storage_folder`.

## Riscos

- Não usar `admin.ts`/service_role para nenhuma operação de CRUD
  normal — só infraestrutura (ADR-009). Se em algum momento parecer
  "mais fácil" usar service_role pra resolver um problema de RLS no
  CRUD, isso é sinal de que a policy de RLS está errada, não de que
  service_role deveria ser usada ali.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para uma variável
  `NEXT_PUBLIC_*` nem ser referenciada fora de `admin.ts`.

## Primeiro passo

Confirmar com o usuário: `supabase login`/`link`/`db push` já
rodaram? `SUPABASE_SERVICE_ROLE_KEY` já está no `.env.local`? Se sim
aos dois, criar o bucket `apps` via `admin.ts` e então implementar o
upload.
