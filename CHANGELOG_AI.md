# Changelog — Alterações feitas por IA

> Histórico cronológico (mais recente no topo) de alterações feitas
> por assistentes de IA neste projeto. Este arquivo passou a existir
> em 2026-08-06; alterações anteriores a essa data (ver `git log`)
> não estão detalhadas aqui.

---

## 2026-08-08 (32) — Fase 1, Sprint 2: cores hardcoded removidas em favor dos tokens

**Contexto:** levantamento completo (33 ocorrências, 10 arquivos) de
cores Tailwind cruas apresentado para revisão antes de qualquer
edição. Usuário decidiu os 2 gaps encontrados e autorizou a execução.

**Decisão 1 — Sidebar (gap novo, fechado em `DESIGN_SYSTEM.md` §5.3):**
a sidebar sempre foi escura por decisão de identidade, não acidente,
mas os 4 tokens shadcn dedicados a isso (`--sidebar`,
`--sidebar-foreground`, `--sidebar-accent`, `--sidebar-border`) nunca
tinham sido customizados — ficaram no neutro-claro padrão. Convertidos
com o mesmo processo do §5.2 (script Node, sRGB→OKLab) a partir das
cores reais em produção (`slate-950`/`slate-300`/`slate-800`),
preservando a aparência exata. Tons secundários da sidebar (`slate-400
/500/600`) viraram opacidade sobre `--sidebar-foreground` (`/75 /55
/40`) em vez de tokens novos — mesmo padrão que `ring-foreground/10`
já usa no resto do projeto.

**Decisão 2 — Fundo de página (`bg-slate-100`):** verificado que
`--background` (`oklch(1 0 0)`, branco puro) é idêntico a `--card` —
usá-lo eliminaria a separação visual entre o canvas da página e os
cards brancos. **Não alterado nesta sessão** — as 2 ocorrências
(`login/page.tsx:14`, `(dashboard)/layout.tsx:18`) continuam
`bg-slate-100`, aguardando decisão do usuário sobre criar um token
dedicado ou redefinir `--background`.

**Decisão 3 — Ponto de notificação (`bg-red-500`):** `bg-destructive`,
sem criar `warning` alternativo.

**Substituições aplicadas** (ver diff completo, não resumido aqui por
volume — 33 ocorrências menos as 2 do gap 2 = 31 trocas em 10
arquivos): `Sidebar.tsx`, `Header.tsx`, `login/page.tsx`,
`StatusBadge.tsx` (`bg-emerald-600` sólido → `bg-success/10
text-success`, mesmo padrão soft que `Badge variant="destructive"` já
usava — corrige uma inconsistência visual entre os badges Ativo/
Inativo que existia antes), `AssetUploadField.tsx`, `AppForm.tsx`,
`ActionsMenu.tsx`, `StatCard.tsx`, `ui/dialog.tsx` (`bg-black/10` →
`bg-foreground/10`, consistência com `ring-foreground/10` já usado no
mesmo componente).

**Validado:** `tsc`, `lint`, `build` limpos; conferência visual real
em `/apps` e `/apps/novo` — sidebar, badges de status e botão primário
sem nenhuma mudança de layout ou intenção visual perceptível.

**Não commitado ainda** — aguardando revisão do usuário.

---

## 2026-08-08 (31) — Fase 1, Sprint 1: tokens de cor do Design System aplicados

**Contexto:** primeira etapa de execução da Fase 1 (Implementação do
Design System) combinada no fechamento da sessão anterior. Sprint 1 é
só tokens em `globals.css` — sem tocar em componentes/páginas
(Sprint 2 em diante).

**Validação da cor antes de aplicar** (`DESIGN_SYSTEM.md` §5.2 pede
reconferência com conversor real antes de entrar no CSS): script Node
com a matriz sRGB→linear→OKLab padrão confirmou `#0F6D76` →
`oklch(0.4896 0.0800 205.28)`, batendo com a aproximação manual do
documento (`oklch(0.49 0.08 205)`).

**Alterado em `src/app/globals.css`:**
- `--primary`, `--primary-foreground`, `--ring`, `--sidebar-primary`
  (light e dark) — troca do neutro/índigo residual pelo teal oficial,
  exatamente como a tabela do §5.2 especifica.
- 6 tokens novos — `--success`/`--warning`/`--info` +
  `-foreground` de cada, iguais em light e dark (o documento não
  distingue por tema para esses três) — seguindo o padrão que
  `--destructive` já usa.
- Mapeamento dos 6 tokens novos em `@theme inline`
  (`--color-success`, etc.), mesmo padrão de `--color-destructive`,
  para que `bg-success`/`text-warning`/etc. existam como classes
  Tailwind quando o Sprint 2 remover os hardcodes.

**Validado:** `tsc --noEmit`, `npm run lint` e `npm run build` limpos;
`npm run dev` na porta 3900 e conferência visual real — botão "Novo
Aplicativo" e switches "Ativo" em `/apps` já herdam o teal via
`bg-primary` (shadcn `Button`/`Switch`), sem nenhuma mudança de
layout. Badges de status continuam verde/vermelho cru — esperado,
escopo do Sprint 2.

Próximo: Sprint 2 — remover cores Tailwind cruas (`slate-*`,
`blue-500`, `emerald-600`, `red-*`) de `Sidebar.tsx`, `Header.tsx`,
`StatusBadge.tsx`, `AppForm.tsx` etc., trocando por token.

---

## 2026-08-07 (30) — Auditoria de banco: backup + migração da Fase 4 (limpeza) preparados, aguardando aplicação

**Contexto:** encerramento combinado da auditoria de banco (entradas
27-29 cobriram as fases 1-3). Antes de remover `download_url`,
`downloader_code` e `storage_folder`, usuário pediu um backup simples
dos valores atuais (sem tabela nova, sem compatibilidade) e que o
motivo da remoção ficasse documentado como parte da evolução da
arquitetura (Projeto Downloads antigo + primeira implementação do
Storage).

**Backup:** `supabase/backups/20260807_apps_legacy_columns_backup.csv`
— `id`, `name`, `download_url`, `downloader_code`, `storage_folder`
das 5 linhas de `apps`, lido via Management API antes de qualquer
`DROP COLUMN`.

**Migração preparada** (`supabase/migrations/20260807190000_apps_drop_legacy_download_columns.sql`,
**ainda não aplicada** — aguardando confirmação explícita):
```sql
alter table public.apps
  drop column download_url,
  drop column downloader_code,
  drop column storage_folder;
```

**Verificado antes de escrever a migração:** nenhuma referência a
nenhuma das 3 colunas em `src/` (`grep` sem resultado) — confirma que
não há leitura/escrita ativa em nenhum fluxo do painel hoje.

Ver ADR-020 para o histórico completo (origem no Projeto Downloads
`inovatv.pro` e na primeira tentativa de representar armazenamento
neste projeto, antes de `asset_folder`/Hostinger virarem o padrão) e
para por que a remoção acontece agora, antes do Portal Público que a
ADR-008 original colocava como pré-condição.

---

## 2026-08-07 (29) — Auditoria de banco: Fase 3 (evolução de schema) aplicada — updated_at automático em apps

**Contexto:** handoff entre computadores desde a entrada 28 (fim da
Fase 2). `.env.local` local estava desatualizado (sem
`SUPABASE_ACCESS_TOKEN`/`STORAGE_PORT`) — sincronizado a partir da
cópia canônica no Google Drive antes de continuar (ver `.gitignore`,
memória `env_local_sync_drive`). Usuário aprovou seguir direto para a
Fase 3.

**Aplicado** (`supabase/migrations/20260807180000_apps_updated_at_trigger.sql`,
via Management API do Supabase, com aprovação explícita antes de
rodar):
- `apps.updated_at` (`timestamptz not null default now()`).
- Backfill: linhas existentes (5 apps) receberam `updated_at =
  created_at`, não o timestamp da migração — nunca foram de fato
  atualizadas desde a criação.
- Função `public.set_updated_at()` — **genérica de propósito**, sem
  referenciar `apps` nem nenhuma coluna além de `updated_at`, a pedido
  explícito do usuário: reusar a mesma função em módulos futuros que
  também ganharem `updated_at` (Banners, Notícias, FAQ, Tutoriais
  etc.), criando só um trigger específico por tabela
  (`<tabela>_set_updated_at`), nunca uma função por tabela.
- Trigger `apps_set_updated_at` (`BEFORE UPDATE ... FOR EACH ROW`).

**Verificado:**
- `npx tsc --noEmit`, `npm run lint` e `npm run build` limpos.
- Coluna e trigger confirmados via `information_schema` depois da
  aplicação.
- Testado com um `UPDATE ... RETURNING` real numa linha de teste:
  `updated_at` mudou para o timestamp do update, `created_at` ficou
  intacto; linha revertida ao estado original (`is_active`) logo em
  seguida.

Ver ADR-019 para o registro completo da decisão, incluindo o padrão a
repetir em módulos futuros (reusar a função, criar só o trigger).

**Não incluído nesta entrada:** Fase 4 (remover
`download_url`/`downloader_code`/`storage_folder`) — ainda não
iniciada, precisa de confirmação explícita antes de qualquer `DROP
COLUMN` (operação destrutiva, `download_url` tem dado real nos 2 apps
reais).

---

## 2026-08-07 (28) — Auditoria de banco: Fase 2 (integridade) aplicada — UNIQUE/NOT NULL/FK em apps

