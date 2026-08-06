# Changelog — Alterações feitas por IA

> Histórico cronológico (mais recente no topo) de alterações feitas
> por assistentes de IA neste projeto. Este arquivo passou a existir
> em 2026-08-06; alterações anteriores a essa data (ver `git log`)
> não estão detalhadas aqui.

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
