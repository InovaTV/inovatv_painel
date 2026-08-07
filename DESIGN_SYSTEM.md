# Design System — InovaTV Painel

> Documento Mestre da Fase UI/UX. Referência obrigatória para toda
> implementação visual a partir da sua aprovação. Nenhuma linha de
> código foi alterada para produzir este documento — é puramente um
> projeto visual, a ser aprovado antes da Fase 1 de implementação.

## 0. Escopo desta fase

Esta fase (e este documento) cobrem **só** experiência visual e de
uso: layout, componentes, CSS/Tailwind, shadcn/ui, tipografia, cores,
ícones, responsividade, animações leves.

**Fora de escopo, sem exceção:** banco de dados, arquitetura, Storage,
Server Actions, Services, regras de negócio, autenticação, RLS,
documentação arquitetural (`ARCHITECTURE_DECISIONS.md`). O módulo
Aplicativos está congelado funcionalmente (ver `DEFINITION_OF_DONE.md`)
— a Fase 5 deste plano melhora a experiência da tela, não o
comportamento por trás dela.

---

## 1. Diagnóstico do estado atual

Levantado direto do código antes de escrever qualquer recomendação,
para este documento nascer de cima da realidade do projeto, não de uma
proposta genérica:

- **Paleta 100% neutra.** `src/app/globals.css` define `--primary`,
  `--secondary`, `--accent`, `--muted` todos com croma zero em OKLCH
  (`oklch(0.2 0 0)`, `oklch(0.97 0 0)` etc.) — é literalmente a paleta
  `neutral` padrão do shadcn (`components.json`: `"baseColor":
  "neutral"`), nunca customizada. Só `--destructive` tem cor. É por
  isso que o painel parece "sem identidade" — não é impressão, é o
  valor real do token.
- **Dois sistemas de cor coexistindo.** Componentes shadcn usam os
  tokens (`bg-primary`, `text-muted-foreground`), mas boa parte das
  telas usa Tailwind cru por cima: `bg-slate-950`, `text-slate-300`,
  `border-slate-800` (`Sidebar.tsx`), `bg-slate-100` (layout do
  dashboard), `focus:ring-blue-500` (`Header.tsx`), `bg-emerald-600`
  (`StatusBadge.tsx`), `border-red-500`/`text-red-600` (`AppForm.tsx`).
  Troca de tema ou de cor de marca hoje exigiria caçar essas classes
  espalhadas em vez de mudar uma variável.
- **Cards sem elevação.** `Card` (`components/ui/card.tsx`) usa
  `ring-1 ring-foreground/10`, sem `box-shadow` nenhum — por isso os
  cards "parecem quadrados", como você notou. `AppForm.tsx` nem usa o
  componente `Card`: envolve os campos num `<div className="rounded-xl
  border bg-white p-8">` à mão.
- **Formulário com elementos nativos não estilizados como
  componente.** `<select>` e `<textarea>` em `AppForm.tsx` são HTML
  puro com `className="w-full rounded-md border px-3 py-2"` — não
  existe `Select`, `Textarea` nem `Label` instalados em
  `components/ui/` (só `button`, `card`, `separator`, `badge`,
  `dropdown-menu`, `input`, `table`, `dialog`, `switch`). As opções de
  Plataforma/Status ainda usam emoji (`📱 Mobile`, `🟢 Ativo`) dentro do
  `<option>` — não é um padrão visual, é texto de emoji cru.
- **Upload sem tratamento visual.** `AssetUploadField.tsx` usa
  `<input type="file">` nativo (`className="mt-2 block w-full
  text-sm"`) — sem dropzone, sem ícone, sem estado visual de
  arrastar-e-soltar. A barra de progresso existe e funciona bem
  tecnicamente, só falta acabamento.
- **Botão hambúrguer decorativo.** O ícone `Menu` no `Header.tsx` não
  tem `onClick` — não abre/fecha nada. Sidebar não tem nenhum
  comportamento mobile hoje (`w-72` fixo, sem colapso, sem overlay).
