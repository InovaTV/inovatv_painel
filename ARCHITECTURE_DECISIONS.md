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

**Status:** **SUPERSEDIDA em 2026-08-06 pela ADR-011** — o
armazenamento de arquivos deixou de ser Supabase Storage e passou a
ser Hostinger. Histórico mantido para contexto (migração aplicada,
bucket `apps` chegou a ser criado — ver `CHANGELOG_AI.md` — mas ficou
sem uso; não é removido agora, ver ADR-011). As colunas
`storage_path`/`icon_path`/`banner_path`/`asset_folder`/`storage_folder`
continuam sendo usadas, só que agora apontam para caminhos na
Hostinger em vez de um bucket Supabase — nenhuma migração de dado foi
necessária para essa troca.

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
usuário marque como descontinuado no futuro. **Atualização, mesmo
dia:** a migração de armazenamento para a Hostinger (ADR-011) é
confirmada pelo usuário como sendo, na prática, a infraestrutura do
Portal Público previsto aqui — `download_url` continua depreciado e
será removido quando esse portal estiver pronto.

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

---

## ADR-010 — Escopo e rotação do Supabase Access Token

**Decisão:** `SUPABASE_ACCESS_TOKEN` (Personal Access Token da conta
Supabase, usado pela CLI) é exclusivo para operações administrativas
do Supabase CLI — `login`, `link`, `db push` e comandos equivalentes.
Nunca é lido pela aplicação em runtime, nunca vira parte de um Server
Action ou rota. Uma vez a CLI autenticada localmente, o token não
precisa ser reutilizado a cada comando. Recomendação explícita do
usuário: revogar o token (Supabase → Account → Access Tokens) quando
o projeto estabilizar ou quando não houver mais necessidade de rodar
comandos administrativos da CLI.

**Motivo:** é um token de conta, não de projeto — dá acesso a todos
os projetos Supabase da conta, não só ao `inovatv_painel`. Restringir
o uso e revogar quando não for mais necessário reduz a superfície de
risco caso o token vaze.

**Status:** regra permanente a partir de 2026-08-06.

---

## ADR-011 — Hostinger como armazenamento oficial de arquivos

**Decisão:** o Supabase Storage deixa de ser usado para arquivos da
aplicação (APK, ícones, banners, e qualquer arquivo público futuro —
imagens/vídeos de tutoriais, PDFs de FAQ, downloads). A partir de
2026-08-06, a **Hostinger** (FTP/SFTP) passa a ser o armazenamento
oficial. O Supabase continua sendo usado só para banco de dados,
autenticação e RLS — nunca mais para arquivos.

Os arquivos na Hostinger são **públicos** (URL direta, sem URL
assinada). Controle de acesso, quando necessário, é feito pela
aplicação (checagem de sessão/RLS antes de expor o link), não pelo
armazenamento — diferente do modelo de bucket privado da ADR-007.

Estrutura de diretórios definitiva:

```
assets/
  apps/
    unitv/
      mobile/{apk,icon,banner}/
      tv/{apk,icon,banner}/
  tutorials/
    images/
    videos/
  faq/
  downloads/
```

Nenhuma migração de dado foi necessária: as colunas já existentes
(`storage_path`, `icon_path`, `banner_path`, `asset_folder`,
`storage_folder`) continuam guardando o **caminho relativo** do
arquivo — só que agora relativo à raiz da Hostinger, não a um bucket
Supabase. A URL pública é sempre construída em tempo de execução
(`getPublicUrl`), nunca gravada como valor fixo no banco.

**Motivo:** o plano Supabase atual (Free) tem um teto de upload de
50MB por arquivo, abaixo dos 300MB decididos para APK (ADR-007/
`STORAGE.md`) — não configurável por bucket, é um limite de
projeto/plano inteiro. Migrar para uma hospedagem com controle total
sobre limites de arquivo resolve isso e evita precisar migrar de novo
quando o Portal Público estiver pronto (a Hostinger já nasce como
infraestrutura definitiva para isso — ver ADR-008).

