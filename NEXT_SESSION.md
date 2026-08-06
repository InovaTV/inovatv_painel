# Próxima Sessão — Ponto de Retomada

> Leia primeiro `PROJECT_MASTER.md` para o contexto completo. Este
> arquivo é só o "onde paramos e o que fazer agora".

Última atualização: 2026-08-06

---

## Onde paramos

Fase de **Autenticação + Middleware** concluída e verificada
(build limpo, `tsc` limpo, redirecionamento testado via `curl`).

Estamos na ordem de implementação definida pelo usuário:

1. ✅ Autenticação
2. ✅ Middleware
3. ✅ Dashboard (estrutura — dados ainda estáticos)
4. 🔶 CRUD Aplicativos — **Create, Read e Delete prontos; falta
   Update**
5. ⬜ Upload APK
6. ⬜ Upload Ícone
7. ⬜ Upload Banner
8. ⬜ CRUD Clientes
9. ⬜ FAQ
10. ⬜ Tutoriais
11. ⬜ Configurações

## Próximo passo imediato

**Terminar o CRUD de Aplicativos** antes de avançar para upload
(Delete já foi implementado nesta sessão via `deleteAppAction` +
`ActionsMenu` com `window.confirm`; falta só Update):

1. Criar página de edição `src/app/(dashboard)/apps/[id]/editar/page.tsx`
   + `updateAppAction` em `src/app/(dashboard)/apps/actions.ts` (já
   existe esse arquivo, com `deleteAppAction` — adicionar ao lado),
   reaproveitando `AppForm` (vai precisar aceitar
   `defaultValues`/modo edição — hoje só cria, envia sempre para
   `createAppAction`).
2. Trocar o `disabled` do item "Editar" no `ActionsMenu`
   (`src/components/common/ActionsMenu.tsx`) por um link real para a
   página de edição.
3. Considerar trocar `window.confirm` (usado no delete) por um
   `AlertDialog` do shadcn, se quiser uma UI mais consistente com o
   resto do design system — não é bloqueante, é polimento.
4. Seguir o fluxo fixado em `PROJECT_MASTER.md` §9 antes de encerrar:
   `tsc --noEmit`, `npm run build`, `npm run lint`, atualizar os
   quatro documentos de continuidade, e só então commitar. Testar
   manualmente criando/editando/excluindo um app real no Supabase (a
   tabela `apps` tem as colunas: `name`, `slug`, `version`,
   `platform`, `description`, `display_order`, `is_active`).

Depois disso: **Upload de APK/Ícone/Banner** via Supabase Storage.
Vai exigir decidir:
- Nome/estrutura dos buckets no Supabase Storage.
- Se upload acontece via Server Action (`FormData` com arquivo) ou
  via URL assinada gerada no servidor e upload direto do browser.
- Tamanho máximo de arquivo (especialmente APK).

## Coisas para verificar/perguntar ao usuário quando chegar a hora

- Não existe `SUPABASE_SERVICE_ROLE_KEY` em `.env.local` — só a chave
  anônima. Se o upload exigir bypass de RLS, será preciso pedir essa
  chave ao usuário (nunca expor no browser).
- Cards do Dashboard mostram números fixos — perguntar se já deve
  virar contagem real (`select count`) nesta fase ou só depois que
  todos os módulos existirem.

## Estado técnico no fim da sessão anterior

- `npx tsc --noEmit` → sem erros.
- `npm run lint` → sem erros/warnings.
- `npm run build` → sucesso, sem warnings.
- Testado via `curl`: `/`, `/apps` sem sessão → `307` para `/login`;
  `/login` → `200`.
- Processos `node.exe` da máquina foram todos finalizados durante os
  testes de auth para liberar a porta usada pelos testes (incluindo
  um processo que já ocupava a porta 3000 antes da sessão começar —
  se havia algo do usuário rodando ali, precisa reiniciar
  manualmente).
- Commit criado ao final desta sessão — ver `CHANGELOG_AI.md` para o
  hash e a mensagem.
