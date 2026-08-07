# Definition of Done — InovaTV Painel

> Critério objetivo para marcar um módulo como concluído no
> `ROADMAP.md`. Se algum item aqui não está marcado, o módulo **não**
> está pronto — não importa se o CRUD básico já funciona.

Um módulo só é considerado concluído quando:

- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Upload concluído, quando o módulo tiver arquivos (APK, ícone,
  banner, etc.) — via Server Action, nunca upload direto do browser
  (ADR-004)
- [ ] Busca funcionando
- [ ] Paginação funcionando
- [ ] Ordenação funcionando
- [ ] Filtros relevantes ao módulo (ex.: status, plataforma)
- [ ] Preview do conteúdo, quando fizer sentido (ex.: imagem, ícone)
- [ ] Validação de formulário implementada (não só `required` do HTML)
- [ ] Tratamento de erro visível ao usuário (não só `console.error`)
- [ ] Tipagem completa — sem `any`
- [ ] Sem `TODO` deixado no código
- [ ] `npm run build` OK
- [ ] `npm run lint` OK
- [ ] Testado manualmente (criar, editar, excluir, buscar, paginar)
- [ ] Documentação de continuidade atualizada (`PROJECT_MASTER.md`,
  `ROADMAP.md`, `CHANGELOG_AI.md`, `NEXT_SESSION.md`)
- [ ] Commit realizado

## Módulo Aplicativos — aplicação deste critério

Primeiro módulo a ser medido por este arquivo. Estado atual (ver
`ROADMAP.md` para o detalhe):

- [x] Create
- [x] Read
- [x] Update
- [x] Delete
- [x] Upload APK
- [x] Upload Ícone
- [x] Upload Banner do app
- [x] Preview
- [x] Download
- [x] Ordenação (setas ↑/↓, `OrderControls` + `swapDisplayOrder` —
  troca simples de vizinho, sem drag-and-drop)
- [x] Status (`StatusToggle` — `Switch` + `StatusBadge`, Server Action
  `toggleAppStatusAction`)
- [x] Busca (`AppsSearch`, filtro `ilike` por nome via `?q=`)
- [x] Paginação (`AppsPagination`, `?page=`, `APPS_PAGE_SIZE=10`,
  página grampeada no service pra nunca pedir um offset inválido ao
  PostgREST)
- [x] Validação de formulário além de `required` (`validateAppFields`
  em `app.service.ts` — nome mín. 2 chars, slug via regex + unicidade
  contra o banco, versão via regex; erros viram `AppValidationError`
  com `fieldErrors` por campo)
- [x] Tratamento de erro visível ao usuário (`AppForm` usa
  `useActionState` e mostra erro por campo + banner genérico no topo;
  `ActionsMenu`/`StatusToggle`/`OrderControls` capturam falha das
  Server Actions e avisam via `window.alert`, revertendo o estado
  otimista quando aplicável)
- [x] Sem `any` / sem `TODO` (confirmado via grep nesta sessão)
- [x] `npm run build` OK
- [x] `npm run lint` OK
- [x] Testado manualmente (criar, editar, excluir, buscar, paginar,
  reordenar, alternar status, baixar, validação de slug duplicado/
  formato inválido — todos verificados ao vivo nesta sessão)

## Módulo Aplicativos — CONCLUÍDO (funcionalmente) em 2026-08-07

Todos os itens acima marcados. Módulo fechado pelo critério deste
documento. Próximo passo combinado com o usuário: auditoria do banco
de dados (`apps`/`products`/relacionadas), depois fase exclusiva de
UI/UX — não abrir outro módulo antes disso.
