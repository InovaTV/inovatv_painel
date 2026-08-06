# Próxima Sessão

> Documento descartável — reescrito por completo a cada sessão.
> Para contexto permanente, ver `PROJECT_MASTER.md` §1.1, `ROADMAP.md`,
> `DEFINITION_OF_DONE.md`, `STORAGE.md` e ADR-007/ADR-008/ADR-009/ADR-010.

## Último commit

Ver `git log` — commit desta sessão aplica a migração SQL, cria o
bucket `apps`, e documenta o bloqueio de plano Free (50MB). O
anterior, `cd9e610`, adicionou `.env.example` e ADR-010.

## Objetivo da próxima sessão

**Bloqueado por uma decisão de negócio, não técnica.** Migração
aplicada ✅, bucket `apps` criado ✅ (privado). Mas o projeto Supabase
está no **plano Free**, com teto global de upload de **50MB**
(`Project Settings → Storage`) — não dá pra configurar por bucket,
é um limite de projeto/plano inteiro. Os 300MB decididos para APK
(e mesmo APKs "pequenos" de referência, 70-120MB) não cabem nisso.

**Pergunta para o usuário, sem a qual não dá pra prosseguir com
Upload de APK:**
- Fazer upgrade do projeto Supabase para o plano Pro (ou outro pago)
  para elevar esse teto? (Decisão de billing — o assistente não deve
  nem pode fazer isso sozinho.)
- Ou aceitar um limite de APK bem menor que 300MB por enquanto
  (inviável pra a maioria dos APKs reais, segundo a própria
  estimativa do usuário)?
- Ou repensar onde o APK fica hospedado (ex.: continuar em algo
  parecido com o Projeto Downloads pra esse arquivo especificamente
  — mas isso conflita com a ADR-008 de não manter compatibilidade com
  sistemas legados, e não está claro se é um "sistema legado" ou uma
  necessidade real de infraestrutura diferente)?

**Enquanto isso não for decidido:** Upload de Ícone (5MB) e Banner
(10MB) **não são afetados** pelo teto de 50MB — dá pra implementar
esses dois normalmente. Só o Upload de APK está bloqueado.

## Arquivos que serão alterados (quando cada parte for desbloqueada)

- Ícone/Banner (desbloqueado): `src/lib/supabase/storage.ts` (novo),
  `src/app/(dashboard)/apps/actions.ts`, `src/components/apps/AppForm.tsx`,
  `src/services/app.service.ts` (tipos com `icon_path`/`banner_path`).
- APK (bloqueado): mesmos arquivos, mais `storage_path`, mas só depois
  da decisão de plano.

## Riscos

- Não presumir qual caminho o usuário vai escolher para o limite de
  APK — os três exigem decisão explícita, nenhum é obviamente certo.
- Se implementar Upload de Ícone/Banner antes de resolver o APK,
  cuidado para não deixar o formulário/UI inconsistente (ex.: 2 de 3
  uploads funcionando, 1 bloqueado) — comunicar isso claramente na UI
  também, não só no código.

## Primeiro passo

Perguntar ao usuário como resolver o teto de 50MB antes de qualquer
código de upload de APK. Enquanto isso, posso adiantar Upload de
Ícone/Banner se o usuário topar seguir nessa ordem.
