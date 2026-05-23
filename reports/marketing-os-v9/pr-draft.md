# Marketing OS v9 - Fluxos Guiados, Command Center e Release Candidate

## Resumo
Adiciona a fase Marketing OS v9 com Command Center, fluxos guiados, runner local, next action engine, release readiness local, onboarding e rascunho de PR.

## Escopo
- Command Center como ponto inicial operacional
- Catalogo com pelo menos 15 fluxos guiados
- Runner local com progresso e exportacao
- Release Candidate local e PR draft
- Onboarding de uso do Marketing OS

## Rotas
- /: aprovado
- /storyops: aprovado
- /campaigns: aprovado
- /operations: aprovado
- /exports: aprovado
- /safety: aprovado
- /qa: aprovado
- /studio: aprovado
- /library: aprovado
- /recording: aprovado
- /review: aprovado
- /insights: aprovado
- /metrics: aprovado
- /experiments: aprovado
- /strategy: aprovado
- /weekly-review: aprovado
- /imports: aprovado
- /performance: aprovado
- /workspace: aprovado
- /history: aprovado
- /runbook: aprovado
- /settings: aprovado
- /audit-log: aprovado
- /command-center: aprovado
- /flows: aprovado
- /flows/fechamento-semanal-completo: aprovado
- /release: aprovado
- /onboarding: aprovado

## Scripts
- npm test: aprovado
- npm run test: aprovado
- npx tsc --noEmit: aprovado
- npm run smoke:marketing: aprovado
- npm run dogfood:marketing: aprovado
- npm run qa:marketing: aprovado
- npm run studio:check: aprovado
- npm run qa:studio: aprovado
- npm run intelligence:check: aprovado
- npm run qa:intelligence: aprovado
- npm run import:check: aprovado
- npm run weekly:check: aprovado
- npm run qa:weekly: aprovado
- npm run workspace:check: aprovado
- npm run backup:check: aprovado
- npm run qa:workspace: aprovado
- npm run flows:check: aprovado
- npm run rc:check: aprovado
- npm run qa:flows: aprovado
- npm run health:routes: aprovado
- npm run build: aprovado
- npm run health:routes:local: aprovado

## Seguranca
- Sem API externa
- Sem publicacao automatica
- Sem dados de pacientes
- Sem alteracao de .env
- Sem push, merge ou tag executados

## O que nao foi feito
- Nao conectou Instagram, Meta, Reportei, OpenAI, Etus, WhatsApp ou Google
- Nao publicou conteudo
- Nao criou backend real

## Como testar localmente
1. npm test
2. npx tsc --noEmit
3. npm run flows:check
4. npm run rc:check
5. npm run build
6. npm run health:routes:local

## Riscos remanescentes
- baixo: Dev server pode precisar reinicio apos build.
- baixo: Fluxos orientam, mas nao substituem revisao humana.