**Status:** decisão aprovada em 2026-08-06. Implementação (camada de
abstração) em andamento — ver ADR-012 e `STORAGE.md`. Credenciais da
Hostinger (FTP/SFTP) ainda não configuradas no `.env.local` no
momento desta ADR; bloqueado até isso acontecer.

---

## ADR-012 — Camada de abstração de armazenamento

**Decisão:** nenhum componente ou Server Action da aplicação conhece
FTP, SFTP ou Hostinger diretamente. Todo acesso a arquivos passa por
uma interface única em `src/lib/storage/`:

```
src/lib/storage/
  types.ts       # interface StorageProvider + tipos
  provider.ts     # export const storage: StorageProvider — ponto único de import
  remote-storage.ts      # implementação concreta (FTP/SFTP)
```

O resto do código só chama `storage.upload(...)`, `storage.delete(...)`,
`storage.exists(...)`, `storage.getPublicUrl(...)` — importado de
`@/lib/storage/provider`, nunca de `remote-storage.ts` diretamente.

**Motivo:** trocar de provedor de armazenamento no futuro (outra
hospedagem, S3, etc.) deve significar escrever um novo arquivo que
implementa `StorageProvider` e trocar uma linha em `provider.ts` — não
reescrever cada Server Action que faz upload. Já é a segunda vez que
o projeto muda de armazenamento (Supabase → Hostinger) em uma única
sessão; a camada existe para que uma terceira mudança, se acontecer,
seja barata.

**Status:** interface e implementação escritas em 2026-08-06
(`tsc`/`lint`/`build` limpos). Ajustada no mesmo dia para nomenclatura
genérica: arquivo `remote-storage.ts` (não `hostinger.ts`), variáveis
`STORAGE_*` (não `HOSTINGER_*`), seleção de provider via
`STORAGE_PROVIDER` em `provider.ts` — a aplicação depende só do
conceito de "storage provider", nunca do nome da hospedagem
específica. **Testada com sucesso via `npm run storage:test` em
2026-08-06** — conecta, cria diretório, envia, confirma existência,
monta URL pública, remove e confirma remoção contra a Hostinger real.
Ganhou `replace()` no mesmo dia: upload seguro para paths que já
podem ter um arquivo (envia pra `{path}.uploading`, confirma tamanho,
renomeia por cima do destino final — nunca sobrescreve diretamente),
também testado contra o servidor real. Ganhou `stat(path)` (tamanho +
data de modificação, `null` se o arquivo não existe) para exibir
informação do arquivo na UI sem precisar de coluna nova no banco.

---

## ADR-013 — Route Handler para upload de arquivo (exceção pontual à ADR-003)

**Decisão:** upload de arquivo (APK/Ícone/Banner) usa uma **Route
Handler** (`src/app/api/apps/[id]/upload/route.ts`), não uma Server
Action, e é chamado do client via `XMLHttpRequest` em vez de
`<form action={...}>`. Único caso sancionado de fugir do padrão
Server Action da ADR-003 — motivo técnico específico: Server Actions
não expõem evento de progresso de upload no browser; `XMLHttpRequest`
sim (`xhr.upload.onprogress`). A Route Handler continua 100%
servidor — o client nunca fala com Storage/FTP diretamente, mesma
garantia de segurança da ADR-003/012, só muda o transporte.

Coberta automaticamente pela mesma proteção de autenticação de
qualquer outra rota (`src/proxy.ts` cobre `/api/*`) e pelo mesmo
`experimental.proxyClientMaxBodySize` já configurado — não precisou
de configuração nova.

**Motivo:** requisito explícito do usuário — barra de progresso real
(percentual, MB enviado/total) na experiência de upload.

