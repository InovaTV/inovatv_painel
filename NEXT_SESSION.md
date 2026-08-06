# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md`, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md` e ADR-007.

## Último commit

Ver `git log` — commit desta sessão adiciona a migração SQL e o
`STORAGE.md` (sem código, sem bucket criado). O anterior, `4acbd24`,
implementou o Update de Aplicativos.

## Objetivo da próxima sessão

Dois passos possíveis, nessa ordem:

1. **Bloqueante fora do meu controle:** aplicar manualmente
   `supabase/migrations/20260806140000_add_banner_path_fix_storage_folder.sql`
   no Supabase (SQL Editor ou `supabase db push`) — não tenho
   permissão de DDL com a chave anônima disponível neste ambiente.
2. Depois disso confirmado: criar o bucket `apps` (privado) no
   Supabase Storage e implementar upload de APK/Ícone/Banner via
   Server Action, seguindo exatamente `STORAGE.md`/ADR-007.

## Arquivos que serão alterados (quando o upload for implementado)

- `src/lib/supabase/storage.ts` (novo) — helpers de upload/URL
  assinada.
- `src/app/(dashboard)/apps/actions.ts` — Server Actions de upload
  recebendo arquivo via `FormData`.
- `src/components/apps/AppForm.tsx` — os 3 `<Input type="file" disabled />`
  viram inputs reais.
- `src/components/apps/` — novo componente para o "cartão" do APK
  (nome, tamanho, versão, data, Download/Trocar/Remover) e preview de
  ícone/banner.

## Riscos

- Migração SQL ainda não foi aplicada no banco — nada do upload deve
  ser codado assumindo que `banner_path` já existe até isso ser
  confirmado pelo usuário.
- **Pergunta em aberto, não resolvida:** qual a relação entre
  `download_url` (aponta para `https://inovatv.pro/...`, fora do
  Supabase) e o novo Storage do painel? O assistente não tem acesso
  ao repositório do "Projeto Downloads" para investigar — só o
  usuário pode responder isso. Não bloqueia o upload em si (que não
  toca em `download_url`), mas bloqueia decidir se/quando
  `download_url` passa a ser atualizado automaticamente.
- Não existe `SUPABASE_SERVICE_ROLE_KEY` em `.env.local`. Se a
  política do bucket privado exigir bypass de RLS para o upload via
  Server Action, será necessário pedir essa chave ao usuário.

## Primeiro passo

Confirmar com o usuário: (1) a migração SQL foi aplicada? (2) alguma
resposta sobre a relação `download_url` / Projeto Downloads? Só então
criar o bucket `apps` e começar o Server Action de upload.
