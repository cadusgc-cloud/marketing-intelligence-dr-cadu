# Weekly Strategic Decision Layer

## Objetivo

A camada Weekly Strategic Decision Layer transforma a Central Semanal em uma leitura estrategica inicial da semana. Ela compara a semana selecionada com a semana anterior salva, calcula deltas e organiza sinais que ajudam Cadu e a equipe a discutir a proxima semana com mais clareza.

## O que ela faz

- Compara a semana aberta em `/weekly` com a semana imediatamente anterior salva.
- Calcula delta absoluto e percentual para metricas de midia, conteudo e funil.
- Classifica variacoes como melhora, piora, neutras ou contextuais.
- Detecta sinais conservadores de gargalo comercial, queda de presenca organica, pressao de custo e eficiencia de investimento.
- Gera recomendacoes praticas com prioridade, tipo, responsavel sugerido e janela de acao.
- Mostra uma leitura basal quando ainda nao existe semana anterior.

## O que ela nao faz

- Nao decide investimento automaticamente.
- Nao substitui revisao humana.
- Nao promete resultado de marketing, agenda ou receita.
- Nao altera dados salvos.
- Nao cria schema, migration, seed ou integracao externa.
- Nao usa API externa nem LLM.

## Metricas usadas

- Investimento Meta Ads.
- Conversas Meta/WhatsApp.
- Custo por conversa Meta.
- Visitas ao perfil via Meta.
- Investimento Google Ads.
- Cliques e conversoes Google Ads.
- Custo por clique e taxa de conversao Google.
- Stories, Reels/Shorts, posts e visitas ao perfil Instagram.
- WhatsApps totais.
- Conversas qualificadas.
- Consultas marcadas e comparecidas.
- Taxa de comparecimento.
- Cirurgias fechadas.
- Taxa de fechamento.

## Regras iniciais de sinais

- Primeira semana salva: gera leitura basal sem delta comparativo.
- Funil incompleto: marca leitura limitada quando faltam consultas marcadas, comparecimento ou fechamento.
- Meta com muitas conversas e poucas consultas: indica possivel gargalo comercial ou de WhatsApp.
- Muitos WhatsApps com baixa taxa de consulta: recomenda revisar abordagem e follow-up.
- Consultas marcadas com baixo comparecimento: recomenda revisar confirmacao e qualificacao.
- Google com custo e baixa conversao: recomenda auditoria antes de ampliar verba.
- Queda relevante de Stories: indica risco de menor presenca organica.
- Investimento maior sem ganho proporcional de demanda: alerta de eficiencia.
- Custo por conversa Meta pressionado: recomenda revisar criativos, publicos e cadencia.

## Recomendacoes

As recomendacoes sao praticas e conservadoras. Cada item possui:

- tipo: marketing, comercial, conteudo, operacoes, tracking ou estrategia;
- prioridade: baixa, media ou alta;
- responsavel sugerido: Cadu, equipe comercial, marketing, atendimento ou revisao humana;
- janela de acao: esta semana, proxima semana ou revisao mensal.

## Limitacoes

- A leitura depende da qualidade dos dados agregados salvos.
- Campos comerciais ausentes reduzem a confiabilidade da interpretacao.
- Deltas percentuais ficam sem percentual quando a semana anterior era zero.
- A camada nao conhece contexto externo, agenda real, sazonalidade completa ou decisoes comerciais fora do sistema.
- Dezembro/2025 continua sendo tratado como anomalia operacional nos pontos do sistema que usam essa regra.

## Revisao humana obrigatoria

A leitura apoia a organizacao da operacao e deve ser revisada por uma pessoa antes de decisoes de investimento. Ela nao deve ser usada como autorizacao automatica para escalar, pausar ou redistribuir verba.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Testes principais:

- `tests/weeklyStrategicDecision.test.ts`
- `tests/weeklyMarketingWeeks.test.ts`
- `tests/weeklyMarketingWeeks.persistence.test.ts`
- `tests/weeklyCommandCenter.test.ts`

## Proximas melhorias

- Ajustar pesos por canal depois de mais semanas salvas.
- Mostrar um historico visual de deltas sem adicionar dependencia nova.
- Permitir comentarios humanos sobre cada recomendacao.
- Separar recomendacoes por dono operacional na interface.
- Criar criterios de revisao mensal quando houver base historica suficiente.
