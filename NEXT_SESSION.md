# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## ⚠️ Commits locais não pushados

Os 2 commits abaixo (Fase 3, Sprints 1-2) estão só localmente —
confirmar com o usuário antes de dar push. A Fase 1 completa
(até `fdcebcf`) já está publicada em `origin/main`.

## Último commit (local, não pushado)

`94427c0` — `feat(banners): Fase 3 Sprint 2 - CRUD basico de Banners`.
`git status`: working tree limpo.

Commits desta sessão, à frente de `origin/main` (2 commits):
- `1a43d17` Fase 3 Sprint 1 — fundação de banco (banners): RLS,
  `updated_at`+trigger, coluna `category`, `action_type` controlado.
- `94427c0` Fase 3 Sprint 2 — CRUD básico de Banners (listar, buscar,
  paginar, criar, editar, excluir, ativar/desativar, reordenar).

## Checkpoint do projeto

- ✅ **Arquitetura** — `ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-020).
- ✅ **Infraestrutura** — Hostinger como storage oficial (ADR-011),
  `STORAGE.md`.
- ✅ **Banco de dados** — auditoria de 4 fases concluída e verificada em
  produção (ADR-017 a ADR-020, `CHANGELOG_AI.md` entradas 27-30).
- ✅ **Design System** — `DESIGN_SYSTEM.md` finalizado + §5.3 (Sidebar)
  e §5.4 (Canvas) adicionados durante a implementação.
- ✅ **Fase 1 — Implementação do Design System — CONCLUÍDA
  (2026-08-08)**. Todos os 5 sprints commitados:
  - ✅ Sprint 1 (Tokens de cor).
  - ✅ Sprint 2 (Remover hardcodes), incluindo o token `--canvas`.
  - ✅ Sprint 3 (Tipografia/Espaçamento/Sombra/Radius).
  - ✅ Sprint 4 (Componentes) — `Select`/`Textarea`/`Label`/`Progress`
    instalados e aplicados. `Skeleton` **não** instalado (sem uso).
  - ✅ Sprint 5 — Páginas, em 3 fases, todas commitadas e aprovadas:
    - ✅ Fase A (Sidebar + Header) — `93d1fb2`.
    - ✅ Fase B (Dashboard) — `2c12116`.
    - ✅ Fase C (Aplicativos/CRUD) — `0e7fae8`.
  - **Auditoria final (somente leitura) feita e aprovada — sem
    pendências importantes.** Publicada em `origin/main`.
- 🔄 **Fase 3 — Banners (Marketing)** — em andamento, plano completo
  aprovado (levantamento → aprovação → implementação → testes →
  revisão → commit → push, por sprint):
  - ✅ Sprint 1 (Fundação de banco) — commitado (`1a43d17`), aplicado
    e validado contra o banco real.
  - ✅ Sprint 2 (CRUD básico) — commitado (`94427c0`), validado no
    navegador.
  - ⬜ **Sprint 3 (Upload/Storage de imagens) — próximo passo, ainda
    não iniciado.**
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## Fase A concluída — Sprint 5, Sidebar/Header (commit `93d1fb2`)

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

## Fase C concluída — Sprint 5, Aplicativos (commit `0e7fae8`)

Executada em 4 etapas (visual → comportamento novo, nessa ordem),
cada uma validada com `tsc`/lint/build antes de seguir:

1. **Empty state** (`AppsTable.tsx` + `page.tsx`) — `q` passado como
   prop; tabela distingue busca sem resultado (`SearchX`, "Nenhum
   resultado para a busca", sem botão) de tabela genuinamente vazia
   (`Smartphone`, "Nenhum aplicativo ainda", botão "Novo Aplicativo").
2. **`AppForm.tsx`** — os dois blocos manuais (`rounded-xl border...`)
   viraram `Card`/`CardContent` oficiais. Nenhum campo/lógica mudou.
3. **`AssetUploadField.tsx`, visual** — wrapper vira `Card`; preview
   de ícone/banner vira `Card overflow-hidden` com imagem no topo
   (§17) — **ajuste feito na validação**: `aspect-square
   object-contain bg-muted` para ícone (evita cortar a logo),
   `aspect-video object-cover` para banner (preserva a composição
   horizontal); estado com arquivo atual (sem preview de imagem, ex.
   APK) vira "card de arquivo" com thumbnail (`FileArchive`) à
   esquerda (§16); estados `done`/`error` ganham ícones `CheckCircle2`/
   `AlertCircle`.
4. **`AssetUploadField.tsx`, drag-and-drop real** — dropzone visual
   (ícone `Upload`, "Clique ou arraste o arquivo aqui", legenda do
   tipo aceito); `onDragOver`/`onDragLeave`/`onDrop` conectados à
   mesma função `upload(file)` já existente — mecanismo XHR/streaming
   ndjson **inalterado**.

Validado no navegador com o app de teste `sei lá` (upload real por
clique **e** por um evento de `drop` nativo simulado via JavaScript —
o arquivo veio do `dataTransfer`, passou pela mesma `upload()`, subiu
ao servidor via streaming, `Progress` funcionou, `router.refresh()`
trouxe o novo asset). Nenhum app real (`UniTV Mobile`/`UniTV TV Box`)
foi modificado — só visualizado, para conferir o preview de ícone/
banner reais. Aprovado pelo usuário antes do commit.

## Fase 3, Sprint 1 concluído — fundação de banco (commit `1a43d17`)

Diagnóstico completo apresentado primeiro (código/banco real via
Management API/storage/Design System/documentação) — 7 decisões
levantadas e aprovadas pelo usuário antes de qualquer SQL:

1. RLS: `SELECT` público mantido, `INSERT`/`UPDATE`/`DELETE`
   exclusivos para `authenticated` (mesmo padrão do ADR-017/`apps`).
2. `AssetUploadField` será generalizado no Sprint 3 (não duplicado).
3. `action_type` com vocabulário controlado: `none`/`app`/`url`.
4. `app_slug` **não removido** — análise de uso (zero referências no
   código, redundante com `action_target` no único registro) não
   achou motivo técnico pra remover; função no Portal Público ainda
   indefinida, decisão de manter por ora.
5. Nova coluna `category` **obrigatória** (`NOT NULL`), vocabulário
   controlado: `home`/`promocao`/`novidade`/`black_friday`/`destaque`.
   Registro existente classificado como `novidade` (conteúdo "Nova
   versão disponível").
6. Storage de banners: `assets/banners/{id}/image.webp` — **área
   própria, não reaproveita `apps/{asset_folder}/{platform}/...`**
   (confirmado explicitamente pelo usuário). Ainda não implementado
   (Sprint 3).
7. `updated_at` + trigger reaproveitando `public.set_updated_at()`
   (mesma função da migração de `apps`).

Aplicado e validado ao vivo contra o banco real (schema, constraints,
trigger, policies, grants e o registro reconferidos após a migração).
Achado documentado na validação: `updated_at` ficou com o timestamp da
migração (não igual a `created_at`) porque o backfill de `category`
disparou o trigger recém-criado — decisão do usuário: **está correto
assim**, a linha foi genuinamente alterada por esta migração.

## Fase 3, Sprint 2 concluído — CRUD básico (commit `94427c0`)

Escopo: listar, buscar, paginar, criar, editar, excluir, ativar/
desativar, reordenar por setas — sem upload, sem drag-and-drop.

- `banner.service.ts` espelha `app.service.ts` (mesmo padrão de
  paginação/busca/validação/`display_order`).
- `BannerForm.tsx`: `category` via `Select` obrigatório; `action_type`
  condicional — `none` esconde e limpa `action_target`, `app` mostra
  `Select` de aplicativos (valor = `apps.slug`, via `getAllApps()`
  novo em `app.service.ts` — `getApps()` é paginada, não serve pra
  popular dropdown), `url` mostra `Input type="url"` com validação
  nativa + validação de servidor.
- Seção "Imagem" visível com placeholder ("Salve o banner para
  habilitar o envio da imagem") — upload real fica pro Sprint 3.
- `ActionsMenu.tsx`, `OrderControls.tsx` e `StatusToggle.tsx`
  generalizados (props em vez de Server Action hardcoded) para
  Apps e Banners reusarem sem duplicar — visual/comportamento de Apps
  preservado, `AppsTableRow.tsx` atualizado.
- **Bug real encontrado e corrigido na validação:** Server Components
  não podem passar closures inline como prop pra Client Components —
  só a referência direta da Server Action ou `.bind()`. Afetava Apps
  e Banners igualmente; corrigido com `.bind(null, id)` nos dois.

Validado no navegador (criar/editar/excluir/buscar/paginar/reordenar/
toggle, nos dois caminhos de `action_type`) e regressão em Apps
conferida (toggle testado e revertido). Exclusão de banner não pôde
ser clicada via automação (`window.confirm()` nativo trava a aba —
limitação conhecida da ferramenta, não falha da aplicação); mesmo
código já comprovado em `deleteAppAction`.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado em OKLCH mas não virou
  token — uso pontual, não decidido ainda onde.

## Primeiro passo

**Fase 3 (Banners), Sprint 3 — Upload/Storage de imagens é o próximo
passo — ainda não iniciado, não implementar sem passar por
levantamento/aprovação primeiro** (mesmo procedimento de sempre).
Escopo já sinalizado no diagnóstico original e nas decisões do
Sprint 1:
- Generalizar `AssetUploadField.tsx` (endpoint/configuração via
  props) em vez de duplicar componente — decisão 2 do Sprint 1.
- Path de storage: `assets/banners/{id}/image.webp`, área própria,
  **não reaproveitar `apps/{asset_folder}/{platform}/...`** — decisão
  6 do Sprint 1, confirmada explicitamente pelo usuário.
- `image_path` já existe na tabela `banners`, só falta o fluxo de
  upload (rota `/api/banners/[id]/upload`, Server Action, preview).

Commits `1a43d17`/`94427c0` (Fase 3, Sprints 1-2) ainda não foram
pushados — confirmar com o usuário antes de dar push. Fase 1 completa
já está publicada em `origin/main` (até `fdcebcf`).
