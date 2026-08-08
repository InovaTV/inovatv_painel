# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## ⚠️ Commit local não pushado

O commit abaixo está só localmente (usuário pediu explicitamente para
não dar push ainda). Se outra máquina for sincronizar via
clone/pull do `origin/main`, **este commit não vai estar lá** até
alguém rodar `git push` desta máquina — a sincronização anterior
(Sprint 4/Fase A) já foi concluída e está em `origin/main` via
`d2cf1f5`.

## Último commit (local, não pushado)

`2c12116` — `feat(design-system): Fase 1 Sprint 5 Fase B - Dashboard
(icones nos StatCard)`. `git status`: working tree limpo.

Histórico local à frente de `origin/main` (1 commit):
- `2c12116` Sprint 5 Fase B — Dashboard (ícones nos StatCard)

## Checkpoint do projeto

- ✅ **Arquitetura** — `ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-020).
- ✅ **Infraestrutura** — Hostinger como storage oficial (ADR-011),
  `STORAGE.md`.
- ✅ **Banco de dados** — auditoria de 4 fases concluída e verificada em
  produção (ADR-017 a ADR-020, `CHANGELOG_AI.md` entradas 27-30).
- ✅ **Design System** — `DESIGN_SYSTEM.md` finalizado + §5.3 (Sidebar)
  e §5.4 (Canvas) adicionados durante a implementação.
- 🔄 **Fase 1 — Implementação do Design System**:
  - ✅ Sprint 1 (Tokens) — commitado.
  - ✅ Sprint 2 (Remover hardcodes) — commitado, incluindo o token
    `--canvas`.
  - ✅ Sprint 3 (Tipografia/Espaçamento/Sombra/Radius) — commitado.
  - ✅ Sprint 4 (Componentes) — commitado. `Select`/`Textarea`/
    `Label`/`Progress` instalados e aplicados. `Skeleton` **não**
    instalado (sem uso ainda).
  - 🔄 **Sprint 5 — Páginas**, dividido em 3 fases (plano completo
    aprovado, ver seção abaixo):
    - ✅ **Fase A (Sidebar + Header)** — commitada (`93d1fb2`) e
      **aprovada pelo usuário**, com a ressalva de validação visual
      registrada abaixo (não bloqueia o Sprint).
    - ✅ **Fase B (Dashboard)** — commitada (`2c12116`), aguardando
      push. Ícones nos `StatCard` via `CardAction`. `tsc`/lint/build
      limpos, validado no navegador (dashboard com sessão autenticada,
      5 StatCards conferidos, layout/espaçamento/valores inalterados).
    - ⬜ **Fase C (Aplicativos/CRUD)** — **próximo passo**, plano já
      aprovado (ver seção abaixo).
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## O que aconteceu nesta sessão (2026-08-08)

Sprint 5 planejado e Fase A implementada e commitada:

- **Levantamento completo** das 4 páginas (Dashboard, Sidebar, Header,
  Aplicativos/CRUD) contra o `DESIGN_SYSTEM.md`, apresentado e
  aprovado com ajustes do usuário (ver "Decisões fechadas" abaixo).
- **Plano de execução** em 3 fases (A/B/C) apresentado e aprovado.
- **Fase A implementada:**
  - `SidebarProvider.tsx` (novo) — Context de UI local (`isOpen`/
    `toggle`/`close`), sem persistência, sem dependência nova.
  - `Sidebar.tsx` — virou Client Component: estado ativo por rota
    (`usePathname` vs `item.href`, `bg-sidebar-accent` +
    `border-l-primary`), ícones `size={18}` → `className="size-5"`
    (§10), drawer responsivo abaixo de `md` (`fixed` + `translate-x`
    + `transition-transform`, overlay `bg-black/50 md:hidden`, fecha
    ao navegar). Espaçamento (`space-y-2`, `py-3`) mantido intacto —
    decisão explícita de não mexer.
  - `Header.tsx` — hambúrguer conectado ao `toggle()` (visível só
    abaixo de `md`), campo de busca migrado pra `Input`, os 3 botões
    manuais migrados pra `Button variant="outline" size="icon"`,
    badge "Online" com `bg-success/10 text-success` + ponto
    `animate-pulse`. Ponto vermelho de notificação mantido.
  - `layout.tsx` — envolvido com `SidebarProvider`.
- `tsc`/lint/build limpos.

## Ressalva registrada e aceita — validação de responsividade da Fase A

A lógica do drawer (abrir/fechar/overlay/fechar-ao-navegar) foi
**validada via JavaScript** (disparando `.click()` programático nos
elementos e conferindo as classes Tailwind resultantes no DOM), porque
a ferramenta de redimensionar a janela do Chrome **não funcionou neste
computador** — a janela estava maximizada e `resize_window` não
conseguiu reduzi-la (`window.innerWidth` continuou em 2133px mesmo
após "sucesso" reportado pela ferramenta). **Não foi possível obter
screenshot real em viewport mobile** por essa limitação de ambiente.

Confirmado nesta sessão (via estado/DOM, não via screenshot):
- Classes responsivas corretas no DOM (`md:static md:translate-x-0`
  na `aside`, `md:hidden` no botão hambúrguer e no overlay).
- Hambúrguer oculto no desktop (`display: none`, confirmado via
  `getComputedStyle`).
- Toggle abre (`isOpen: true`, overlay aparece), overlay fecha,
  clique em item de navegação fecha o drawer **e** navega.

**Usuário revisou essa ressalva e aprovou a Fase A mesmo assim** — o
commit `93d1fb2` está aprovado. Isso **não é mais um bloqueio**: não é
necessário validar visualmente antes de seguir para a Fase B. Se
surgir oportunidade num navegador com viewport mobile real (ex.
DevTools funcionando normalmente na outra máquina), vale conferir por
tranquilidade, mas não é pré-requisito para continuar.

## Decisões fechadas no levantamento/plano do Sprint 5 (não reabrir)

- Sidebar: espaçamento (`space-y-2`, `py-3`) **não muda** neste
  Sprint — texto do §18 do `DESIGN_SYSTEM.md` sobre isso é ambíguo/
  contraditório, decisão do usuário foi não inventar interpretação.
- Header: ponto vermelho de notificação **mantém** `bg-destructive`
  (não é regra do DS, é julgamento — ficou como estava).
- Dashboard: `Skeleton` **não entra** neste Sprint (sem uso real
  ainda).
- Aplicativos: **não implementar** destaque visual do último app
  editado (`bg-primary/5` + `border-l-2` de linha "ativa" — §15) —
  decisão explícita de não fazer.
- Dropzone do upload (Fase C, ainda não implementada): drag-and-drop
  **real** (não só visual), com APIs nativas do navegador, sem lib
  nova, sem redesenhar a arquitetura de upload existente — decisão já
  fechada, só falta implementar na Fase C.

## Fase B concluída — Sprint 5, Dashboard (commit `2c12116`)

`StatCard` ganhou prop `icon` (Lucide, `size-5`, `text-muted-foreground`,
via `CardAction`); `DashboardCards.tsx` passa o ícone por categoria —
Apps→`Smartphone`, Banners→`Image`, Novidades→`Newspaper`,
Tutoriais→`BookOpen`, FAQ→`CircleHelp` (mesmos ícones já usados no
menu da Sidebar). `Skeleton` não entrou (decisão já fechada). `tsc`/
lint/build limpos, validado visualmente no navegador. Aprovado pelo
usuário antes do commit.

## Próxima etapa — Sprint 5, Fase C: Aplicativos (plano já aprovado)

Ordem já fechada com o usuário:
1. Empty state da tabela — diferenciar tabela vazia (ícone + "Nenhum
   aplicativo ainda" + apoio + botão "Novo Aplicativo") de busca sem
   resultado (mensagem de "nenhum resultado para a busca", sem botão
   de ação principal).
2. `AppForm.tsx` — bloco de dados vira `Card` oficial.
3. `AssetUploadField.tsx` — reconstrução completa numa passada só:
   wrapper vira `Card`; preview de ícone/banner vira `Card
   overflow-hidden` com imagem no topo (§17); estado idle vira
   dropzone com drag-and-drop real (§16, decisão acima); estado com
   arquivo atual vira "card de arquivo" com thumbnail à esquerda;
   estado done ganha ícone `CheckCircle2`; estado error ganha ícone
   `AlertCircle` (cores já estão certas nos dois, só falta o ícone).
   **Lição já registrada:** testar upload usando um app de teste da
   lista (`teste100`/`sei lá`), nunca um app real — sessão anterior
   sobrescreveu por engano o ícone do UniTV Mobile e precisou de
   limpeza manual no Hostinger.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado em OKLCH mas não virou
  token — uso pontual, não decidido ainda onde.

## Primeiro passo

Abrir a Fase C (Aplicativos) direto — não há pendência bloqueando,
plano já aprovado (ver seção acima). Commit `2c12116` (Fase B) ainda
não foi pushado — confirmar com o usuário antes de dar push.
