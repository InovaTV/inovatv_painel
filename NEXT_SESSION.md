# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## Último commit (local, não pushado)

Sprint 4 do Design System — instalação de `Select`/`Textarea`/`Label`/
`Progress` via `shadcn` CLI e migração de `AppForm.tsx`/
`AssetUploadField.tsx`. `git status`: working tree limpo. Push não
solicitado ainda — pedir confirmação ao usuário antes de dar push,
como nas sessões anteriores.

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
  - ✅ Sprint 4 (Componentes) — commitado. `Select`/`Textarea`/
    `Label`/`Progress` instalados e aplicados em `AppForm.tsx`/
    `AssetUploadField.tsx`, emojis removidos. `Skeleton` **não**
    instalado (decisão explícita do usuário — só entra quando houver
    uso real no Dashboard/Tabela, Fase 2/5).
  - ⬜ **Sprint 5 — Páginas (Dashboard → Sidebar → Header → CRUD
    Apps) — próximo passo.**
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## O que aconteceu nesta sessão (2026-08-08)

Sprint 4 fechado: levantamento apresentado e aprovado (com ajuste do
usuário — Skeleton fora do escopo por não ter uso imediato) antes de
qualquer instalação. Componentes `Select`/`Textarea`/`Label`/
`Progress` instalados via `shadcn` CLI. `AppForm.tsx` migrado (6
`Label`, 3 `Select` — Produto/Plataforma/Status, 1 `Textarea` —
Descrição); emojis (`📱`/`📺`/`🟢`/`⚪`) substituídos pelos ícones
Lucide já usados no projeto (`MonitorSmartphone`/`Tv`/`CheckCircle2`/
`XCircle`, mesmos de `PlatformBadge`/`StatusBadge`). Barra de
progresso manual de `AssetUploadField.tsx` trocada pelo componente
`Progress`. `tsc`/lint/build limpos.

Validação ao vivo no navegador (dropdowns, formulário populado,
upload real ponta a ponta) confirmou tudo funcionando. Um teste de
upload real acabou sobrescrevendo por engano o ícone verdadeiro do
app "UniTV Mobile" no Hostinger — identificado, avisado ao usuário
imediatamente, e revertido no mesmo dia (script one-off descartável,
não versionado, removeu o arquivo de teste do storage e limpou
`icon_path` de volta a `null` — estado idêntico ao anterior ao teste).
**Lição para a próxima validação de upload:** usar um app de teste da
lista (`teste100`, `sei lá`) em vez de um app real.

## Próxima etapa — Sprint 5: Páginas

Conforme `DESIGN_SYSTEM.md` §22 (Fases 2-5), a partir daqui é
aplicação do Design System já fundamentado nas telas, uma de cada vez,
mesmo rigor de sempre (levantar escopo exato, apresentar, só então
mexer):

1. **Dashboard** — `StatCard` ganha ícone (§13), grid com espaçamento
   novo (§7). Primeira tela a herdar cor de marca visível.
2. **Sidebar** — estado ativo por rota (`pathname` vs `item.href`,
   hoje não existe), comportamento responsivo/colapsável (§18-19).
   Maior componente de interação, não só estilo.
3. **Header** — hambúrguer funcional conectado à Sidebar, tokens de
   cor no lugar de hardcoded, badge "Online" com pulso (§18).
4. **CRUD Aplicativos** — tabela com hover/linha ativa/empty state
   (§15), upload como dropzone real (§16), preview como `Card`
   (§17). Função continua congelada (`DEFINITION_OF_DONE.md`) — só
   UX.

`Skeleton` entra durante Dashboard e/ou CRUD Aplicativos (Sprint 4
deixou o componente de fora por não ter uso ainda — instalar quando a
tela que o consome for trabalhada, não antes).

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado em OKLCH mas não virou
  token — uso pontual, não decidido ainda onde.

## Primeiro passo

Abrir o Sprint 5 escolhendo por qual tela começar (Dashboard é a
ordem sugerida pelo documento) e levantar o escopo exato de mudanças
antes de tocar em qualquer arquivo, para aprovação do usuário.
