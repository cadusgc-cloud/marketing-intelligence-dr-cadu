# PR Readiness - Marketing OS v9

## Branches

- Branch base: `codex/marketing-os-v8-workspace-history`
- Branch V9: `codex/marketing-os-v9-guided-flows-rc`

## Escopo

A V9 adiciona Command Center, fluxos guiados, flow runner local, next action engine, release candidate local, PR draft generator e onboarding.

## Rotas novas

- `/command-center`
- `/flows`
- `/flows/[id]`
- `/release`
- `/onboarding`

## Dominios novos

- `lib/guided-flows/`
- `lib/release-readiness/`

## Scripts novos

```bash
npm run flows:check
npm run rc:check
npm run qa:flows
```

## Testes

Testes V9 esperados:

- `tests/guidedFlowsV9.test.ts`
- `tests/releaseReadinessV9.test.ts`
- `tests/commandCenterV9.test.ts`

## Validacoes obrigatorias

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
npm run import:check
npm run weekly:check
npm run qa:weekly
npm run workspace:check
npm run backup:check
npm run qa:workspace
npm run flows:check
npm run rc:check
npm run qa:flows
npm run health:routes
npm run build
npm run health:routes:local
```

## Segurança

- Sem API externa.
- Sem backend real.
- Sem publicacao automatica.
- Sem upload.
- Sem dados de pacientes.
- Sem alteracao de `.env`.
- Sem push, merge ou tag executados pelo agente.

## Riscos remanescentes

- O progresso local depende de localStorage no navegador.
- O Release Candidate e estatico/local; ele nao consulta GitHub.
- Fluxos orientam a execucao, mas nao substituem revisao humana.

## Como testar localmente

1. Rodar `npm run flows:check`.
2. Rodar `npm run rc:check`.
3. Rodar `npm run health:routes`.
4. Subir `npm run dev -- --port 3010`.
5. Abrir `/command-center`, `/flows`, `/flows/fechamento-semanal-completo`, `/release` e `/onboarding`.

## Comando futuro de push

Nao executar automaticamente:

```bash
git push -u origin codex/marketing-os-v9-guided-flows-rc
```
