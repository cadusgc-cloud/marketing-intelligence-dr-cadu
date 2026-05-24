# PR Readiness - Marketing OS v8

## Branch

- Base: `codex/marketing-os-v7-guided-report-import`
- Feature: `codex/marketing-os-v8-workspace-history`

## Escopo

- Workspace local.
- Historico operacional.
- Snapshots sanitizados.
- Backup/restore tecnico.
- Auditoria local.
- Runbook semanal.
- Configuracoes locais client-side.
- Relatorios V8 versionados.

## Rotas novas

- `/workspace`
- `/history`
- `/runbook`
- `/settings`
- `/audit-log`

## Dominios novos

- `lib/marketing-workspace/`
- `lib/marketing-workspace/client/`
- `components/workspace/useMarketingWorkspace.tsx`

## Scripts novos

- `npm run workspace:check`
- `npm run backup:check`
- `npm run qa:workspace`

## Seguranca

- Sem API externa.
- Sem backend real.
- Sem publicacao automatica.
- Sem upload.
- Sem dados de pacientes.
- Sem credenciais.
- Sem alteracao de `.env`.
- Sem push, merge ou tag.

## Riscos remanescentes

- Persistencia local depende do navegador do usuario.
- Restore visual ainda deve ser confirmado manualmente.
- Backup JSON tecnico deve ser guardado com cuidado pelo usuario.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run smoke:marketing
npm run workspace:check
npm run backup:check
npm run qa:workspace
npm run health:routes
npm run build
```

## Push futuro

Nao executado automaticamente:

```bash
git push -u origin codex/marketing-os-v8-workspace-history
```
