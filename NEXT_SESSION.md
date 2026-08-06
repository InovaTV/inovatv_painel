# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`.

## Último commit

Ver `git log` — commit desta sessão corrige "Timeout (control
socket)" em `remote-storage.ts` (`allowSeparateTransferHost: true` +
timeout de 20min). Testado com 20MB reais via script (sucesso,
~27.6s) — **ainda não reconfirmado pelo usuário no navegador**.

## Objetivo da próxima sessão

**Bloqueado até o usuário repetir o teste manual mais uma vez.**
Reiniciar `npm run dev`, logar, editar um app com o mesmo APK real
de antes, enviar. Esperado: sem "Unexpected end of form", sem
"Timeout (control socket)", log `[upload] apk "...": XXmb —
storage.replace() XXms, total XXms` aparece certo, arquivo chega na
Hostinger, `storage_path` atualiza.

**Se passar:** Upload de APK fechado de verdade. Depois disso, nessa
ordem (conforme o usuário já definiu):
1. Barra de progresso no upload — percentual, MB enviados/total,
   etapa atual da operação. Pedido explícito do usuário, ainda não
   implementado. Provavelmente precisa de um mecanismo de streaming
   de progresso do Server Action pro client (`useFormStatus` sozinho
   não dá progresso granular — considerar `XMLHttpRequest`/`fetch`
   com upload progress no client chamando um route handler, já que
   Server Actions não expõem progresso nativo de upload; ou usar
   `ProgressTracker` do `basic-ftp`/evento de progresso do
   `ssh2-sftp-client` do lado do servidor e mandar pro client via
   algum canal — avaliar as opções antes de implementar, não
   presumir uma solução).
2. UX do Ícone/Banner (desabilitar com "Disponível em breve", texto
   mais curto na seção "Arquivos").
3. Ícone/Banner de verdade.

**Se não passar:** pedir o stack trace completo do terminal do
`npm run dev`.

## Risco que continua em aberto

Vercel (deploy alvo) provavelmente tem teto de payload próprio,
independente de tudo que foi ajustado até agora — não investigado.

## Primeiro passo

Perguntar ao usuário se já repetiu o teste manual e o que aconteceu.
