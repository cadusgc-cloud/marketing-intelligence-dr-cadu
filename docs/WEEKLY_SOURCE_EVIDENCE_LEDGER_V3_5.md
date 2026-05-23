# Weekly Source Evidence Ledger v3.5

## Objetivo

A v3.5 adiciona um mapa de origem dos dados semanais.

Ele ajuda a responder, antes de salvar a semana:

- de onde veio cada grupo de numero;
- quais campos agregados estao presentes;
- quais fontes estao sem coleta, em revisao ou bloqueadas;
- quais perguntas humanas precisam ser feitas;
- quais limites de privacidade continuam ativos.

## Onde aparece

- Em `/data`, junto da validacao antes de salvar.
- Na rota dedicada `/data/source-evidence`.
- Como link no guia de coleta e nas rotas de apoio.

## Como funciona

O dominio puro `lib/weeklySourceEvidenceLedger.ts` combina:

- guia manual de coleta;
- prontidao por fonte;
- dados semanais agregados atuais;
- checagens de qualidade;
- regras de privacidade por fonte.

O resultado e um ledger com fontes, campos, valores agregados, lacunas, proximas acoes e Markdown copiavel.

## O que nao faz

- Nao busca dados sozinho.
- Nao conecta Instagram, Meta, Google, WhatsApp ou Reportei.
- Nao usa OAuth, token, scraping, e-mail ou automacao externa.
- Nao salva automaticamente.
- Nao altera banco, schema Prisma ou migration.
- Nao roda seed.
- Nao usa dados pessoais, clinicos, DMs, nomes, telefones, prontuarios, prints ou material identificavel.
- Nao usa Dezembro/2025 como benchmark normal, media, score ou recomendacao.

## Como usar

1. Coletar os numeros agregados nas fontes manuais.
2. Preencher `/data`.
3. Conferir o mapa de origem.
4. Copiar o mapa quando precisar registrar a revisao humana.
5. Resolver fontes ausentes, em revisao ou bloqueadas antes de conclusoes fortes.

## Como testar

```bash
npm test -- --run tests/weeklySourceEvidenceLedger.test.ts tests/weeklyDataCollectionGuide.test.ts tests/weeklyCollectionReadiness.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Adicionar um filtro visual por fontes bloqueadas ou ausentes.
- Permitir impressao local do mapa, sem banco e sem envio.
- Conectar o mapa ao botao de salvamento como conferencia visual adicional.
