# PR Readiness - Marketing OS v5

## Branches

- Base esperada: branch atual de produto apos V4.
- Feature: `codex/marketing-os-v5-content-studio`.

## Commit esperado

```text
feat: adicionar content studio do marketing os v5
```

## Escopo

- Content Studio local em `/studio`.
- Biblioteca editorial em `/library`.
- Planejamento de gravacao em `/recording`.
- Fila de revisao/producao em `/review`.
- Dominio puro em `lib/content-studio/`.
- Script `npm run studio:check`.
- Relatorios versionados em `reports/marketing-os-v5/`.

## Rotas novas

- `/studio`
- `/library`
- `/recording`
- `/review`

## Dominios novos

- `lib/content-studio/types.ts`
- `lib/content-studio/library.ts`
- `lib/content-studio/voice.ts`
- `lib/content-studio/quality.ts`
- `lib/content-studio/composer.ts`
- `lib/content-studio/variants.ts`
- `lib/content-studio/recording.ts`
- `lib/content-studio/queues.ts`
- `lib/content-studio/exports.ts`
- `lib/content-studio/reports.ts`
- `lib/content-studio/index.ts`

## Scripts novos

- `npm run studio:check`
- `npm run qa:studio`

## Validacoes esperadas

```bash
npm test
npm run test
npx tsc --noEmit
npm run smoke:marketing
npm run dogfood:marketing
npm run qa:marketing
npm run studio:check
npm run health:routes
npm run build
npm run health:routes:local
git diff --check
git diff --cached --check
```

## Checklist de seguranca

- [x] Sem API externa.
- [x] Sem publicacao automatica.
- [x] Sem upload real.
- [x] Sem dados de paciente.
- [x] Sem `.env`.
- [x] Sem banco real, migration ou seed.
- [x] Sem push, merge ou tag nesta rodada.
- [x] Termos de risco tratados por quality/safety.
- [x] Revisao humana obrigatoria antes de uso externo.

## Riscos remanescentes

- O sistema ainda e local e deterministico; nao entende contexto real do dia.
- As sugestoes de midia sao placeholders editoriais, nao arquivos reais.
- Qualquer uso externo depende de revisao humana.

## Como testar localmente

1. Rodar as validacoes listadas.
2. Subir `npm run dev -- --port 3010`.
3. Abrir:
   - `http://localhost:3010/studio`
   - `http://localhost:3010/library`
   - `http://localhost:3010/recording`
   - `http://localhost:3010/review`
4. Conferir CSS, exportacoes e ausencia de tela branca.

## Push futuro

Nao executado nesta rodada. Quando aprovado:

```bash
git push -u origin codex/marketing-os-v5-content-studio
```
