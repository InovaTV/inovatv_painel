# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## Último commit

`d809c54` — `docs: finalize InovaTV design system and visual
identity`. **Pushado para `origin/main`** — `git status` confirmou
working tree clean e `main` local sincronizado com `origin/main` logo
após o push.

## Checkpoint do projeto

Os quatro pilares abaixo estão consolidados. A partir daqui o trabalho
deixa de ser "descoberta" e passa a ser "execução":

- ✅ **Arquitetura** — `ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-020).
- ✅ **Infraestrutura** — Hostinger como storage oficial (ADR-011),
  `STORAGE.md`.
- ✅ **Banco de dados** — auditoria de 4 fases concluída e verificada em
  produção (ADR-017 a ADR-020, `CHANGELOG_AI.md` entradas 27-30).
- ✅ **Design System** — `DESIGN_SYSTEM.md` finalizado e commitado
  nesta sessão (commit `d809c54`). Ver detalhe abaixo.
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## O que aconteceu nesta sessão (2026-08-07) — Design System

Documento Mestre da Fase UI/UX criado, revisado e fechado em conjunto
com o usuário, em várias rodadas:

1. **Diagnóstico** do estado visual atual, direto do código (paleta
   100% neutra, Tailwind cru misturado com tokens, cards sem sombra,
   formulário com `<select>`/`<textarea>` nativos e emoji, upload sem
   tratamento visual).
2. **Três estudos de identidade visual** (Tech/azul, Streaming/violeta,
   InovaTV/teal), grounded nas referências reais do produto UniTV
   (ícone com gradiente âmbar-vermelho-violeta + wordmark azul; banner
   de marketing roxo-magenta) — nenhuma copiada diretamente. Artefato
   completo (não commitado, é material de trabalho) em
   `design-studies/identidade-visual-inovatv.html`.
3. **Conceito C (InovaTV) escolhido**: o painel administra produtos
   (UniTV hoje, outros depois), não é ele mesmo um produto — não deve
   herdar nem competir com a identidade de nenhum específico. Ver
   `DESIGN_SYSTEM.md` §3.1/3.5 e §5.1.
4. **Refinamento de cor**: a proposta inicial de teal (`#12897D`,
   ~174°) lia como software médico/clínico. Uma rodada isolando a
   variável matiz (mantendo luminosidade/saturação, variando só o
   deslocamento em direção ao azul) confirmou que o problema era matiz,
   não brilho. Fechado em **`#0F6D76`** (~185°).
5. **Capítulo novo — "Princípios de Interface"** (`DESIGN_SYSTEM.md`
   §3): registra o raciocínio permanente por trás das decisões visuais
   (painel-como-plataforma, informação > decoração, cor comunica
   estado antes de marca, consistência > novidade, produtos têm
   identidade própria, elegância silenciosa) — pensado para envelhecer
   melhor que a paleta específica.
6. Documento renumerado (Seções 0-23) com todas as ~30 referências
   cruzadas ("Seção N") reindexadas via script (descending renumber),
   conferidas uma a uma.

**Regra operacional fixada pelo usuário para a implementação:**
nenhuma decisão visual nova durante a Fase 1+ — se surgir algo não
coberto pelo `DESIGN_SYSTEM.md`, o documento é atualizado primeiro,
só depois o código. Nenhum componente/página é considerado concluído
sem estar 100% aderente ao documento. (Salvo em memória —
`feedback_visual_implementation_discipline`.)

## Próxima etapa combinada com o usuário

**Fase 1 — Implementação do Design System**, nesta ordem (§22 do
`DESIGN_SYSTEM.md`, detalhada em sprints pelo usuário):

1. **Sprint 1 — Tokens**: `--primary` (`#0F6D76`), `--success`,
   `--warning`, `--info` no `globals.css`. Sem mudar layout ainda.
2. **Sprint 2 — Remover hardcodes**: eliminar cores Tailwind cruas
   (`slate-*`, `blue-500`, `emerald-600`, `red-*` espalhados em
   `Sidebar.tsx`, `Header.tsx`, `StatusBadge.tsx`, `AppForm.tsx` etc.)
   — tudo passa a usar os tokens.
3. **Sprint 3 — Base visual**: tipografia (§6), espaçamento (§7),
   radius (§9), sombra (§8). Sem redesenhar páginas ainda.
4. **Sprint 4 — Componentes**: instalar/atualizar `Select`, `Textarea`,
   `Label`, `Progress`, `Skeleton` (§11) e alinhar `Button`, `Card`,
   `Input`, `Badge`, `Table` existentes aos padrões (§12-17).
5. **Sprint 5 — Páginas**, só então, nesta ordem: Dashboard → Sidebar →
   Header → CRUD Aplicativos (§22, Fases 2-5 do plano original).

Usuário foi explícito: não pretende voltar a discutir identidade
visual — a próxima sessão é execução pura do que já está documentado.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado, tudo indica artefato de terminal/shell. Ignorar; só
  reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `design-studies/identidade-visual-inovatv.html`: não commitado de
  propósito (material de deliberação, não documentação oficial).
  Perguntar ao usuário se quer arquivá-lo no repo ou descartá-lo agora
  que a decisão está fechada.

## Primeiro passo

Abrir a Fase 1 (Sprint 1 — Tokens) diretamente: propor a edição exata
de `src/app/globals.css` com os valores de `DESIGN_SYSTEM.md` §5.2,
confirmar os valores OKLCH convertidos (o documento pede
reconferência com um conversor de cor real antes de aplicar), e seguir
o mesmo rigor das fases anteriores (mudança apresentada antes de
aplicada, `tsc`/`lint`/`build` limpos, validação ao vivo no navegador).