**Como aplicar:** upload de arquivo passa por Route Handler + XHR no
client, chamando a mesma `uploadAppAsset()` do service layer que uma
Server Action chamaria. Tudo o mais (CRUD de texto/metadados)
continua exclusivamente Server Action — esta ADR não abre precedente
geral para Route Handlers, só cobre upload de arquivo com progresso.

**Status:** implementado e validado (tsc/lint/build limpos,
`getNextDisplayOrder`/produtos/`stat()` testados via script) em
2026-08-06. Componente reutilizável (`AssetUploadField.tsx`)
funcional para APK; Ícone/Banner reaproveitam sem mudança de código
quando forem habilitados. Progresso é real só na etapa
navegador→servidor (não inclui a etapa servidor→Hostinger) — decisão
consciente do usuário para manter a implementação simples agora;
evoluir para SSE só se a UX atual não for suficiente na prática.
**Atualização 2026-08-07:** a UX atual não foi suficiente na prática
(barra ficava presa em "processando" pela transferência FTP inteira,
a etapa mais lenta) — ver ADR-014, que cobre exatamente esse caso
previsto aqui.

---

## ADR-014 — Progresso real também na etapa servidor→armazenamento remoto

**Decisão:** a Route Handler de upload (ADR-013) responde em
**streaming** (ndjson — uma linha de JSON por evento), em vez de um
único `NextResponse.json()` no final. Durante o upload FTP, cada
evento de progresso do `basic-ftp` (`client.trackProgress()`, nativo
da lib) vira uma linha `{stage: "storage", sentBytes, totalBytes}`
enviada ao client assim que acontece. O evento final é `{done: true,
path}` (sucesso) ou `{done: true, error}` (falha) — erros passam a
vir no corpo do stream, não mais via status HTTP, porque a resposta já
fixa status 200 assim que o streaming começa.

No client, `AssetUploadField.tsx` continua usando `XMLHttpRequest`
(não `fetch`) para poder ler a resposta enquanto ela chega: o evento
`xhr.addEventListener("progress", ...)` (progresso de **download** da
resposta, não confundir com `xhr.upload.addEventListener("progress")`
usado pra etapa navegador→servidor) dispara a cada chunk recebido,
e o client faz parsing incremental de `xhr.responseText` por linha.

