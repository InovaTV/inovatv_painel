# Roadmap — InovaTV Painel

> Checklist de progresso do projeto, por fase. Atualizado a cada
> sessão em que uma tarefa muda de estado. Não é o lugar para
> detalhes de arquitetura (ver `PROJECT_MASTER.md`) nem para decisões
> permanentes (ver `ARCHITECTURE_DECISIONS.md`) — só o "o que já foi
> feito e o que falta", em ordem.

Última atualização: 2026-08-06

## Foco atual

**Regra fixada pelo usuário:** não abrir um módulo novo (Banners,
FAQ, Tutoriais, Clientes, Configurações) enquanto o módulo
**Aplicativos** não estiver 100% fechado — Create, Read, Update,
Delete, Upload (APK/Ícone/Banner), teste manual e documentação em
dia. Ver ADR-006 em `ARCHITECTURE_DECISIONS.md` sobre por quê isso
importa: os próximos módulos vão reaproveitar os padrões que saírem
daqui.

---

## Fase 1 — Base

- [x] Auth (login/logout via Supabase Auth + Server Actions)
- [x] Middleware (`src/proxy.ts`, proteção de rotas)
- [x] Dashboard (layout + cards — dados ainda estáticos)

## Fase 2 — CRUD Aplicativos

- [ ] CRUD Apps completo
  - [x] Create
  - [x] Read
  - [x] Delete
  - [ ] Update

## Fase 3 — Upload (Aplicativos)

- [ ] Upload APK
- [ ] Upload Ícone
- [ ] Upload Banner (imagem promocional do app)

## Fase 4 — Clientes

- [ ] CRUD Clientes

## Fase 5 — FAQ

- [ ] CRUD FAQ

## Fase 6 — Tutoriais

- [ ] CRUD Tutoriais

## Fase 7 — Configurações

- [ ] Tela de Configurações

## Módulo em aberto (não posicionado ainda)

- [ ] **Banners** (módulo de marketing, distinto do "Upload Banner"
  da Fase 3 — este é conteúdo próprio, já existe item "Banners" no
  `Sidebar` e no `README.md`, mas não tem fase definida na ordem que
  o usuário passou). Perguntar ao usuário onde encaixar isso quando
  chegar a hora — provavelmente entre a Fase 3 e a Fase 4, mas não
  presumir.

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