- **Dark mode existe só no CSS, não na aplicação.** `.dark` está
  totalmente definido em `globals.css`, mas não há `ThemeProvider` nem
  toggle em lugar nenhum — hoje o painel roda 100% no tema claro, na
  prática.
- **Base é sólida.** `Button`, `Badge` e `Table` já são shadcn
  corretos, com variantes via `cva`, tokens de cor, e um padrão de
  radius coerente (`--radius: 0.625rem` com escala derivada
  `sm/md/lg/xl/2xl/3xl/4xl`). `StatusBadge`/`PlatformBadge` já seguem a
  regra certa — compõem `Badge`, não reinventam um badge novo. É o
  padrão a generalizar, não a exceção.

Conclusão prática: **o problema não é falta de sistema, é sistema
inconsistente.** A base (Tailwind v4 + shadcn `radix-nova`,
`class-variance-authority`, tokens em `globals.css`) é a certa; falta
(a) dar cor de marca a ela, (b) parar de escapar dela com classes
cruas, e (c) completar o inventário de componentes que faltam
(Select, Textarea, Label, Empty State, Skeleton, Progress).

---

## 2. Princípios de produto

1. **Parecer pronto para venda, não "customizado internamente".** Cada
   tela deve passar a impressão de um produto SaaS comercial — mesmo
   nível de acabamento visual que Linear, Vercel Dashboard ou Stripe
   Dashboard —, não de um CRUD interno gerado rápido.
2. **Consistência antes de originalidade.** Toda tela nova deve
   *parecer* que nasceu do mesmo sistema das telas existentes. Nenhuma
   página tem liberdade para inventar seu próprio espaçamento, cor ou
   componente.
3. **Hierarquia visual clara.** Uma ação primária por tela (ex.:
   "Salvar Alterações") sempre mais forte visualmente que ações
   secundárias (ex.: "Cancelar"). Isso já é uma queixa explícita sua —
   vira regra formal aqui.
4. **Densidade de informação sem aperto.** O painel lida com tabelas e
   formulários — não pode virar um site de marketing com espaço vazio
   demais —, mas o espaçamento atual está apertado demais na direção
   oposta. O objetivo é respiro controlado, não vazio.
5. **Menos decisão por tela.** Cada padrão (card, tabela, formulário,
   upload) é definido **uma vez** neste documento e reaplicado. Nenhum
   módulo futuro (Banners, Notícias, FAQ, Tutoriais, Clientes) deve
   nascer com um estilo próprio.

---

## 3. Regra de governança: não reinventar componentes

Regra fixada por você, formalizada aqui como padrão permanente do
projeto:

- **Um componente, uma implementação.** Nunca criar `<AppButton />` e
  `<ButtonGrande />` para o mesmo propósito. Variações nascem de
  **variantes** (`cva`) do componente único — exatamente como
  `buttonVariants` já faz em `button.tsx`.
- Antes de estilizar um elemento novo à mão (`<select className="...">`,
  `<div className="rounded-lg border p-4">` fazendo de card), a
  pergunta obrigatória é: **existe um componente em
  `components/ui/` pra isso? Se não existe, ele deveria existir aí,
  não só nesta tela.**
- Módulos futuros (Banners, Notícias, FAQ, Tutoriais) reutilizam os
  mesmos componentes de formulário, tabela, card e upload definidos
  aqui — nenhum nasce com padrão visual próprio.
- Este documento é a referência obrigatória. Divergências encontradas
  durante a implementação (Fases 1-5) devem ser resolvidas *atualizando
  este documento primeiro*, depois o código — nunca o contrário.

---

## 4. Identidade visual — proposta de cor de marca

Hoje não existe nenhuma cor de marca definida em lugar nenhum do
projeto (sem logo além dos SVGs padrão do Next.js em `public/`, sem
menção a cor institucional em nenhum `.md`). Isso é uma decisão de
produto que falta tomar — não um ajuste técnico.

**Proposta:** um azul-índigo vívido como cor primária de interação
(`--primary`), mantendo o resto da paleta neutra. É o padrão de
painéis SaaS "prontos para venda" (Linear, Vercel, Stripe, Raycast) —
neutro em 95% da superfície, com uma cor de assinatura forte só nos
pontos de ação e identidade (botão primário, link ativo, item ativo da
sidebar, foco, barra de progresso, gráficos do dashboard).

