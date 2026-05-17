# Weekly Manual Review Trail v3.4

## Objetivo

A v3.4 adiciona uma trilha copiavel de revisao humana antes do salvamento da semana.

Ela responde, em um unico registro:

- se a coleta esta pronta, em revisao, em andamento ou bloqueada;
- qual e o primeiro foco antes de salvar;
- quais pendencias existem no workspace local;
- quais bloqueios ou revisoes existem no formulario;
- quais fontes ainda pedem coleta ou conferencia;
- qual decisao humana precisa ser marcada fora do sistema.

## Onde aparece

- No workspace local dentro de `/data`.
- Na rota dedicada `/data/collection-workspace`.
- Na rota de referencia `/data/manual-review-trail`.

## Como funciona

O dominio puro `lib/weeklyManualReviewTrail.ts` combina:

- progresso do workspace local;
- gate de decisao da coleta;
- handoff pre-salvamento;
- validacao do formulario;
- prontidao por fonte;
- guardrails fixos de privacidade e governanca.

O resultado inclui um Markdown copiavel para revisao manual. O texto nao e enviado para equipe, nao salva decisao automaticamente e nao altera banco.

## Status possiveis

- `ready`: coleta e formulario permitem salvamento manual com revisao humana.
- `review`: a semana pode ser util, mas ainda pede conferencia humana.
- `collecting`: existem pendencias de coleta antes de salvar.
- `blocked`: existe bloqueio de workspace, formulario, fonte ou privacidade.

## O que nao faz

- Nao salva automaticamente.
- Nao altera banco, schema Prisma ou migration.
- Nao roda seed.
- Nao conecta API externa, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao envia recomendacao para equipe.
- Nao publica conteudo.
- Nao usa dado pessoal, clinico, DM, conversa, print privado ou paciente.
- Nao usa Dezembro/2025 como benchmark normal, media, score, projecao ou recomendacao.

## Como testar

```bash
npm test -- --run tests/weeklyManualReviewTrail.test.ts tests/weeklyCollectionSaveHandoff.test.ts tests/weeklyCollectionWorkspace.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Criar um historico local temporario de trilhas copiadas, sem texto livre e sem banco.
- Adicionar impressao local do checklist de revisao.
- Conectar a trilha com uma tela de conferencia visual antes do clique em salvar.
