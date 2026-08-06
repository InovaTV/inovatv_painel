# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1 (arquitetura
> congelada), `ROADMAP.md`, `DEFINITION_OF_DONE.md`, `STORAGE.md`.

## Último commit

Ver `git log` — commit desta sessão adiciona `storage.replace()`
(upload seguro: temp → valida tamanho → renomeia) e a convenção de
nome de arquivo fixo. `storage:test` com 6/6 checks ✔ contra a
Hostinger real, incluindo `replace()`.

## Objetivo da próxima sessão

**Infraestrutura 100% pronta e testada — sem bloqueios.** Implementar
Upload de APK. Arquitetura congelada (§8.1) — só feature, sem novas
abstrações.

1. Server Action de upload chamando `storage.replace()` (não
   `upload()` — o path é fixo e pode já ter um arquivo) de
   `@/lib/storage/provider`.
2. `AppForm.tsx` — trocar o `<Input type="file" disabled />` do APK
   por um input real, `name="apk"`.
3. `app.service.ts` — `AppData`/`App` ganham `storage_path` (já
   existe na tabela).
4. Validar tamanho (300MB) e tipo de arquivo antes do upload.
5. Path fixo, sem versão no nome:
   `apps/{asset_folder}/{platform}/apk/app.apk` (ver `STORAGE.md`).
   Versão do app continua vindo só da coluna `version` do banco.

## Arquivos que serão alterados

- `src/app/(dashboard)/apps/actions.ts` ou local equivalente.
- `src/components/apps/AppForm.tsx`.
- `src/services/app.service.ts`.

## Riscos

- FTP sem TLS (achado da sessão anterior) — já registrado como
  melhoria futura no `ROADMAP.md`, não bloqueia o upload.
- Uploads grandes (até 300MB) por FTP podem ser lentos — Next.js tem
  limite de tamanho de body padrão para Server Actions que pode
  precisar de ajuste (`serverActions.bodySizeLimit` em
  `next.config.ts`) para arquivos desse tamanho. Verificar antes de
  testar upload de APK real.
- `replace()` já cobre a troca segura (upload → valida → renomeia) —
  não reimplementar essa lógica na Server Action, só chamar o método.

## Primeiro passo

Verificar o limite de tamanho de body de Server Actions no
`next.config.ts` (provavelmente precisa aumentar para 300MB), depois
ler `AppForm.tsx` atual e escrever a Server Action usando
`storage.replace()`.
