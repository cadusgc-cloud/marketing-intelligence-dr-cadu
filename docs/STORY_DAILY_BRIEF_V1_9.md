# Story Daily Brief v1.9

## Objetivo

O Story Daily Brief cria uma camada operacional diaria para os Stories do Marketing Intelligence OS. Ele conecta o planejamento semanal, a exportacao da semana, o board de execucao manual e o registro posterior de resultados em um unico painel de decisao do dia.

## O que faz

- Seleciona o dia operacional pela data ou pelo dia da semana.
- Mostra o objetivo do dia, tema, status, total de stories e equilibrio de funil.
- Separa fila de publicacao manual e fila de revisao.
- Destaca prioridades para Cadu, marketing, atendimento e revisao humana.
- Lista metricas agregadas a registrar depois da execucao.
- Reforca guardrails de privacidade, etica medica e publicacao manual.

## O que nao faz

- Nao publica Stories.
- Nao conecta Instagram, Meta, WhatsApp ou APIs externas.
- Nao cria OAuth, token, webhook, scraping ou automacao de envio.
- Nao usa dados de pacientes, DMs, prints, prontuarios, nomes ou fotos privadas.
- Nao altera schema Prisma, banco, seed ou migrations.
- Nao substitui revisao humana do Dr. Cadu.

## Rota

`/stories/today`

Parametros opcionais:

- `date=YYYY-MM-DD`: abre o dia correspondente dentro do pacote semanal.
- `day=<dia>`: fallback por rotulo do dia, quando a data nao for informada.

Se a data ou o dia nao forem encontrados, o sistema volta para o primeiro dia do pacote semanal para manter a tela segura e funcional.

## Regras operacionais

1. Itens bloqueados impedem status de execucao.
2. Itens com risco de privacidade, alerta etico ou status `needs_review` entram na fila de revisao.
3. Itens prontos ou pendentes sem alerta entram na fila de conferencia e publicacao manual.
4. O briefing sempre orienta registro posterior de metricas agregadas.
5. A recomendacao nunca promete resultado e nunca decide pelo humano.

## Metricas a registrar

- Visualizacoes por story e total do dia.
- Respostas agregadas, sem nomes ou prints.
- Interacoes de sticker, enquetes e caixas de pergunta.
- Cliques de link ou CTA.
- Visitas ao perfil.
- Conversas de WhatsApp em numero consolidado.
- Observacoes qualitativas sem identificacao de pessoa ou caso clinico.

## Guardrails

- Publicacao sempre manual.
- Dados sempre agregados.
- Nenhuma integracao externa nesta versao.
- Nenhum dado pessoal ou clinico.
- Revisao humana antes de qualquer item sensivel.
- Tom sobrio, educativo e compativel com perfil medico.

## Como testar

```bash
npm test -- --run tests/storyDailyBrief.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias

- Permitir que o board de execucao abra diretamente no dia selecionado.
- Persistir status diarios quando houver decisao explicita de banco local.
- Conectar resultados agregados reais da semana ao briefing do dia.
- Criar uma visao de fechamento diario para alimentar a Central Semanal.
