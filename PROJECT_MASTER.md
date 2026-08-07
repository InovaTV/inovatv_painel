# InovaTV Painel — Documento Mestre

> Este arquivo é a fonte da verdade sobre o estado do projeto.
> **Permanente — nunca é apagado ou reescrito do zero, só cresce.**
> Deve ser lido no início de qualquer sessão nova (humana ou IA) antes
> de qualquer alteração.
>
> Documentos de continuidade deste projeto e seus papéis:
> - **`PROJECT_MASTER.md`** (este arquivo) — permanente, sempre
>   crescendo: arquitetura, módulos, estrutura, convenções, estado
>   atual.
> - **`ROADMAP.md`** — checklist de progresso por fase, atualizado
>   (não reescrito do zero).
> - **`NEXT_SESSION.md`** — **descartável**, reescrito por completo a
>   cada sessão: último commit, objetivo da próxima sessão, arquivos
>   que serão alterados, riscos, primeiro passo.
> - **`CHANGELOG_AI.md`** — permanente, histórico cronológico do que
>   já foi feito. Nunca apagado.
> - **`ARCHITECTURE_DECISIONS.md`** — permanente, decisões que exigem
>   aprovação explícita do usuário para serem revertidas. Nunca
>   apagado.
> - **`DEFINITION_OF_DONE.md`** — permanente, critério objetivo para
>   marcar um módulo como concluído no `ROADMAP.md`.
>
> **Estes 6 documentos estão congelados a partir de 2026-08-06.**
> Só voltam a ser reestruturados por pedido explícito do usuário — a
> atualização mecânica de fim de sessão (§9) não conta como
> reestruturação. Foco a partir daqui é 100% código.

Última atualização: 2026-08-06

---

## 0. Estado do Projeto

| | |
|---|---|
| Versão Arquitetural | v1.0 |
| Último commit (antes das mudanças desta sessão) | `ecc6b53` |
| Build (`npm run build`) | ✅ OK |
| TypeScript (`npx tsc --noEmit`) | ✅ OK |
| Lint (`npm run lint`) | ✅ OK |

> O hash acima é o `HEAD` no início da sessão que gerou este commit —
> o commit resultante desta sessão ainda não existe no momento em que
> este arquivo foi escrito. Ver `CHANGELOG_AI.md` para o commit real
> quando disponível.

Ver **ADR** (`ARCHITECTURE_DECISIONS.md`) para as decisões
arquitetônicas permanentes que não devem ser revertidas sem decisão
explícita do usuário.

## 1. O que é o projeto

**InovaTV Painel** — painel administrativo web da plataforma InovaTV.
Não armazena conteúdo por conta própria: tudo é administrado via
Supabase (Database + Storage). Público: administradores internos da
InovaTV, autenticados via Supabase Auth.

Módulos previstos: Dashboard, Aplicativos, Banners, Tutoriais, FAQ,
Clientes, Configurações.

## 1.1 Ambiente Local

Variáveis obrigatórias (`.env.local` — nunca commitado; ver
`.env.example` para a lista sem valores):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (chave `anon`, usada por
  toda a aplicação em runtime)
- `SUPABASE_SERVICE_ROLE_KEY` (só para `src/lib/supabase/admin.ts`,
  escopo restrito a infraestrutura — ADR-009)
- `SUPABASE_ACCESS_TOKEN` (Personal Access Token da conta Supabase,
  só para operações administrativas do Supabase CLI — `login`,
  `link`, `db push`. **Não** é usado em runtime da aplicação nem em
  operações do dia a dia. Recomendação: revogar em
  Account → Access Tokens no Supabase quando o projeto estabilizar
  ou quando não houver mais necessidade de rodar CLI administrativo)
