# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`.

## Último commit

Ver `git log` — commit desta sessão corrige o `next.config.ts`
(`experimental.proxyClientMaxBodySize: "300mb"`), causa raiz do
"Unexpected end of form" no teste manual do usuário. **Ainda não
reconfirmado no navegador.**

## Objetivo da próxima sessão

**Bloqueado até o usuário repetir o teste manual.** Não avançar para
Ícone/Banner nem para UX/texto até o Upload de APK funcionar de
verdade pelo navegador (decisão explícita do usuário).

Teste: `npm run dev` (reiniciar se já estava rodando, pra pegar o
`next.config.ts` novo), logar, editar um app com um APK real
(20-45MB), enviar. Esperado: sem erro, log
`[upload] apk "...": XXmb — storage.replace() XXms, total XXms`
aparece no terminal, arquivo chega na Hostinger, `storage_path`
atualiza no banco.

**Se passar:** Upload de APK fechado de verdade. Só então:
1. UX do Ícone/Banner (desabilitar com "Disponível em breve" em vez
   de campo morto, texto mais curto na seção "Arquivos" do
   `AppForm.tsx`) — pendências que o usuário já sinalizou.
2. Ícone/Banner de verdade (`uploadAppAsset` já suporta os dois).

**Se não passar:** pedir o stack trace completo do terminal do
`npm run dev` (não só a mensagem que aparece no navegador) — com
isso dá pra diagnosticar com precisão em vez de tentar outra
hipótese às cegas.

## Risco que continua em aberto

Vercel (deploy alvo, `PROJECT_MASTER.md`) provavelmente tem teto de
payload próprio, independente de `serverActions.bodySizeLimit` E de
`proxyClientMaxBodySize` — isso resolve o ambiente local, não
resolve produção. Não investigado ainda.

## Primeiro passo

Perguntar ao usuário se já repetiu o teste manual e o que aconteceu.
