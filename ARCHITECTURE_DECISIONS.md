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

---

## ADR-006 — Reutilização antes de criação

**Decisão:** antes de implementar uma funcionalidade nova, verificar
se já existe um componente reutilizável ou um padrão já estabelecido
no projeto (tabela, formulário, confirmação de exclusão, menu de
ações, upload). Evitar duplicação de código e manter consistência
visual e arquitetural entre módulos.

**Motivo:** os próximos módulos (Banners, FAQ, Tutoriais, Clientes)
vão precisar essencialmente dos mesmos elementos já construídos para
Aplicativos — tabela com ações, formulário com Server Action, exclusão
com confirmação, upload de arquivo. Construir cada módulo do zero, sem
checar o que já existe, gera inconsistência visual e múltiplas
implementações do mesmo padrão para manter.

**Como aplicar:** ao começar um módulo novo, primeiro revisar
`components/apps/`, `components/common/` e `components/ui/` (e os
demais módulos já implementados) para identificar o que pode ser
generalizado/reaproveitado (ex.: `ActionsMenu` já é genérico o
suficiente para qualquer entidade com `id`; um componente de tabela
genérico pode nascer a partir de `AppsTable` quando o segundo módulo
precisar de algo parecido — não abstrair antes da segunda necessidade
real). Só criar um componente novo quando não houver nada reutilizável
e o padrão realmente for específico do módulo.

**Status:** regra permanente a partir de 2026-08-06, vale para todos
os módulos daqui pra frente.

---

## ADR-007 — Estrutura do Storage

**Decisão:** um único bucket privado `apps`, com pastas por
produto/plataforma (`{asset_folder}/{platform}/{apk,icon,banner}/`),
**não** por slug do app. Colunas existentes (`storage_path`,
`icon_path`, `asset_folder`, `storage_folder`, `download_url`)
mantidas sem renomear; adicionada apenas `banner_path`. Leitura
sempre via URL assinada gerada no servidor — nunca acesso público
direto. Troca de arquivo segue upload → atualizar banco → remover
antigo (nessa ordem), nunca o inverso.

**Motivo:** já existiam dados reais de produção (2 apps) seguindo a
convenção produto/plataforma — decisão explícita do usuário de não
forçar uma reestruturação (slug-based) por cima de uma convenção já
consistente. Ver `STORAGE.md` para o detalhamento completo.

**Status:** estrutura aprovada e documentada (`STORAGE.md`,
`supabase/migrations/20260806140000_add_banner_path_fix_storage_folder.sql`).
Bucket **ainda não criado** e upload **ainda não implementado** —
bloqueado por (1) migração SQL ainda não aplicada/confirmada pelo
usuário e (2) ausência de `service_role` key neste ambiente (a chave
anônima não cria bucket). `download_url`/Projeto Downloads deixou de
ser pergunta em aberto — ver ADR-008.

---

## ADR-008 — Sem compatibilidade com sistemas legados marcados para descontinuação

**Decisão:** toda funcionalidade nova deve ser implementada pensando
na futura interface pública do InovaTV Central, não em manter
compatibilidade com sistemas que já foram marcados para
descontinuação. Especificamente: o "Projeto Downloads" (site externo
`inovatv.pro`, referenciado por `apps.download_url`) será
descontinuado — nenhuma funcionalidade nova deve ler, escrever ou
depender de `download_url`. O campo permanece na tabela só por
compatibilidade temporária; será removido
(`ALTER TABLE apps DROP COLUMN download_url;`) em uma migração futura,
quando existir um Portal Público de Downloads dentro do próprio
InovaTV Central (`/apps/[slug]` ou `/downloads/[slug]`) — não faz
parte do escopo atual.

**Motivo:** evitar gastar esforço construindo pontes/compatibilidade
temporária com algo que já tem data marcada para deixar de existir.
O painel deve ser desenhado para onde o produto está indo (Portal
Público integrado ao InovaTV Central), não para onde ele já não vai
mais estar.

**Status:** regra permanente a partir de 2026-08-06. Aplica-se
imediatamente a `download_url` e a qualquer sistema legado que o
usuário marque como descontinuado no futuro.

---

## ADR-009 — Escopo da Service Role

**Decisão:** `SUPABASE_SERVICE_ROLE_KEY` é exclusiva para operações
administrativas de infraestrutura — Storage (criação/gestão de
buckets, upload/limpeza de arquivos), migrações de dados, scripts de
manutenção. **Nunca** é usada como mecanismo padrão de acesso ao
banco para funcionalidades do painel. O CRUD normal (Aplicativos e
todos os módulos futuros) continua exclusivamente via Supabase Auth
(usuário autenticado) + Server Actions + RLS, usando o client em
`src/lib/supabase/server.ts`.

**Motivo:** evitar que, por conveniência, o código passe a usar
service_role "porque funciona", erodindo a separação entre sessão de
usuário autenticado (RLS aplicado, auditável) e acesso administrativo
irrestrito (RLS ignorado). Mantém o modelo de autorização previsível
conforme o painel cresce.

**Como aplicar:** todo Server Action novo usa por padrão
`createClient()` de `src/lib/supabase/server.ts`. Só usar
`createAdminClient()` de `src/lib/supabase/admin.ts` quando a
operação for genuinamente de infraestrutura (ex.:
`supabase.storage.createBucket`, remoção de arquivo órfão, script de
manutenção) — nunca para servir uma tela ou CRUD do painel.

**Status:** regra permanente a partir de 2026-08-06.
