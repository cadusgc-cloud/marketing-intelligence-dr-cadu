# PR readiness - Marketing OS v4

## Branches

Branch base esperada: `codex/marketing-os-v3-execution-suite` ou a branch que contem a V3.

Branch da feature: `codex/marketing-os-v4-qa-dogfooding-pr-readiness`.

## Escopo da V4

- Semana piloto realista de 2026-05-24 a 2026-05-30.
- Dogfooding engine.
- QA automatico de conteudo.
- Rota `/qa`.
- Scripts de dogfooding e route health.
- Relatorios versionados.
- Integrações de UI em `/operations`, `/campaigns`, `/exports` e `/safety`.

## Rotas afetadas

- `/qa`: nova rota de QA, dogfooding e PR readiness.
- `/operations`: mostra status da semana piloto e link para QA.
- `/campaigns`: permite carregar a Semana Piloto.
- `/exports`: inclui exports da semana piloto.
- `/safety`: inclui safety audit da semana piloto.

## Dominios criados

- `lib/marketing-scenarios/`
- `lib/marketing-quality/`
- `lib/marketing-dogfooding/`

## Scripts criados

```bash
npm run dogfood:marketing
npm run qa:marketing
npm run health:routes
npm run health:routes:local
```

## Testes adicionados

- `tests/marketingV4Dogfooding.test.ts`

Cobertura:

- semana piloto;
- Story QA;
- reels/posts;
- safety;
- exportacoes;
- scripts;
- PR readiness.

## Comandos de validacao

Rodar antes de push/PR:

```bash
npm test
npm run test
npx tsc --noEmit
npm run smoke:marketing
npm run dogfood:marketing
npm run health:routes
npm run build
npm run dev -- --port 3010
npm run health:routes:local
git diff --check
git diff --cached --check
```

## Checklist de seguranca

- [x] Sem API externa.
- [x] Sem publicacao automatica.
- [x] Sem upload.
- [x] Sem conta real.
- [x] Sem dados de pacientes.
- [x] Sem prontuario.
- [x] Sem localizacao real.
- [x] Sem `.env`.
- [x] Sem migration.
- [x] Sem seed.
- [x] Sem push, merge ou tag nesta rodada.

## Como testar localmente

1. Rodar `npm run build`.
2. Rodar `npm run dev -- --port 3010`.
3. Abrir:
   - `http://localhost:3010/`
   - `http://localhost:3010/storyops`
   - `http://localhost:3010/campaigns`
   - `http://localhost:3010/operations`
   - `http://localhost:3010/exports`
   - `http://localhost:3010/safety`
   - `http://localhost:3010/qa`
4. Rodar `npm run health:routes:local`.

## Como abrir PR futuramente

Nao executar push automaticamente nesta rodada. Quando aprovado:

```bash
git push -u origin codex/marketing-os-v4-qa-dogfooding-pr-readiness
```

Depois abrir PR contra a branch correta do projeto, sem merge automatico.

## O que nao foi feito

- Nenhuma integracao real com rede social.
- Nenhuma automacao real de postagem.
- Nenhuma chamada para API externa.
- Nenhuma alteracao de banco.
- Nenhum uso de dado real sensivel.
- Nenhuma alteracao de `.env`.
