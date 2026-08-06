# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §8.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md`, ADR-013.

## Último commit

Ver `git log` — commit desta sessão implementa a revisão funcional
completa da tela de Aplicativos aprovada pelo usuário: layout de duas
colunas, Slug/Ordem automáticos, select de Produto (tabela `products`
nova), `StorageProvider.stat()`, upload via Route Handler + XHR com
progresso real (`AssetUploadField`), Ícone/Banner como placeholder
"Disponível em breve". **Ainda não reconfirmado pelo usuário no
navegador** — é uma mudança grande de UI, testes automatizados via
script não substituem o teste manual real.

## Objetivo da próxima sessão

**Bloqueado até o usuário testar no navegador.** Reiniciar
`npm run dev`, logar, e verificar:

1. Criar um app novo: Nome preenche Slug automaticamente; Slug para
   de seguir o Nome assim que editado manualmente; select de Produto
   mostra "UniTV"; "+ Novo Produto" revela campo de texto; salvar
   redireciona direto pra tela de edição (não mais pra lista).
2. Na tela de edição: layout em duas colunas sem scroll excessivo;
   enviar um APK real mostra barra de progresso com % e MB reais
   durante o envio, depois "Processando no servidor...", depois
   "Concluído"; tamanho e data aparecem certos depois; tentar
   selecionar outro arquivo durante o upload não deve ser possível
   (input desabilitado).
3. Ícone e Banner aparecem como cartão com cadeado "Disponível em
   breve" — sem nenhum campo clicável.
4. Editar um app existente (ex.: unitv-mobile) — confirmar que o
   Produto pré-seleciona "UniTV" corretamente (via `asset_folder`
   já existente = "unitv").

**Se passar:** UX revisada fechada. Próximo: Upload de Ícone/Banner
de verdade (habilitar os cartões, `AssetUploadField` já pronto,
`uploadAppAsset`/Route Handler já suportam os dois tipos — é
majoritariamente trocar `LockedAssetPlaceholder` por
`AssetUploadField` com `type="icon"`/`"banner"`).

**Se não passar:** pedir o que exatamente quebrou (visual, erro no
console do navegador, erro no terminal do `npm run dev`).

## Riscos que continuam em aberto

- Vercel (deploy alvo) — teto de payload próprio não investigado.
- Progresso do upload é real só na etapa navegador→servidor, não
  cobre servidor→Hostinger (decisão consciente do usuário — ADR-013).
- `products.asset_folder` não tem FK formal em `apps.asset_folder` —
  se o nome de um produto mudar no futuro, os apps existentes não
  atualizam automaticamente (decisão consciente, mantido simples).

## Primeiro passo

Perguntar ao usuário se já testou no navegador e o que aconteceu.