**Contexto:** entrada 27 fechou a Fase 1 (segurança) da auditoria de
banco, num commit próprio (`2f27978`). Usuário aprovou a Fase 2
(integridade) com um ajuste em relação à proposta inicial: além do
`UNIQUE` em `apps.slug` e da FK `apps.asset_folder → products.
asset_folder`, pediu para também tornar os dois campos `NOT NULL`,
alinhando o banco com o que a aplicação já trata como obrigatório.

**Aplicado** (`supabase/migrations/20260807170000_apps_integrity_slug_asset_folder.sql`,
via Management API do Supabase, com aprovação explícita antes de
rodar):
- `apps.slug`: `NOT NULL` + `UNIQUE` (`apps_slug_key`).
- `apps.asset_folder`: `NOT NULL` + `FOREIGN KEY` para
  `products.asset_folder`, `ON UPDATE RESTRICT ON DELETE RESTRICT`
  (`apps_asset_folder_fkey`) — `RESTRICT` e não `CASCADE` porque
  `asset_folder` é literalmente um componente do caminho físico de
  armazenamento na Hostinger; um `CASCADE` atualizaria o valor no
  banco mas nunca moveria os arquivos já enviados.

**Pré-condições verificadas antes de aplicar:** 0 slugs duplicados, 0
`asset_folder` órfão (sem produto correspondente), 0 valores nulos em
`slug`/`asset_folder` nas 5 linhas existentes — migração aplicada sem
nenhum conflito de dado.

**Rede de segurança adicionada** — `src/services/app.service.ts`:
`rethrowAsSlugConflict()` detecta o código Postgres `23505` na
constraint `apps_slug_key` especificamente e relança como
`AppValidationError({ slug: "Já existe um aplicativo com esse slug." })`
em vez de deixar o erro genérico do banco vazar. Cobre o caso raro de
corrida que `isSlugTaken()` sozinho não pega (duas criações/edições
simultâneas com o mesmo slug passando pela validação da aplicação ao
mesmo tempo) — mantém a mensagem amigável mesmo nesse caminho. Usado
em `createApp()` e `updateApp()`.

**Verificado:**
- `npx tsc --noEmit`, `npm run lint` e `npm run build` limpos.
- Constraints e `NOT NULL` confirmados via `pg_constraint`/
  `information_schema.columns` depois da aplicação.
- Testado ao vivo no navegador: editar um app existente (UniTV
  Mobile) continua funcionando normalmente com as novas constraints em
  vigor (sem erro, redireciona pra `/apps` como sempre).

Ver ADR-018 para o registro completo da decisão.

**Não incluído nesta entrada (próximas fases, mesma auditoria):** Fase
3 (`updated_at` + trigger automático) e Fase 4 (remover
`download_url`/`downloader_code`/`storage_folder`) — nenhuma migração
criada ou aplicada ainda, aguardando aprovação fase a fase.

---

## 2026-08-07 (27) — Auditoria de banco: achado crítico de RLS + Fase 1 (segurança) aplicada

**Contexto:** com o módulo Aplicativos funcionalmente concluído
(entrada 26), o usuário pediu a auditoria de banco combinada
anteriormente (`apps`/`products`/relacionadas — colunas em uso,
reservadas, legadas, índices, constraints, tipos, simplificação).

**Ferramenta usada:** Management API do Supabase
(`POST /v1/projects/{ref}/database/query`) com o `SUPABASE_ACCESS_TOKEN`
já existente no `.env.local` (ver ADR-010) — permite rodar SQL de
introspecção (e, com aprovação explícita, DDL) direto contra o banco
real, sem precisar de Docker local para `supabase db dump`.

**Achado crítico (reportado primeiro, antes do resto da auditoria):**
`public.apps` tinha RLS habilitado mas com as 4 policies
("Enable ... for all users") permissivas para o role `public`
(`qual`/`with_check` = `true`), combinado com grants completos de
SELECT/INSERT/UPDATE/DELETE para `anon`. Ou seja: a chave anônima
(pública, embutida no bundle do navegador) permitia ler, criar, editar
e **apagar** qualquer app direto via REST do Supabase, sem logar no
painel — o login/`proxy.ts` protegia só a UI do Next.js, nunca o
banco. `products` (sem RLS, grants mais restritos) e `banners`
(RLS + só policy de SELECT) tinham exposição menor; `banners` já
seguia o padrão correto.

**Auditoria completa apresentada ao usuário** cobrindo: colunas de
`apps` (13 em uso, 4 reservadas para funcionalidade futura —
`package_name`/`min_android_version`/`current_version_code`/
`requires_login` —, 3 legadas — `download_url`/`downloader_code`/
`storage_folder`), ausência de `UNIQUE` em `apps.slug`, ausência de FK
entre `apps.asset_folder` e `products.asset_folder` (hoje só
convenção de código), ausência de `updated_at`/trigger, e o achado de
RLS acima. Usuário aprovou a auditoria e definiu a ordem de execução
(divergindo da apresentação inicial, que tratou tudo como
"oportunidades" no mesmo nível): Fase 1 Segurança → Fase 2 Integridade
(UNIQUE slug + FK asset_folder) → Fase 3 Evolução de schema
(updated_at + trigger) → Fase 4 Limpeza (remover colunas legadas).

**Fase 1 (Segurança) executada nesta entrada** — usuário pediu para
fechar `apps` **completamente** para `anon` (nem SELECT), não só
escrita: painel é o único consumidor da tabela hoje, sem portal
público nem API pública (mesma regra da ADR-008 — não construir
pensando em compatibilidade futura). Ver ADR-017 para o detalhe
completo da decisão.

- `supabase/migrations/20260807160000_lock_down_apps_rls_anon.sql`
  (novo): dropa as 4 policies antigas, cria 4 novas restritas a
  `to authenticated`, revoga SELECT/INSERT/UPDATE/DELETE de `anon`.
- Migração **aplicada em produção** via Management API (com aprovação
  explícita do usuário antes de rodar) — não é só um arquivo esperando
  aplicação manual, diferente das migrações anteriores deste projeto
  (que só tinham a chave anônima disponível).

**Verificado:**
- `curl` direto contra `/rest/v1/apps` com a chave anônima → `401`,
  `{"code":"42501","message":"permission denied for table apps"}`.
- Painel logado testado ao vivo no navegador (Claude in Chrome) depois
  da mudança: listagem carrega normalmente, toggle de status
  (`teste100` → Ativo → Inativo, revertido ao estado original) prova
  que leitura e escrita continuam funcionando via sessão autenticada.
- `npx tsc --noEmit` e `npm run lint` limpos (nenhum código TS mudou
  nesta entrada, só SQL).

**Não incluído nesta entrada (fica para as próximas fases da mesma
auditoria, mesma sessão ou seguinte):** Fase 2 (UNIQUE em `apps.slug`,
FK `apps.asset_folder → products.asset_folder`), Fase 3 (`updated_at`
+ trigger), Fase 4 (remover `download_url`/`downloader_code`/
`storage_folder`). Nenhuma dessas migrações foi criada nem aplicada
ainda — aguardando a mesma aprovação explícita fase a fase.

---

## 2026-08-07 (26) — Validação de formulário + tratamento de erro — módulo Aplicativos CONCLUÍDO

**Contexto:** entrada 25 fechou Download/Preview/Status/Busca/
Ordenação/Paginação e deixou pendentes os dois últimos itens do
`DEFINITION_OF_DONE.md`: validação de formulário além de `required` e
tratamento de erro visível ao usuário. Usuário pediu para concluir os
dois, rodar `tsc`/`lint`/`build` de novo, e então fazer **um único
commit** representando o encerramento funcional do módulo — sem abrir
outro módulo depois; próximo passo é a auditoria do banco de dados e,
só depois, a fase de UI/UX.

**Validação de formulário** — `src/services/app.service.ts`:
- `AppValidationError` (novo): erro de negócio com `fieldErrors:
  Record<string,string>`, distinto de erro de infraestrutura.
- `validateAppFields()`: nome (obrigatório, mín. 2 chars), slug
  (obrigatório, regex `^[a-z0-9]+(-[a-z0-9]+)*$`), versão (obrigatória,
  regex `^\d+(\.\d+)*$` — aceita os formatos reais já em uso: "1",
  "5", "012", "3.24.2", "4.19.1.00"), plataforma (contra allowlist
  `["mobile","tv"]`, defesa em profundidade além do `<select>`).
- `isSlugTaken()`: checagem de unicidade contra o banco (excluindo o
  próprio id em updates). **Descoberto via teste real:** a tabela
  `apps` não tem `UNIQUE` constraint em `slug` (confirmado inserindo e
  removendo uma linha de teste via `createAdminClient()`) — a
  unicidade agora é garantida na camada de aplicação.
- `createApp()`/`updateApp()` chamam a validação antes de tocar no
  banco e lançam `AppValidationError` se algo falhar; valores são
  `.trim()`ados antes de salvar.

**Tratamento de erro visível** — Server Actions pararam de deixar erro
"vazar" como página de erro genérica do Next:
- `AppActionState` (novo tipo, em `app.service.ts`):
  `{ error?: string; fieldErrors?: Record<string,string> }`.
- `createAppAction`/`updateAppAction` mudaram de assinatura para
  `(prevState, formData)` (compatível com `useActionState`) e retornam
  `AppActionState` em vez de lançar — capturam `AppValidationError`
  (vira `fieldErrors`) e qualquer outro erro (vira `error` genérico +
  `console.error` para debug). `redirect()` continua fora do
  `try/catch` (nunca deve ser capturado).