- `STORAGE_HOST` / `STORAGE_USER` / `STORAGE_PASSWORD` /
  `STORAGE_ROOT_PATH` / `STORAGE_PUBLIC_BASE_URL` (armazenamento
  de arquivos — ADR-011/ADR-012, ver `STORAGE.md`. Usuário deve ser
  restrito ao diretório de arquivos, nunca a conta principal da
  hospedagem)

Essas variáveis existem só em `.env.local` (e nas envs da Vercel em
produção/preview). Nunca em `README.md`, nunca em qualquer documento
de continuidade, nunca coladas em chat.

## 2. Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui (style `radix-nova`, baseColor `neutral`)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- Deploy alvo: Vercel

## 3. Arquitetura obrigatória (decisão fixada)

- Autenticação via **Supabase Auth**, sessão gerenciada por cookies
  (`@supabase/ssr`), nunca `localStorage`/token manual.
- **`src/proxy.ts`** protege as rotas (Next.js 16 renomeou o antigo
  `middleware.ts` para `proxy.ts` — mesma função, nova convenção de
  arquivo). Redireciona não-autenticados para `/login` e usuários
  autenticados para fora de `/login`.
- **Server Components** por padrão; `"use client"` só quando há
  interatividade real (formulário controlado, estado, hooks).
- **Server Actions** para toda escrita (create/update/delete) — nunca
  chamada direta do Supabase a partir do browser para operações de
  escrita.
- **Supabase Server Client** (`src/lib/supabase/server.ts`) para
  Server Components e Server Actions. **Supabase Browser Client**
  (`src/lib/supabase/client.ts`) reservado para casos futuros que
  exijam interatividade client-side (ex.: realtime) — hoje não é
  usado por nenhum fluxo de escrita.
- Nunca usar chave de acesso administrativo (`service_role`) no
  browser. Hoje o projeto só tem a chave pública (`anon`) configurada
  em `.env.local`; se uploads/Storage exigirem privilégios elevados,
  isso deve acontecer via Server Action, nunca client-side.

## 4. Estrutura de pastas

```
src/
├─ app/
│  ├─ (auth)/login/          # página de login, fora do layout do dashboard
│  ├─ (dashboard)/           # rotas protegidas — layout com Header+Sidebar
│  │  ├─ layout.tsx           # busca o usuário da sessão, passa pro Header
│  │  ├─ page.tsx             # Dashboard (cards de resumo)
│  │  └─ apps/
│  │     ├─ page.tsx          # listagem de apps
│  │     ├─ actions.ts        # Server Actions deleteAppAction/updateAppAction
│  │     ├─ [id]/editar/page.tsx  # form de edição (busca app+products+stat do APK)
│  │     └─ novo/
│  │        ├─ page.tsx       # form de novo app (busca products)
│  │        └─ actions.ts     # Server Action createAppAction
│  ├─ api/apps/[id]/upload/route.ts  # Route Handler de upload (ADR-013) — não é Server Action
│  ├─ layout.tsx              # layout raiz (html/body, fontes)
│  └─ globals.css
├─ components/
│  ├─ apps/                  # AppForm, AppsTable, AppsTableRow, StatusBadge, AssetUploadField
│  ├─ common/                 # ActionsMenu, PlatformBadge
│  ├─ dashboard/               # DashboardCards, StatCard
│  ├─ layout/                  # Header, Sidebar
│  └─ ui/                       # shadcn primitives (badge, button, card, ...)
├─ lib/
│  ├─ actions/auth.ts          # signInAction, signOutAction
│  ├─ supabase/
│  │  ├─ client.ts              # browser client (@supabase/ssr)
│  │  ├─ server.ts               # server client (@supabase/ssr, cookies) — padrão para todo CRUD
│  │  ├─ admin.ts                 # service_role client — só infraestrutura (ADR-009)
│  │  └─ middleware.ts            # updateSession() usado por src/proxy.ts
│  ├─ storage/                  # armazenamento de arquivos (ADR-011/ADR-012)
│  │  ├─ types.ts                # interface StorageProvider (upload/replace/delete/exists/stat/getPublicUrl)
│  │  ├─ provider.ts              # export const storage — único ponto de import
│  │  └─ remote-storage.ts               # implementação FTP/SFTP
│  └─ utils.ts                   # cn, slugify, formatBytes, formatDate
├─ services/
│  ├─ app.service.ts            # getApps/getApp/createApp/updateApp/deleteApp/uploadAppAsset
│  └─ product.service.ts          # getProducts/getProduct/createProduct/resolveProductAssetFolder
├─ types/database.ts            # (vazio — tipos gerados do Supabase pendentes)
└─ proxy.ts                     # proteção de rotas (convenção Next 16)
```

