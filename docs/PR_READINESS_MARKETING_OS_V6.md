# PR Readiness - Marketing OS v6

## Branches

- Base: `codex/marketing-os-v5-content-studio`
- Feature: `codex/marketing-os-v6-intelligence-loop`

## Escopo

- Dominio `lib/marketing-intelligence/`
- Dataset ficticio seguro com 45+ registros
- Parser manual TSV/CSV
- Normalizacao de formatos e pilares
- Performance scoring
- Learning loop
- Experiment engine
- Strategy roadmap 30/60/90
- Next best actions
- Opportunity map
- Calendario adaptativo
- Exportacoes de insights, TSV, Google Agenda, Etus/manual e JSON tecnico
- Rotas `/insights`, `/metrics`, `/experiments`, `/strategy`
- Scripts `intelligence:check` e `qa:intelligence`

## Rotas afetadas

- `/insights`
- `/metrics`
- `/experiments`
- `/strategy`
- `/operations`
- `/exports`
- `/safety`
- `/qa`

## Scripts novos

```bash
npm run intelligence:check
npm run qa:intelligence
```

## Validacoes esperadas

```bash
npm test
npm run test
npx tsc --noEmit
npm run smoke:marketing
npm run dogfood:marketing
npm run qa:marketing
npm run studio:check
npm run qa:studio
npm run intelligence:check
npm run qa:intelligence
npm run health:routes
npm run build
npm run health:routes:local
git diff --check
git diff --cached --check
```

## Checklist de seguranca

- [x] Sem API externa
- [x] Sem publicacao automatica
- [x] Sem upload real
- [x] Sem dados de pacientes
- [x] Sem alteracao de `.env`
- [x] Sem migration ou seed
- [x] Sem push, merge ou tag
- [x] Metricas apenas agregadas e manuais
- [x] Recomendacoes dependem de revisao humana

## Riscos remanescentes

- O dataset atual e ficticio; a qualidade das recomendacoes reais dependera da consistencia da entrada manual.
- O parser e simples e nao tenta resolver CSVs complexos com aspas e quebras de linha internas.
- Scores sao heuristicas conservadoras, nao analise estatistica definitiva.

## O que nao foi feito

- Nao houve integracao com Instagram, Meta, TikTok, Google, OpenAI, Etus ou WhatsApp.
- Nao houve automacao de postagem.
- Nao houve persistencia em banco.
- Nao houve upload de midia.
- Nao houve uso de dados reais.

## Push futuro

Nao executar automaticamente nesta fase. Quando aprovado:

```bash
git push -u origin codex/marketing-os-v6-intelligence-loop
```
