# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1 (arquitetura
> congelada), `ROADMAP.md`, `DEFINITION_OF_DONE.md`, `STORAGE.md`.

## Último commit

Ver `git log` — commit desta sessão valida `storage:test` contra a
Hostinger real (5/5 checks ✔) e corrige 2 bugs de compatibilidade
(`STORAGE_PORT` fallback, extensões `.ts` nos imports internos).

## Objetivo da próxima sessão

**Infraestrutura de Storage validada — sem bloqueios.** Próximo item
do `DEFINITION_OF_DONE.md`/`ROADMAP.md` Fase 2: **Upload de APK**.
Arquitetura congelada (§8.1) — implementar só a feature, sem novas
abstrações.

1. Server Action de upload em `src/app/(dashboard)/apps/actions.ts`
   (ou `apps/novo/actions.ts`/`apps/[id]/editar` conforme o caso),
   chamando `storage.upload()` de `@/lib/storage/provider`.
2. `AppForm.tsx` — trocar o `<Input type="file" disabled />` do APK
   por um input real, `name="apk"`.
3. `app.service.ts` — `AppData`/`App` ganham `storage_path` (já
   existe na tabela).
4. Validar tamanho (300MB) e tipo de arquivo antes do upload.
5. Path de destino segue a convenção do `STORAGE.md`:
   `apps/{asset_folder}/{platform}/apk/{arquivo}`.

## Arquivos que serão alterados

- `src/app/(dashboard)/apps/actions.ts` ou local equivalente.
- `src/components/apps/AppForm.tsx`.
- `src/services/app.service.ts`.

## Riscos

- Confirmado nesta sessão (debug temporário, removido do código):
  SFTP falha (SSH indisponível/handshake perdido) e FTPS falha por
  mismatch de certificado (`ftp.inovatv.pro` vs `*.hstgr.io` — cert
  é do provedor, não do domínio customizado). O fallback automático
  funciona e cai para **FTP puro, sem criptografia** — credenciais
  trafegam em texto claro nessa conexão. Aceitável por ora (mesmo
  princípio de risco que qualquer FTP tradicional), mas vale
  considerar no futuro: conectar via hostname `*.hstgr.io` em vez do
  domínio customizado poderia habilitar FTPS de verdade — não fazer
  isso agora sem pedir para o usuário confirmar que quer investigar.
- Uploads grandes (até 300MB) por FTP podem ser mais lentos/instáveis
  que SFTP — acompanhar timeout em Server Actions (Next.js tem limite
  de tamanho de body padrão que pode precisar de ajuste para arquivos
  grandes).
- Política de substituição (upload novo → atualizar banco → remover
  antigo) precisa ser respeitada ao implementar "trocar APK".

## Primeiro passo

Ler `AppForm.tsx` atual e decidir onde entra o campo de upload de
APK, depois escrever a Server Action usando `storage.upload()`.
