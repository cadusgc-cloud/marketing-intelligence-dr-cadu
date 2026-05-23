# Weekly Collection Save Handoff v3.2

## Objetivo

A v3.2 adiciona um handoff pre-salvamento ao workspace local de coleta.

Depois da v3.1 criar o gate de decisao da coleta, esta camada cruza:

- estado do checklist local;
- gate de coleta;
- validacao visual do formulario em `/data`.

O resultado e uma orientacao curta para saber se a semana pode seguir para salvamento manual, se precisa de revisao ou se deve ficar bloqueada.

## Onde aparece

- Em `/data`, dentro do workspace local de coleta.
- Em `/data/collection-workspace`, na rota dedicada de referencia com dados simulados.

## O que faz

- Classifica o handoff como `ready_to_save`, `review_before_save`, `collect_first` ou `blocked`.
- Mostra checklist com gate de coleta, validacao do formulario, bloqueios, pontos de revisao e privacidade.
- Lista proximas acoes antes de salvar.
- Gera texto copiavel para revisao manual.
- Mantem a decisao humana antes de salvar e antes de usar a leitura operacional.

## O que nao faz

- Nao salva automaticamente.
- Nao altera banco.
- Nao cria schema Prisma, tabela ou migration.
- Nao roda seed.
- Nao conecta APIs, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao envia mensagem para equipe.
- Nao publica conteudo.
- Nao altera campanha.
- Nao usa dados pessoais, pacientes, DMs, conversas, prints, nomes, telefones ou informacao clinica.

## Regras de classificacao

1. Se o gate de coleta ou o formulario tiver bloqueio, o handoff fica `blocked`.
2. Se o gate ainda tiver coleta pendente, fica `collect_first`.
3. Se o gate pedir revisao final ou o formulario estiver em `needs-review`, fica `review_before_save`.
4. Se gate e formulario estiverem prontos, fica `ready_to_save`.

## Decisao de salvamento manual

O campo `manualSaveAllowed` so fica positivo quando:

- o gate de coleta recomenda salvamento;
- a validacao do formulario permite salvar.

Mesmo assim, o texto reforca revisao humana. O handoff nunca faz salvamento automatico.

## Guardrails

O handoff reforca:

- somente metricas agregadas;
- sem dado pessoal, clinico, DM, conversa, print privado ou paciente;
- sem API externa, OAuth, scraping, envio automatico ou publicacao;
- Dezembro/2025 fora de benchmark normal;
- revisao humana antes de decisao operacional.

## Como testar

```bash
npm test -- --run tests/weeklyCollectionSaveHandoff.test.ts tests/weeklyCollectionDecisionGate.test.ts tests/weeklyCollectionWorkspace.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Destacar no formulario o primeiro campo que ainda bloqueia o salvamento.
- Exportar o handoff como Markdown baixavel.
- Mostrar trilha local de revisao sem texto livre.
- Integrar o handoff ao Weekly Command Center depois do salvamento, usando apenas metricas agregadas.