**Motivo:** a barra de progresso cobria só navegador→servidor (rápida,
quase instantânea em qualquer rede razoável) e ficava travada em
"Processando no servidor... 100%" durante toda a transferência real
pro FTP da Hostinger — a etapa que de fato demora (segundos, às vezes
vários, dependendo do tamanho do arquivo). Usuário reportou isso como
"a barra não tem valor nenhum" — já estava prevista como possível
próximo passo na ADR-013 ("evoluir para SSE só se a UX atual não for
suficiente na prática").

**Como aplicar:** qualquer novo tipo de upload que reaproveite
`uploadAppAsset`/`storage.replace()` já ganha esse progresso de graça
— basta passar um `onProgress` (ver `UploadInput.onProgress` em
`src/lib/storage/types.ts`). SFTP não implementa `onProgress` (a lib
`ssh2-sftp-client` não expõe um callback de progresso equivalente) —
sem impacto prático hoje porque a conexão real é sempre FTP puro
(SFTP falha na negociação e cai no fallback, ver `STORAGE.md`), mas se
isso mudar no futuro o progresso da etapa storage volta a ficar
estático pra uploads via SFTP.

**Status:** implementado e validado ao vivo no navegador (Claude in
Chrome, upload real de ~4.7MB, barra confirmada subindo 0%→100%
durante a etapa FTP) em 2026-08-07.

---

## ADR-015 — Env vars em scripts: sempre usar o loader do Next, nunca `node --env-file`

**Decisão:** qualquer script Node deste projeto que precise ler
`.env.local` (diagnósticos, seeds, migrações futuras) deve carregar o
env via `@next/env` (`loadEnvConfig(process.cwd())`), nunca via
`node --env-file=.env.local` nem `dotenv` puro sem expansão. Se o
import do que depende do env for estático, ele precisa vir depois do
`loadEnvConfig` via `import()` dinâmico — um `import` estático no topo
do arquivo é *hoisted* e avalia antes de qualquer código do próprio
módulo rodar, inclusive antes do `loadEnvConfig`.

**Motivo:** o Next.js expande `$VAR` dentro de `.env*` automaticamente
(feature documentada — permite um valor referenciar outro). Um `$`
literal numa credencial (ex.: senha gerada aleatoriamente) precisa
estar escapado (`\$`) pra não ser interpretado como referência a uma
variável inexistente e virar string vazia **silenciosamente** — sem
erro, sem warning, só o valor errado em runtime. `node --env-file` (o
loader nativo do Node) não faz essa expansão, então um script que use
esse loader para "testar" credenciais pode passar perfeitamente
enquanto o app real, usando o loader do Next, falha com a mesma
variável — foi exatamente esse o descompasso que escondeu o bug da
entrada 2026-08-07 (24) do `CHANGELOG_AI.md` por trás de um `530 Login
incorrect` intermitente e difícil de reproduzir via CLI.

**Como aplicar:** ao escrever qualquer script novo fora do runtime do
Next que precise das mesmas credenciais que o app usa em produção/dev,
copiar o padrão de `scripts/storage-doctor.ts` (loadEnvConfig +
import dinâmico). Nunca assumir que um valor com `$` em `.env.local`
"deveria simplesmente funcionar" sem checar se precisa de escape — em
caso de dúvida, testar o valor efetivo com `loadEnvConfig` antes de
usá-lo numa credencial real.

**Status:** implementado (`scripts/storage-doctor.ts`,
`package.json#scripts.storage:test`) em 2026-08-07.

---

## ADR-016 — Download de APK via Route Handler (indireção proposital)

**Decisão:** o download do APK não é um link direto para a URL
pública da Hostinger (`storage.getPublicUrl(app.storage_path)`).
É uma **Route Handler** própria
(`src/app/api/apps/[id]/download/route.ts`, `GET`) que resolve o
`storage_path` do app no banco e responde com
`NextResponse.redirect()` para a URL pública. O client (`ActionsMenu`)
sempre aponta para `/api/apps/{id}/download`, nunca para a URL da
Hostinger diretamente.

**Motivo:** requisito explícito do usuário — mesmo sem nenhuma lógica
extra hoje além do redirect, todo download passa por um ponto único
no servidor. Isso preserva a arquitetura para adicionar, sem mudar o
client, funcionalidades futuras como contagem/estatística de
downloads, auditoria (quem baixou o quê e quando) ou controle de
acesso (ex.: exigir sessão válida, checar plano do cliente).

**Não é uma exceção à ADR-003:** download é leitura (`GET`), não
CRUD/mutação — não há Server Action equivalente para "ir buscar um
arquivo", então não há padrão para fugir. Diferente da ADR-013 (upload
via Route Handler), aqui não existe alternativa nativa do Next.js
sendo contornada; é simplesmente o tipo certo de rota para o caso.

**Como aplicar:** se um botão de "Ações" (`ActionsMenu`) precisar de
download em outro módulo no futuro, repetir o mesmo padrão —
`downloadHref` opcional na prop, apontando para uma Route Handler
`GET` própria daquele módulo, nunca para a URL do storage diretamente.
Sem sessão/sem `storage_path` retornam erro (`404` via
`NextResponse.json`) em vez de redirecionar — evita expor uma URL de
storage quebrada ou um redirect para `undefined`.

