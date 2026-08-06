# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md`, `ROADMAP.md` e
> `ARCHITECTURE_DECISIONS.md`.

## Último commit

`7faff8e` — feat(auth): migrate to Supabase SSR with protected admin panel
(mais o commit de documentação desta sessão — ver `git log`).

## Objetivo da próxima sessão

Fechar o **Update** de Aplicativos — última peça do CRUD antes de
poder avançar para upload (regra fixada: não abrir módulo novo
enquanto Aplicativos não estiver 100% fechado, ver `ROADMAP.md`).

## Arquivos que serão alterados

- `src/app/(dashboard)/apps/[id]/editar/page.tsx` (novo)
- `src/app/(dashboard)/apps/actions.ts` (adicionar `updateAppAction`)
- `src/components/apps/AppForm.tsx` (precisa aceitar modo edição:
  `defaultValues` + decidir entre `createAppAction`/`updateAppAction`)
- `src/components/common/ActionsMenu.tsx` (trocar `disabled` do
  "Editar" por link real)

## Riscos

- `AppForm` hoje é hardcoded para `createAppAction`; a forma mais
  limpa de suportar os dois modos sem duplicar o componente é passar
  a action como prop — checar se isso quebra o `useFormStatus` do
  `SubmitButton` interno (não deveria, mas validar).
- `[id]/editar` é uma rota dinâmica nova — confirmar que `proxy.ts`
  cobre esse padrão de rota (matcher é genérico, deve cobrir, mas
  testar).

## Primeiro passo

Ler `src/components/apps/AppForm.tsx` e `src/app/(dashboard)/apps/novo/actions.ts`
atuais, decidir a interface de `AppForm` para os dois modos, e então
criar `updateAppAction` reaproveitando `updateApp()` que já existe em
`src/services/app.service.ts`.
