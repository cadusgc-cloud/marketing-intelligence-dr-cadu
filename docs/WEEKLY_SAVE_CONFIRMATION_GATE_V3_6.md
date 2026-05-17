# Weekly Save Confirmation Gate v3.6

## Objetivo

A v3.6 adiciona uma conferencia final antes do salvamento da semana em `/data`.

Ela junta, em um unico painel:

- validacao do formulario;
- mapa de origem dos dados;
- prontidao por fonte;
- privacidade e seguranca;
- revisao humana.

## Onde aparece

- No topo de `/data`, antes dos painéis detalhados de validacao, origem e coleta.

## Como funciona

O dominio puro `lib/weeklySaveConfirmationGate.ts` recebe:

- `WeeklySaveReadinessReport`;
- `WeeklyCollectionReadinessBoard`;
- `WeeklySourceEvidenceLedger`.

Com isso, ele decide se a semana esta:

- pronta para salvar manualmente;
- revisavel antes de salvar;
- bloqueada para salvamento.

Quando ha bloqueio de formulario, fonte ou privacidade, o botao de salvamento fica bloqueado pelo gate final.

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
npm test -- --run tests/weeklySaveConfirmationGate.test.ts tests/weeklyDataInput.test.ts tests/weeklySourceEvidenceLedger.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Ampliar o foco automatico para impressao local e revisao posterior.
- Criar impressao local da conferencia final.
- Exibir uma revisao compacta depois que a semana for salva.