**Status:** implementado em 2026-08-07. `ActionsMenu` ganhou prop
opcional `downloadHref` (item "Baixar APK" só aparece quando o app tem
`storage_path`). Testado ao vivo no navegador via Claude in Chrome:
fetch direto ao endpoint com um app real retorna `type:
"opaqueredirect"` (confirma o redirect); com um id inexistente,
`getApp()` lança e a rota responde `500` (mesmo comportamento de
qualquer outra página que dependa de um id inválido neste projeto —
não é uma regressão introduzida aqui).

---

## ADR-017 — RLS de `apps` fechado para `anon` (achado crítico da auditoria de banco)

**Decisão:** a tabela `public.apps` foi completamente fechada para o
role `anon` — nem `SELECT`. Todas as 4 policies (SELECT/INSERT/
UPDATE/DELETE) agora são restritas a `to authenticated`, e os grants
de tabela (`SELECT`/`INSERT`/`UPDATE`/`DELETE`) foram revogados de
`anon` (migração `20260807160000_lock_down_apps_rls_anon.sql`).

**Achado (auditoria de banco, 2026-08-07):** a tabela tinha RLS
habilitado, mas as 4 policies originais ("Enable ... for all users")
tinham `qual`/`with_check` = `true` para o role `public` — que inclui
`anon` — combinado com grants completos de `SELECT`/`INSERT`/
`UPDATE`/`DELETE` para `anon`. Na prática, **qualquer requisição com a
chave anônima** (pública, embutida no bundle do navegador como
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) conseguia ler, criar, editar e
**apagar** qualquer app diretamente via API REST do Supabase — sem
precisar logar no painel. O login/`proxy.ts` protegia só a interface
do Next.js, nunca o banco em si.

**Motivo de fechar SELECT também (não só escrita):** decisão explícita
do usuário. O painel é hoje o **único** consumidor de `apps` — não
existe portal público, API pública nem app externo lendo essa tabela.
Seguindo a mesma regra da ADR-008 (não construir pensando em
compatibilidade futura), não há razão para manter uma porta de leitura
aberta "para o caso de precisar um dia". Se/quando existir um portal
público ou outra integração, a policy de leitura correspondente será
criada então, específica para esse caso — não antecipada agora.

**Por que isso não quebra o painel:** toda a superfície de leitura e
escrita de `apps` no código roda via Server Action/Server Component
com `createClient()` (`src/lib/supabase/server.ts`), que usa o cookie
de sessão do Supabase Auth — a requisição chega ao PostgREST como
`authenticated`, nunca `anon`. O próprio `src/proxy.ts` já exige login
para qualquer rota de `(dashboard)`, então não existe hoje nenhum
caminho no app que dependa de `anon` conseguir acessar `apps`.

**Como aplicar:** qualquer tabela nova (Banners/Marketing, Clientes,
FAQ, Tutoriais, Configurações — Fases 3+) deve nascer com o mesmo
padrão: RLS habilitado, policies restritas a `authenticated`, sem
grant nenhum para `anon`, a menos que exista uma razão concreta e
atual (não hipotética) para acesso anônimo. `banners` (tabela já
existente no banco, módulo ainda não construído) já segue esse padrão
para escrita (RLS + só policy de `SELECT`), mas teria a mesma revisão
quando o módulo for iniciado.

**Status:** aplicado em produção via Management API do Supabase
(token de acesso já usado neste projeto para diagnóstico — ver
ADR-010) em 2026-08-07, e migração correspondente commitada em
`supabase/migrations/`. Verificado com `curl` direto contra
`/rest/v1/apps` usando a chave anônima: `401`, `permission denied for
table apps` (`42501`). Painel logado testado ao vivo no navegador
(Claude in Chrome) depois da mudança — leitura e escrita (toggle de
status) funcionando normalmente. Primeira de quatro fases de uma
auditoria de banco mais ampla (`apps`/`products`/relacionadas) — ver
`ROADMAP.md` e `CHANGELOG_AI.md` para as fases seguintes (integridade,
evolução de schema, limpeza de colunas legadas).

---

