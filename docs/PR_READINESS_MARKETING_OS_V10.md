# PR readiness - Marketing OS v10

## Branches

- Branch base: `codex/marketing-os-v9-guided-flows-rc`
- Branch V10: `codex/marketing-os-v10-product-hardening`

## Escopo

- Product Shell.
- Route Manifest.
- Navegacao global agrupada.
- Home como porta para Command Center.
- Estados vazios e estados de erro.
- Acessibilidade basica.
- UI content QA.
- Visual QA leve.
- Release polish.
- Documentation Hub.

## Rotas novas/alteradas

- `/`
- `/command-center`
- `/flows`
- `/flows/[id]`
- `/release`
- `/onboarding`
- `/documentation`

## Componentes novos

- `components/product/*`
- `lib/product-ui`
- `lib/product-copy`
- `lib/product-routes`
- `lib/ui-quality`
- `lib/release-polish`

## Scripts novos

```bash
npm run ui:a11y
npm run ui:content
npm run visual:check
npm run product:check
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
npm run import:check
npm run weekly:check
npm run qa:weekly
npm run workspace:check
npm run backup:check
npm run qa:workspace
npm run flows:check
npm run rc:check
npm run qa:flows
npm run ui:a11y
npm run ui:content
npm run visual:check
npm run product:check
npm run health:routes
npm run build
npm run health:routes:local
```

## Seguranca

- Sem API externa.
- Sem backend real novo.
- Sem publicacao automatica.
- Sem dados de pacientes.
- Sem upload.
- Sem alteracao de `.env`.
- Sem push, merge ou tag executado.

## Riscos remanescentes

- QA visual leve nao substitui screenshot/manual QA.
- Checker de acessibilidade e estatico.
- Algumas rotas legadas mantem UI anterior para preservar compatibilidade.

## Comando futuro

Nao executar automaticamente:

```bash
git push -u origin codex/marketing-os-v10-product-hardening
```
