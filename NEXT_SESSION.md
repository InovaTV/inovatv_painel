# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`.

## Último commit

Ver `git log` — commit desta sessão adiciona log de instrumentação
em `uploadAppAsset` (tamanho do arquivo, tempo do `storage.replace()`,
tempo total). Decisão do usuário: **não avançar para Ícone/Banner
antes de validar Upload de APK pelo navegador de verdade.**

## Objetivo da próxima sessão

**Bloqueado até o usuário fazer o teste manual no navegador.** Não
sou eu quem faz esse teste — não tenho login/senha do painel.

Teste que o usuário vai rodar: `npm run dev`, logar, editar um app,
selecionar um APK real (20-45MB, conforme os apps reais do projeto),
enviar, e confirmar: arquivo chegou na Hostinger, banco atualizou
(`storage_path`), o log `[upload] apk "...": XXmb — storage.replace()
XXms, total XXms` aparece no terminal do `npm run dev` com números
plausíveis (não travando/timeout).

**Se passar:** Upload de APK fechado de verdade → seguir pra
Ícone/Banner (`uploadAppAsset` já suporta os dois, só falta habilitar
os inputs no `AppForm.tsx` + uma chamada igual à do `apk` em
`createAppAction`/`updateAppAction` — zero mudança em
`app.service.ts`).

**Se não passar (timeout, erro, ou muito lento):** investigar com os
números do log em mãos — não é a Vercel ainda (isso só importa em
produção), é validar o caminho local/self-hosted primeiro.

## Risco importante, não resolvido

`PROJECT_MASTER.md` lista **Vercel** como deploy alvo. Configurei
`next.config.ts` (`serverActions.bodySizeLimit: "300mb"`), mas
plataformas serverless costumam ter teto de payload por requisição
**independente** disso — historicamente bem abaixo de 300MB nos
planos comuns da Vercel. Isso não foi testado em produção nesta
sessão (só localmente via script). **Antes de confiar em upload de
APK grande de verdade:** confirmar com o usuário qual plano/produto
Vercel será usado e se suporta payloads desse tamanho, ou considerar
alternativa (upload direto do browser pro Storage, streaming, ou
outro host que não seja serverless para essa rota específica) — não
presumir, perguntar.

## Arquivos já alterados nesta sessão (contexto, não repetir)

- `src/services/app.service.ts`, `src/app/(dashboard)/apps/actions.ts`,
  `src/app/(dashboard)/apps/novo/actions.ts`,
  `src/components/apps/AppForm.tsx`, `next.config.ts`.

## Primeiro passo

Perguntar ao usuário se quer testar manualmente no navegador antes
de avançar (opção A) ou seguir direto pra Ícone/Banner (opção B) —
e, separadamente, esclarecer o plano Vercel antes de considerar
Upload de APK "pronto para produção".
