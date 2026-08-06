# Armazenamento de Arquivos — InovaTV Painel

> Ver ADR-011 e ADR-012 (`ARCHITECTURE_DECISIONS.md`) para as
> decisões permanentes por trás deste documento. Este arquivo detalha
> a implementação; as ADRs registram o porquê.

Última atualização: 2026-08-06

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
   fica parado, sem uso (não removido).

## Armazenamento oficial: Hostinger

**Acesso:** FTP/SFTP, com um usuário restrito ao diretório de
arquivos (nunca a conta principal da hospedagem). Preferência SFTP
sobre FTP — a camada de código detecta automaticamente qual está
disponível e usa o mais seguro (ver `src/lib/storage/hostinger.ts`).

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
        apk/
        icon/
        banner/
      tv/
        apk/
        icon/
        banner/
  tutorials/
    images/
    videos/
  faq/
  downloads/
```

Mantém a lógica produto/plataforma já usada para apps (ver histórico
na ADR-007) e já reserva espaço para os próximos módulos
(Tutoriais, FAQ) reaproveitarem a mesma raiz `assets/` em vez de cada
um inventar sua própria convenção — ADR-006 (reutilização).

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

`download_url` continua depreciado (ADR-008) — este novo esquema é,
na prática, a infraestrutura do futuro Portal Público que
substituirá esse campo.

## Camada de código (ADR-012)

```
src/lib/storage/
  types.ts       # interface StorageProvider
  provider.ts     # export const storage — único ponto de import
  hostinger.ts      # implementação FTP/SFTP
```

Uso em qualquer Server Action:

```ts
import { storage } from "@/lib/storage/provider";

const { path, url } = await storage.upload({
  path: "apps/unitv/mobile/apk/unitv-mobile-v3.24.2.apk",
  data: buffer,
});
```

Nenhum componente ou Server Action deve importar `ssh2-sftp-client`,
`basic-ftp` ou `hostinger.ts` diretamente.

## Variáveis de ambiente (`.env.local` — ver `.env.example`)

| Variável | Papel |
|---|---|
| `HOSTINGER_HOST` | endereço do servidor FTP/SFTP |
| `HOSTINGER_USER` | usuário restrito ao diretório de arquivos (não a conta principal) |
| `HOSTINGER_PASSWORD` | senha desse usuário |
| `HOSTINGER_ROOT_PATH` | caminho no servidor até a raiz de `assets/` |
| `HOSTINGER_PUBLIC_BASE_URL` | domínio/URL que serve esse mesmo diretório publicamente |
| `HOSTINGER_SFTP_PORT` / `HOSTINGER_FTP_PORT` | opcionais, só se as portas padrão (22/21) não forem as certas — **atenção:** hospedagem compartilhada da Hostinger às vezes usa uma porta SSH não-padrão (verificar no hPanel) |
| `HOSTINGER_PROTOCOL` | opcional, força `sftp` ou `ftp` em vez da detecção automática |

## Status desta implementação

**Escrita, validada por `tsc`/`lint`/`build`, mas NÃO testada contra
a Hostinger real.** Nenhuma credencial configurada ainda — ninguém
chama `storage.upload/delete/exists` em nenhuma rota. Antes de
marcar qualquer upload como concluído no `DEFINITION_OF_DONE.md`,
fazer um teste manual de conectividade + upload real.

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
