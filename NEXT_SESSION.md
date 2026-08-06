# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, ADR-013.

## Último commit

Ver `git log` — commit desta sessão liga Ícone e Banner ao mesmo
`AssetUploadField`/`uploadAppAsset`/Route Handler já usados pro APK,
sem duplicar nenhum código. `ROADMAP.md`/`DEFINITION_OF_DONE.md`
marcam os três uploads como concluídos. **Ainda não reconfirmado pelo
usuário no navegador** (só validado via script contra Storage real).

## Objetivo da próxima sessão

**Bloqueado até o usuário testar Ícone/Banner no navegador.**
Reiniciar `npm run dev`, editar um app, confirmar que os cartões de
Ícone e Banner agora têm input real (não mais "Disponível em breve"),
que o envio funciona com progresso, e que `icon_path`/`banner_path`
atualizam no banco.

**Se passar:** módulo Aplicativos — CRUD + os 3 uploads estão
fechados. Usuário pediu, nessa ordem exata, depois disso:

1. **Nada de melhorias visuais ainda** — reservadas para uma fase
   exclusiva de UI/UX quando o módulo Aplicativos estiver 100%
   encerrado (Preview, Download, Ordenação, Status toggle, Busca,
   Paginação ainda faltam antes disso).
2. **Não fazer a auditoria do banco ainda** — só depois que Ícone e
   Banner estiverem concluídos *e validados*. Quando chegar a hora:
   revisar coluna por coluna de `apps`/`products`/relacionadas,
   separando em uso / reservada para funcionalidade futura já
   planejada / legado pra remover. Não fazer isso preventivamente
   nem por iniciativa própria antes do pedido explícito.

Meu palpite de próximo passo real (a confirmar com o usuário, não
presumir): Preview (ícone/banner já têm URL pública via
`getPublicUrl`, dá pra mostrar `<img>` direto) e Status como toggle
(`Switch` em vez do `<select>` atual) parecem os itens mais baratos
de fechar antes de Busca/Paginação/Ordenação, que são mais
estruturais.

## Riscos que continuam em aberto

- Vercel — teto de payload próprio, não investigado.
- Progresso do upload cobre só a etapa navegador→servidor.
- `accept="image/png"`/`"image/webp"` nos inputs de Ícone/Banner é só
  filtro de UI — não há validação server-side de que o conteúdo real
  bate com a extensão fixa (`icon.png`/`banner.webp`). Não é bloqueio
  agora, mas fica registrado como possível item de "validação além de
  required" (`DEFINITION_OF_DONE.md`) se virar problema na prática.

## Primeiro passo

Perguntar ao usuário se já testou Ícone/Banner no navegador. Se sim,
perguntar o que ele quer fazer a seguir — não presumir Preview/Status
sem confirmação, dado que o usuário está definindo a ordem
explicitamente etapa a etapa nesta conversa.
