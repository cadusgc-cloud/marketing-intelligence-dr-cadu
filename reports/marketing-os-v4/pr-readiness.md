# PR readiness - Marketing OS v4

## Escopo do PR

- Semana piloto realista para 2026-05-24 a 2026-05-30.
- Dogfooding engine.
- QA automatico textual/editorial.
- Rota /qa.
- Scripts de dogfooding e route health.
- Relatorios versionados.
- Documentacao de PR readiness.

## Checklist de seguranca

- [x] Sem API externa.
- [x] Sem publicacao automatica.
- [x] Sem upload.
- [x] Sem dados de pacientes.
- [x] Sem paciente, prontuario, caso real ou documento sensivel.
- [x] Sem .env alterado.
- [x] Sem migration.
- [x] Sem seed.
- [x] Sem push, merge ou tag nesta rodada.

## Comandos esperados antes do PR

- npm test
- npm run test
- npx tsc --noEmit
- npm run smoke:marketing
- npm run dogfood:marketing
- npm run health:routes
- npm run build
- npm run dev -- --port 3010
- npm run health:routes:local
- git diff --check
- git diff --cached --check

## Push futuro sugerido

Nao executar nesta rodada:

```bash
git push -u origin codex/marketing-os-v4-qa-dogfooding-pr-readiness
```
