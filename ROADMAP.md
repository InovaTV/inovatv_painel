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
1. Auditoria do banco de dados (`apps`/`products`/relacionadas) — em
   andamento, ver "Auditoria de banco" abaixo.
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

## Auditoria de banco (2026-08-07, em andamento)

Auditoria completa apresentada e aprovada pelo usuário (ver
`CHANGELOG_AI.md` entrada 27 para o detalhe). Execução dividida em 4
fases, uma de cada vez, cada uma apresentada e aprovada antes de
aplicar:

- [x] **Fase 1 — Segurança:** `apps` fechada para `anon` (nem
  `SELECT`) — achado crítico: RLS habilitado mas com policies
  permissivas pra `public`/`anon`, permitindo INSERT/UPDATE/DELETE
  direto via API REST sem login. Ver ADR-017. Aplicado e verificado
  em 2026-08-07.
- [x] **Fase 2 — Integridade:** `UNIQUE` + `NOT NULL` em `apps.slug`;
  `NOT NULL` + FK `apps.asset_folder → products.asset_folder`
  (`ON UPDATE/DELETE RESTRICT`). Ver ADR-018. Aplicado e verificado em
  2026-08-07.
- [x] **Fase 3 — Evolução de schema:** `updated_at` + trigger
  automático em `apps`, via função genérica reutilizável
  `public.set_updated_at()` (pensada pra Banners/Notícias/FAQ/
  Tutoriais futuros — só o trigger é por tabela). Ver ADR-019.
  Aplicado e verificado em 2026-08-07.
- [x] **Fase 4 — Limpeza:** `download_url`, `downloader_code` e
  `storage_folder` removidas (colunas legadas do antigo Projeto
  Downloads `inovatv.pro` e da primeira representação de storage deste
  projeto, ambas substituídas por `asset_folder`/Hostinger). Backup dos
  valores em `supabase/backups/20260807_apps_legacy_columns_backup.csv`.
  Ver ADR-020. Aplicado e verificado em 2026-08-07.

Colunas `package_name`/`min_android_version`/`current_version_code`/
`requires_login` ficam como reservadas para funcionalidade futura —
nenhuma ação planejada.

**Auditoria de banco encerrada (4/4 fases).** Schema do módulo
Aplicativos considerado maduro. Próximo passo combinado: fase de
UI/UX, não um novo módulo.

## Fase 3 — Banners (Marketing)

Módulo separado do "Upload Banner" da Fase 2 — aqui é conteúdo
próprio (Banner Home, Banner Promoção, Banner Novidade, Banner Black
Friday, Banner Destaque, etc.), não um arquivo anexado a um app.

- [ ] CRUD Banners (Marketing)

## Fase 4 — Clientes (redefinida em 2026-08-09 — ver ADR-021)

Não haverá CRUD local de clientes neste projeto. Clientes, testes,
planos e vencimentos são geridos no Rocket Gestor (sistema externo) —
o Painel não duplica esse cadastro em Supabase. A integração entre o
app do usuário final (`inovatv_central`) e o Rocket acontece por uma
API intermediária separada (projeto próprio, ainda não criado), fora
do escopo deste roadmap. Ver ADR-021 em `ARCHITECTURE_DECISIONS.md`
para a decisão completa.

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
