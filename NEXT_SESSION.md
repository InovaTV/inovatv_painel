# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, `DESIGN_SYSTEM.md`,
> ADR-013 a ADR-020.

## Último commit

`6bce4d9` — `docs: correct NEXT_SESSION.md commit pointer for
end-of-day handoff`. As mudanças desta sessão (tokens do Design System
+ este handoff) **ainda não foram commitadas nem pushadas** — usuário
não pediu commit ainda. Rodar `git status` ao retomar para confirmar
o que está pendente antes de qualquer ação.

## Checkpoint do projeto

- ✅ **Arquitetura** — `ARCHITECTURE_DECISIONS.md` (ADR-001 a ADR-020).
- ✅ **Infraestrutura** — Hostinger como storage oficial (ADR-011),
  `STORAGE.md`.
- ✅ **Banco de dados** — auditoria de 4 fases concluída e verificada em
  produção (ADR-017 a ADR-020, `CHANGELOG_AI.md` entradas 27-30).
- ✅ **Design System** — `DESIGN_SYSTEM.md` finalizado (commit
  `d809c54`). Tratado como especificação, não guia — nenhuma decisão
  visual nova durante a implementação.
- 🔄 **Fase 1 — Implementação do Design System** — em andamento
  (`DESIGN_SYSTEM.md` §22, sprints detalhados abaixo).
- **Módulo Aplicativos: funcionalmente concluído** (`DEFINITION_OF_DONE.md`).

## O que aconteceu nesta sessão (2026-08-08)

**Sprint 1 — Tokens: concluído.** Detalhe completo em
`CHANGELOG_AI.md` entrada 31. Resumo:

1. Validado `#0F6D76` → `oklch(0.4896 0.08 205.28)` com conversor real
   (script Node, matriz sRGB→OKLab), confirmando a aproximação manual
   do `DESIGN_SYSTEM.md` §5.2.
2. Aplicado em `src/app/globals.css`: `--primary`,
   `--primary-foreground`, `--ring`, `--sidebar-primary` (light+dark)
   trocados do neutro/índigo para o teal oficial; 6 tokens novos
   (`--success`/`--warning`/`--info` + foreground) adicionados,
   mapeados em `@theme inline`.
3. Validado: `tsc`, `lint`, `build` limpos; `dev` na porta 3900,
   conferência visual real em `/apps` — botão primário e switches já
   herdam o teal via `bg-primary`, zero mudança de layout. Badges de
   status continuam com cor crua (esperado — Sprint 2).
4. Dev server parado ao final, porta 3900 livre.

## Próxima etapa combinada com o usuário

**Sprint 2 — Remover hardcodes**, na ordem do `DESIGN_SYSTEM.md` §22:

- Eliminar cores Tailwind cruas (`slate-*`, `blue-500`, `emerald-600`,
  `red-*`) espalhadas em `Sidebar.tsx`, `Header.tsx`,
  `StatusBadge.tsx`, `AppForm.tsx` e demais componentes — trocar tudo
  por token (`--success`/`--warning`/`--info`/`--primary` etc., já
  disponíveis desde o Sprint 1).
- `StatusBadge` é o caso concreto mais visível: hoje usa
  `emerald-600`/`red-600` direto; deve passar a usar
  `bg-success/10 text-success` / equivalente para os outros estados,
  conforme `DESIGN_SYSTEM.md` §5.2 (bloco de código dos tokens de
  status).
- Sem mudar layout/tipografia/espaçamento ainda — isso é Sprint 3.
- Mesmo rigor: mudança apresentada antes de aplicada, `tsc`/`lint`/
  `build` limpos, validação ao vivo no navegador.

Depois: Sprint 3 (tipografia/espaçamento/radius/sombra, §6-9), Sprint 4
(componentes shadcn — `Select`/`Textarea`/`Label`/`Progress`/
`Skeleton`, §11), Sprint 5 (páginas, só então).

## Pendências fora de escopo (não iniciar sem pedido explícito)

- Arquivo `MAwv\357\200\252` (raiz do repo, 0 bytes, não versionado):
  investigado em sessão anterior, tudo indica artefato de
  terminal/shell. Ignorar; só reinvestigar se reaparecer.
- Bucket `apps` do Supabase Storage: criado mas sem uso (ADR-007,
  supersedida pela ADR-011). Sem ação planejada.
- `#D69A4A` (âmbar de apoio, §5.2): validado como
  `oklch(0.7290 0.1201 71.69)` nesta sessão mas **não** virou token —
  é usado com moderação em componentes específicos, não como cor de
  tema global. Registrar se/quando um componente precisar dele.

## Primeiro passo

Abrir o Sprint 2 lendo `Sidebar.tsx`, `Header.tsx`, `StatusBadge.tsx` e
`AppForm.tsx` para levantar todas as cores Tailwind cruas em uso,
apresentar a lista completa (arquivo → cor atual → token de destino)
para confirmação antes de editar qualquer um.
