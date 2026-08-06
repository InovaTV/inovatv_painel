# Architecture Decision Records — InovaTV Painel

> Registro de decisões arquitetônicas **permanentes**. Diferente de
> `PROJECT_MASTER.md` (estado atual, muda com frequência), este
> arquivo só recebe entradas novas — decisões existentes não são
> reescritas nem removidas. Para reverter uma decisão, adicione uma
> ADR nova que supersede a anterior, deixando o registro explícito de
> quando e por quê mudou.
>
> Qualquer alteração de código que contradiga uma ADR aqui registrada
> deve ser tratada como quebra de arquitetura, não como refatoração
> normal — exige decisão explícita do usuário antes de prosseguir.

---

## ADR-001 — Autenticação

**Decisão:** Supabase Auth (email/senha) + Server Actions para login
e logout. Sessão gerenciada por cookies via `@supabase/ssr`, nunca
por token manual em `localStorage`.

**Motivo:** evitar acesso administrativo direto pelo browser e manter
a sessão validável no servidor (Server Components, Server Actions e
middleware/proxy) sem depender de estado no client.

**Status:** implementado (`src/lib/actions/auth.ts`,
`src/app/(auth)/login/`).

---

## ADR-002 — Middleware / Proteção de rotas

**Decisão:** proteção de rotas via `src/proxy.ts` (convenção do
Next.js 16). `middleware.ts` **não** é utilizado neste projeto —
Next.js 16 renomeou a convenção; recriar `middleware.ts` não terá
efeito nenhum (o arquivo é simplesmente ignorado pelo framework).

**Motivo:** seguir a convenção atual do framework na versão em uso;
evitar o warning de depreciação e, mais importante, evitar o bug já
enfrentado nesta sessão onde `middleware.ts` foi criado mas nunca
interceptou nenhuma requisição.

**Status:** implementado (`src/proxy.ts` + `src/lib/supabase/middleware.ts`).

---

## ADR-003 — CRUD

**Decisão:** todo CRUD (criação, edição, exclusão) passa
obrigatoriamente por Server Actions. Nenhum componente client acessa
o Supabase diretamente para operações de escrita.

**Motivo:** manter privilégios de escrita no servidor, permitir
validação/autorização centralizada, e não depender de RLS como única
linha de defesa para mutações administrativas.

**Status:** parcialmente implementado — Create (`createAppAction`) e
Delete (`deleteAppAction`) de Aplicativos seguem o padrão. Update de
Aplicativos e os demais módulos (Banners, Tutoriais, FAQ, Clientes,
Configurações) ainda não foram construídos.

---

## ADR-004 — Storage / Upload

**Decisão:** uploads (APK, ícone, banner e futuros arquivos) passam
obrigatoriamente por Server Actions. Nenhum upload é feito
diretamente do browser para o Supabase Storage.

**Motivo:** mesma razão da ADR-003 — evitar acesso administrativo
direto pelo browser e manter controle centralizado sobre validação de
tipo/tamanho de arquivo antes da gravação.

**Status:** ainda não implementado. Inputs de arquivo no `AppForm`
existem apenas como placeholder visual (`disabled`).

---

## ADR-005 — Estrutura

**Decisão:** arquitetura baseada em features/domínio dentro de
`components/` (`components/apps/`, `components/dashboard/`, etc.),
com Server Actions colocadas ao lado da rota que as usa
(`app/(dashboard)/apps/actions.ts`, `app/(dashboard)/apps/novo/actions.ts`),
não centralizadas em uma pasta única de "actions" por módulo.

**Motivo:** manter cada módulo (Aplicativos, Banners, ...)
autocontido — fácil de localizar tudo que pertence a um domínio sem
navegar por múltiplas pastas paralelas.

**Status:** aplicado ao módulo Aplicativos; será o padrão para os
próximos módulos.
