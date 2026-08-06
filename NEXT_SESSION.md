# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`.

## Último commit

Ver `git log` — commit desta sessão implementa Upload de APK
(`uploadAppAsset` em `app.service.ts`, ligado a `createAppAction`/
`updateAppAction`, campo `asset_folder` novo no `AppForm`). Testado
via script direto (bypassa `next/headers`) — 7/7 checks, mas **ainda
não testado via o app rodando de verdade no navegador** (eu não
tenho login/senha do painel).

## Objetivo da próxima sessão

Dois caminhos possíveis:

**A) Verificação humana primeiro (recomendado antes de seguir):**
Rodar o painel (`npm run dev`), logar, criar um app novo com um APK
pequeno de teste, confirmar que salva, editar esse app trocando o
APK, confirmar que troca. Isso valida o caminho real (multipart
FormData via Server Action rodando no Next), que é diferente do
script que usei pra testar nesta sessão.

**B) Seguir direto pra Ícone/Banner** — `uploadAppAsset` já suporta
os dois tipos (`ASSET_CONFIG` já tem `icon`/`banner`), só falta:
1. Habilitar os inputs de Ícone/Banner no `AppForm.tsx` (hoje
   `disabled`), `name="icon"`/`name="banner"`.
2. `createAppAction`/`updateAppAction` — mesmo padrão do `apk`:
   pegar o `File` do FormData, chamar `uploadAppAsset(app, "icon", file)`
   / `"banner"` se presente.
3. Nenhuma mudança em `app.service.ts` — a função já é genérica.

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
