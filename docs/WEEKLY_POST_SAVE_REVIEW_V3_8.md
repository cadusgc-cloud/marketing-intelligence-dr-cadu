# Weekly Post Save Review v3.8

## Objetivo

A v3.8 adiciona uma revisao compacta pos-salvamento em `/weekly`.

Depois que uma semana e salva em `/data`, a Central Semanal passa a mostrar um bloco curto que responde:

- o que foi salvo;
- qual e a confianca da leitura;
- qual e o primeiro passo humano recomendado;
- quais pontos ainda limitam a conclusao;
- quais modulos abrir em seguida.

## Onde aparece

- Em `/weekly`, logo depois do cabecalho principal do Weekly Command Center.

## Como funciona

O dominio puro `lib/weeklyPostSaveReview.ts` recebe:

- semana atual salva;
- semana anterior valida, quando existir;
- resultado do Weekly Command Center.

Com isso, ele gera:

- status da revisao;
- score de confianca;
- snapshot dos dados salvos;
- checklist compacto;
- primeiro passo;
- links de continuidade;
- guardrails de privacidade e governanca.

## Status possiveis

- `ready_for_review`: leitura pronta para revisao operacional interna.
- `limited_review`: leitura util, mas limitada por historico, cadencia ou funil.
- `needs_data_review`: revisar dados antes de concluir, especialmente em anomalia ou baixa confianca.

## O que nao faz

- Nao salva automaticamente.
- Nao altera banco, schema Prisma ou migration.
- Nao roda seed.
- Nao conecta API externa, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao envia recomendacao para equipe.
- Nao publica conteudo.
- Nao usa dado pessoal, clinico, DM, conversa, print privado, prontuario ou paciente.
- Nao usa Dezembro/2025 como benchmark normal, media, score, projecao ou recomendacao.

## Como testar

```bash
npm test -- --run tests/weeklyPostSaveReview.test.ts tests/weeklyCommandResult.test.ts tests/weeklyCommandCenter.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Ampliar o pacote copiavel com impressao local.
- Mostrar diferenca entre semana atual, semana anterior e media historica em uma faixa unica.
- Conectar a revisao compacta ao pacote manual de execucao sem persistir novos campos.
