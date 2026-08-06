# Roadmap — InovaTV Painel

> Checklist de progresso do projeto, por fase. Atualizado a cada
> sessão em que uma tarefa muda de estado. Não é o lugar para
> detalhes de arquitetura (ver `PROJECT_MASTER.md`) nem para decisões
> permanentes (ver `ARCHITECTURE_DECISIONS.md`) — só o "o que já foi
> feito e o que falta", em ordem.

Última atualização: 2026-08-06

## Foco atual

**Regra fixada pelo usuário:** não abrir um módulo novo enquanto o
módulo **Aplicativos** não estiver 100% fechado — critério objetivo
em `DEFINITION_OF_DONE.md`, não "CRUD básico funciona". Ver ADR-006
em `ARCHITECTURE_DECISIONS.md` sobre por quê isso importa: os
próximos módulos vão reaproveitar os padrões que saírem daqui.

Documentação e arquitetura estão **congeladas** a partir de
2026-08-06 — só voltam a mudar se surgir uma decisão arquitetônica
real (vira ADR) ou o fim de sessão exigir atualização mecânica dos
documentos. O esforço agora é 100% em código.

---

## Fase 1 — Base

- [x] Auth (login/logout via Supabase Auth + Server Actions)
- [x] Middleware (`src/proxy.ts`, proteção de rotas)
- [x] Dashboard (layout + cards — dados ainda estáticos)

## Fase 2 — Módulo Aplicativos

Único módulo em trabalho agora. Concluído quando atender
`DEFINITION_OF_DONE.md` por completo — não antes.

- [x] Create
- [x] Read
- [x] Update
- [x] Delete
- [ ] Upload APK
- [ ] Upload Ícone
- [ ] Upload Banner do app (imagem promocional — pertence ao
  cadastro do app, **não** é o módulo "Banners" de marketing da Fase 3)
- [ ] Preview
- [ ] Download
- [ ] Ordenação
- [ ] Status (toggle ativo/inativo)
- [ ] Busca
- [ ] Paginação

## Fase 3 — Banners (Marketing)

Módulo separado do "Upload Banner" da Fase 2 — aqui é conteúdo
próprio (Banner Home, Banner Promoção, Banner Novidade, Banner Black
Friday, Banner Destaque, etc.), não um arquivo anexado a um app.

- [ ] CRUD Banners (Marketing)

## Fase 4 — Clientes

- [ ] CRUD Clientes

## Fase 5 — FAQ

- [ ] CRUD FAQ

## Fase 6 — Tutoriais

- [ ] CRUD Tutoriais

## Fase 7 — Configurações

- [ ] Tela de Configurações

---

## Como este arquivo se relaciona com os outros

- **`PROJECT_MASTER.md`** — arquitetura, stack, estrutura, convenções.
  Permanente, sempre crescendo.
- **`NEXT_SESSION.md`** — só o próximo passo imediato. Descartável,
  reescrito a cada sessão.
- **`CHANGELOG_AI.md`** — histórico do que já foi feito. Nunca
  apagado.
- **`ARCHITECTURE_DECISIONS.md`** — decisões permanentes (ADRs). Nunca
  apagado.
- **`ROADMAP.md`** (este arquivo) — visão geral do progresso por
  fase. Atualizado, nunca reescrito do zero.
- **`DEFINITION_OF_DONE.md`** — critério objetivo para marcar um
  módulo como concluído aqui.
