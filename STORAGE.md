# Armazenamento de Arquivos — InovaTV Painel

> Ver ADR-011 e ADR-012 (`ARCHITECTURE_DECISIONS.md`) para as
> decisões permanentes por trás deste documento. Este arquivo detalha
> a implementação; as ADRs registram o porquê.

Última atualização: 2026-08-11

## Decisão (histórico resumido)

1. Primeira tentativa: Supabase Storage, bucket privado `apps`,
   estrutura produto/plataforma. Migração aplicada, bucket chegou a
   ser criado.
2. Ao criar o bucket, descoberto que o projeto Supabase está no
   **plano Free**, com teto de upload de **50MB por arquivo, global
   do projeto** — não configurável por bucket. Abaixo dos 300MB
   decididos para APK.
3. Decisão do usuário: **substituir completamente** o Supabase
   Storage por uma hospedagem própria (**Hostinger**) para todo
   arquivo público da plataforma — não só APK. O bucket Supabase
   ficou parado, sem uso, por um tempo (não removido de imediato).
   **Atualização (2026-08-11): os buckets `apps` e `apks` foram
   excluídos por completo** — o Supabase Storage não existe mais
   neste projeto, em nenhuma forma.

## Armazenamento oficial: Hostinger

**Acesso:** FTP/SFTP, com um usuário restrito ao diretório de
arquivos (nunca a conta principal da hospedagem). Preferência SFTP
sobre FTP — a camada de código detecta automaticamente qual está
disponível e usa o mais seguro (ver `src/lib/storage/remote-storage.ts`).

**Visibilidade:** arquivos são **públicos** — URL direta, sem URL
assinada. O controle de acesso (quem pode ver o quê no painel) é
responsabilidade da aplicação, não do armazenamento.

```
Painel → Server Action → Hostinger (upload) → banco guarda o caminho
                                                        ↓
                                     usuário final acessa via URL pública
                                     construída em runtime (getPublicUrl)
```

## Estrutura de diretórios

```
assets/
  apps/
    unitv/
      mobile/
        apk/app.apk
        icon/icon.png
        banner/banner.webp
      tv/
        apk/app.apk
        icon/icon.png
        banner/banner.webp
  banners/
    {id}/
      image.webp
  tutorials/
    images/
    videos/
  faq/
  downloads/
```

`apps/` segue a convenção produto/plataforma (`{asset_folder}/{platform}/`).
`banners/` (Home, carrossel — tabela `banners`, coluna `image_path`) segue
uma convenção própria, por `id` do registro, já que não tem produto nem
plataforma — implementada na Fase 3 (Sprint 3, 2026-08-08), corrigida em
2026-08-11 (o path chegou a incluir um prefixo `assets/` redundante,
gerando `assets/assets/banners/...`; corrigido para `banners/{id}/...`,
mesma regra do ponto abaixo).

**Convenção definitiva de nome — o painel nunca pergunta o nome do
arquivo, ele já sabe:**

| Tipo | Nome fixo |
|---|---|
| APK | `app.apk` |
| Ícone | `icon.png` |
| Banner | `banner.webp` |

Nunca `unitv_icon_final.png`, `logo-v2.png`, `app-v3.24.2.apk` etc. —
o nome nunca varia por app, só o caminho da pasta
(`{asset_folder}/{platform}/`) muda. Isso significa que o futuro
Portal Público (e qualquer outro consumidor) descobre o arquivo só
pela combinação produto+plataforma+tipo, sem precisar consultar o
banco para saber o nome.

Mantém a lógica produto/plataforma já usada para apps (ver histórico
na ADR-007) e já reserva espaço para os próximos módulos
(Tutoriais, FAQ) reaproveitarem a mesma raiz `assets/` em vez de cada
um inventar sua própria convenção — ADR-006 (reutilização).

Nome nunca versionado porque a versão já existe na coluna `version`
do banco — versionar o nome do arquivo também só faria a URL pública
mudar a cada atualização sem necessidade. Atualizar o APK/ícone/banner
= mesmo path, conteúdo novo (via `storage.replace()`), banco atualiza
só a versão.

**Path passado pro `StorageProvider` nunca começa com `assets/`.** A
raiz `assets/` já vem da própria conta FTP/SFTP (escopo do lado do
servidor, fora do código — `STORAGE_ROOT_PATH` está vazio hoje, ver
tabela de variáveis abaixo). Incluir `assets/` no path duplica o
segmento (bug real encontrado e corrigido em 2026-08-11 no upload de
Banners — ver seção "Estrutura de diretórios").

## Colunas no banco (sem migração necessária)

As mesmas colunas já usadas para o plano Supabase continuam válidas —
só mudou o que elas apontam:

| Coluna | Antes (Supabase) | Agora (Hostinger) |
|---|---|---|
| `storage_path` | caminho dentro do bucket `apps` | caminho relativo dentro de `assets/` na Hostinger |
| `icon_path` | idem | idem |
| `banner_path` | idem | idem |
| `asset_folder` | nome do produto (`unitv`) | inalterado |
| `storage_folder` | raiz física produto/plataforma | inalterado |

`banners.image_path` (tabela `banners`, não `apps`) segue a mesma
lógica — caminho relativo dentro de `assets/` na Hostinger — mas nunca
existiu no modelo Supabase; nasceu direto para a Hostinger (Fase 3).

