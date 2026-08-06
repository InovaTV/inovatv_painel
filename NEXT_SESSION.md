# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §1.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md` e ADR-007 (superseded) /
> ADR-008/ADR-009/ADR-010/ADR-011/ADR-012.

## Último commit

Ver `git log` — commit desta sessão adiciona a camada de storage
desacoplada (`src/lib/storage/`) e o pivô para Hostinger (ADR-011,
ADR-012). O anterior, `8112a70`, aplicou a migração Supabase e criou
o bucket `apps` (agora sem uso).

## Objetivo da próxima sessão

**Bloqueado até existirem credenciais reais da Hostinger.** A camada
de código (`src/lib/storage/`) está escrita e compila, mas nunca foi
testada contra um servidor real.

Preciso que o usuário:
1. Configure o hosting na Hostinger e, se possível, crie um usuário
   FTP/SFTP **restrito ao diretório de arquivos** (não a conta
   principal).
2. Adicione ao `.env.local`: `HOSTINGER_HOST`, `HOSTINGER_USER`,
   `HOSTINGER_PASSWORD`, `HOSTINGER_ROOT_PATH`,
   `HOSTINGER_PUBLIC_BASE_URL` (ver `.env.example` e `STORAGE.md`
   para o papel de cada uma).
3. Confirme qual domínio/subdomínio vai servir publicamente esse
   diretório (necessário para `HOSTINGER_PUBLIC_BASE_URL`).

Assim que as credenciais existirem, o primeiro passo é um **teste
manual de conectividade e upload** (arquivo pequeno, de teste) antes
de escrever qualquer Server Action de verdade — `storage.upload()`
precisa provar que funciona contra o servidor real antes de qualquer
coisa ir para o `DEFINITION_OF_DONE.md` como concluída.

## Arquivos que serão alterados

- `src/app/(dashboard)/apps/actions.ts` — Server Actions de upload,
  chamando `storage.upload/delete` de `@/lib/storage/provider`.
- `src/components/apps/AppForm.tsx` — inputs de arquivo reais.
- `src/services/app.service.ts` — `AppData`/`App` incorporando
  `storage_path`/`icon_path`/`banner_path`/`asset_folder`/`storage_folder`.
- Possível script de teste one-off
  (`scripts/test-storage-connection.mjs`?) pra validar a conexão
  antes de integrar no fluxo real — decidir se vale a pena ou se
  testa direto via uma Server Action de desenvolvimento.

## Riscos

- `src/lib/storage/hostinger.ts` foi escrito sem poder testar contra
  a Hostinger real — há risco real de pequenos erros de API
  (`ssh2-sftp-client`/`basic-ftp`) só aparecerem no primeiro teste
  real. Não presumir que está correto só porque compila.
- Porta SSH da Hostinger em hospedagem compartilhada às vezes não é a
  22 padrão — verificar no hPanel antes de assumir.
- `HOSTINGER_ROOT_PATH` (caminho no servidor) e
  `HOSTINGER_PUBLIC_BASE_URL` (URL pública) precisam mapear pro
  mesmo diretório físico — errar isso faz upload funcionar mas o
  link público quebrar (ou vice-versa). Conferir com um upload de
  teste antes de confiar.
- Bucket `apps` no Supabase ficou órfão (sem uso) — não precisa
  remover agora (decisão do usuário), mas não reintroduzir código que
  volte a usá-lo sem decisão explícita nova.

## Primeiro passo

Perguntar ao usuário se as credenciais `HOSTINGER_*` já estão no
`.env.local`. Se sim, rodar um teste de conectividade/upload real
antes de qualquer coisa. Se não, esperar.
