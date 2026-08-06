# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md`, `ROADMAP.md` e
> `DEFINITION_OF_DONE.md`. Documentação continua congelada — só
> código, exceto pelas atualizações mecânicas de fim de sessão.

## Último commit

Ver `git log` — commit desta sessão implementa Update de Aplicativos
(CRUD 100% completo). O anterior, `01bf70e`, foi o congelamento da
documentação (`DEFINITION_OF_DONE.md` + split Apps/Banners).

## Objetivo da próxima sessão

CRUD de Aplicativos está completo (Create/Read/Update/Delete). Próximo
item do `DEFINITION_OF_DONE.md`: **Upload de APK, Ícone e Banner do
app** via Supabase Storage (ADR-004 — obrigatoriamente por Server
Action). Antes de começar: `npm run build` + `npm run lint` (regra
§9.1).

## Arquivos que serão alterados

- `src/lib/supabase/storage.ts` ou similar (novo) — helpers de
  upload/URL pública.
- `src/app/(dashboard)/apps/actions.ts` e/ou `apps/novo/actions.ts` —
  Server Actions de upload passam a receber os arquivos via
  `FormData`.
- `src/components/apps/AppForm.tsx` — os 3 `<Input type="file" disabled />`
  atuais precisam virar inputs reais, com `name` para chegar no
  `FormData` do Server Action.
- Possivelmente `src/services/app.service.ts` — se as colunas
  `apk_url`/`icon_url`/`banner_url` (ou nomes equivalentes) ainda não
  existirem na tabela `apps` do Supabase, será preciso confirmar com
  o usuário antes de gravar.

## Riscos

- Não existe `SUPABASE_SERVICE_ROLE_KEY` em `.env.local` — só a chave
  anônima. Se o bucket do Storage exigir bypass de RLS para escrita
  via Server Action, será necessário pedir essa chave ao usuário
  (nunca expor no browser — ADR-004/ADR-001).
- Não sabemos ainda o nome/estrutura dos buckets no Supabase Storage
  nem os nomes de coluna para as URLs resultantes na tabela `apps` —
  **perguntar ao usuário antes de implementar**, não presumir.
- Tamanho máximo de arquivo (especialmente APK) precisa de decisão
  explícita antes de codar validação.

## Primeiro passo

Perguntar ao usuário: (1) nomes/estrutura dos buckets no Supabase
Storage, (2) se as colunas de URL já existem na tabela `apps` ou
precisam ser criadas, (3) tamanho máximo aceito por tipo de arquivo.
Só então desenhar o Server Action de upload.