`download_url` continua depreciado (ADR-008) — este novo esquema é,
na prática, a infraestrutura do futuro Portal Público que
substituirá esse campo.

## Camada de código (ADR-012)

```
src/lib/storage/
  types.ts       # interface StorageProvider
  provider.ts     # export const storage — único ponto de import
  remote-storage.ts      # implementação FTP/SFTP
```

Uso em qualquer Server Action — `replace()` para qualquer path que
possa já ter um arquivo (todo upload de APK/ícone/banner do painel,
já que o nome é fixo); `upload()` só faz sentido pra um path que se
sabe que é novo:

```ts
import { storage } from "@/lib/storage/provider";

const { path, url } = await storage.replace({
  path: "apps/unitv/mobile/apk/app.apk",
  data: buffer,
});
```

`replace()` nunca sobrescreve diretamente: envia para
`{path}.uploading`, confirma que o tamanho enviado bate com o
recebido pelo servidor, só então renomeia por cima do destino final.
Se a conexão cair no meio do envio, o arquivo em `path` continua
intacto — o `.uploading` órfão é removido em caso de falha. Testado
contra a Hostinger real em 2026-08-06 (`npm run storage:test`).

Nenhum componente ou Server Action deve importar `ssh2-sftp-client`,
`basic-ftp` ou `remote-storage.ts` diretamente.

## Variáveis de ambiente (`.env.local` — ver `.env.example`)

| Variável | Papel |
|---|---|
| `STORAGE_HOST` | endereço do servidor FTP/SFTP |
| `STORAGE_USER` | usuário restrito ao diretório de arquivos (não a conta principal) |
| `STORAGE_PASSWORD` | senha desse usuário |
| `STORAGE_ROOT_PATH` | caminho no servidor até a raiz de `assets/`, quando precisar ser explícito. **Hoje está vazio** — a raiz já vem do escopo da própria conta FTP/SFTP (configurada no hPanel), então nenhum path passado ao `StorageProvider` deve incluir `assets/` (ver "Estrutura de diretórios") |
| `STORAGE_PUBLIC_BASE_URL` | domínio/URL que serve esse mesmo diretório publicamente |
| `STORAGE_SFTP_PORT` / `STORAGE_FTP_PORT` | opcionais, só se as portas padrão (22/21) não forem as certas — **atenção:** hospedagem compartilhada da Hostinger às vezes usa uma porta SSH não-padrão (verificar no hPanel) |
| `STORAGE_PROTOCOL` | opcional, força `sftp` ou `ftp` em vez da detecção automática |
| `STORAGE_FTP_SECURE` | opcional, força `true`/`false` (FTPS vs FTP puro). Sem definir, detecta automaticamente: tenta FTPS, cai para FTP puro se o servidor recusar |

## Status desta implementação

**Testada com sucesso contra a Hostinger real em 2026-08-06**
(`npm run storage:test`): conecta, cria diretório, envia arquivo,
confirma existência, monta URL pública
(`https://inovatv.pro/assets/...`), remove e confirma remoção — todos
os 5 checks passaram. Infraestrutura de Storage validada de ponta a
ponta.

**Em uso real, não mais só infraestrutura testada:**
- **Apps** (`app.service.ts`, `uploadAppAsset`) — APK, ícone e banner
  promocional do app, via `/api/apps/[id]/upload` (Route Handler,
  streaming ndjson de progresso, ADR-013/ADR-014).
- **Banners** (`banner.service.ts`, `uploadBannerAsset`, Fase 3 Sprint
  3, 2026-08-08) — imagem do banner (Home/carrossel), via
  `/api/banners/[id]/upload`, mesmo padrão de Route Handler.

**Protocolo real usado: FTP puro, sem TLS.** SFTP não está disponível
nesse host (handshake SSH falha). FTPS falha por mismatch de
certificado — o certificado TLS do servidor é `*.hstgr.io` (do
provedor), não `ftp.inovatv.pro` (domínio customizado), então o
Node rejeita a conexão seguindo o hostname configurado. O fallback
automático (ADR-012) cai corretamente para FTP sem criptografia.
Credenciais trafegam em texto claro nessa conexão — risco aceito por
ora; se quiser eliminar isso, uma opção futura é conectar via
hostname `*.hstgr.io` em vez do domínio customizado (não implementado
— decisão do usuário, não presumida aqui).

## Tamanho máximo por tipo de arquivo (decisão original, ainda válida)

| Tipo | Limite |
|---|---|
| APK | 300 MB |
| Ícone | 5 MB |
| Banner | 10 MB |

Validado na aplicação (Server Action), não no armazenamento — a
Hostinger não tem o teto de 50MB que o Supabase Free tinha, mas cada
plano de hospedagem tem seu próprio limite de upload/PHP
(`upload_max_filesize` etc. se relevante) — confirmar isso quando a
conta Hostinger estiver configurada.

## Política de substituição (sem acumular lixo)

Mantida sem alteração: upload do novo → atualizar banco → só depois
remover o antigo do armazenamento, nunca o inverso.

## UI planejada (sem alteração)

- Ícone/Banner: preview imediato.
- APK: sem preview; cartão com nome, tamanho, versão, data de envio,
  ações Download/Trocar/Remover.
