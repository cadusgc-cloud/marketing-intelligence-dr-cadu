# Marketing Intelligence OS — Dr. Cadu

MVP full-stack em Next.js para analisar relatórios agregados de marketing de um cirurgião plástico. A versão inicial não usa autenticação, integrações externas nem OpenAI API. O parser é determinístico e trabalha somente com estatísticas agregadas.

## Rodando localmente

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts

```bash
npm run dev       # servidor local
npm run build     # build Next.js com Prisma generate
npm test          # testes unitários com Vitest
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
- `prisma/schema.prisma`: modelos do banco SQLite local.

## Limitações do MVP

- Parser regex cobre formatos comuns, mas relatórios muito livres podem exigir ajustes.
- Benchmarks são configuráveis, porém as regras ainda usam constantes internas em alguns pontos.
- Comparações de queda entre períodos ainda são heurísticas baseadas no texto e nas médias do dashboard.
- Compliance médico é checklist de risco para revisão humana, não parecer jurídico.