- `AppForm.tsx`: passou a usar `useActionState` em vez de só
  `action={...}`; cada campo mostra sua mensagem (`FieldError`) e um
  banner vermelho aparece no topo para erro genérico. Também mapeia o
  erro de `resolveProductAssetFolder()` ("Nome do novo produto é
  obrigatório.") para o campo `new_product_name`.
- `ActionsMenu` (excluir), `StatusToggle` (toggle) e `OrderControls`
  (reordenar): as três agora envolvem a chamada da Server Action em
  `try/catch` e mostram `window.alert()` em caso de falha, em vez de
  falhar silenciosamente. `StatusToggle` também reverte o estado
  otimista do `Switch` se a chamada falhar.

**Verificado:** `npx tsc --noEmit`, `npm run lint` e `npm run build`
limpos. Testado ao vivo no navegador: slug duplicado (usando o slug
real de um app existente) bloqueado com mensagem inline antes de
qualquer escrita no banco; slug com caracteres inválidos e versão com
letras bloqueados com mensagens específicas; criação com dados válidos
funcionando normalmente (redireciona para a edição). App de teste
criado durante a verificação removido depois via script descartável
(`_tmp-cleanup-test-app.ts`) — nenhum dado de teste ficou no banco.

**Módulo Aplicativos está funcionalmente concluído** conforme
`DEFINITION_OF_DONE.md` (ver seção "CONCLUÍDO" naquele arquivo e
`ROADMAP.md` Fase 2). Próximo passo combinado: auditoria de banco,
depois fase de UI/UX — nenhum outro módulo deve começar antes disso.

---

## 2026-08-07 (25) — Download, Preview, Status, Busca, Ordenação e Paginação do módulo Aplicativos

**Contexto:** com CRUD + os 3 uploads já fechados (entrada 24), o
usuário pediu para seguir a lista de pendências do
`DEFINITION_OF_DONE.md` nesta ordem exata: Download, Preview, Status,
Busca, Ordenação, Paginação — sem entrar na fase de UI/UX antes de
concluir todos.

**Download** (ADR-016) — `src/app/api/apps/[id]/download/route.ts`
(Route Handler `GET`) resolve `storage_path` no banco e responde com
`NextResponse.redirect()` para a URL pública. Indireção proposital: o
client sempre aponta para `/api/apps/{id}/download`, nunca direto pra
Hostinger — permite adicionar estatística/auditoria/controle de
acesso depois sem mudar o client. `ActionsMenu` ganhou prop opcional
`downloadHref` (item "Baixar APK" só aparece com `storage_path`
setado). Testado ao vivo: fetch com `redirect: "manual"` retorna
`type: "opaqueredirect"` para app real; id inexistente retorna `500`
(mesmo comportamento de qualquer página deste projeto que dependa de
um id inválido).

**Preview** — `editar/page.tsx` monta `iconUrl`/`bannerUrl` via
`storage.getPublicUrl()` e repassa por `AppForm` até
`AssetUploadField`, que agora recebe `previewUrl` opcional e renderiza
uma thumbnail (`<img>`, com `?v=modifiedAt` para invalidar cache após
um replace no mesmo path). Testado ao vivo com upload real de um PNG
de teste no app "UniTV Mobile" — depois **revertido** (arquivo
apagado da Hostinger via script `_tmp-revert-icon.ts` descartável +
`icon_path` restaurado para `null`), a pedido do usuário, que prefere
apps sem mídia real permanecerem sem mídia em vez de placeholder.

**Status** — `StatusToggle` (`src/components/apps/StatusToggle.tsx`):
`Switch` do shadcn (`npx shadcn add switch`, sem dependência nova além
do componente) + `StatusBadge` existente, chamando a nova Server
Action `toggleAppStatusAction` → `setAppActive()` em
`app.service.ts`. Substituiu o `StatusBadge` estático na tabela.

**Busca** — `AppsSearch` (client, debounce 300ms) escreve `?q=` na URL
via `router.replace`; `getApps()` ganhou `GetAppsOptions.q` (filtro
`.ilike("name", ...)`). `AppsPage` virou async com `searchParams`.
`AppsTable` ganhou estado vazio ("Nenhum aplicativo encontrado.").

**Ordenação** — a pedido do usuário, implementação simples (setas
↑/↓, sem drag-and-drop, sem lib nova). Primitiva de backend
desacoplada da UI: `swapDisplayOrder(a, b)` em `app.service.ts` só
troca o `display_order` de dois apps — não sabe quem é "vizinho".
`OrderControls` (client) calcula prev/next a partir do array já
renderizado (`AppsTable` passa `apps[index-1]`/`apps[index+1]`) e
chama a Server Action `swapAppOrderAction`. Seta ↑ desabilitada no
primeiro item, ↓ desabilitada no último. Preparado para, no futuro,
trocar só a interação (drag-and-drop) sem tocar em
`swapDisplayOrder`/`swapAppOrderAction`.

**Paginação** — `getApps()` ganhou `page`/`APPS_PAGE_SIZE` (10) e
passou a retornar `{ apps, total, page, pageSize }`. **Bug real
pego em teste manual:** PostgREST responde `PGRST103` ("Requested
range not satisfiable") quando o offset do `.range()` é `>=` à
contagem real de linhas (mas não quando os dois são `0`) — acontecia
ao acessar `/apps?page=2` com só 5 apps no banco, quebrando a página
inteira (erro 500). Corrigido fazendo a contagem numa query separada
(`head: true`) *antes* de montar o `.range()`, grampeando a página
pedida ao número real de páginas — nunca mais pede um offset
inválido. `AppsPage` agora usa o `page` (já grampeado) devolvido por
`getApps()`, não o valor cru da URL, pra manter o rótulo "Página X de
Y" e os estados de disabled do `AppsPagination` sempre consistentes
com os dados exibidos.

**Verificado:** `npx tsc --noEmit`, `npm run lint` e `npm run build`
limpos. Todas as seis funcionalidades testadas ao vivo no navegador
via Claude in Chrome (Download, Preview, Status, Busca, Ordenação) ou
por chamada direta ao service contra o Supabase real (Paginação, após
o bug do PGRST103 aparecer num teste no navegador). Nenhum dado de
teste ficou para trás: ícone de teste revertido, toggles de status e
trocas de ordem revertidos ao estado original depois de confirmados.

**Não incluído nesta sessão (fica para a próxima):** validação de
formulário além de `required`, tratamento de erro visível ao usuário
(hoje só `console.error`) — únicos itens do
`DEFINITION_OF_DONE.md` do módulo Aplicativos ainda pendentes antes de
poder considerá-lo 100% concluído.

---

## 2026-08-07 (24) — Bug real de senha FTP corrigido + progresso completo no upload

**Contexto:** sessão começou sincronizando `.env.local` entre os dois
computadores do usuário (compartilhado via Google Drive desde a sessão
anterior — pasta `INOVATV PAINEL - ENV`). A senha FTP tinha sido
rotacionada num dos computadores; o outro ainda tinha a antiga. Ao
sincronizar e testar, apareceu um bug real e intermitente: Upload de
Ícone/Banner/APK dava `530 Login incorrect` no navegador **mesmo com a
senha certa** no `.env.local` — mas `npm run storage:test` (diagnóstico
via CLI) sempre passava com a mesma senha.

**Causa raiz:** a senha FTP contém um `$` seguido de letras
(`...e$RrJp...`). O loader de env do Next.js (`@next/env`) expande
`$VAR` automaticamente dentro de `.env*` (feature documentada, não bug
do framework) — como não existe variável `RrJp`, o Next silenciosamente
apagava esse trecho da senha em runtime. `storage-doctor.ts` usava
`node --env-file=.env.local` (loader nativo do Node, sem expansão), por
isso sempre via a senha correta e nunca reproduzia o bug — falso
negativo estrutural no diagnóstico.

**Corrigido**
- `.env.local` (não versionado, sincronizado via Drive): `$` escapado
  para `\$` na senha FTP.
- `scripts/storage-doctor.ts`: passou a carregar env via
  `@next/env#loadEnvConfig` (mesmo loader do app), com `import()`
  dinâmico do storage provider *depois* de carregar o env (import
  estático seria hoisted e avaliaria `remote-storage.ts` — que lê
  `process.env` no topo do módulo — antes do loadEnvConfig rodar).
- `package.json`: `storage:test` não usa mais `--env-file`.

Ver ADR-015 para o registro permanente dessa regra (sempre usar o
loader do Next em qualquer script/diagnóstico deste projeto).

**Também implementado:** progresso real de upload também na etapa
servidor→armazenamento remoto (antes só cobria navegador→servidor,
ficando parada em "Processando no servidor... 100%" pelo tempo todo da
transferência FTP real — a etapa mais lenta). Ver ADR-014.

- `src/lib/storage/types.ts` — `UploadInput` ganhou `onProgress?:
  (sentBytes: number) => void`.
- `src/lib/storage/remote-storage.ts` — `uploadViaFtp` usa
  `client.trackProgress()` (API nativa do `basic-ftp`) para chamar
  `onProgress` a cada ~500ms de transferência. SFTP não reporta
  progresso incremental (sem impacto prático — conexão real é sempre
  FTP puro, SFTP falha e cai no fallback).
- `src/app/api/apps/[id]/upload/route.ts` — resposta virou streaming
  ndjson (uma linha de JSON por evento de progresso + evento final com
  `{done: true, path}` ou `{done: true, error}`). Erros agora vêm
  no corpo do stream, não mais via status HTTP (a resposta já fixa
  status 200 assim que o streaming começa).
- `src/components/apps/AssetUploadField.tsx` — lê o stream via
  `xhr.addEventListener("progress", ...)` (evento de download do XHR,
  não o de upload), parseando linhas ndjson conforme chegam.
- `package.json`: `dev`/`start` fixados na porta `3900` — a 3000
  default colide com outro serviço já rodando neste PC
  (`shwaserver2.exe`, projeto não relacionado do usuário).

**Testado:** `npx tsc --noEmit` e `npm run lint` limpos. Upload real de
ícone (~4.7MB) testado ao vivo no navegador via Claude in Chrome —
barra de progresso subindo de 0%→100% de verdade durante a etapa FTP
(antes ficava travada), "Enviado com sucesso" confirmado. Testado
também via requisição sintética direta à Route Handler (sem
autenticação — descartado, rota exige sessão; validação real foi pelo
navegador autenticado).

**Commit:** `28464df`, push feito para `origin/main`.

---

## 2026-08-06 (23) — Upload de Ícone e Banner (reaproveitando a infraestrutura por completo)

**Contexto:** usuário validou a revisão de UX (entrada anterior) e o
Upload de APK pelo navegador, e autorizou Ícone/Banner reaproveitando
`uploadAppAsset`/Route Handler/`StorageProvider` sem duplicar código —
exatamente o que a entrada 18 já tinha preparado (`ASSET_CONFIG` já
suportava os três tipos desde o início).

**Alterado**
- `[id]/editar/page.tsx` — busca `storage.stat()` também para
  `icon_path`/`banner_path` (se existirem), em paralelo com o do APK.
- `AppForm.tsx` — os dois `LockedAssetPlaceholder` ("Disponível em
  breve") foram substituídos por `AssetUploadField` reais
  (`type="icon"`/`type="banner"`), mesmo componente já usado pro APK.
  Função `LockedAssetPlaceholder` removida (sem uso restante). Helper
  `toCurrentAsset()` extraído para não repetir a conversão
  `AssetStat → { size, modifiedAt }` três vezes.

**Não foi necessário mudar:** `app.service.ts` (`uploadAppAsset`/
`ASSET_CONFIG`), a Route Handler, `AssetUploadField.tsx` — zero
duplicação, exatamente como pedido.

**Testado:** `replace()`+`stat()`+`delete()` para os paths reais de
ícone (`.../icon/icon.png`) e banner (`.../banner/banner.webp`) via
script descartável (criado e removido nesta entrada), confirmando o
mesmo mecanismo genérico funciona para os dois tipos.

**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
limpos.

**ROADMAP.md / DEFINITION_OF_DONE.md atualizados:** Upload de Ícone e
Upload Banner do app marcados como concluídos. Itens restantes do
módulo Aplicativos: Preview, Download, Ordenação (UI de
reordenação — hoje só automática), Status (toggle visual), Busca,
Paginação, validação além de `required`, tratamento de erro visível
mais completo.

**Escopo mantido estrito:** nenhuma melhoria visual foi feita nesta
entrada — usuário reservou isso para uma fase exclusiva de UI/UX após
o módulo Aplicativos estar 100% fechado. Auditoria do banco (`apps`,
`products` e relacionadas) também **não** foi feita — fica para
depois de Ícone/Banner estarem concluídos *e validados* pelo usuário
no navegador.

---

## 2026-08-06 (22) — Revisão funcional da tela de Aplicativos: proposta aprovada e implementada

**Contexto:** com Upload de APK validado pelo navegador de verdade, o
usuário aprovou uma proposta de revisão funcional antes de abrir
Ícone/Banner: layout em duas colunas, automação de campos (Ordem,
Slug, Produto), informações do arquivo na UI, Ícone/Banner
claramente indisponíveis (não "parecendo funcionar"), e upload
reutilizável com progresso real.

**Adicionado**
- `supabase/migrations/20260806150000_create_products_table.sql` —
  tabela `products` (id, name, asset_folder, created_at), seedada com
  `UniTV`/`unitv` (alinhado ao asset_folder já usado pelos 2 apps
  reais). Sem FK em `apps.asset_folder` — products é só a lista
  controlada de onde o valor vem, não uma relação formal (decisão
  consciente de manter simples).
- `supabase/migrations/20260806150100_grant_products_access.sql` +
  `20260806150200_grant_products_service_role.sql` — tabelas criadas
  via migração raw não herdam os grants que `apps` tem (criada via
  dashboard); precisou de `GRANT` explícito pra `anon`/`authenticated`/
  `service_role`. Descoberto e corrigido via teste real, não suposto.
- `src/services/product.service.ts` — `getProducts`, `getProduct`,
  `createProduct` (deriva `asset_folder` via `slugify`),
  `resolveProductAssetFolder` (usado pelas duas Server Actions de
  app, evita duplicar a lógica de "produto existente vs. + Novo
  Produto").
- `StorageProvider.stat(path)` (`types.ts`/`remote-storage.ts`) —
  tamanho + data de modificação, `null` se não existe. SFTP via
  `stat()`, FTP via `size()`+`lastMod()`. Zero coluna nova no banco —
  reaproveitável por Ícone/Banner/Tutoriais/FAQ depois.
- `slugify`/`formatBytes`/`formatDate` em `src/lib/utils.ts` —
  compartilhados entre client (auto-slug ao digitar o Nome) e server
  (`asset_folder` de produto novo).
- `src/app/api/apps/[id]/upload/route.ts` — Route Handler (ADR-013,
  exceção pontual e documentada à ADR-003) usado só para upload de
  arquivo, chamando a mesma `uploadAppAsset()`. Protegido
  automaticamente pelo `proxy.ts` (cobre `/api/*`) e pelo
  `proxyClientMaxBodySize` já configurado.
- `src/components/apps/AssetUploadField.tsx` — widget reutilizável de
  upload via `XMLHttpRequest`: progresso real (`xhr.upload.onprogress`),
  etapas rotuladas ("Enviando arquivo..." → "Processando no
  servidor..." → "Concluído"), bloqueio de envio duplo (input
  desabilitado durante upload), mensagens de sucesso/erro. Type-
  agnóstico (`apk`/`icon`/`banner`) — Ícone/Banner reaproveitam sem
  mudar código quando forem habilitados.

**Alterado**
- `AppData` (`app.service.ts`) — `display_order` removido (agora
  automático: `createApp` calcula `MAX(display_order) + 1`; `updateApp`
  não toca mais nesse campo). `App` (tipo de leitura) continua com
  `display_order: number`.
- `AppForm.tsx` — reescrito: layout de duas colunas (dados à
  esquerda, Arquivos à direita), Slug auto-gerado do Nome via
  `slugify` (para de sincronizar assim que o campo é editado
  manualmente), `<select>` de Produto (nomes reais, nunca
  `asset_folder`) com "+ Novo Produto" revelando um campo de texto,
  campo Ordem removido do form. Área de Arquivos: `AssetUploadField`
  real para APK (só em modo edição — criar precisa salvar primeiro,
  já que o path depende do `id`), Ícone/Banner como placeholder com
  cadeado "Disponível em breve" (sem `<input>` nenhum, nada que
  pareça clicável).
- `novo/actions.ts`/`apps/actions.ts` — não fazem mais upload de
  arquivo (isso migrou pra Route Handler); resolvem `asset_folder`
  via `resolveProductAssetFolder`. `createAppAction` agora redireciona
  para `/apps/{id}/editar` (não `/apps`) — permite enviar o APK
  imediatamente após criar.
- `novo/page.tsx`/`[id]/editar/page.tsx` — buscam `products`;
  `editar` também busca `storage.stat()` do APK atual (se existir) e
  passa pro form.

**Testado:** `stat()` (tamanho, data, retorno `null` para arquivo
inexistente), cálculo de próxima `display_order`, resolução de
produto por id — todos via script descartável (criado e removido
nesta entrada) contra o banco/Storage reais. `storage:test` padrão
sem regressão.

**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
limpos.

**Ainda pendente:** reconfirmação do usuário no navegador — mudança
de UI grande, script não substitui teste manual real.

---

## 2026-08-06 (21) — Corrigido "Timeout (control socket)" no Upload de APK

**Contexto:** com o multipart resolvido (entrada 20), o teste manual
do usuário avançou e revelou um segundo erro real: `Timeout (control
socket)` durante o envio via FTP.

**Causa raiz encontrada** (lendo o source do `basic-ftp`, não
supondo): a biblioteca tem uma proteção padrão contra bounce attack —
quando o servidor responde ao comando PASV com um host **diferente**
do host da conexão de controle, o `basic-ftp` por padrão
(`allowSeparateTransferHost: false`) ignora esse host e força o da
conexão de controle. Em hospedagem compartilhada atrás de load
balancer (Hostinger, aqui), isso trava a conexão de dados até estourar
o timeout de 30s da conexão de controle. Confirmado no próprio código
fonte (`node_modules/basic-ftp/dist/transfer.js`), não deduzido só
pela mensagem de erro.

**Alterado:** `src/lib/storage/remote-storage.ts` — todas as 6
instâncias de `FtpClient` agora passam por `createFtpClient()`, que
define `allowSeparateTransferHost: true` (confiável aqui: o host é
`STORAGE_HOST` conhecido, não input de terceiros) e aumenta o timeout
de 30s (padrão) para 20 minutos (medido: 20MB reais levaram ~28s
nesse servidor — ~0,7MB/s; no mesmo ritmo, 300MB, o teto decidido
para APK, levaria ~7min — 20min dá margem confortável).

**Testado de verdade:** script descartável (criado e removido nesta
entrada) enviou 20MB reais via `storage.replace()` — sucesso em
~27.6s, arquivo confirmado no Storage, removido depois. `storage:test`
padrão (arquivos pequenos) continua passando, sem regressão.

**Verificação:** `tsc`/`lint`/`build` limpos.

**Ainda pendente:** reconfirmação do usuário no navegador (fluxo real
com sessão + Server Action), que é diferente do teste via script.

---

## 2026-08-06 (20) — Corrigido "Unexpected end of form" no Upload de APK

**Contexto:** teste manual do usuário no navegador falhou com
`Unexpected end of form` ao enviar um APK real (20-45MB) via
`AppForm`. Confirma que o script da entrada 18 validou a
infraestrutura, mas não o caminho real do usuário — exatamente a
lacuna que o teste manual existia pra encontrar.

**Causa raiz encontrada:** Next.js 16 tem um limite de tamanho de
body **separado** para requisições que passam pelo `proxy.ts`
(`experimental.proxyClientMaxBodySize`, default 10MB — documentado
em `node_modules/next/dist/server/config-shared.d.ts`), independente
do `experimental.serverActions.bodySizeLimit` já configurado. Como
`src/proxy.ts` roda em praticamente todas as rotas (ADR-002), ele
cortava o multipart em 10MB antes da requisição chegar na Server
Action — o parser interno (`busboy`) reporta esse corte como
"Unexpected end of form" em vez de um erro claro de limite excedido.

**Alterado:** `next.config.ts` — adicionado
`experimental.proxyClientMaxBodySize: "300mb"`, ao lado do
`serverActions.bodySizeLimit` já existente.

**Verificação:** `tsc`/`lint`/`build` limpos. **Ainda não
reconfirmado pelo usuário no navegador** — próximo passo é repetir
exatamente o mesmo teste manual que revelou o bug.

**Escopo mantido estrito, por decisão explícita do usuário:** não
mexi em Ícone/Banner nem no texto da seção "Arquivos" do `AppForm`
nesta entrada, mesmo sendo mencionados na mesma mensagem — a
recomendação final do usuário foi focar só na correção do bug antes
de qualquer UX.

---

## 2026-08-06 (19) — Log de instrumentação para o teste manual de Upload de APK

Usuário decidiu **não avançar para Ícone/Banner** antes de validar
Upload de APK pelo navegador de verdade (script da entrada anterior
provou a infraestrutura, não o caminho real do usuário). Pediu log
de tamanho/tempo pra ter dado concreto se o teste manual falhar ou
for lento.

**Alterado:** `uploadAppAsset` (`app.service.ts`) agora loga
`[upload] {tipo} "{path}": {tamanho}MB — storage.replace() {ms}ms,
total {ms}ms` ao final de cada upload bem-sucedido.

**Verificação:** `tsc`/`lint` limpos. Sem novo teste automatizado —
a validação agora é manual, pelo usuário, no navegador.

---

## 2026-08-06 (18) — Upload de APK implementado e testado de ponta a ponta

**Contexto:** primeira funcionalidade construída sobre a infraestrutura
de Storage já pronta. Seguiu as duas regras do usuário: nenhum
componente React fala com o Storage (só Server Actions →
`storage.replace()`), e a lógica ficou genérica (`uploadAppAsset`)
para Ícone/Banner reaproveitarem depois sem reescrever nada.

**Adicionado**
- `uploadAppAsset(app, type, file)` em `app.service.ts` — valida
  tamanho por tipo (`ASSET_CONFIG`: apk 300MB, icon 5MB, banner
  10MB, nomes fixos `app.apk`/`icon.png`/`banner.webp`), monta o path
  fixo (`apps/{asset_folder}/{platform}/{tipo}/{arquivo}`), chama
  `storage.replace()`, grava a coluna certa (`storage_path`/
  `icon_path`/`banner_path`) no banco. Só o `type: "apk"` está
  ligado a uma Server Action por enquanto — `"icon"`/`"banner"` já
  funcionam na função, só falta o input habilitado no form.
- `AppData`/`App` (`app.service.ts`) ganharam `asset_folder`
  (obrigatório, novo campo no form) e os 3 campos de path para
  leitura (`storage_path`/`icon_path`/`banner_path`).
- `next.config.ts` — `experimental.serverActions.bodySizeLimit: "300mb"`
  (default do Next é 1MB, bem abaixo do necessário pro APK).

**Alterado**
- `createAppAction`/`updateAppAction` — recebem o arquivo `apk` do
  `FormData`; se presente, chamam `uploadAppAsset` depois de
  criar/atualizar a linha (precisam do `id` e do `asset_folder`
  já salvos).
- `AppForm.tsx` — campo `asset_folder` novo (texto, obrigatório);
  input de APK habilitado (`name="apk"`, `accept=".apk"`), mostra o
  path atual quando já existe; Ícone/Banner continuam `disabled`.

**Testado de verdade** (script descartável, criado e removido nesta
entrada — não faz parte do repo): criou uma linha de app de teste,
chamou `storage.replace()` com o path real, atualizou `storage_path`,
releu do banco pra confirmar, checou existência no Storage, limpou
arquivo e linha. 7/7 checks ✔. (`uploadAppAsset` em si não pôde ser
chamada fora do runtime do Next — depende de `next/headers` via
`server.ts` — o teste replicou a mesma sequência de operações.)

**Risco identificado, não resolvido — importante:** `PROJECT_MASTER.md`
lista Vercel como deploy alvo. Plataformas serverless (Vercel
incluída) costumam ter um teto de tamanho de payload por requisição
**independente** do `bodySizeLimit` do Next.js — historicamente bem
abaixo de 300MB nos planos mais comuns. `experimental.serverActions.bodySizeLimit`
só remove o limite do lado do Next; não garante que a Vercel deixe um
upload de 300MB passar. Isso funciona local/self-hosted (testado
nesta sessão só via Node/script direto, não via Server Action real
rodando num servidor Next) mas **precisa ser validado em produção**
antes de confiar nisso pra APKs grandes — não presumido, não
resolvido aqui. Ver `NEXT_SESSION.md`.

**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
limpos.

---

## 2026-08-06 (17) — Convenção definitiva de nomes de arquivo

Só documentação — nenhum código do módulo de Storage foi tocado
(decisão explícita do usuário: módulo está maduro, só mexe de novo
por bug/troca de provedor/protocolo). `STORAGE.md` agora fixa os
nomes exatos, sem ambiguidade: `app.apk`, `icon.png`, `banner.webp`
— sempre esses nomes, nunca variação por app. Árvore de diretórios
atualizada com os nomes de arquivo completos, não só as pastas.

---

## 2026-08-06 (16) — storage.replace(), nome de arquivo fixo, item de segurança no ROADMAP

**Contexto:** usuário pediu 3 coisas antes de começar Upload de APK:
(1) registrar a limitação de FTP sem TLS como item de melhoria futura
no `ROADMAP.md`, não como bloqueio; (2) `storage.replace()` — upload
seguro que nunca sobrescreve diretamente (temp → valida tamanho →
renomeia), pra evitar perder um APK se a conexão cair no meio; (3)
nome de arquivo fixo (`app.apk`, não `unitv-mobile-v3.24.2.apk`) já
que a versão mora no banco — assim atualizar o arquivo não muda a
URL pública.

**Adicionado**
- `StorageProvider.replace()` em `types.ts` + implementação completa
  em `remote-storage.ts` (upload pra `{path}.uploading`, confirma
  tamanho via `stat`/`size`, renomeia via `rename` — SFTP e FTP).
  Limpeza best-effort do temporário em caso de falha (tamanho errado
  ou rename falhar) sem mascarar o erro original.
- `scripts/storage-doctor.ts` ganhou um 6º check testando `replace()`
  de verdade.
- `ROADMAP.md` — seção "Melhorias futuras" com os 2 itens de
  segurança (FTPS via hostname `*.hstgr.io`, disponibilidade de SFTP).

**Alterado**
- `STORAGE.md` — convenção de nome fixo documentada, exemplo de uso
  trocado de `upload()` para `replace()` (uso recomendado pra
  APK/ícone/banner, já que o path pode já ter um arquivo).
- ADR-012 — status atualizado com `replace()`.

**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
limpos. `npm run storage:test` — 6/6 checks ✔ contra a Hostinger
real, incluindo `replace()`.

---

## 2026-08-06 (15) — storage:test validado contra a Hostinger real

**Usuário configurou as credenciais `STORAGE_*` no `.env.local`.**
Rodei `npm run storage:test`: os 5 checks passaram (conecta, envia,
confirma existência, monta URL pública, remove, confirma remoção).
Infraestrutura de Storage validada de ponta a ponta.

**Corrigido no processo (bugs de compatibilidade, não decisão de
arquitetura):**
- `.env.local` tinha `STORAGE_PORT` (genérico), código só lia
  `STORAGE_SFTP_PORT`/`STORAGE_FTP_PORT`. `remote-storage.ts` agora
  aceita `STORAGE_PORT` como fallback para os dois.
- Imports internos de `src/lib/storage/` (`provider.ts` →
  `remote-storage.ts`/`types.ts`) precisaram de extensão `.ts`
  explícita — obrigatório pro Node resolver o módulo ao rodar
  `storage-doctor.ts` nativamente (o Next.js/Turbopack tolera
  extensão explícita normalmente, então não deve quebrar o build).

**Alterado:** `STORAGE.md` e ADR-012 — status atualizado de "não
testada" para "testada com sucesso" (2026-08-06).

**Verificação:** `npx tsc --noEmit` limpo, `npm run storage:test`
com todos os 5 checks ✔.

**Achado de segurança, registrado (não é um bug a corrigir agora):**
usei debug temporário (removido antes do commit) pra confirmar qual
protocolo realmente foi usado — SFTP falha (SSH indisponível),
FTPS falha por mismatch de certificado (`ftp.inovatv.pro` vs
`*.hstgr.io`), fallback cai pra **FTP puro, sem TLS**. Credenciais
trafegam em texto claro nessa conexão. Documentado em `STORAGE.md`
como risco aceito por ora; possível mitigação futura (conectar via
hostname `*.hstgr.io`) fica para o usuário decidir, não implementada.

**Próximo passo:** Upload de APK — primeira Server Action real
usando `storage.upload()`.

---

## 2026-08-06 (14) — Detecção automática de FTPS vs FTP puro

Completa a detecção automática já existente (SFTP vs FTP) um nível
abaixo: dentro do fallback FTP, `remote-storage.ts` agora tenta FTPS
primeiro e só cai para FTP sem TLS se o servidor recusar — usuário
não precisa descobrir isso no hPanel. Override manual opcional via
`STORAGE_FTP_SECURE`. `tsc`/`lint`/`build` limpos. Não é uma nova
decisão arquitetural, só completa o padrão já decidido em
ADR-011/012 ("detecte automaticamente, priorize o mais seguro").

---

## 2026-08-06 (13) — Arquitetura declarada congelada

Nota curta em `PROJECT_MASTER.md` §8.1: a partir do commit `17bdff3`,
a arquitetura-base é considerada congelada. Próximas sessões focam em
funcionalidades do `ROADMAP.md`, não em novas refatorações
estruturais. Sem mudança de código.

---

## 2026-08-06 (12) — Nomenclatura genérica de Storage Provider

**Contexto:** revisão rápida (usuário com limite de uso quase
esgotado — mudança pequena e contida, não nova feature). Ajuste:
generalizar a nomenclatura do storage para não referenciar Hostinger
por nome — hoje é Hostinger, no futuro pode ser outra coisa, e o
código não deveria precisar mudar por causa disso.

**Alterado**
- `src/lib/storage/hostinger.ts` → `src/lib/storage/remote-storage.ts`.
- Variáveis de ambiente: `HOSTINGER_HOST/USER/PASSWORD/ROOT_PATH/
  PUBLIC_BASE_URL/SFTP_PORT/FTP_PORT/PROTOCOL` → `STORAGE_*`
  equivalentes. Nova `STORAGE_PROVIDER=hostinger` seleciona a
  implementação em `provider.ts` (hoje só existe o case
  `"hostinger"`, mas o padrão de seleção já está pronto pra um
  segundo provider no futuro).
- `.env.example`, `STORAGE.md`, `ARCHITECTURE_DECISIONS.md`
  (ADR-011/012), `PROJECT_MASTER.md` §1.1/§4 — nomenclatura
  atualizada. Entradas antigas do `CHANGELOG_AI.md` mantidas como
  estavam (histórico não é reescrito).

**Adicionado**
- `scripts/storage-doctor.ts` + `npm run storage:test` — diagnóstico
  de conectividade (conecta → cria dir → envia arquivo de teste →
  confirma existência → monta URL pública → remove → confirma
  remoção). Não roda com sucesso ainda (sem credenciais), mas está
  pronto pro primeiro teste real.
- `tsconfig.json` — `allowImportingTsExtensions: true` (necessário
  pro script rodar via suporte nativo a TypeScript do Node 26,
  importando `provider.ts` com extensão explícita).

**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
— todos limpos.

---

## 2026-08-06 (11) — Pivô de armazenamento: Supabase Storage → Hostinger

**Contexto:** o teto de 50MB do plano Free do Supabase (achado na
entrada anterior) inviabilizava upload de APK. Usuário decidiu trocar
completamente o armazenamento de arquivos para uma hospedagem própria
(Hostinger, via FTP/SFTP), não só para APK — para todo arquivo
público da plataforma (apps, tutoriais, FAQ, downloads futuros).
Confirmou que isso substitui definitivamente o antigo Projeto
Downloads (fecha o ciclo da ADR-008) e pediu uma camada de código
desacoplada antes de qualquer implementação de upload.

**Adicionado**
- `src/lib/storage/types.ts` — interface `StorageProvider`
  (`upload`/`delete`/`exists`/`getPublicUrl`) e tipos de suporte.
- `src/lib/storage/provider.ts` — `export const storage`, único
  ponto de import para o resto da aplicação.
- `src/lib/storage/hostinger.ts` — implementação FTP/SFTP. Detecta
  automaticamente qual protocolo está disponível (tenta SFTP,
  cai para FTP), com cache por processo e override manual via
  `HOSTINGER_PROTOCOL`. Usa `ssh2-sftp-client` e `basic-ftp` (novas
  dependências, mais `@types/ssh2-sftp-client` como dev dependency).
- ADR-011 (Hostinger como armazenamento oficial) e ADR-012 (camada
  de abstração de storage) em `ARCHITECTURE_DECISIONS.md`.
- `.env.example` — 5 novas variáveis `HOSTINGER_*` (host, user,
  password, root path, public base URL) mais 3 opcionais (portas,
  protocolo forçado).

**Alterado**
- `STORAGE.md` — reescrito para descrever a Hostinger como
  armazenamento real, com a estrutura de diretórios definitiva
  (`assets/apps/...`, `assets/tutorials/...`, `assets/faq/`,
  `assets/downloads/`) e a tabela de mapeamento das colunas
  existentes (nenhuma migração de dado necessária — os mesmos
  campos `storage_path`/`icon_path`/`banner_path`/`asset_folder`/
  `storage_folder` continuam sendo usados, só aponta pra outro
  backend agora).
- ADR-007 — Status atualizado para "superseded pela ADR-011"
  (decisão original preservada, não reescrita).
- ADR-008 — nota adicionada confirmando que a Hostinger é, na
  prática, a infraestrutura do Portal Público previsto ali.
- `PROJECT_MASTER.md` — §1.1 com as novas variáveis, §4 com
  `src/lib/storage/` na estrutura de pastas.

**Importante — NÃO testado:** nenhuma credencial `HOSTINGER_*` está
configurada no `.env.local` ainda. O código compila e passa
`tsc`/`lint`/`build`, mas a conexão FTP/SFTP real nunca foi exercida.
Ninguém chama `storage.*` em nenhuma rota/Server Action ainda —
puramente preparação de infraestrutura, igual ao padrão já usado com
Supabase (documentar/preparar antes de credenciais existirem).

**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
— todos limpos.

---

## 2026-08-06 (10) — Migração aplicada, bucket criado, bloqueio de plano descoberto

**Contexto:** usuário confirmou `SUPABASE_SERVICE_ROLE_KEY` e
`SUPABASE_ACCESS_TOKEN` adicionadas ao `.env.local` e autorizou
prosseguir com login/link/db push/criação do bucket.

**Feito**
- `npx supabase login --token "$SUPABASE_ACCESS_TOKEN"` — sucesso
  (token lido do `.env.local`, nunca digitado no chat).
- `npx supabase link --project-ref deovfultywlftlvdzukc` — sucesso.
- `npx supabase db push` — aplicou
  `20260806140000_add_banner_path_fix_storage_folder.sql`. Confirmado
  via REST: `banner_path` existe (null nos 3 apps), `storage_folder`
  corrigido (`"public/apps/unitv/mobile"` e `"public/apps/unitv/tv"`,
  sem o prefixo `"storage_folder = "` do bug original).
- `scripts/create-storage-bucket.mjs` (novo) — script idempotente
  usando `createAdminClient()`. Criou o bucket `apps` (privado).
  Primeira tentativa com `fileSizeLimit: 300MB` no bucket falhou
  (`EntityTooLarge`/413); segunda tentativa sem `fileSizeLimit`
  (herda o teto do projeto) funcionou.

**Bloqueio novo, não previsto:** ao investigar o erro 413, descobri
via Management API (`GET /v1/projects/{ref}/config/storage`) que o
projeto tem `fileSizeLimit: 52428800` (50MB) — e via
`GET /v1/organizations/{org}` que a organização está no **plano
Free**. Esse teto é global do projeto; nenhum valor configurado no
bucket consegue superá-lo. Os 300MB decididos para APK (e mesmo APKs
"pequenos" de 70-120MB, citados como referência) não cabem no plano
atual. **Não tentei alterar esse limite** — é uma decisão de
plano/billing, não uma configuração de código; fica para o usuário.

**Verificação:** nenhuma mudança de código de aplicação — só o
script de infraestrutura (`.mjs`, roda fora do Next.js) e docs.
`tsc`/`lint`/`build` não são afetados por scripts fora de `src/`, mas
serão checados de qualquer forma antes do próximo commit.

---

## 2026-08-06 (9) — .env.example, ADR-010 (escopo do access token), seção "Ambiente Local"

**Contexto:** `npx supabase login` falhou neste ambiente (não-TTY,
sem fluxo automático de navegador). Usuário concordou em usar um
Personal Access Token via `SUPABASE_ACCESS_TOKEN`, com duas condições:
nunca commitar/documentar o valor, e usar o token só para operações
administrativas da CLI (login/link/db push), revogando-o quando o
projeto estabilizar.

**Adicionado**
- `.env.example` — lista das 4 variáveis sem valores
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`).
- `.gitignore` — exceção `!.env.example` (a regra `.env*` existente
  ignoraria esse arquivo também; precisa ser versionado, é o único
  `.env*` que deve ir pro Git, sem valores).
- ADR-010 em `ARCHITECTURE_DECISIONS.md` — escopo e rotação do
  `SUPABASE_ACCESS_TOKEN`.
- `PROJECT_MASTER.md` §1.1 "Ambiente Local" — lista as 4 variáveis
  obrigatórias e seus papéis, reforça que nunca vão para
  `README.md`/documentação/chat.

**Ainda bloqueado:** `SUPABASE_ACCESS_TOKEN` e
`SUPABASE_SERVICE_ROLE_KEY` ainda não estão no `.env.local`
(confirmado — só as duas variáveis `NEXT_PUBLIC_*` originais existem
até agora). Aguardando o usuário adicionar as duas antes de rodar
`login`/`link`/`db push` e criar o bucket.

**Verificação:** nenhuma mudança de código — `.env.example` e
documentação apenas.

---

## 2026-08-06 (8) — ADR-009 (escopo da service_role) + admin.ts

**Contexto:** usuário concordou em configurar `SUPABASE_SERVICE_ROLE_KEY`
localmente e autenticar o Supabase CLI (`login`/`link`/`db push`), com
uma condição: a service_role nunca pode virar o mecanismo padrão de
acesso ao banco — só serve para tarefas de infraestrutura (Storage,
buckets, limpeza, migrações, scripts de manutenção). CRUD normal
continua via Supabase Auth + Server Actions + RLS.

**Adicionado**
- ADR-009 em `ARCHITECTURE_DECISIONS.md` — escopo da service_role.
- `src/lib/supabase/admin.ts` — `createAdminClient()`, único ponto do
  código autorizado a usar `SUPABASE_SERVICE_ROLE_KEY`. Ainda não
  usado em lugar nenhum (a chave não existe no `.env.local` até o
  usuário adicionar) — só operacionaliza a ADR-009 em código, pronto
  para quando o bucket for criado.

**Alterado**
- `PROJECT_MASTER.md` §4 — estrutura de pastas atualizada com
  `admin.ts` e a nota de que `server.ts` é o padrão para todo CRUD.
- `STORAGE.md` — nota de bloqueio atualizada: migração será aplicada
  via Supabase CLI (não mais SQL Editor manual), e a `service_role`
  key, quando adicionada, só é usada via `admin.ts` para a criação do
  bucket.

**Verificação**
- `npx tsc --noEmit` — sem erros.
- `npm run lint` — sem erros/warnings.
- `npm run build` — sucesso (nenhuma rota nova, `admin.ts` não é
  importado por nada ainda).

**Ainda bloqueado:** aguardando o usuário concluir `supabase login` →
`link` → `db push` e adicionar `SUPABASE_SERVICE_ROLE_KEY` ao
`.env.local`.

---

## 2026-08-06 (7) — download_url depreciado; ainda bloqueado para o upload

**Contexto:** usuário confirmou que a migração SQL ainda não foi
aplicada (upload continua bloqueado até isso acontecer) e resolveu a
pergunta em aberto sobre `download_url`: o Projeto Downloads externo
será descontinuado, `download_url` fica ignorado a partir de agora e
será removido numa migração futura (não nesta). Também pediu uma
regra permanente contra manter compatibilidade com sistemas
legados marcados para descontinuação.

**Alterado**
- `STORAGE.md` — seção `download_url` reescrita: deixa de ser
  pergunta em aberto, vira decisão fechada (ignorar completamente,
  remoção futura). Adicionado aviso no topo listando os dois
  bloqueios reais antes de criar o bucket: migração não aplicada, e
  falta de `service_role` key neste ambiente para criar bucket (a
  chave anônima não tem essa permissão).
- `ARCHITECTURE_DECISIONS.md` — ADR-008 nova: "sem compatibilidade
  com sistemas legados marcados para descontinuação", aplicada
  imediatamente a `download_url`. ADR-007 atualizada para refletir
  que `download_url` não é mais pergunta em aberto.

**Ainda bloqueado (sem mudança de código nesta entrada):**
- Migração SQL não aplicada — usuário confirmou explicitamente.
- Criação do bucket `apps` — além de depender da migração, também
  precisa de `service_role` key (não disponível) ou criação manual
  pelo usuário via painel do Supabase.

**Verificação:** nenhuma mudança de código — só documentação.

---

## 2026-08-06 (6) — Estrutura do Storage validada antes do upload (só SQL + doc, sem bucket/código)

**Contexto:** antes de implementar upload de APK/Ícone/Banner, o
usuário pediu para investigar o schema real antes de propor
migração. Ao consultar a tabela `apps` via REST (chave anônima), veio
à tona que **já existem dados reais de produção** (2 apps: UniTV
Mobile, UniTV TV Box) com colunas (`storage_path`, `icon_path`,
`asset_folder`, `storage_folder`, `download_url`) que não batiam com
a proposta inicial (bucket por slug, colunas `apk_path`/`banner_path`
novas). Nenhum bucket existe ainda no Storage (`[]` via API).

Decisão do usuário: preservar a convenção existente
(produto/plataforma, não slug), não renomear colunas, adicionar só o
que falta.

**Adicionado**
- `supabase/migrations/20260806140000_add_banner_path_fix_storage_folder.sql`
  — `ALTER TABLE` adicionando `banner_path`, e `UPDATE` corrigindo o
  bug de dado em `storage_folder` (valor salvo como
  `"storage_folder = <path>"` em vez de só `<path>`, confirmado nas 2
  linhas reais). **Não aplicada ainda** — precisa ser rodada
  manualmente (SQL Editor do Supabase ou `supabase db push`); este
  ambiente só tem a chave anônima, que não executa DDL.
- `STORAGE.md` — estrutura de pastas do bucket `apps` (privado,
  produto/plataforma/tipo), tabela de colunas usadas, tamanhos
  máximos por tipo (APK 300MB, Ícone 5MB, Banner 10MB), política de
  substituição sem lixo (upload → atualizar banco → remover antigo),
  e nota explícita de que os valores atuais de `storage_path` dos 2
  apps reais não são tocados por esta migração (formato antigo,
  `public/apps/...`, sem subpasta por tipo — será naturalmente
  sobrescrito na primeira troca de arquivo pelo painel).
- ADR-007 em `ARCHITECTURE_DECISIONS.md` — registra a decisão de
  estrutura do Storage.

**Não feito nesta entrada (aguardando aprovação/decisão do usuário):**
- Bucket `apps` **não foi criado**.
- Upload **não foi implementado**.
- `download_url` não foi tocado nem investigado — o assistente não
  tem acesso ao repositório do "Projeto Downloads" (fora deste
  diretório de trabalho) para investigar como esse campo é
  consumido. Pergunta em aberto registrada em `NEXT_SESSION.md`; a
  implementação de upload não escreverá em `download_url` de qualquer
  forma, independente da resposta.

**Verificação:** nenhuma mudança de código nesta entrada — SQL de
migração (não aplicada) + documentação.

---

## 2026-08-06 (5) — Update de Aplicativos implementado (CRUD 100% completo)

**Contexto:** primeira sessão de código após o congelamento da
documentação. Objetivo único: fechar o item "Update" do
`DEFINITION_OF_DONE.md` para o módulo Aplicativos. Árvore verificada
limpa antes de começar (regra §9.1).

**Adicionado**
- `updateAppAction` em `src/app/(dashboard)/apps/actions.ts` — Server
  Action, reaproveita `updateApp()` já existente em
  `app.service.ts`, redireciona para `/apps` após salvar.
- `src/app/(dashboard)/apps/[id]/editar/page.tsx` — busca o app via
  `getApp(id)`, `notFound()` se não existir, renderiza `AppForm` em
  modo edição.

**Alterado**
- `src/components/apps/AppForm.tsx` — agora aceita `app?: App`
  opcional. Quando presente: preenche todos os campos via
  `defaultValue`, usa `updateAppAction.bind(null, app.id)` como
  action do form (padrão de Server Action com argumento extra via
  `.bind`), e o botão muda para "Salvar Alterações". Sem `app`:
  comportamento igual ao de antes (`createAppAction`).
- `src/components/common/ActionsMenu.tsx` — item "Editar" deixou de
  ser `disabled`; agora é um `Link` real para `/apps/[id]/editar`
  (`DropdownMenuItem asChild`).

**Verificação**
- `npx tsc --noEmit` — sem erros.
- `npm run lint` — sem erros/warnings.
- `npm run build` — sucesso; nova rota `/apps/[id]/editar` aparece
  no build como dinâmica.
- Testado via `curl`: `/apps/<uuid>/editar` sem sessão → `307` para
  `/login` (proxy cobre a rota dinâmica corretamente).

**Estado do módulo Aplicativos após esta entrada** (ver
`DEFINITION_OF_DONE.md`): Create/Read/Update/Delete ✅. Ainda faltam:
Upload APK/Ícone/Banner, Preview, Download, Ordenação, Status
(toggle), Busca, Paginação, validação além de `required`, tratamento
de erro visível ao usuário.

---

## 2026-08-06 (4) — DEFINITION_OF_DONE.md, split Apps/Banners, congelamento da documentação

**Contexto:** usuário decidiu que a documentação atingiu um bom ponto
e pediu para parar de refiná-la — risco de "documentar o projeto em
vez de construir o projeto". Últimos dois ajustes autorizados antes do
congelamento: um sexto documento (`DEFINITION_OF_DONE.md`) e a
separação clara entre "Upload Banner" (arquivo do cadastro de um app)
e o módulo "Banners" (conteúdo de marketing, distinto).

**Adicionado**
- `DEFINITION_OF_DONE.md` — critério objetivo de conclusão de módulo
  (CRUD, upload, busca, paginação, ordenação, filtros, preview,
  validação, tratamento de erro, tipagem sem `any`, sem `TODO`,
  build/lint OK, docs em dia, commit feito). Já aplicado ao módulo
  Aplicativos, com checklist detalhado do estado atual.
- §9.1 em `PROJECT_MASTER.md` — regra "nunca iniciar uma feature com
  a árvore de trabalho suja" (build → lint → corrigir → commit →
  só então começar).

**Alterado**
- `ROADMAP.md` — Fase 2 ("Módulo Aplicativos") passou a listar o
  checklist completo do `DEFINITION_OF_DONE.md` (Update, Upload
  APK/Ícone/Banner do app, Preview, Download, Ordenação, Status,
  Busca, Paginação), em vez de só CRUD básico. Banners (marketing)
  virou Fase 3, com Clientes/FAQ/Tutoriais/Configurações
  renumerados para Fase 4–7.
- `PROJECT_MASTER.md` — topo do arquivo lista os 6 documentos e
  declara congelamento a partir de 2026-08-06 (só mudam por pedido
  explícito ou atualização mecânica de fim de sessão).

**Decisão registrada (não é ADR — é diretriz de processo, não
arquitetura):** documentação e arquitetura congeladas; todo esforço
daqui pra frente é fechar o módulo Aplicativos até bater 100% do
`DEFINITION_OF_DONE.md`, sem abrir nenhum outro módulo antes disso.

**Verificação:** nenhuma mudança de código nesta entrada — só
documentação (a última antes do congelamento).

---

## 2026-08-06 (3) — Reorganização dos documentos de continuidade

**Contexto:** usuário definiu papéis mais claros para os documentos
de continuidade: `PROJECT_MASTER.md` permanente (só cresce, nunca é
reescrito do zero), `NEXT_SESSION.md` descartável (reescrito por
completo a cada sessão, formato mínimo fixo), e pediu um quinto
documento (`ROADMAP.md`) para visão de progresso por fase, separado
do `PROJECT_MASTER.md`. Também pediu uma regra permanente de
reutilização de componentes antes de criar algo novo.

**Adicionado**
- `ROADMAP.md` — checklist por fase (Fase 1 a 7 + módulo "Banners" em
  aberto, sem fase definida — sinalizado para perguntar ao usuário
  quando chegar a hora, já que não estava na ordem original passada
  por ele e não deve ser presumido).
- ADR-006 em `ARCHITECTURE_DECISIONS.md` — "Reutilização antes de
  criação": checar componente/padrão existente antes de implementar
  algo novo; não abstrair antes da segunda necessidade real.

**Alterado**
- `NEXT_SESSION.md` — reescrito no formato mínimo fixo: Último
  commit / Objetivo da próxima sessão / Arquivos que serão alterados
  / Riscos / Primeiro passo. Deixa de carregar histórico acumulado.
- `PROJECT_MASTER.md` — topo do arquivo agora explica o papel de cada
  um dos 5 documentos de continuidade; §6 ganhou as regras "reutilização
  antes de criação" (ADR-006) e "foco em um módulo por vez" (não abrir
  módulo novo antes de Aplicativos estar 100% fechado); §8/§9
  atualizados para incluir `ROADMAP.md` no fluxo de leitura e de
  atualização de fim de sessão.

**Verificação:** nenhuma mudança de código nesta entrada — só
documentação. `tsc`/`lint`/`build` seguem no estado da entrada
anterior (todos ✅).

---

## 2026-08-06 (2) — Lint limpo, Delete de Aplicativos, ADRs e commit

**Contexto:** ao preparar o commit da fase de Autenticação, `npm run
lint` revelou 2 erros (`any` implícito) e 1 warning (prop `id` não
usada em `ActionsMenu`). Corrigir isso da forma certa exigiu tipagem
forte para Aplicativos e, para o warning, implementar de verdade a
exclusão (em vez de suprimir o aviso artificialmente).

**Adicionado**
- `App` (interface) em `src/services/app.service.ts` — tipo completo
  de uma linha de aplicativo (`AppData` + `id`). Funções do service
  agora retornam `Promise<App>`/`Promise<App[]>` em vez de tipo
  implícito.
- `src/app/(dashboard)/apps/actions.ts` — `deleteAppAction` (Server
  Action), chama `deleteApp()` do service e `revalidatePath("/apps")`.
- `ARCHITECTURE_DECISIONS.md` — ADR-001 a ADR-005 (Autenticação,
  Middleware/proxy, CRUD via Server Actions, Storage via Server
  Actions, estrutura por feature).
- Seção "Estado do Projeto" e "Fluxo de trabalho fixado" no
  `PROJECT_MASTER.md`.

**Alterado**
- `src/components/apps/AppsTable.tsx`,
  `src/components/apps/AppsTableRow.tsx` — `apps: any[]` / `app: any`
  substituídos por `App[]` / `App` (import de `@/services/app.service`).
- `src/components/common/ActionsMenu.tsx` — botão "Excluir" agora
  funcional: `window.confirm` → `deleteAppAction(id)` →
  `router.refresh()`. Botão "Editar" marcado `disabled` (ainda não
  existe página de edição) em vez de ficar clicável sem fazer nada.

**Verificação**
- `npx tsc --noEmit` — sem erros.
- `npm run lint` — sem erros/warnings.
- `npm run build` — sucesso.

**Commit desta sessão:** mensagem
`feat(auth): migrate to Supabase SSR with protected admin panel` —
ver `git log` para o hash (o arquivo é escrito antes do commit
existir, então não referencia o próprio hash).

---

## 2026-08-06 (1) — Autenticação, Middleware e correção de build

**Contexto:** projeto estava sem compilar (`AppDialog.tsx` incompleto)
e sem nenhuma proteção de rota. Executada a etapa 1–2 da ordem de
implementação (Autenticação + Middleware), com correções de bugs
encontrados no caminho.

**Removido**
- `src/components/apps/dialogs/AppDialog.tsx` — sintaticamente
  incompleto (sem `return`), quebrava `tsc`. Não era usado por
  nenhuma rota.
- `src/components/apps/AppsPageClient.tsx` — duplicava, sem terminar,
  o fluxo já funcional de `/apps` + `/apps/novo`. Não era usado por
  nenhuma rota.
- `src/lib/supabase/index.ts` — barrel vazio, não importado em
  nenhum lugar.

**Adicionado**
- `src/lib/supabase/server.ts` — client Supabase para uso em Server
  Components/Actions (`@supabase/ssr`, cookies via `next/headers`).
- `src/lib/supabase/middleware.ts` — `updateSession()`, redireciona
  não-autenticados para `/login` e autenticados para fora de `/login`.
- `src/proxy.ts` — proteção de rotas (convenção Next.js 16; ver nota
  abaixo). Aplica `updateSession()` a todas as rotas exceto assets
  estáticos.
- `src/app/(auth)/login/page.tsx` — formulário de login (email/senha).
- `src/lib/actions/auth.ts` — `signInAction` e `signOutAction`
  (Server Actions).

**Alterado**
- `src/lib/supabase/client.ts` — migrado de `@supabase/supabase-js`
  (singleton simples) para `createBrowserClient` do `@supabase/ssr`.
- `src/services/app.service.ts` — todas as funções passaram a usar o
  novo client de servidor assíncrono (`await createClient()`).
- `src/components/apps/AppForm.tsx` — parava de fazer escrita direta
  no Supabase a partir do client (usava `getSupabaseClient` do
  browser); agora envia via `<form action={createAppAction}>` (Server
  Action que já existia em `apps/novo/actions.ts` mas estava sem uso).
  Estado de "salvando" via `useFormStatus`, não mais `useState`
  manual. Inputs de arquivo (APK/ícone/banner) ficaram `disabled` com
  aviso — upload real é etapa futura.
- `src/components/layout/Header.tsx` — recebe `email` do usuário
  logado via prop (antes tinha "José Antônio" fixo); adicionado botão
  de logout (`signOutAction`).
- `src/app/(dashboard)/layout.tsx` — busca o usuário da sessão
  (`supabase.auth.getUser()`) e passa pro `Header`.
- `src/app/(dashboard)/page.tsx` — **corrigido bug**: a página
  renderizava seu próprio `Header`/`Sidebar` por cima do que o
  `layout.tsx` já renderiza (dashboard aparecia duplicado).

**Decisão técnica registrada:** Next.js 16 renomeou a convenção de
arquivo `middleware.ts` para `proxy.ts` (mesma função,
`export function proxy` em vez de `export function middleware`).
Criamos primeiro como `middleware.ts` na raiz (erro: não interceptava
nada — com `src/`, o arquivo precisa estar dentro de `src/`), movemos
para `src/middleware.ts`, e então rodamos o codemod oficial
`npx @next/codemod middleware-to-proxy .` para migrar para
`src/proxy.ts`, eliminando o warning de depreciação no build.

**Verificação**
- `npx tsc --noEmit` — sem erros.
- `npm run build` — sucesso, sem warnings.
- Teste manual via `curl`: `/` e `/apps` sem sessão retornam
  `307 → /login`; `/login` retorna `200`.

**Efeito colateral da sessão:** todos os processos `node.exe` da
máquina foram encerrados (`taskkill /IM node.exe /F`) para limpar
servidores de dev duplicados durante o teste, incluindo um processo
que já ocupava a porta 3000 antes da sessão começar (origem
desconhecida — não era do Next.js deste projeto).

**Não incluído nesta sessão (fica para a próxima):**
- CRUD Aplicativos: Update e Delete (funções já existem em
  `app.service.ts`, sem UI/rota/action ligadas).
- Upload de APK/Ícone/Banner (Supabase Storage).
- Módulos Clientes, FAQ, Tutoriais, Configurações.
- Tipos gerados do Supabase (`src/types/database.ts` continua vazio).

---

## Antes de 2026-08-06 (não documentado neste formato)

Ver `git log` para o histórico de commits anterior a este arquivo:
- `Create initial dashboard layout` (×3)
- `Initialize shadcn UI and fix Supabase client`
- `Create Supabase integration structure`
- `Install Supabase libraries`
- `Rename project to inovatv_painel`
- `Initialize Next.js admin panel`
