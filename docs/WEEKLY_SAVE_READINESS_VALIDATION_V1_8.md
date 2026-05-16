# v1.8 - Validacao antes de salvar a semana

## Objetivo

A v1.8 adiciona uma camada de validacao visual antes de salvar os dados semanais em `/data`.

Ela ajuda a separar dois tipos de problema:

- bloqueios reais, que impedem o salvamento seguro;
- pontos de revisao operacional, que nao impedem salvar, mas reduzem a qualidade da leitura semanal.

## O que bloqueia o salvamento

O botao de salvar fica bloqueado quando faltam campos essenciais ou quando ha erro que o servidor tambem recusaria:

- rotulo da semana ausente;
- data de inicio ausente ou invalida;
- data de fim ausente ou invalida;
- data de fim anterior a data de inicio;
- numero negativo;
- campo numerico invalido;
- campo de contagem com valor decimal.

## O que gera revisao, mas permite salvar

O painel pode marcar a semana como `revisar` quando os dados ainda estao incompletos para uma leitura operacional forte:

- midia paga sem dados agregados;
- Instagram organico sem volume suficiente;
- Stories abaixo do minimo operacional;
- Reels/Shorts abaixo do minimo semanal;
- funil comercial incompleto;
- Google Ads com conversoes zeradas;
- Meta Ads mais confiavel que Google Ads naquela semana.

Nesses casos, a semana pode ser salva porque ainda representa uma coleta real, mas a decisao humana deve considerar a leitura limitada.

## Separacao tecnica

A logica fica em `lib/weeklyDataInput.ts`, na funcao `buildWeeklySaveReadinessReport`.

A interface fica em `app/data/WeeklyDataInputClient.tsx`, no painel `Validacao antes de salvar`.

Essa separacao mantem o dominio puro e facilita evolucao futura para validadores adicionais ou assistencia por LLM, sem acoplar a regra ao componente React.

## O que esta camada nao faz

- nao busca dados automaticamente;
- nao conecta APIs externas;
- nao usa tokens;
- nao altera banco;
- nao altera schema Prisma;
- nao cria migration;
- nao substitui revisao humana;
- nao salva dados sozinha.

## Como testar

```bash
npm test -- --run tests/weeklyDataInput.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias

- destacar visualmente o primeiro campo bloqueador;
- criar estado de rascunho explicitamente separado de semana salva;
- adicionar checklist de conferencia antes de comparar semanas;
- evoluir para importacao de planilha com validacao por aba/canal;
- manter integracoes externas fora do MVP ate decisao especifica.
