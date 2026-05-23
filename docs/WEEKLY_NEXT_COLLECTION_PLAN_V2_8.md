# Weekly Next Collection Plan v2.8

## Objetivo

A v2.8 transforma a prontidao da coleta por fonte em um plano operacional para a proxima semana.

Enquanto a v2.7 responde "o que falta coletar", esta camada responde:

- quem deveria coletar;
- quando coletar;
- qual evidencia agregada deve ser reunida;
- quais criterios tornam a coleta aceitavel;
- quais guardrails impedem uso inseguro.

## Onde aparece

O painel aparece em `/data`, logo abaixo de:

1. validacao antes de salvar;
2. prontidao da coleta por fonte.

Ele nao salva dados, nao envia mensagens e nao conecta APIs. E um roteiro interno para preparar a proxima coleta semanal.

## O que ele faz

- Le a `Weekly Collection Readiness`.
- Gera tarefas priorizadas para fontes ausentes, bloqueadas ou em revisao.
- Separa tarefas por responsavel sugerido: Cadu, marketing, atendimento ou revisao humana.
- Define cadencia: antes da semana, diaria, fechamento semanal ou revisao obrigatoria.
- Lista evidencias agregadas a coletar.
- Lista criterios de aceite antes de salvar a semana.
- Cria um handoff interno copiavel.
- Mantem uma rotina diaria e uma rotina de fechamento semanal.

## O que ele nao faz

- Nao conecta Instagram, Meta, Google, WhatsApp, e-mail ou qualquer API externa.
- Nao usa OAuth, token, credencial ou scraping.
- Nao publica conteudo.
- Nao envia mensagem para equipe, paciente, lead ou terceiro.
- Nao altera campanha, verba, banco, schema Prisma ou migration.
- Nao usa dado pessoal, clinico, DM, nome, telefone, print privado ou conversa individual.
- Nao substitui revisao humana.

## Fontes cobertas

### Identidade da semana

Bloqueios em rotulo, inicio ou fim viram tarefa de alta prioridade antes da coleta.

Se o periodo cruzar Dezembro/2025, a semana deve ser marcada como anomalia operacional e nao pode entrar em benchmark normal.

### Instagram organico

Quando faltam dados, o plano pede fechamento de:

- Stories publicados;
- Reels/Shorts publicados;
- posts publicados;
- visitas ao perfil.

Quando a cadencia esta baixa, o plano adiciona uma tarefa diaria para separar queda por volume de queda por qualidade.

### Meta Ads

O plano pede investimento, conversas agregadas no WhatsApp e visitas ao perfil quando disponiveis.

A coleta deve conferir se a coluna de resultado e conversa real de WhatsApp, nao clique generico.

### Google Ads

O plano pede investimento, cliques e conversoes agregadas.

Quando ha custo ou cliques com conversoes zeradas, a tarefa vira revisao de tracking, intencao e pagina antes de qualquer leitura de escala.

### Funil comercial

O plano pede apenas totais agregados:

- WhatsApps totais;
- conversas qualificadas;
- consultas marcadas;
- consultas comparecidas;
- cirurgias fechadas.

Nao deve copiar nomes, telefones, conversas, DMs, prints ou dados de pacientes.

### Contexto operacional

O plano pede observacoes curtas sobre feriados, cadencia, tracking e anomalias.

Se houver indicio de dado identificavel, a tarefa fica bloqueada ate limpeza manual.

## Handoff interno

O handoff e um texto copiavel para orientar coleta manual. Ele reforca:

- somente totais agregados;
- sem dados pessoais;
- sem API externa;
- sem envio automatico;
- Dezembro/2025 fora de benchmarks normais;
- revisao humana antes de salvar em `/data`.

## Limites de produto

Esta camada e parte do Marketing Intelligence OS interno. Ela ajuda a organizar a coleta semanal, mas nao decide investimento, nao altera campanhas e nao interfere automaticamente na equipe.

Team Audit Mode permanece interno por padrao.

## Como testar

```bash
npm test -- --run tests/weeklyNextCollectionPlan.test.ts tests/weeklyCollectionReadiness.test.ts tests/weeklyDataInput.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Exportar o plano como texto copiavel separado.
- Conectar tarefas do plano ao board de execucao semanal.
- Permitir marcar manualmente uma tarefa como coletada sem salvar dados reais.
- Criar uma leitura historica de fontes mais frequentemente incompletas.
- Preparar, no futuro, integracoes oficiais apenas depois de validacao manual, custo aprovado e governanca de privacidade.
