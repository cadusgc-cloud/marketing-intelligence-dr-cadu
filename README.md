# Marketing Intelligence OS — Dr. Cadu

MVP full-stack em Next.js para analisar relatórios agregados de marketing de um cirurgião plástico. A versão inicial não usa autenticação, integrações externas nem OpenAI API. O parser é determinístico e trabalha somente com estatísticas agregadas.

## Rodando localmente

Configure `.env` com as strings PostgreSQL do Neon:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

Para rodar os testes de persistência, configure também um banco PostgreSQL separado e descartável:

```bash
TEST_DATABASE_URL="postgresql://USER:PASSWORD@HOST/testdb?sslmode=require"
TEST_DIRECT_URL="postgresql://USER:PASSWORD@HOST/testdb?sslmode=require"
```

```bash
npm install
npm run db:generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

```bash
npm run dev       # servidor local
npm run build     # build Next.js com Prisma generate
npm test          # testes unitários com Vitest
npm run smoke:marketing     # smoke test do Marketing OS
npm run dogfood:marketing   # dogfooding da semana piloto V4
npm run studio:check        # QA do Content Studio V5 e relatorios
npm run health:routes       # route health estatico
npm run health:routes:local # route health contra localhost:3010
npx prisma migrate dev     # aplica migrações no banco local/dev
npx prisma migrate deploy  # aplica migrações em produção
npm run db:seed   # recria benchmarks e relatórios iniciais
```

## Escopo

- `/` dashboard geral
- `/plan` planejamento semanal completo para uso interno local
- `/content/[id]` pacote completo de conteudo, legenda, stories, videos, prompts e checklist etico
- `/prompts` biblioteca de prompts copiaveis para uso manual
- `/export` exportacao local em Markdown, JSON e CSV
- `/operations` central operacional V3 para Hoje/Semana/Mes, tarefas, readiness, MediaOps, Safety e exportacoes
- `/exports` pacotes copiaveis da operacao mensal, semanal e diaria
- `/safety` centro de seguranca medico-publicitaria da operacao editorial
- `/studio` Content Studio V5 para gerar pacote completo de tema
- `/library` biblioteca editorial com pilares, temas, hooks, frases e templates
- `/recording` planejamento de gravacao em lote com 8 a 10 videos
- `/review` fila local de revisao e producao
- `/campaigns` maquina editorial de 30 dias para campanhas mensais internas
- `/storyops` planejamento diario de 6 stories naturais, seguros e copiaveis
- `/reports` lista de relatórios
- `/reports/new` importação por texto colado
- `/reports/[id]` detalhe analisado
- `/insights` central de recomendações
- `/benchmarks` benchmarks internos
- `/settings` edição simples dos benchmarks

## v1.1 - Leitura Estratégica da Semana

A Central Semanal em `/weekly` inclui uma camada de decisão estratégica que compara a semana selecionada com a semana anterior salva, calcula deltas e organiza sinais práticos para a próxima semana.

Essa leitura identifica gargalos comerciais, queda de presença orgânica, pressão de custo e alertas de eficiência. As recomendações são apoio operacional: devem ser revisadas por uma pessoa antes de qualquer decisão de investimento e não prometem resultado.

## v1.2 - Importacao assistida de dados semanais

A tela `/data` inclui uma importacao assistida para colar dados agregados de Instagram, Meta Ads, Google Ads e funil comercial. O sistema gera uma previa dos campos reconhecidos antes de aplicar nos inputs semanais.

Essa etapa nao conecta APIs externas, nao usa tokens e nao busca dados automaticamente. Ela serve para validar o fluxo real com numeros consolidados antes de evoluir para CSV/Excel ou integracoes oficiais.

## v1.3 - Template de coleta semanal

A tela `/data` tambem inclui um template copiavel para orientar a coleta manual de metricas semanais em Instagram, Meta Ads, Google Ads e funil comercial.

O template funciona como checklist operacional: ajuda a coletar numeros consolidados, colar na importacao assistida e revisar antes de salvar. Ele nao conecta APIs externas, nao cria tokens e nao salva dados automaticamente.

## v1.4 - Importacao CSV/planilha

A tela `/data` inclui uma importacao assistida por CSV/TSV para dados copiados de planilha ou arquivo `.csv`. A tabela e convertida para linhas `campo: valor` antes de entrar no fluxo de previa e aplicacao manual.

Essa etapa nao le `.xlsx` diretamente, nao conecta Google Sheets, nao usa tokens e nao salva dados automaticamente. Ela serve para acelerar o preenchimento com dados agregados ja revisados.

## App interno de conteudo - uso local

As rotas `/`, `/plan`, `/content/[id]`, `/prompts` e `/export` formam um fluxo local completo para revisar desempenho demo, planejar a semana, abrir pacotes de conteudo, copiar legendas/hashtags/prompts e exportar o planejamento.

Essa camada usa apenas dados agregados ficticios e deterministica local. Ela nao integra redes sociais, nao chama API externa, nao publica automaticamente e nao usa dados de pacientes.

## v1.5 - Mapeamento manual de colunas CSV

A importacao CSV/TSV em `/data` tambem permite revisar cada coluna da planilha e escolher o campo correspondente antes de enviar para a importacao assistida.

Esse mapeamento ajuda quando o cabecalho vem como `Meta R$`, `WA Ads`, `Stories IG` ou outro nome operacional. Colunas sem uso podem ser ignoradas. O fluxo continua local, sem API externa, sem token, sem salvamento automatico e com revisao humana antes de aplicar.

## v1.6 - Presets de mapeamento CSV

A tela `/data` inclui presets de mapeamento para acelerar planilhas recorrentes: deteccao automatica, planilha semanal consolidada, midia paga, Instagram organico e funil comercial.

O preset apenas sugere o mapeamento inicial. O usuario continua podendo revisar cada coluna, ignorar campos e enviar a previa para a importacao assistida antes de aplicar nos dados semanais.

## v1.7 - Validacao visual da importacao CSV

A previa CSV/TSV em `/data` agora mostra uma validacao antes de enviar para a importacao assistida. O painel indica se a previa esta pronta, se precisa de revisao ou se deve ficar bloqueada.

O bloqueio ocorre quando ha possiveis dados sensiveis, nenhum texto importavel ou nenhum campo conhecido reconhecido. Avisos como periodo ausente, rotulo ausente ou colunas ignoradas exigem revisao humana, mas nao salvam nada automaticamente.

## v1.8 - Validacao antes de salvar a semana

A tela `/data` agora mostra uma validacao final antes de salvar a semana. O painel separa bloqueios essenciais, como periodo invalido ou campos numericos inconsistentes, de pontos que apenas exigem revisao operacional.

Quando ha bloqueio, o botao de salvar fica desativado. Quando ha apenas revisao, a semana ainda pode ser salva, mas a leitura da Central Semanal deve ser interpretada com cautela humana.

## v1.9 - Briefing diario de Stories

A rota `/stories/today` cria um briefing operacional do dia para conectar planejamento semanal, exportacao, execucao manual e registro de resultados dos Stories.

O painel separa fila de publicacao manual, fila de revisao, prioridades do dia, metricas agregadas a registrar e guardrails de privacidade. Ele nao conecta Instagram, Meta, WhatsApp ou APIs externas, nao publica automaticamente e nao usa dados pessoais ou clinicos.

## StoryOps Diario v2.0

A rota `/storyops` gera uma sequencia diaria de 6 stories com linguagem curta, natural e editavel, pensada para parecer story nativo do Instagram e nao uma arte montada.

O modulo inclui temas iniciais, linhas editoriais, sugestoes de midia natural, frases seguras, frases de risco, gate editorial, status de seguranca e exportacao copiavel. Ele nao conecta Instagram, Meta, WhatsApp ou APIs externas, nao publica automaticamente, nao usa dados de pacientes e exige revisao humana antes de qualquer postagem manual.

## Marketing Intelligence OS v2.0 - Maquina Editorial de 30 dias

A rota `/campaigns` cria uma central mensal interna para planejar 30 dias de conteudo organico. Ela gera dias, semanas, pilares editoriais, temas, stories via StoryOps, reels, posts/carrosseis, sugestoes MediaOps, safety gate medico-publicitario e exportacoes copiaveis em Markdown, TSV, Google Agenda e briefing para editor.

O modulo e deterministico e local. Ele nao conecta APIs externas, nao publica automaticamente, nao agenda posts reais, nao faz upload de midia, nao usa dados de pacientes, nao altera banco e nao altera schema Prisma.

## Marketing OS v3 - Central Operacional de Execucao Editorial

A rota `/operations` consolida a execucao diaria, semanal e mensal: pacote do dia, tarefas editoriais, status local via `localStorage`, readiness, backlog, reaproveitamento de temas, MediaOps V3, Safety Center e Export Center.

As rotas `/exports` e `/safety` separam pacotes copiaveis e revisao medico-publicitaria. A V3 continua local e deterministica: nao conecta APIs externas, nao publica, nao envia mensagens, nao altera banco, nao usa dados de pacientes e exige revisao humana antes de qualquer publicacao manual.

Validacao rapida:

```bash
npm run smoke:marketing
```

## Marketing OS v4 - QA, dogfooding e PR readiness

A rota `/qa` valida automaticamente uma semana piloto realista, de 2026-05-24 a 2026-05-30, chamada "Semana Piloto - Cirurgia Plastica Sem Promessa".

A V4 gera a semana com StoryOps, campanhas, Marketing Ops, MediaOps, safety gate, exports copiaveis e readiness. Depois roda dogfooding e QA automatico para provar que o sistema consegue produzir uma semana segura sem depender de integracao externa ou revisao manual inicial extensa.

Scripts novos:

```bash
npm run dogfood:marketing
npm run qa:marketing
npm run health:routes
npm run health:routes:local
```

Relatorios versionados ficam em `reports/marketing-os-v4/`.

Como nas fases anteriores, a V4 nao conecta APIs externas, nao publica automaticamente, nao faz upload, nao usa dados de pacientes, nao altera banco e nao mexe em `.env`.

## Marketing OS v5 - Content Studio, Biblioteca e Gravacao

A V5 adiciona uma fabrica editorial local em `/studio`. O Content Studio transforma um tema em pacote completo: 6 stories, reel, carrossel, post estatico, legendas, briefing para editor, checklist de midia, variacoes seguras, fila de revisao e fila de producao.

Rotas novas:

- `/studio`: gera e exporta pacotes completos de tema.
- `/library`: inventario de pilares, temas, hooks, frases e templates.
- `/recording`: planejamento de gravacao com 8 a 10 videos curtos.
- `/review`: fila local de revisao e producao.

Scripts novos:

```bash
npm run studio:check
npm run qa:studio
```

Relatorios versionados ficam em `reports/marketing-os-v5/`.

A V5 continua sem API externa, sem publicacao automatica, sem upload, sem dado de paciente, sem banco real novo e sem alteracao de `.env`.

## v2.0 - Tela de resultado do Weekly Command Center

A rota `/weekly` agora abre com uma tela de resultado operacional chamada Weekly Command Center. Ela resume a semana selecionada, compara com a semana anterior valida, separa cadencia de qualidade, lista sinais, organiza aprendizado por funcao de conteudo, mostra Stories/presenca diaria e monta um plano interno para a proxima semana.

A leitura permanece deterministica, interna e baseada somente em metricas agregadas. Dezembro/2025 continua excluido de comparacoes normais por anomalia operacional, e o sistema nao publica, nao envia mensagens e nao conecta APIs externas.

## v2.1 - Contexto de semanas validas

O Weekly Command Center tambem calcula uma janela recente de semanas anteriores validas para dar contexto historico a metricas agregadas. A tela mostra se a semana atual esta acima, abaixo ou perto da media recente em visitas ao perfil, cadencia, conversas, funil e conversoes disponiveis.

Dezembro/2025 segue excluido da janela historica por anomalia operacional. A media recente e apenas apoio de contexto: nao e previsao, benchmark definitivo nem autorizacao automatica para decisao de verba, conteudo ou equipe.

## v2.2 - Prioridades da proxima semana

O Weekly Command Center agora ranqueia alavancas internas para a proxima semana. A camada organiza o que repetir, ajustar, pausar ou testar com base em sinais deterministicos, contexto historico valido, cadencia, funil, Meta, Google e Team Audit Mode.

As prioridades mostram score, area, responsavel sugerido, janela de acao, evidencias e guardrails. Elas nao enviam recomendacoes automaticamente, nao publicam conteudo, nao conectam APIs externas e nao substituem revisao humana.

## v2.3 - Board de execucao semanal

O Weekly Command Center agora inclui um board interno de execucao semanal em `/weekly/execution`. Ele transforma as prioridades ranqueadas em tarefas por faixa de tempo: hoje, esta semana, proxima semana e revisao mensal.

Cada tarefa mostra status, risco, responsavel sugerido, checklist, criterios de aceite, evidencias e guardrail. O board ajuda a preparar execucao manual e revisao humana; ele nao publica, nao envia mensagens, nao altera campanhas, nao conecta APIs externas e nao usa dados pessoais.

## v2.4 - Pacote manual de execucao

A rota `/weekly/execution/packet` organiza o board em um pacote de revisao humana: brief executivo, foco da semana, gates de aprovacao, brief por responsavel sugerido, plano de coleta agregada da proxima semana e roteiro de revisao.

O pacote continua interno e deterministico. Ele nao salva decisoes, nao publica, nao envia mensagens, nao altera campanhas, nao integra APIs externas e nao transforma Team Audit Mode em acao externa automatica.

## v2.5 - Guia de coleta semanal

A rota `/data/collection-guide` mostra de onde tirar cada dado semanal antes de preencher `/data`: Instagram organico, Meta Ads, Google Ads, WhatsApp/funil, identidade da semana, contexto editorial e anomalias.

O guia separa campos que ja existem como input ativo de metricas que ainda devem ficar em observacoes, como alcance, impressoes e interacoes agregadas. Ele reforca coleta manual, metricas consolidadas, privacidade, exclusao de Dezembro/2025 de benchmarks normais e ausencia de API externa nesta fase.

## v2.6 - Pacote copiavel de coleta

A rota `/data/collection-packet` transforma o guia de coleta em artefatos prontos para uso manual: checklist de fechamento, template `campo: valor`, modelo CSV/TSV e mensagem de handoff interno.

Esse pacote ajuda a coletar numeros semanais de Instagram, Meta Ads, Google Ads e funil comercial sem depender de API. Ele permanece interno, nao envia mensagens, nao publica conteudo, nao altera banco e exige revisao humana antes de salvar a semana em `/data`.

## v2.7 - Prontidao da coleta por fonte

A tela `/data` agora mostra uma leitura de prontidao por fonte antes de salvar: identidade da semana, Instagram organico, Meta Ads, Google Ads, funil comercial e contexto editorial.

A camada classifica cada fonte como pronta, revisar, sem coleta ou bloqueada, calcula score de coleta e lista proximas acoes manuais. Ela nao busca dados automaticamente, nao conecta APIs, nao envia mensagens e mantem Dezembro/2025 fora de benchmarks normais.

## v2.8 - Plano de coleta da proxima semana

A tela `/data` tambem transforma a prontidao por fonte em um plano de coleta para a semana seguinte. O painel indica tarefas priorizadas, responsavel sugerido, cadencia, evidencias agregadas, criterios de aceite, rotina diaria, fechamento semanal e um handoff interno copiavel.

O plano continua interno e manual: nao conecta APIs, nao envia mensagens, nao publica conteudo, nao altera campanhas e nao usa dados pessoais. Ele existe para orientar a coleta agregada antes de salvar a proxima semana e ler o Weekly Command Center.

## v2.9 - Pacote copiavel do plano de coleta

A tela `/data` agora permite copiar o pacote completo do plano de coleta da proxima semana. A rota `/data/next-collection-plan` mostra uma versao dedicada de referencia com plano completo, rotina diaria, fechamento semanal, handoff interno e briefs por responsavel sugerido.

O pacote permanece manual, interno e baseado em metricas agregadas. Ele nao envia mensagens, nao conecta APIs, nao salva dados automaticamente e nao altera banco, campanha ou conteudo publicado.

## v3.0 - Workspace local de coleta

A tela `/data` e a rota `/data/collection-workspace` agora incluem um checklist local para acompanhar a coleta semanal. O usuario pode marcar itens como pendentes, coletados ou bloqueados, ver progresso e copiar um resumo de status.

O progresso fica apenas no navegador via `localStorage` e armazena somente status de tarefa. Nao ha campo livre para nomes, DMs, conversas, prints, pacientes ou dados clinicos; o fluxo continua manual, interno e sem API externa.

## v3.1 - Gate de decisao da coleta

A tela `/data` e a rota `/data/collection-workspace` agora mostram um gate local antes do salvamento manual da semana. Ele classifica a coleta como pronta para salvar, coleta pendente, revisao final ou bloqueada.

O gate usa somente o status do checklist local, gera proximas acoes e perguntas de revisao humana, e permite copiar um resumo interno. Ele nao salva automaticamente, nao conecta APIs, nao cria banco, nao envia mensagens e nao substitui decisao humana.

## v3.2 - Handoff pre-salvamento

A tela `/data` e a rota `/data/collection-workspace` agora cruzam o gate de coleta com a validacao do formulario antes de salvar a semana. O handoff indica se a semana esta pronta para salvar, se precisa revisar, se deve coletar primeiro ou se esta bloqueada.

O handoff gera checklist e proximas acoes copiaveis para revisao manual. Ele nao salva automaticamente, nao altera banco, nao conecta APIs, nao envia mensagens e continua usando apenas metricas agregadas.

## v3.3 - Primeiro foco de bloqueio

O handoff pre-salvamento agora destaca um "Primeiro foco" com area sugerida, motivo e link interno para o ponto mais importante a revisar antes de salvar. Isso reduz a leitura da lista inteira quando existe bloqueio ou pendencia.

O foco continua local e deterministico: nao salva automaticamente, nao altera banco, nao conecta APIs e nao usa dados pessoais. Ele apenas orienta a revisao humana dentro da tela `/data`.

## v3.4 - Trilha de revisao manual

A tela `/data` e as rotas `/data/collection-workspace` e `/data/manual-review-trail` agora mostram uma trilha copiavel de revisao humana antes do salvamento da semana.

A trilha junta workspace, gate de coleta, handoff pre-salvamento, validacao do formulario e prontidao por fonte em um Markdown interno. Ela ajuda a registrar se a semana deve ser salva, revisada, mantida em coleta ou bloqueada. Continua sem API externa, sem envio automatico, sem alteracao de banco e sem dados pessoais.

## v3.5 - Mapa de origem dos dados

A tela `/data` e a rota `/data/source-evidence` agora mostram um mapa copiavel de origem dos dados semanais. Ele organiza, por fonte, quais campos vieram de Instagram, Meta Ads, Google Ads, funil comercial, calendario ou revisao humana.

O mapa mostra status da origem, valores agregados presentes, lacunas, perguntas de revisao e guardrails antes do salvamento. Ele nao busca dados automaticamente, nao conecta APIs, nao cria token, nao altera banco e nao usa dados pessoais.

## v3.6 - Conferencia final antes de salvar

A tela `/data` agora mostra um gate final antes do botao de salvamento efetivo. Ele cruza validacao do formulario, mapa de origem, prontidao por fonte, privacidade e revisao humana.

Quando ha bloqueio de formulario, fonte ou privacidade, o botao de salvar fica bloqueado pelo gate final. Quando ha apenas lacunas operacionais, o salvamento continua manualmente possivel, mas a leitura posterior deve ser tratada como limitada e revisada por uma pessoa.

## v3.7 - Primeiro foco do gate final

O gate final em `/data` agora destaca um "Primeiro foco" acionavel antes da grade de checks. Ele aponta para o primeiro bloqueio ou revisao relevante, mostra a area sugerida, o motivo e uma acao pratica para resolver antes do salvamento manual.

Quando todos os checks estao ok, o foco orienta salvar a semana manualmente e abrir `/weekly` para revisar diagnostico, sinais e plano. A camada continua deterministica, interna, sem API externa, sem envio automatico, sem alteracao de banco e sem dados pessoais.

## v3.8 - Revisao compacta pos-salvamento

A tela `/weekly` agora inclui uma revisao compacta pos-salvamento. Depois que a semana e salva em `/data`, o Weekly Command Center mostra o que foi salvo, a confianca da leitura, o primeiro passo humano recomendado, um checklist compacto e os proximos modulos a abrir.

Essa camada ajuda a fechar o ciclo entre coleta, salvamento e interpretacao da semana. Ela nao altera banco, nao cria schema, nao conecta APIs, nao publica, nao envia mensagens e mantem Dezembro/2025 fora de benchmark normal.

## v3.9 - Pacote pos-salvamento copiavel

A revisao compacta em `/weekly` agora pode ser copiada como Markdown e aberta em uma rota dedicada: `/weekly/post-save-review`.

O pacote pos-salvamento organiza status, confianca, primeiro passo, snapshot salvo, checklist, links de continuidade e guardrails em um artefato interno de revisao humana. Ele nao salva automaticamente, nao altera banco, nao conecta API externa, nao envia recomendacao para equipe e nao publica conteudo.

## Privacidade

O produto não solicita, processa ou exibe dados de pacientes. Use apenas métricas agregadas de marketing, como investimento, alcance, impressões, conversas, conversões, CPL e CPA.

## Arquitetura

- `lib/parser/reportParser.ts`: extração determinística por regex.
- `lib/engine/validationEngine.ts`: validações de CPL, CPA, anomalias e dados ausentes.
- `lib/engine/recommendationEngine.ts`: classificação de criativos, keywords e recomendações.
- `lib/engine/analyzeReport.ts`: orquestra parser, validações e recomendações.
- `prisma/schema.prisma`: modelos do banco PostgreSQL usado pelo Prisma.

## Anomalias operacionais

Dezembro/2025 é tratado como anomalia operacional porque a conta do Instagram/Meta foi hackeada nesse período.

Regra aplicada: qualquer relatório cujo período cruze dezembro/2025 recebe `isOperationalAnomaly = true` e a observação: “Período excluído da análise normal por hackeamento da conta.”

Relatórios marcados como anomalia operacional permanecem visíveis apenas como contexto histórico. Eles não entram em médias históricas, benchmarks, score executivo, thresholds, projeções, recomendações, diagnósticos de criativos/keywords nem comparações de performance normal.

## Diagnóstico executivo e AgentRun

O diagnóstico executivo é gerado em runtime a partir dos dados persistidos do relatório, canais, recomendações, criativos, keywords e DataIssues. O modelo `AgentRun` já existe no schema, mas fica reservado para uma etapa futura em que seja necessário diagnóstico auditável, versionamento do engine, integração com LLM, botão de reprocessamento ou comparação de diagnósticos gerados em momentos diferentes.

Não persistir esse diagnóstico agora evita que ele fique obsoleto quando benchmarks, parser ou `recommendationEngine` mudarem.

## Limitações conhecidas do MVP

- Parser regex cobre formatos comuns, mas relatórios muito livres podem exigir ajustes.
- Benchmarks são configuráveis, porém as regras ainda usam constantes internas em alguns pontos.
- Comparações de queda entre períodos ainda são heurísticas baseadas no texto e nas médias do dashboard.
- Compliance médico é checklist de risco para revisão humana, não parecer jurídico.
- `ChannelSummary` ainda não persiste `interactions`, `shares`, `saves` e `comments` como métricas agregadas de canal.
- Essas métricas são preservadas em `CreativePerformance` quando pertencem a conteúdos ou criativos específicos.
- O alinhamento do schema deve ser retomado quando o dashboard precisar comparar interações agregadas por período, quando o `recommendationEngine` passar a usar interações agregadas do canal ou quando houver necessidade de relatórios orgânicos consolidados mais completos.
- Esta decisão mantém o MVP enxuto e evita uma migração Prisma desnecessária neste momento.
## Marketing OS v6 - Intelligence Loop

A V6 fecha o ciclo estrategico local: metricas manuais agregadas entram em `/metrics`, viram aprendizado em `/insights`, experimentos em `/experiments` e roadmap adaptativo em `/strategy`.

Rotas principais da V6:

- `/insights` - aprendizado editorial, top conteudos, pilares, formatos, oportunidades e proximas melhores acoes.
- `/metrics` - colagem manual de TSV/CSV, validacao, normalizacao e relatorio.
- `/experiments` - testes editoriais seguros, sem automacao de publicacao.
- `/strategy` - plano 30/60/90 dias e calendario adaptativo de 7 dias.

Scripts da V6:

```bash
npm run intelligence:check
npm run qa:intelligence
npm run health:routes
```

A V6 continua sem API externa, sem publicacao automatica, sem upload, sem dados de pacientes e sem alteracao de `.env`.

## Marketing OS v7 - Coleta Semanal Guiada

A V7 adiciona a rotina semanal para importar relatorios manuais, validar qualidade, fechar desempenho e gerar o plano da proxima semana.

Rotas principais da V7:

- `/imports` - colagem de CSV/TSV, origem do relatorio, mapeamento de colunas, validacao e normalizacao.
- `/weekly-review` - assistente de fechamento semanal em sete etapas.
- `/performance` - comparacao semanal, ranking de conteudos, pilares, formatos, oportunidades e Ads manual.

Scripts da V7:

```bash
npm run import:check
npm run weekly:check
npm run qa:weekly
```

Fluxo semanal recomendado:

1. Exportar os relatorios agregados manualmente.
2. Colar em `/imports`.
3. Conferir qualidade, duplicidades, datas e dados sensiveis.
4. Abrir `/weekly-review`.
5. Copiar relatorio semanal, TSV, Agenda, Etus/manual e tarefas.
6. Abrir `/performance` para revisar sinais e priorizar a proxima semana.

A V7 nao conecta APIs, nao publica, nao faz upload, nao altera banco, nao salva credenciais e nao deve receber dados identificaveis.

## Marketing OS v8 - Workspace local e historico operacional

A V8 adiciona uma camada de continuidade local para o Marketing OS:

- `/workspace`: estado local, semana ativa, snapshots, backup, restore e integridade.
- `/history`: historico operacional sanitizado.
- `/runbook`: checklist semanal por dia.
- `/settings`: configuracoes locais sem backend.
- `/audit-log`: eventos de auditoria e severidade.

Scripts novos:

```bash
npm run workspace:check
npm run backup:check
npm run qa:workspace
```

Fluxo semanal recomendado:

1. Domingo: abrir `/weekly-review`, importar metricas manuais e fechar a semana.
2. Criar snapshot em `/workspace`.
3. Seguir o checklist em `/runbook`.
4. Usar `/operations`, `/studio`, `/review` e `/exports` para execucao manual.
5. Sabado: exportar backup tecnico local e criar novo snapshot.

A V8 continua sem API externa, sem backend real, sem publicacao automatica, sem upload, sem dados de pacientes e sem alteracao de `.env`.