## ADR-018 — Integridade de `apps.slug` e `apps.asset_folder` no banco (fase 2 da auditoria)

**Decisão:** `apps.slug` e `apps.asset_folder` passaram de opcionais/
sem garantia de integridade real para:
- `slug`: `NOT NULL` + `UNIQUE` (`apps_slug_key`).
- `asset_folder`: `NOT NULL` + `FOREIGN KEY` para
  `products.asset_folder`, com `ON UPDATE RESTRICT ON DELETE
  RESTRICT` (`apps_asset_folder_fkey`).

Migração: `supabase/migrations/20260807170000_apps_integrity_slug_asset_folder.sql`.

**Motivo:** os dois campos já eram tratados como obrigatórios e (no
caso do slug) únicos **só na camada de aplicação**
(`validateAppFields`/`isSlugTaken` em `app.service.ts`, e
`resolveProductAssetFolder` sempre retornando um valor não vazio).
Decisão explícita do usuário: o banco deve refletir exatamente as
mesmas regras da aplicação, para que um estado inconsistente não seja
possível mesmo por um caminho que não passe pela aplicação (acesso
direto ao banco, script, migração futura mal escrita, bug).

**Por que `RESTRICT` e não `CASCADE` na FK:** `asset_folder` não é só
uma chave lógica — é literalmente um componente do caminho físico de
armazenamento na Hostinger
(`apps/{asset_folder}/{platform}/apk|icon|banner/...`, ver
`uploadAppAsset` em `app.service.ts`). Um `ON UPDATE CASCADE`
atualizaria `apps.asset_folder` no banco automaticamente se
`products.asset_folder` mudasse, mas os arquivos já enviados para a
Hostinger **não se moveriam** — o caminho salvo no banco ficaria
divergente do caminho real no FTP, silenciosamente. `RESTRICT` nos
dois lados força uma decisão explícita (hoje não há UI de edição de
produto, então isso não afeta nenhum fluxo em uso).

**Rede de segurança para corrida (race condition):** a checagem
`isSlugTaken()` na aplicação não cobre duas criações/edições
simultâneas com o mesmo slug passando pela validação ao mesmo tempo —
quem perde a corrida esbarraria na `UNIQUE` constraint do banco como
um erro genérico. Adicionado `rethrowAsSlugConflict()` em
`app.service.ts`: detecta o código Postgres `23505` (violação de
unicidade) na constraint `apps_slug_key` especificamente e relança
como `AppValidationError({ slug: "Já existe um aplicativo com esse
slug." })` — a mesma mensagem amigável de sempre, mesmo nesse caminho
raro que só a integridade do banco consegue pegar.

**Como aplicar:** qualquer coluna que a aplicação já trata como
"sempre obrigatória"/"sempre única" deveria, com o tempo, ganhar a
constraint equivalente no banco — não deixar a validação de aplicação
como única linha de defesa quando o dado já é conhecido como
verdadeiramente obrigatório/único em produção. Repetir esse padrão
(constraint no banco + tradução do erro correspondente pra mensagem
amigável) em módulos futuros que tiverem o mesmo tipo de campo.

**Status:** aplicado em produção via Management API do Supabase em
2026-08-07 (pré-condições verificadas antes: 0 slugs duplicados, 0
`asset_folder` órfão, 0 valores nulos em `slug`/`asset_folder` nas 5
linhas existentes — migração aplicada sem conflito). Verificado
via `pg_constraint`/`information_schema.columns` depois da aplicação
(constraints e `NOT NULL` confirmados). Testado ao vivo no navegador:
editar um app existente (UniTV Mobile) continua funcionando
normalmente com as novas constraints em vigor. Segunda de quatro fases
da auditoria de banco — ver ADR-017 (fase 1) e `ROADMAP.md`/
`CHANGELOG_AI.md` para as fases seguintes (evolução de schema, limpeza
de colunas legadas).
