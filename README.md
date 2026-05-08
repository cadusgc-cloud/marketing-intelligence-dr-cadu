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
