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
npx prisma migrate dev     # aplica migrações no banco local/dev
npx prisma migrate deploy  # aplica migrações em produção
npm run db:seed   # recria benchmarks e relatórios iniciais
```

## Escopo

- `/` dashboard geral
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