## 5. Status por módulo

| Módulo | Status | Observações |
|---|---|---|
| Autenticação (login/logout) | ✅ Funcional | Email/senha via `signInWithPassword`. Sem cadastro público — admins criados direto no Supabase. |
| Middleware / proteção de rotas | ✅ Funcional | `src/proxy.ts`, redireciona por sessão. |
| Dashboard (layout + cards) | ✅ Funcional (dados estáticos) | Cards ainda mostram números fixos (2 apps, 0 nos demais) — não busca contagem real ainda. |
| CRUD Aplicativos — Create | ✅ Funcional | Via Server Action `createAppAction`. |
| CRUD Aplicativos — Read (listagem) | ✅ Funcional | `getApps()` em Server Component. |
| CRUD Aplicativos — Update | ⬜ Pendente | `updateApp()` existe no service, sem página/action/UI. Botão "Editar" no `ActionsMenu` fica `disabled` até existir. |
| CRUD Aplicativos — Delete | ✅ Funcional | `deleteAppAction` (Server Action, `apps/actions.ts`) + `ActionsMenu` com confirmação via `window.confirm`. |
| Upload APK / Ícone / Banner | ✅ Funcional | Route Handler + XHR (ADR-013), armazenamento Hostinger via FTP (ADR-011/012), progresso real ponta a ponta incluindo a etapa servidor→FTP (ADR-014). Validado no navegador em 2026-08-07. |
| Banners | ⬜ Não iniciado | |
| Tutoriais | ⬜ Não iniciado | |
| FAQ | ⬜ Não iniciado | |
| Clientes | ⬜ Não iniciado | |
| Configurações | ⬜ Não iniciado | |
| Tipos gerados do Supabase | ⬜ Pendente | `src/types/database.ts` continua vazio, mas o módulo Aplicativos já tem tipagem manual forte (`App`/`AppData` em `app.service.ts`) — sem `any` no caminho de Aplicativos. Demais módulos precisarão do mesmo tratamento ao serem criados. |

## 6. Decisões e convenções fixadas

- **Padrão de rota protegida**: tudo dentro de `(dashboard)/` assume
  sessão válida (garantida pelo `proxy.ts`); não repetir checagem de
  auth em cada página.
- **Padrão de formulário de escrita**: Server Component da página +
  Server Action colocada em `actions.ts` ao lado da página + o form
  (client component só se precisar de estado/interatividade) chama a
  action via `<form action={...}>`, usando `useFormStatus` para estado
  de "salvando".
- **Nomenclatura de arquivos**: componentes em PascalCase, um
  componente por arquivo, subpastas por domínio dentro de
  `components/`.
