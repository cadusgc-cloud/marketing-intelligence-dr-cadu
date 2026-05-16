# Weekly Execution Board v2.3

## Objetivo

O Weekly Execution Board transforma as prioridades da semana em tarefas internas de execucao. Ele fica depois da leitura estrategica e do ranking de alavancas, ajudando Dr. Cadu a decidir o que fazer, revisar, pausar ou testar na proxima semana.

O board nao e um publicador, nao envia mensagens, nao altera campanhas e nao fala com a equipe automaticamente. Ele organiza trabalho interno a partir de metricas agregadas.

## O que a camada faz

- Converte cada prioridade semanal em uma tarefa operacional.
- Distribui tarefas em quatro faixas: hoje, esta semana, proxima semana e revisao mensal.
- Define status: planejada, precisa de revisao, pronta ou bloqueada.
- Define risco: baixo, medio ou alto.
- Cria checklist de execucao manual.
- Cria criterios de aceite antes de considerar a tarefa pronta.
- Mostra evidencias agregadas que justificam a tarefa.
- Cria uma agenda curta de revisao semanal.
- Cria um diario de decisoes para registrar escolhas humanas.

## O que a camada nao faz

- Nao publica conteudo.
- Nao envia WhatsApp, e-mail, DM ou orientacao para a equipe.
- Nao acessa Instagram, Meta Ads, Google Ads ou qualquer API externa.
- Nao altera verba, campanha, calendario ou banco de dados.
- Nao usa dados de pacientes, nomes, prontuarios, prints privados ou material identificavel.
- Nao promete resultado.
- Nao substitui revisao humana.

## Entrada de dados

A entrada vem do `WeeklyCommandResult`, que ja consolida:

- semana selecionada;
- comparacao com semana anterior valida;
- contexto de semanas validas;
- sinais deterministicos;
- leitura de cadencia x qualidade;
- ranking de prioridades da proxima semana.

O board nao cria metricas novas e nao altera schema Prisma.

## Faixas de execucao

### Hoje

Tarefas de prioridade alta e decisao curta. Devem ser usadas para destravar leitura, seguranca ou coleta antes de qualquer acao maior.

### Esta semana

Tarefas operacionais que podem ser preparadas e executadas manualmente depois de revisao.

### Proxima semana

Testes, repeticoes e ajustes que devem entrar no planejamento editorial ou comercial da proxima semana.

### Revisao mensal

Itens de aprendizado, governanca e Team Audit Mode. Permanecem internos por padrao.

## Status das tarefas

- `planned`: tarefa planejada, ainda sem aprovacao final.
- `needs_review`: exige revisao humana antes de executar.
- `ready`: baixa complexidade, pronta para planejamento manual.
- `blocked`: depende de dado agregado incompleto ou decisao humana bloqueante.

## Regras de governanca

- Usar somente metricas agregadas.
- Nao usar dados sensiveis ou identificaveis.
- Manter Team Audit Mode interno ate 2026-07-31, salvo pedido explicito do usuario.
- Manter dezembro/2025 fora de medias, benchmarks, projecoes e recomendacoes normais.
- Registrar decisoes humanas antes de mudar verba, criativo, calendario ou rotina da equipe.

## Rota

- Resumo em `/weekly`.
- Board completo em `/weekly/execution`.
- A rota aceita `?week=<id>` para abrir o board da semana selecionada.

## Como testar

```bash
npm test -- --run tests/weeklyExecutionBoard.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias

- Permitir exportar o board como checklist manual.
- Permitir registrar a decisao humana tomada por tarefa.
- Conectar tarefas aprovadas ao calendario editorial interno.
- Criar historico de execucao semanal sem automatizar envio externo.
