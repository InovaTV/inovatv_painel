# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## ✅ Sincronizado com origin/main

`main` e `origin/main` no mesmo commit — `git push origin main`
concluído sem erros. Fase 1 completa e Fase 3 (Banners, Sprints 1-3)
estão integralmente publicadas em `origin/main`.

## Último commit (pushado)

`c17a72e` — `docs: NEXT_SESSION.md - Fase 3 Sprint 3 concluido,
proximo passo em aberto`. `git status`: working tree limpo.

Commits da Fase 3 publicados:
- `1a43d17` Sprint 1 — fundação de banco (banners): RLS,
  `updated_at`+trigger, coluna `category`, `action_type` controlado.
- `94427c0` Sprint 2 — CRUD básico de Banners (listar, buscar,
  paginar, criar, editar, excluir, ativar/desativar, reordenar).
- `3e3ce31` Sprint 3 — Upload/Storage de imagens: generaliza
  `AssetUploadField`, `uploadBannerAsset()`, rota
  `/api/banners/[id]/upload`.
- `c17a72e` docs — Sprint 3 concluído.

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
- ✅ **Fase 3 — Banners/Marketing — CONCLUÍDA e publicada em
  `origin/main`** (2026-08-08 a 2026-08-09). Sprints 1-3 concluídos,
  cada um com levantamento → aprovação → implementação → testes →
  revisão → commit:
  - ✅ Sprint 1 (Fundação de banco) — `1a43d17`.
  - ✅ Sprint 2 (CRUD básico) — `94427c0`.
  - ✅ Sprint 3 (Upload/Storage de imagens) — `3e3ce31`.
  - O módulo administrativo possui fundação de banco, CRUD,
    ordenação, ativação/desativação e upload/storage de imagens.
  - **O consumo público dos banners e o carrossel ficam fora desta
    fase** — são trabalho futuro, a tratar quando o Portal Público
    for iniciado (nenhum código/design desse consumo existe ainda).
  - Próximo módulo **ainda não definido** — decisão do usuário é
    revisar `ROADMAP.md` + este documento para escolher com base na
    arquitetura já construída, não simplesmente seguir a numeração
    (Fase 4 em diante) por padrão.
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

## Fase 3, Sprint 3 concluído — upload/storage de imagens (commit `3e3ce31`)

Levantamento completo apresentado primeiro (arquitetura de upload de
Apps, o que Banners já tinha, storage, reaproveitamento, regras,
preview, segurança) — decisões fechadas pelo usuário antes de
codificar:

- Limite 10MB (mesmo de "Upload Banner" de Apps, por analogia).
- Sem validação de dimensões/proporção neste sprint.
- Sem exclusão do arquivo na Hostinger ao excluir o banner — mesmo
  comportamento (lacuna) já existente em `deleteApp`; limpeza de
  assets órfãos fica para tarefa futura específica e abrangente.
- Sem conversão real pra WebP, sem instalar `sharp`/lib de imagem —
  nome fixo `.webp` é só convenção de path, mesmo comportamento já
  existente no "Upload Banner" de Apps.
- `formFieldType="image"`, path `assets/banners/{id}/image.webp`.

Implementado em duas etapas, com aprovação entre elas:
1. **`AssetUploadField.tsx` generalizado** — trocou `appId`/`type`
   fixos por `uploadUrl`/`formFieldType`/`acceptCaption`/
   `previewAspect` (props explícitas). `AppForm.tsx` atualizado nos 3
   call sites (apk/ícone/banner) com os mesmos valores de antes, agora
   explícitos. Testado no app de teste `sei lá`: os 3 uploads (inclusive
   substituição de APK) funcionando exatamente como antes.
2. **Upload de Banners** — `uploadBannerAsset()` em `banner.service.ts`
   (espelha `uploadAppAsset`), rota `/api/banners/[id]/upload`
   (espelha `/api/apps/[id]/upload`, mesmo streaming ndjson),
   `BannerForm.tsx` troca o placeholder estático pelo
   `AssetUploadField` real quando o banner já existe,
   `banners/[id]/editar/page.tsx` carrega `storage.stat`/
   `getPublicUrl` para preview persistente.

Validado com banner de teste "Teste Sprint 3 Upload" (nunca o real):
upload, progresso (ndjson capturado em andamento), preview
`aspect-video`/`object-cover`, persistência após reabrir a página, e
substituição (novo upload sobrescreveu o mesmo path via
`storage.replace()`). Banner de teste removido do banco via SQL após
validação (evitando o `window.confirm()` que trava a aba automatizada
— mesma limitação já registrada no Sprint 2); o arquivo de teste
ficou órfão na Hostinger, comportamento aceito para este sprint.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado em OKLCH mas não virou
  token — uso pontual, não decidido ainda onde.

## Primeiro passo

**Fase 3 (Banners/Marketing) está oficialmente encerrada e publicada.**
Não abrir Sprint 4 nem qualquer código novo de Banners sem pedido
explícito — inclusive as pendências já conhecidas (limpeza de assets
órfãos ao excluir banner, validação de dimensão/proporção, consumo via
`app_slug`) continuam fora de escopo até serem convocadas.

**Antes de escolher o próximo módulo**, o usuário quer revisar
`ROADMAP.md` (módulos Fase 4-7: Clientes, FAQ, Tutoriais,
Configurações) junto com este documento, para escolher o próximo com
base na arquitetura já construída (padrões de service/CRUD/upload já
consolidados em Apps e Banners), em vez de seguir a numeração por
padrão. Essa revisão ainda não aconteceu nesta sessão — é o próximo
passo real, antes de qualquer decisão de módulo.

**Portal Público / carrossel de banners:** explicitamente fora de
escopo de qualquer fase atual — só entra quando essa iniciativa for
formalmente aberta.

`main`/`origin/main` sincronizados (`c17a72e`), working tree limpa.