| Token | Hoje (neutro) | Proposto (light) | Proposto (dark) |
|---|---|---|---|
| `--primary` | `oklch(0.205 0 0)` (quase preto) | `oklch(0.53 0.21 265)` (índigo vívido) | `oklch(0.62 0.19 265)` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.98 0 0)` (branco) | `oklch(0.15 0.02 265)` |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.53 0.21 265 / 0.5)` | `oklch(0.62 0.19 265 / 0.5)` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.53 0.21 265)` | já é `oklch(0.488 0.243 264.376)` — mesma família, mantém |

Reparo à parte: o dark mode **já** usa um índigo (`oklch(0.488 0.243
264.376)`) só em `--sidebar-primary` — um resquício de alguma geração
anterior do tema shadcn que nunca chegou a virar a cor oficial do
projeto. A proposta acima adota essa mesma família de matiz (~265°) de
propósito, para todo o sistema, não só a sidebar do modo escuro.

**Cores semânticas de status** — hoje `StatusBadge`/`AssetUploadField`
usam Tailwind cru (`emerald-600`, `red-600`) em vez de token. Proposta:
adicionar 3 tokens novos ao `globals.css`, seguindo exatamente o padrão
que `--destructive` já usa (cor + uso em `/10` de opacidade para fundo
suave):

```css
--success: oklch(0.6 0.15 145);       /* verde — Ativo, Enviado, Concluído */
--success-foreground: oklch(0.98 0 0);
--warning: oklch(0.75 0.15 80);       /* âmbar — Pendente, Atenção */
--warning-foreground: oklch(0.15 0 0);
--info: oklch(0.6 0.15 240);          /* azul — Neutro informativo, distinto do primary */
--info-foreground: oklch(0.98 0 0);
```

Isso é o que passa a alimentar `StatusBadge` (`bg-success/10
text-success` em vez de `bg-emerald-600`), barra de progresso de
upload em sucesso, e qualquer badge de status futuro (Banners
agendado/publicado, Cliente ativo/inativo etc.) — um lugar só para
mudar o verde do sistema inteiro.

**Esta cor é a decisão mais visível deste documento — é a que eu
recomendaria revisar com mais atenção antes de aprovar o resto.** Se
preferir outra família de matiz (ex.: um azul mais "tech" tradicional,
~230°, ou um roxo mais autoral, ~290°), é só ajustar o valor de matiz
(o terceiro número do `oklch()`) — a estrutura do resto do documento
não muda.

---

## 5. Tipografia

Mantém **Geist Sans** (já carregada via `next/font/google` em
`layout.tsx`, zero custo adicional) — é uma escolha já correta,
moderna, mesma família usada por Vercel/Linear. Não há necessidade de
trocar fonte.

Falta uma **escala tipográfica formal** — hoje cada tela escolhe
`text-3xl`, `text-xl`, `text-sm` ad hoc. Proposta de escala única:

| Papel | Classe Tailwind | Peso | Uso |
|---|---|---|---|
| Display | `text-3xl` (30px) | `font-bold` | Título de página (`<h2>` do Dashboard, "Editar Aplicativo") |
| Título de seção | `text-lg` (18px) | `font-semibold` | Título de card, "Arquivos" no formulário |
| Título de card pequeno | `text-sm` (14px) | `font-medium` | `CardTitle` de `StatCard` |
| Corpo | `text-sm` (14px) | `font-normal` | Texto padrão de tabela, formulário, parágrafo |
| Legenda / metadado | `text-xs` (12px) | `font-normal`, `text-muted-foreground` | Timestamps, contadores, texto de apoio |
| Números de destaque | `text-4xl` (36px) | `font-bold`, `tabular-nums` | Valor dos `StatCard` do dashboard |

Regra nova: números em cards/tabelas (contadores, valores, tamanhos de
arquivo) sempre com `tabular-nums`, para não "dançar" quando o dígito
muda — detalhe pequeno que separa painel amador de painel comercial.

---

## 6. Grid e espaçamento

Sua observação de que "hoje está tudo um pouco apertado" está correta
e é mensurável: `main` do dashboard usa `p-8` (32px) mas os cards
internos e o formulário usam `p-4`/`gap-6` — pouco ar entre blocos de
conteúdo relacionado mas distintos.

**Escala de espaçamento** (múltiplos de 4px, padrão Tailwind — não
muda a escala, só formaliza o uso):

| Contexto | Valor | Classe |
|---|---|---|
| Padding interno de card | 24px | `p-6` (hoje varia entre `p-4` e `p-8` sem critério) |
| Gap entre campos de um formulário | 24px | `gap-6` |
| Gap entre seções de uma página (ex.: título → conteúdo) | 32px | `gap-8` / `mt-8` |
| Gap entre cards de uma grid (dashboard, listagens) | 24px | `gap-6` (hoje `gap-5`, arredondar pra escala de 4px) |
| Padding da área de conteúdo (`<main>`) | 32px | `p-8` (mantém) |
| Altura de linha de tabela | mínimo 56px | célula com `py-3.5` em vez do padding default do `<td>` |

**Grid do dashboard:** mantém responsivo (`grid-cols-1 md:grid-cols-2
xl:grid-cols-5`), mas o valor de `gap-5` sobe pra `gap-6` pra bater com
a escala acima.

**Grid do formulário:** mantém 2 colunas em telas largas
(`lg:grid-cols-2`, dados à esquerda / arquivos à direita), mas os
campos internos (hoje `grid-cols-2 gap-6`) ganham mais respiro vertical
entre blocos (`gap-6` → mantém horizontal, mas o espaço entre as duas
fileiras de campos sobe de `mt-6` pra `mt-8`).

---

## 7. Elevação e sombra

Hoje **nenhum** componente usa `box-shadow` — só bordas (`border`,
`ring-1`). É a causa raiz do visual "quadrado" que você identificou.

Proposta de escala de elevação (3 níveis, suficiente para um painel —
não é preciso um Material Design completo):

| Nível | Uso | Classe Tailwind |
|---|---|---|
| `shadow-xs` | Cards em repouso, inputs em foco | `shadow-xs` (já existe no Tailwind v4) |
| `shadow-sm` | Cards em hover (listas clicáveis), dropdowns | `shadow-sm` |
| `shadow-lg` | Modais, popovers, menu suspenso do header | `shadow-lg` |

Regra de substituição: `Card` deixa de depender só de `ring-1
ring-foreground/10` e passa a combinar **borda mais sutil** (`border
border-border/60`, mais clara que hoje) **+ `shadow-xs`**. É a
combinação borda-fina-mais-sombra-leve que dá o efeito "flutuando", não
"emoldurado", que você descreveu como objetivo ("mais respiro, menos
borda, mais sombra leve").

---

## 8. Border radius

A escala já existe e está correta em `globals.css`
(`--radius: 0.625rem` = 10px, com `--radius-sm` a `--radius-4xl`
derivados) — só falta usá-la com critério em vez de valores soltos
(`rounded-xl`, `rounded-lg`, `rounded-md` espalhados sem padrão).

| Elemento | Radius |
|---|---|
| Botão, input, select, textarea | `rounded-lg` (`--radius`, 10px) |
| Card, modal, dropzone de upload | `rounded-xl` (14px) |
| Badge, avatar, chip de status | `rounded-full` (já é o padrão do `Badge`, mantém) |
| Thumbnail de preview (ícone/banner) | `rounded-lg` (hoje já é `rounded-md`, sobe um nível pra combinar com o card ao redor) |

---

## 9. Iconografia

`lucide-react` já é o padrão (`iconLibrary: "lucide"` em
`components.json`) — mantém, é a escolha certa, mesma biblioteca usada
pelos componentes shadcn instalados.

Regras a formalizar:
- **Tamanho por contexto, não por tela:** `size-4` (16px) dentro de
  botões/badges, `size-5` (20px) em itens de navegação (sidebar,
  header), nunca valores soltos tipo `size={18}` escolhidos por
  tentativa visual (como hoje em `Sidebar.tsx`/`Header.tsx`).
- **Nunca emoji como ícone de interface.** Remove `📱`/`📺`/`🟢`/`⚪`
  das `<option>` do formulário (`AppForm.tsx`) — vira ícone Lucide
  (`Smartphone`/`Tv`, já usados em `PlatformBadge`; `CircleCheck`/
  `Circle` para status, já usados em `StatusBadge`) renderizado de
  verdade, não caractere de emoji dependente da fonte do sistema
  operacional do usuário.

---

## 10. Inventário de componentes

### Já existem (`components/ui/`) — mantêm, só recebem os ajustes de token/sombra acima
`Button`, `Card` (+ subcomponentes), `Badge`, `Table` (+
subcomponentes), `Input`, `Dialog`, `DropdownMenu`, `Separator`,
`Switch`.

### Faltam — instalar via `shadcn` CLI nas fases de implementação (Fase 1)
| Componente | Substitui hoje | Usado em |
|---|---|---|
| `Select` | `<select className="rounded-md border px-3 py-2">` cru | `AppForm.tsx` (Produto, Plataforma, Status) |
| `Textarea` | `<textarea className="rounded-md border p-3">` cru | `AppForm.tsx` (Descrição) |
| `Label` | `<label className="mb-2 block text-sm font-medium">` repetido em cada campo | Todo formulário |
| `Progress` | barra de progresso feita à mão em `AssetUploadField.tsx` (`<div className="h-2 ... bg-primary">`) | Upload |
| `Skeleton` | não existe hoje — telas carregam "em branco" até os dados chegarem | Listagem de apps, dashboard |
| Empty state (padrão de composição, não necessariamente um pacote shadcn) | texto solto (`"Nenhum aplicativo encontrado."` em `<TableCell>`) | Tabela vazia, listas futuras vazias (Banners, FAQ etc. antes de ter conteúdo) |

Instalar cada um só quando a fase que o consome chegar (Fase 1 prepara
o inventário completo de uma vez, para as fases seguintes não pararem
no meio para instalar dependência).

---

## 11. Padrões — Botões

- **Uma ação primária por tela**, sempre `variant="default"` (já é o
  token `bg-primary` — passa a carregar a cor de marca automaticamente
  quando a Seção 4 for aplicada).
- **Ação secundária/destrutiva-neutra** (ex.: "Cancelar"): sempre
  `variant="outline"` — nunca outro `variant="default"` do lado da
  ação primária competindo visualmente. É a regra que resolve
  literalmente o seu ponto: *"Salvar merece destaque. Cancelar
  menos."*
- **Ação destrutiva real** (excluir): `variant="destructive"` —
  componente já suporta, só garantir que todo fluxo de exclusão usa
  essa variante (hoje `ActionsMenu` precisa ser conferido na Fase 5).
- Botão de submit em formulário sempre à direita, ordem **Cancelar →
  Salvar** (Cancelar primeiro/mais à esquerda, Salvar por último/mais à
  direita) — já é o padrão em `AppForm.tsx`, mantém.

---

## 12. Padrões — Cards

- Base: `border border-border/60` + `shadow-xs` (ver Seção 7),
  `rounded-xl` (ver Seção 8), `p-6` de padding interno (ver Seção 6).
- `StatCard` do dashboard ganha um ícone (Lucide, `size-5`,
  `text-muted-foreground` ou colorido por categoria) ao lado do
  título — hoje é só número + label, sem nenhum elemento visual de
  apoio.
- Todo bloco que hoje é um `<div className="rounded-xl border ...">`
  feito à mão (o formulário inteiro em `AppForm.tsx`, o card de upload
  em `AssetUploadField.tsx`) passa a ser o componente `Card` de verdade
  — é a regra da Seção 3 aplicada ao caso mais óbvio do código atual.

---

## 13. Padrões — Formulários

- Todo campo: `Label` (novo componente) + input/select/textarea +
  espaço reservado para erro (mesmo padrão de hoje, `FieldError`, mas
  usando `text-destructive` em vez de `text-red-600` hardcoded).
- Erro de campo: borda muda para `border-destructive` (token) em vez
  de `border-red-500` cru — mesmo efeito visual, mas acompanha o tema.
- Erro de formulário (nível página, ex. `state.error` em
  `AppForm.tsx`): vira um componente de alerta inline —
  `bg-destructive/10 text-destructive border border-destructive/20
  rounded-lg p-3` — em vez do `bg-red-50 text-red-600` cru atual.
  Mesma cor semântica usada no badge "Inativo", consistente em todo o
  painel.
- `Select`/`Textarea` novos (Seção 10) substituem os elementos nativos
  — remove os emojis (Seção 9), ganham o mesmo radius/altura dos
  outros inputs.
- Campos relacionados continuam agrupados em grid 2 colunas
  (`AppForm.tsx` já faz isso bem) — não é para virar formulário de uma
  coluna só; é para ganhar respiro (Seção 6), não estrutura nova.

---

## 14. Padrões — Tabelas

- Linha com **hover perceptível**: `hover:bg-muted/50` — hoje a
  `TableRow` do shadcn provavelmente já tem uma base disso (conferir em
  `table.tsx` na Fase 5), mas formalizar como obrigatório em toda
  tabela do painel.
- **Linha ativa/selecionada** (quando aplicável — ex.: item que acabou
  de ser editado, ou seleção futura em massa): `bg-primary/5` +
  borda esquerda de destaque `border-l-2 border-l-primary`.
- Altura mínima de linha 56px (Seção 6) — tabela hoje é um pouco
  apertada verticalmente.
- **Status mais elegante**: `StatusBadge` passa a usar os tokens
  `--success`/`--destructive` em vez de `bg-emerald-600 text-white`
  cru (Seção 4) — mesmo ícone (`CheckCircle2`/`XCircle`), cor vem do
  tema.
- Estado vazio (`"Nenhum aplicativo encontrado."`) vira um empty state
  de verdade: ícone Lucide grande (`size-10`, `text-muted-foreground`),
  título curto, texto de apoio, e (quando fizer sentido) botão de ação
  — "Nenhum aplicativo ainda" + "Novo Aplicativo" em vez de uma linha
  de texto solitária numa célula de tabela.
- Paginação (`AppsPagination.tsx`) e busca (`AppsSearch.tsx`) mantêm a
  posição atual (topo da tabela) — só recebem o espaçamento/radius
  padronizados dos inputs/botões.

---

## 15. Padrões — Upload

Hoje funciona bem tecnicamente (progresso real via streaming ndjson,
já validado em produção) — só falta acabamento visual, exatamente como
você resumiu ("Hoje funciona. Agora tem que ficar bonito.").

- Estado **idle**: vira uma dropzone de verdade — `border-2
  border-dashed border-border rounded-xl` com ícone Lucide central
  (`Upload` ou `FileUp`, `size-8`, `text-muted-foreground`), texto
  "Clique ou arraste o arquivo aqui", e o tipo aceito como legenda
  pequena (`.apk`, `PNG/JPG` etc.) — em vez do `<input type="file">`
  nativo exposto direto.
- Estado **com arquivo atual**: vira um card de arquivo — nome do
  tipo, tamanho, data (já calculado hoje via `formatBytes`/
  `formatDate`), com o preview (ícone/banner) como thumbnail à
  esquerda em vez de abaixo (Seção 8, `rounded-lg`).
- Estado **uploading**: `Progress` (componente novo, Seção 10)
  substitui a barra manual — mesma lógica de porcentagem já calculada
  em `AssetUploadField.tsx`, só troca o elemento visual.
- Estado **done**: mantém o texto de sucesso, mas com ícone
  `CheckCircle2` + cor `text-success` (token novo).
- Estado **error**: ícone `AlertCircle` + `text-destructive`, mesma
  cor semântica do resto do sistema.

## 16. Padrões — Preview

Sua sugestão — "Pode virar um card" — vira regra: qualquer preview de
arquivo (ícone, banner, e futuramente miniaturas de banners de
marketing/Fase 3 do roadmap de produto) é sempre um `Card` com
`overflow-hidden` e a imagem ocupando a largura total do topo
(`*:[img:first-child]:rounded-t-xl`, que o `Card` já suporta nativamente
— ver `card.tsx` linha 15), nunca uma `<img>` solta com borda simples
como é hoje em `AssetUploadField.tsx`.

---

## 17. Padrões — Navegação (Sidebar / Header)

**Sidebar:**
- Item ativo (rota atual) precisa de um estado visual que hoje não
  existe — `Sidebar.tsx` não compara `pathname` com `item.href` em
  lugar nenhum. Proposta: fundo `bg-sidebar-accent`, texto
  `text-sidebar-primary-foreground` ou similar, **mais** uma barra
  vertical de destaque à esquerda do item (`border-l-2` na cor de
  marca) — o padrão mais comum em painéis SaaS, dá orientação
  instantânea de "onde eu estou".
- Item em hover: mantém `hover:bg-slate-800` na essência, mas migra
  para o token `hover:bg-sidebar-accent` (hoje hardcoded em slate, sem
  acompanhar tema).
- Espaçamento entre itens sobe ligeiramente (`space-y-2` →
  `space-y-1` com padding vertical do item maior, `py-2.5` →
  efeito visual mais "lista compacta profissional", menos "botões
  empilhados").

**Header:**
- Botão hambúrguer (`Menu`) precisa de comportamento real — colapsar a
  sidebar em telas menores (é pré-requisito de responsividade, Seção
  18, não só estética).
- Busca, sino de notificação e menu do usuário mantêm a posição atual
  — só recebem o radius/sombra/token padronizados (hoje `border` cru
  sem sombra, foco com `ring-blue-500` hardcoded em vez do token
  `--ring`).
- Badge "Online" (`variant="secondary"`) migra para usar o token
  `--success` com um indicador de pulso sutil (ponto verde animado,
  Seção 19) — reforça "sistema ao vivo" de forma mais explícita que
  hoje.

---

## 18. Responsividade

Hoje o painel não tem nenhum tratamento mobile real — `Sidebar`
(`w-72` fixo) e o grid principal (`flex`) não colapsam em telas
estreitas.

Breakpoints (padrão Tailwind, já usados parcialmente em
`DashboardCards.tsx`): `md` (768px), `lg` (1024px), `xl` (1280px).

| Faixa | Comportamento |
|---|---|
| `< md` | Sidebar vira drawer (oculta por padrão, abre por cima do conteúdo via o botão hambúrguer do Header — Seção 17). Tabelas com scroll horizontal em vez de quebrar layout. Grid de `StatCard` em 1 coluna. |
| `md` – `xl` | Sidebar fixa, mas `StatCard` em 2 colunas (já é o comportamento atual). Formulário do `AppForm` pode cair pra 1 coluna de campos (mantendo 2 colunas nome/slug etc. só a partir de `lg`). |
| `≥ xl` | Layout atual completo — sidebar fixa + `StatCard` em até 5 colunas + formulário 2 colunas de campos + 2 colunas gerais (dados/arquivos). |

Este é o item com maior componente de **implementação** (não é só
CSS/cor) — a Fase 3 (Sidebar) é onde o comportamento de colapso é
efetivamente construído; este documento só define o resultado
esperado.

---

## 19. Estados visuais

Padrão único a aplicar em todo componente interativo do painel — hoje
cada tela resolve isso de um jeito (ou não resolve):

| Estado | Padrão |
|---|---|
| **Hover** | Cards clicáveis: `shadow-sm` (sobe um nível, Seção 7) + `border-border` mais escura. Linhas de tabela: `bg-muted/50`. Botões: já resolvido pelo `Button` (`hover:bg-primary/80` etc.), mantém. |
| **Focus** | Anel de foco visível em **todo** elemento interativo (`focus-visible:ring-3 focus-visible:ring-ring/50` — já é o padrão do `Button`/`Input`; aplicar também no `Select`/`Textarea` novos). Nunca remover outline sem substituto. |
| **Loading** | Botão: texto muda + `disabled` (já é o padrão em `SubmitButton`, mantém). Conteúdo de página/tabela: `Skeleton` (componente novo, Seção 10) no formato do conteúdo final — não um spinner genérico central, que "pisca" a tela inteira. |
| **Sucesso** | Cor `--success` + ícone `CheckCircle2`. Para ações rápidas (salvar, upload concluído), considerar um toast leve no canto da tela nas fases seguintes — fora do escopo deste documento definir a biblioteca, só o padrão visual (fundo `bg-success/10`, borda `border-success/20`, texto `text-success`). |
| **Erro** | Cor `--destructive` + ícone `AlertCircle`/`XCircle`. Mesma regra de fundo suave (Seção 13). |
| **Vazio** | Ver padrão de empty state definido na Seção 14 — ícone + título + apoio + ação, nunca só uma frase solta. |
| **Desabilitado** | `opacity-50 pointer-events-none` — já é o padrão do `Button` (`disabled:opacity-50`), replicar em `Select`/`Textarea`/`Input` novos. |

---

## 20. Animações leves

Regra: **animação serve para dar feedback, não para chamar atenção.**
Nada de transições longas ou efeitos decorativos.

- Transições de cor/sombra (`hover`, `focus`): `transition-all
  duration-150` — já é o padrão em vários componentes (`Sidebar`,
  `Header`), só formalizar a duração (150ms é o ponto certo: perceptível,
  não lento).
- Abertura de dropdown/dialog: já vem do Radix (`radix-ui` +
  `tw-animate-css`, já instalado) — usar as animações padrão da
  biblioteca, não escrever keyframes customizados.
- Barra de progresso de upload: transição suave de largura
  (`transition-all`, já presente em `AssetUploadField.tsx` — mantém
  ao trocar pelo componente `Progress`).
- Indicador de pulso no badge "Online" (Seção 17): único elemento
  deste documento com animação contínua (`animate-pulse`, utilitário
  nativo do Tailwind) — usar com moderação, só aqui.

---

## 21. Ordem de implementação

Replica exatamente a ordem que você definiu, com o escopo de cada fase
já mapeado nas seções acima:

- [ ] **Fase 1 — Design System.** Aplicar este documento na base:
  tokens de cor (Seção 4), espaçamento/radius/sombra (Seções 6-8),
  instalar componentes faltantes (Seção 10: `Select`, `Textarea`,
  `Label`, `Progress`, `Skeleton`). Nenhuma tela muda de layout ainda
  — só a fundação.
- [ ] **Fase 2 — Dashboard.** Primeira tela a herdar o novo sistema:
  `StatCard` com ícone (Seção 12), grid com espaçamento novo (Seção
  6), cor de marca visível pela primeira vez.
- [ ] **Fase 3 — Sidebar.** Estado ativo por rota, comportamento
  responsivo/colapsável (Seções 17-18) — é a fase com mais trabalho de
  interação, não só estilo.
- [ ] **Fase 4 — Header.** Hambúrguer funcional (conectado à Sidebar da
  Fase 3), tokens de cor no lugar dos hardcoded, badge "Online" com
  pulso (Seção 17).
- [ ] **Fase 5 — CRUD Aplicativos.** Formulário com `Select`/`Textarea`/
  `Label` novos (Seção 13), tabela com hover/linha ativa/empty state
  (Seção 14), upload como dropzone real (Seção 15), preview como card
  (Seção 16). Função congelada (`DEFINITION_OF_DONE.md`) — só UX.

Cada fase, ao terminar, passa pelo mesmo rigor da auditoria de banco:
`tsc`/`lint`/`build` limpos + validação ao vivo no navegador antes de
seguir para a próxima.

---

## 22. Aprovação

Este documento precisa da sua aprovação antes de qualquer
implementação começar — nenhuma linha de código foi alterada para
produzi-lo. Ponto de maior atenção recomendada: a cor de marca proposta
na Seção 4 (é a decisão com maior impacto visual e a mais fácil de
ajustar agora, antes de ela se espalhar por todos os componentes).
