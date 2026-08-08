# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## ⚠️ Troca de máquina — ler antes de continuar

Esta sessão foi encerrada de propósito para continuar **em outro
computador**. Antes de qualquer coisa:

1. **Os 4 commits abaixo estão só localmente, não foram pushados**
   (o usuário pediu explicitamente para não dar push em nenhuma das
   sessões). Se o outro computador for um clone/pull do
   `origin/main`, **esses 4 commits não vão estar lá** até alguém
   rodar `git push` desta máquina, ou até o usuário decidir sincronizar
   de outra forma. **Perguntar ao usuário como ele quer levar esse
   trabalho para a outra máquina antes de assumir que o histórico está
   disponível lá.**
2. `.env.local` local conferido **byte a byte** (`diff`, não só
   tamanho/data) contra a cópia canônica no Google Drive
   (`G:\Meu Drive\INOVATV PAINEL - ENV\.env.local`) — idênticos, nada
   para sincronizar.
3. Nenhum servidor de dev rodando ao encerrar (porta 3900 livre).

## Último commit (local, não pushado)

`5769e2e` — `feat(design-system): Fase 1 Sprint 3 - tipografia,
espacamento, sombra e radius`. `git status`: working tree limpo.

Histórico local à frente de `origin/main` (4 commits, ver ponto 1
acima):
- `948eab6` Sprint 1 — tokens de cor
- `b0113fe` Sprint 2 — remover cores hardcoded
- `1b802d1` token `--canvas`
- `5769e2e` Sprint 3 — tipografia/espaçamento/sombra/radius

## Checkpoint do projeto

- ✅ **Arquitetura** — `ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-020).
- ✅ **Infraestrutura** — Hostinger como storage oficial (ADR-011),
  `STORAGE.md`.
- ✅ **Banco de dados** — auditoria de 4 fases concluída e verificada em
  produção (ADR-017 a ADR-020, `CHANGELOG_AI.md` entradas 27-30).
- ✅ **Design System** — `DESIGN_SYSTEM.md` finalizado + §5.3 (Sidebar)
  e §5.4 (Canvas) adicionados durante a implementação.
- 🔄 **Fase 1 — Implementação do Design System**:
  - ✅ Sprint 1 (Tokens) — commitado.
  - ✅ Sprint 2 (Remover hardcodes) — commitado, incluindo o token
    `--canvas`.
  - ✅ Sprint 3 (Tipografia/Espaçamento/Sombra/Radius) — commitado.
  - ⬜ **Sprint 4 (Componentes) — próximo passo.**
  - ⬜ Sprint 5 (Páginas: Dashboard → Sidebar → Header → CRUD Apps).
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## O que aconteceu nesta sessão (2026-08-08)

Sprint 2 fechado (token `--canvas`, commit `1b802d1`) e Sprint 3
completo (commit `5769e2e`): tokens de tipografia (`tabular-nums`),
espaçamento (`--card-spacing`, gaps, `TableCell`), sombra (`Card`
troca `ring` por `border-border/60 + shadow-xs`, `Dialog` ganha
`shadow-lg`, `DropdownMenu` recalibrado pra `shadow-sm`) e radius
(`select`/`textarea`/thumbnail/dropzone). Levantamento apresentado e
aprovado antes de qualquer edição, incluindo 5 itens "por analogia"
(sem virar nova decisão de Design System). `tsc`/lint/build limpos,
conferência visual real no navegador (Dashboard, Lista de Aplicativos,
Novo Aplicativo) — nenhuma quebra de layout.

## Próxima etapa — Sprint 4: Componentes

Escopo já mapeado em `DESIGN_SYSTEM.md` §11 (inventário de
componentes), nenhuma decisão nova precisa ser tomada, só executar:

**Faltam instalar (via `shadcn` CLI):**
| Componente | Substitui hoje | Usado em |
|---|---|---|
| `Select` | `<select>` cru (já com token/radius corrigidos no Sprint 3) | `AppForm.tsx` (Produto, Plataforma, Status) |
| `Textarea` | `<textarea>` cru (idem) | `AppForm.tsx` (Descrição) |
| `Label` | `<label className="mb-2 block text-sm font-medium">` repetido | Todo formulário |
| `Progress` | barra feita à mão em `AssetUploadField.tsx` | Upload |
| `Skeleton` | não existe — telas carregam "em branco" | Listagem de apps, dashboard |
| Empty state (padrão de composição) | texto solto em `<TableCell>` | Tabela vazia |

**Também no escopo do Sprint 4** (`DESIGN_SYSTEM.md` §10, Iconografia
— não coberto no Sprint 3, que foi só §6-9): remover emoji
(`📱`/`📺`/`🟢`/`⚪`) das `<option>` do `AppForm.tsx`, substituir por
ícone Lucide de verdade; padronizar tamanho de ícone por contexto
(`size-4` em botões/badges, `size-5` em navegação) em vez de
`size={18}` solto.

Mesmo rigor das sprints anteriores: levantar o inventário exato antes
de instalar/editar qualquer coisa, apresentar para aprovação, só então
mexer no código.

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado em OKLCH mas não virou
  token — uso pontual, não decidido ainda onde.

## Primeiro passo

Confirmar com o usuário como os 4 commits locais chegam à outra
máquina (push? outro método?) antes de qualquer coisa. Depois, abrir
o Sprint 4 lendo `AppForm.tsx` e `AssetUploadField.tsx` de novo (o
Sprint 3 já mudou alguns detalhes desses arquivos) e levantando o
plano exato de instalação/substituição dos componentes da tabela
acima, para aprovação antes de instalar qualquer coisa via `shadcn`
CLI.
