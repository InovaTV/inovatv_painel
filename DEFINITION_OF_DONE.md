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
- [ ] Upload Ícone
- [ ] Upload Banner do app
- [ ] Preview
- [ ] Download
- [ ] Ordenação
- [ ] Status (já existe `StatusBadge`/filtro visual — falta ação de
  toggle ativo/inativo)
- [ ] Busca
- [ ] Paginação
- [ ] Validação de formulário além de `required`
- [ ] Tratamento de erro visível ao usuário
- [ ] Sem `any` (já resolvido) / sem `TODO`
