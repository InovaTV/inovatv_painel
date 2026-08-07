# Roadmap — InovaTV Painel

> Checklist de progresso do projeto, por fase. Atualizado a cada
> sessão em que uma tarefa muda de estado. Não é o lugar para
> detalhes de arquitetura (ver `PROJECT_MASTER.md`) nem para decisões
> permanentes (ver `ARCHITECTURE_DECISIONS.md`) — só o "o que já foi
> feito e o que falta", em ordem.

Última atualização: 2026-08-07

## Foco atual

**Módulo Aplicativos concluído funcionalmente em 2026-08-07** —
atende `DEFINITION_OF_DONE.md` por completo (ver seção "Módulo
Aplicativos — CONCLUÍDO" naquele arquivo).

**Regra fixada pelo usuário:** não abrir a Fase 3 (Banners/Marketing)
nem qualquer outro módulo novo agora. Próximos passos, nesta ordem:
1. Auditoria do banco de dados (`apps`/`products`/relacionadas —
   colunas em uso / reservadas para funcionalidade futura já
   planejada / legado pra remover).
2. Fase exclusiva de UI/UX (só depois da auditoria).

Ver ADR-006 em `ARCHITECTURE_DECISIONS.md` sobre por que fechar
Aplicativos por completo antes de seguir importa: os próximos módulos
vão reaproveitar os padrões que saíram daqui.

Documentação e arquitetura estão **congeladas** desde 2026-08-06 — só
voltam a mudar se surgir uma decisão arquitetônica real (vira ADR) ou
o fim de sessão exigir atualização mecânica dos documentos. O esforço
agora é 100% em código.

---

## Fase 1 — Base

- [x] Auth (login/logout via Supabase Auth + Server Actions)
- [x] Middleware (`src/proxy.ts`, proteção de rotas)
- [x] Dashboard (layout + cards — dados ainda estáticos)

## Fase 2 — Módulo Aplicativos ✅ CONCLUÍDO (2026-08-07)

- [x] Create
- [x] Read
- [x] Update
- [x] Delete
- [x] Upload APK
- [x] Upload Ícone
- [x] Upload Banner do app (imagem promocional — pertence ao
  cadastro do app, **não** é o módulo "Banners" de marketing da Fase 3)
- [x] Preview
- [x] Download
- [x] Ordenação
- [x] Status (toggle ativo/inativo)
- [x] Busca
- [x] Paginação
- [x] Validação de formulário além de `required`
- [x] Tratamento de erro visível ao usuário

Próximo passo (fixado pelo usuário): auditoria do banco de dados,
depois fase exclusiva de UI/UX. Não abrir a Fase 3 antes disso.

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

## Melhorias futuras (não bloqueiam nenhuma fase)

**Segurança**
- [ ] Investigar uso de FTPS com o hostname `*.hstgr.io` em vez do
  domínio customizado (`ftp.inovatv.pro`) — hoje a conexão cai para
  FTP sem criptografia por mismatch de certificado, ver `STORAGE.md`.
- [ ] Verificar disponibilidade de SFTP caso o plano de hospedagem
  mude.

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
