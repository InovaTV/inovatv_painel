# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## Último commit

`948eab6` — `feat(design-system): Fase 1 Sprint 1 — aplicar tokens de
cor oficiais`. **As mudanças do Sprint 2 (esta sessão) ainda não foram
commitadas** — usuário pediu para revisar o diff antes. Rodar `git
status` ao retomar; se ainda não commitado, o diff está descrito
abaixo e em `CHANGELOG_AI.md` entrada 32.

## Checkpoint do projeto

- ✅ **Arquitetura** — `ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-020).
- ✅ **Infraestrutura** — Hostinger como storage oficial (ADR-011),
  `STORAGE.md`.
- ✅ **Banco de dados** — auditoria de 4 fases concluída e verificada em
  produção (ADR-017 a ADR-020, `CHANGELOG_AI.md` entradas 27-30).
- ✅ **Design System** — `DESIGN_SYSTEM.md` finalizado (commit
  `d809c54`) + §5.3 (Sidebar) adicionado nesta sessão. Tratado como
  especificação, não guia.
- 🔄 **Fase 1 — Implementação do Design System** — Sprint 1 (Tokens)
  commitado; **Sprint 2 (remover hardcodes) implementado, aguardando
  revisão/commit do usuário.**
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## O que aconteceu nesta sessão (2026-08-08) — Sprint 2

Detalhe completo em `CHANGELOG_AI.md` entrada 32. Resumo:

1. Levantamento completo (sem editar nada) de cores Tailwind cruas:
   33 ocorrências em 10 arquivos, apresentado em tabela para revisão.
2. Usuário decidiu os 2 gaps + 1 julgamento pendentes:
   - **Sidebar:** manter escura; `DESIGN_SYSTEM.md` §5.3 criado,
     fechando oficialmente `--sidebar`/`--sidebar-foreground`/
     `--sidebar-accent`/`--sidebar-border` com os valores exatos já em
     produção (convertidos via script, não à mão).
   - **`bg-slate-100` (fundo de página):** verificado que
     `--background` (branco) é idêntico a `--card` — não serve para o
     papel de canvas sem also mudar a separação visual card/página.
     **Não alterado** — 2 ocorrências continuam hardcoded, aguardando
     decisão.
   - **`bg-red-500` (notificação):** `bg-destructive`, sem token novo.
3. 31 substituições aplicadas em 10 arquivos (todas as 33 do
   levantamento, menos as 2 do gap do fundo de página).
4. Validado: `tsc`/`lint`/`build` limpos; `dev` na porta 3900,
   conferência visual em `/apps` e `/apps/novo` — sidebar, badges,
   formulário sem mudança de layout/intenção visual. (Zoom/interação
   mais profunda no formulário foi interrompida por um travamento do
   renderizador da aba do Chrome — não é sinal de problema no código,
   só limitação da sessão de automação do navegador.)
5. Dev server parado ao final, porta 3900 livre.
6. **Não commitado** — usuário pediu para revisar o diff primeiro.

## Próxima etapa

**Se o usuário aprovar o diff:** commitar exatamente o escopo do
Sprint 2 (`DESIGN_SYSTEM.md`, `globals.css`, os 9 componentes/páginas
listados no `CHANGELOG_AI.md` #32, mais este `NEXT_SESSION.md` e o
próprio `CHANGELOG_AI.md`), sem misturar nada de Sprint 3.

**Pendência a resolver antes ou depois do commit (não bloqueia):**
decidir o token para `bg-slate-100` (fundo de página) em
`login/page.tsx:14` e `(dashboard)/layout.tsx:18` — candidatos:
customizar `--background` (mas hoje é igual a `--card`, mudaria a
paleta neutra toda) ou criar um token novo dedicado a "canvas" de
página. Ambos exigem decisão explícita no `DESIGN_SYSTEM.md` antes de
codar, pela mesma disciplina do §5.3.

**Depois disso, Sprint 3** — tipografia/espaçamento/radius/sombra
(`DESIGN_SYSTEM.md` §6-9). Sem mudar página/componente ainda além do
necessário para aplicar esses fundamentos.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado como
  `oklch(0.7290 0.1201 71.69)` na sessão do Sprint 1, mas não virou
  token — uso pontual, não decidido ainda onde.

## Primeiro passo

`git status` + `git diff` para conferir o estado exato deixado por
esta sessão, revisar com o usuário, e só então commitar (ou pedir
ajustes primeiro).
