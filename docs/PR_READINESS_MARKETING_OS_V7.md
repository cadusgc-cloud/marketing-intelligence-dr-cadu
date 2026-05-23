# PR Readiness - Marketing OS v7

## Branch

- Base: `master`
- Feature: `codex/marketing-os-v7-guided-report-import`

## Escopo

- Importacao manual de relatorios em `/imports`.
- Fechamento semanal guiado em `/weekly-review`.
- Performance consolidada em `/performance`.
- Dominio `lib/report-imports`.
- Dominio `lib/weekly-review`.
- Scripts `import:check`, `weekly:check` e `qa:weekly`.
- Relatorios versionados em `reports/marketing-os-v7`.

## Seguranca

- Sem API externa.
- Sem publicacao automatica.
- Sem upload real.
- Sem dados identificaveis.
- Sem alteracao de `.env`.
- Sem migration, seed ou banco real.

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
npm run import:check
npm run weekly:check
npm run qa:weekly
npm run health:routes
npm run build
```

## Riscos remanescentes

- O mapeamento e deterministico; novos formatos de exportacao podem exigir aliases.
- A deteccao sensivel e conservadora, nao substitui revisao humana.
- A comparacao semanal depende de dados completos da semana anterior.

## O que nao foi feito

- Nao houve conexao com Reportei, Instagram, Meta ou Ads.
- Nao houve automacao de postagem.
- Nao houve persistencia em banco.
- Nao houve uso de dados reais.

## Push futuro

Nao executar automaticamente:

```bash
git push -u origin codex/marketing-os-v7-guided-report-import
```