- **`.env.local`** (não versionado; sincronizado entre os dois
  computadores do usuário via `G:\Meu Drive\INOVATV PAINEL - ENV\`)
  contém as credenciais Supabase (URL, publishable key, service role
  key, access token) **e** as credenciais de armazenamento Hostinger
  (ver ADR-011/012, `STORAGE.md`). Se algum valor tiver `$` literal
  (ex.: senha gerada aleatoriamente), precisa vir escapado (`\$`) —
  ver ADR-015.
- **Next.js 16 renomeou `middleware.ts` → `proxy.ts`** (mesma
  funcionalidade, arquivo/nome de export diferentes). Usar sempre
  `proxy.ts` daqui pra frente, nunca recriar `middleware.ts`.
- **Arquivos `AGENTS.md` e `CLAUDE.md` na raiz do projeto** são
  gerados automaticamente pelo `next dev`/`next build` (feature nativa
  do Next 16, `agentRules`). Não são os arquivos de governança deste
  fluxo de memória — não confundir com `PROJECT_MASTER.md` /
  `NEXT_SESSION.md` / `CHANGELOG_AI.md` / `ROADMAP.md` /
  `ARCHITECTURE_DECISIONS.md`.
- **Reutilização antes de criação** (ADR-006): antes de implementar
  algo novo, checar se já existe um componente ou padrão reaproveitável
  no projeto. Evitar duplicação, manter consistência visual e
  arquitetural entre módulos.
- **Foco em um módulo por vez**: não abrir um módulo novo (Banners,
  FAQ, Tutoriais, Clientes, Configurações) enquanto o módulo atual
  (hoje: Aplicativos) não estiver 100% fechado — CRUD completo, upload
  quando aplicável, teste manual e documentação em dia. Ver
  `ROADMAP.md` para o estado exato de cada fase.

## 7. Pendências conhecidas / dívidas técnicas

- Sem tipos gerados do Supabase (`any` usado em `apps: any[]` em
  `AppsTable`, `AppsTableRow`, `AppsPageClient` — este último já
  removido).
- `AppData` (em `app.service.ts`) não é validado com uma lib de schema
  (ex. Zod) — validação de formulário é só `required` no HTML.
- Sem testes automatizados no projeto ainda.
- Cards do Dashboard não refletem contagens reais do banco.

## 8. Como retomar

Ordem de leitura no início de qualquer sessão nova: **`PROJECT_MASTER.md`**
(este arquivo, contexto completo) → **`ROADMAP.md`** (o que já foi
feito, o que falta) → **`NEXT_SESSION.md`** (o próximo passo exato).
**`CHANGELOG_AI.md`** e **`ARCHITECTURE_DECISIONS.md`** são consulta
sob demanda (histórico e decisões que não podem ser revertidas sem
aprovação explícita, respectivamente).

## 8.1 Arquitetura Congelada

A partir do commit `17bdff3` (2026-08-06), a arquitetura-base
(Storage Provider, Auth, Banco, ADRs, documentação) é considerada
**congelada**. Próximas sessões priorizam entrega de funcionalidades
do `ROADMAP.md` sobre novas abstrações/refatorações estruturais — só
criar nova abstração diante de necessidade real comprovada (ADR-006).

> Qualquer mudança arquitetural futura deve demonstrar um benefício
> concreto que não possa ser alcançado reutilizando a arquitetura
> existente. Na ausência desse benefício, a implementação deve seguir
> a estrutura atual.

## 9. Fluxo de trabalho fixado

### 9.1 Antes de iniciar qualquer funcionalidade nova

1. `npm run build`.
2. `npm run lint`.
3. Corrigir tudo o que estiver quebrado.
4. Commitar.
5. Só então iniciar a próxima funcionalidade.

Nunca iniciar uma feature com a árvore de trabalho suja.

### 9.2 Ao final de cada sessão

1. Corrigir todos os erros.
2. Rodar `npm run build`.
3. Rodar `npm run lint`.
4. Atualizar os documentos de continuidade:
   - `PROJECT_MASTER.md` — só o que mudou estruturalmente (nunca
     reescrever do zero).
   - `ROADMAP.md` — marcar itens concluídos/iniciados.
   - `NEXT_SESSION.md` — **reescrever por completo**.
   - `CHANGELOG_AI.md` — adicionar entrada nova (nunca editar
     entradas antigas).
   - `ARCHITECTURE_DECISIONS.md` — só se houver decisão arquitetônica
     nova (nunca editar ADRs existentes).
5. Commitar.
