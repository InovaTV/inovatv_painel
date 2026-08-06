# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md`, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md` e ADR-007/ADR-008.

## Último commit

Ver `git log` — commit desta sessão deprecia `download_url` (ADR-008)
e atualiza `STORAGE.md`. Sem mudança de código. O anterior, `9066ffe`,
adicionou a migração SQL e o `STORAGE.md` original.

## Objetivo da próxima sessão

**Ainda bloqueado.** Não avançar para criar bucket/implementar upload
até os dois itens abaixo estarem resolvidos:

1. Migração `supabase/migrations/20260806140000_add_banner_path_fix_storage_folder.sql`
   aplicada no Supabase (usuário confirmou que ainda não rodou).
2. Bucket `apps` precisa ser criado — a chave anônima disponível
   neste ambiente não tem permissão para isso. Duas opções: o usuário
   cria manualmente pelo painel do Supabase (Storage → New bucket,
   privado, nome `apps`), ou fornece uma `service_role` key para eu
   fazer via código (indo para `.env.local`, nunca exposta ao
   browser).

Quando os dois estiverem resolvidos: implementar upload de
APK/Ícone/Banner via Server Action, seguindo `STORAGE.md`/ADR-007 à
risca (estrutura de pastas, limites de tamanho, política de
substituição sem lixo, leitura só via URL assinada).

## Arquivos que serão alterados (quando desbloqueado)

- `src/lib/supabase/storage.ts` (novo) — helpers de upload/URL
  assinada.
- `src/app/(dashboard)/apps/actions.ts` — Server Actions de upload
  recebendo arquivo via `FormData`.
- `src/components/apps/AppForm.tsx` — os 3 `<Input type="file" disabled />`
  viram inputs reais.
- Novo componente de "cartão" do APK (nome, tamanho, versão, data,
  Download/Trocar/Remover) e preview de ícone/banner.
- `src/services/app.service.ts` — `AppData`/`App` precisam incorporar
  `storage_path`/`icon_path`/`banner_path`/`asset_folder`/`storage_folder`
  (hoje não fazem parte do tipo, embora existam na tabela real).

## Riscos

- Não tentar criar o bucket via API com a chave anônima — vai falhar
  silenciosamente ou com erro de permissão; confirmar antes qual das
  duas opções acima o usuário escolheu.
- `download_url` está oficialmente depreciado (ADR-008) — não
  reintroduzir lógica que dependa dele em nenhuma feature nova.

## Primeiro passo

Perguntar ao usuário: a migração já foi aplicada? E qual das duas
opções para criar o bucket (`service_role` key vs. criação manual)?
Só então prosseguir.
