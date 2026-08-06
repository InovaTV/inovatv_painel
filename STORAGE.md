# Estrutura do Supabase Storage — InovaTV Painel

> Documento de planejamento. **O bucket descrito aqui ainda não foi
> criado** (confirmado via API: `storage/v1/bucket` retorna `[]`).
> Este arquivo existe para validação antes da criação — só criar o
> bucket e implementar upload depois que a estrutura aqui estiver
> aprovada.
>
> **Migração aplicada e bucket criado em 2026-08-06** (via
> `supabase db push` + `scripts/create-storage-bucket.mjs`, usando
> `createAdminClient()` — ADR-009). Confirmado via API:
> `banner_path` existe, `storage_folder` corrigido, bucket `apps`
> existe (privado).
>
> **Novo bloqueio, encontrado ao criar o bucket:** o projeto Supabase
> está no **plano Free**, que tem um teto global de upload de
> **50MB** (`Project Settings → Storage`, confirmado via Management
> API: `fileSizeLimit: 52428800`). Isso é bem abaixo dos 300MB
> decididos para APK — **nenhum bucket-level limit consegue superar
> esse teto**; tentar configurar 300MB no bucket falhou justamente
> por isso. Upload de APK real (a maioria fica entre 70MB e 300MB,
> por decisão do usuário) não é viável no plano atual. Ver
> `NEXT_SESSION.md` para a decisão pendente.

Última atualização: 2026-08-06

## Decisão

Um único bucket **privado**, chamado `apps`. Leitura (preview,
download) sempre via URL assinada gerada no servidor (Server
Action/Server Component) — nunca acesso público direto ao arquivo,
consistente com a ADR-004 (`ARCHITECTURE_DECISIONS.md`).

## Estrutura de pastas

Mantém a convenção que já existe nos dados reais da tabela `apps`
(produto → plataforma), **não** a de pasta por slug:

```
apps/                         (bucket, privado)
  unitv/                      (asset_folder)
    mobile/                   (platform)
      apk/
        unitv-mobile-v3.24.2.apk
      icon/
        icon.webp
      banner/
        banner.webp
    tv/                       (platform)
      apk/
        unitv-tvbox-v4.19.1.00.apk
      icon/
        icon.webp
      banner/
        banner.webp
```

Motivo: no domínio do produto, "UniTV" é o produto e "Mobile"/"TV Box"
são variantes dele — a estrutura reflete `Produto → Plataforma`, não
`Aplicativo → Arquivos`. Um app novo de outro produto (ex.: futuro
"XPTV") ganha sua própria pasta de produto.

## Colunas usadas (tabela `apps`, sem renomear nada existente)

| Coluna | Papel | Status |
|---|---|---|
| `storage_path` | caminho do APK dentro do bucket `apps` | já existe, tem dado real |
| `icon_path` | caminho do ícone | já existe, `null` nos 2 apps reais |
| `banner_path` | caminho do banner | **novo**, adicionado pela migração |
| `asset_folder` | nome da pasta do produto (`unitv`) | já existe, mantido |
| `storage_folder` | raiz física (produto/plataforma) | já existe, dado corrigido pela migração |
| `download_url` | link público de download (domínio externo `inovatv.pro`) | **depreciado** — ver seção abaixo |

## Sobre os valores atuais de `storage_path`/`storage_folder`

Os 2 apps reais (`unitv-mobile`, `unitv-tv`) já têm `storage_path`
preenchido com um formato antigo, ex.:
`public/apps/unitv/mobile/unitv-mobile.apk` — sem subpasta por tipo
de arquivo (`apk/`) e com um prefixo `public/apps/` que não
corresponde ao bucket `apps` decidido aqui (bucket privado, sem
prefixo `public/`).

Como nenhum arquivo real existe no Storage ainda (bucket nem existe),
esse valor é só um texto de intenção, não uma referência a um arquivo
vivo. **Esta migração não reescreve esses valores.** A forma mais
segura de reconciliar é deixar que o próprio fluxo de upload
sobrescreva `storage_path` (e passe a preencher `icon_path`) com o
caminho correto na primeira vez que cada app tiver um arquivo
enviado/trocado pelo painel — sem migração de dado dedicada para isso.

## `download_url` — depreciado, decisão fechada

**Resolvido em 2026-08-06 (não é mais pergunta em aberto):** o
usuário confirmou que o "Projeto Downloads" (site externo
`inovatv.pro` referenciado em `download_url`) **será descontinuado**.
Não há mais nenhuma integração a preservar.

Regra permanente (ver ADR-008): `download_url` fica ignorado a partir
de agora — nenhuma funcionalidade nova lê, escreve ou depende dele.
Ele continua existindo na tabela só por compatibilidade temporária e
será removido (`ALTER TABLE apps DROP COLUMN download_url;`) em uma
migração futura, quando o Portal Público de Downloads passar a fazer
parte do InovaTV Central (`/apps/[slug]` ou `/downloads/[slug]`) —
**não agora**, não faz parte do escopo atual.

## Tamanho máximo por tipo de arquivo

| Tipo | Limite |
|---|---|
| APK | 300 MB |
| Ícone | 5 MB |
| Banner | 10 MB |

## Política de substituição (sem acumular lixo)

Ao trocar um arquivo (ex.: nova versão do APK):

1. Enviar o novo arquivo para o Storage.
2. Atualizar a coluna correspondente (`storage_path`/`icon_path`/`banner_path`)
   no banco **só depois** do upload confirmado.
3. Remover o arquivo antigo do Storage **só depois** do passo 2 ter
   sucesso — nunca apagar antes de confirmar que o novo já está
   salvo e o banco já aponta pra ele.

Isso evita dois problemas: banco apontando para arquivo já apagado
(se a ordem for invertida) e bucket acumulando arquivos órfãos (se o
antigo nunca for removido).

## UI planejada (para quando o upload for implementado)

- **Ícone/Banner:** preview imediato da imagem.
- **APK:** sem preview (não faz sentido); mostrar nome do arquivo,
  tamanho, versão, data de envio, e ações "Download", "Trocar",
  "Remover".
- Todas as leituras (preview e download) passam por URL assinada
  gerada sob demanda — nunca uma URL pública fixa gravada no banco.
