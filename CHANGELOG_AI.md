# Changelog — Alterações feitas por IA

> Histórico cronológico (mais recente no topo) de alterações feitas
> por assistentes de IA neste projeto. Este arquivo passou a existir
> em 2026-08-06; alterações anteriores a essa data (ver `git log`)
> não estão detalhadas aqui.

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
