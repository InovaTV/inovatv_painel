# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md`, `ROADMAP.md` e
> `DEFINITION_OF_DONE.md`. **Documentação está congelada — esta
> sessão é só código.**

## Último commit

Ver `git log` — commit desta sessão é só documentação (o anterior,
`4044f56`, foi o último antes do congelamento).

## Objetivo da próxima sessão

Implementar **Update** de Aplicativos (primeiro item em aberto do
checklist em `DEFINITION_OF_DONE.md` / `ROADMAP.md` Fase 2). Antes de
começar: `npm run build` + `npm run lint` para garantir árvore limpa
(regra `PROJECT_MASTER.md` §9.1).

## Arquivos que serão alterados

- `src/app/(dashboard)/apps/[id]/editar/page.tsx` (novo)
- `src/app/(dashboard)/apps/actions.ts` (adicionar `updateAppAction`)
- `src/components/apps/AppForm.tsx` (suportar modo edição via prop de
  `defaultValues` + qual action usar)
- `src/components/common/ActionsMenu.tsx` (trocar `disabled` do
  "Editar" por link real)

## Riscos

- `AppForm` hoje é hardcoded para `createAppAction`; melhor forma de
  suportar os dois modos sem duplicar o componente é passar a action
  como prop — validar que `useFormStatus` do `SubmitButton` interno
  continua funcionando.
- `[id]/editar` é rota dinâmica nova — confirmar que `proxy.ts` cobre
  esse padrão (matcher é genérico, deve cobrir, mas testar).

## Primeiro passo

Ler `src/components/apps/AppForm.tsx` e
`src/app/(dashboard)/apps/novo/actions.ts`, decidir a interface de
`AppForm` para os dois modos, e criar `updateAppAction` reaproveitando
`updateApp()` já existente em `src/services/app.service.ts`.
