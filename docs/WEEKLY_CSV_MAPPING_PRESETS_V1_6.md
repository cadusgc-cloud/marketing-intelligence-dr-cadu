# v1.6 - Presets de mapeamento CSV

## Objetivo

A v1.6 reduz o trabalho manual na importacao semanal por CSV/TSV.

Em vez de mapear cada coluna do zero, o usuario pode escolher um perfil de planilha antes de gerar a previa. O sistema aplica um conjunto inicial de aliases e ainda permite revisar coluna por coluna.

## Presets incluidos

- Detectar automaticamente.
- Planilha semanal consolidada.
- Midia paga.
- Instagram organico.
- Funil comercial.

## Como funciona

1. O usuario escolhe o perfil da planilha em `/data`.
2. O usuario cola ou carrega CSV/TSV local.
3. O sistema detecta cabecalhos e ultima linha de dados.
4. O preset sugere o mapeamento inicial.
5. O usuario revisa cada coluna e pode alterar qualquer campo.
6. A previa continua indo para a importacao assistida antes de aplicar nos dados da semana.

## Seguranca

- Nao conecta APIs externas.
- Nao usa tokens.
- Nao cria credenciais.
- Nao salva automaticamente.
- Nao altera banco.
- Nao altera schema Prisma.
- Nao cria migration.
- Nao roda seed.
- Nao usa dados pessoais.
- Continua exigindo revisao humana antes de aplicar dados.

## Limites

- Preset nao garante que a planilha esteja correta.
- Colunas ambiguas ainda precisam de revisao humana.
- O sistema usa a ultima linha nao vazia como semana atual quando ha varias linhas.
- Arquivos `.xlsx` ainda nao sao lidos diretamente.
- Integracoes oficiais continuam fora do MVP.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Testes principais:

- `tests/weeklyCsvImport.test.ts`
- `tests/weeklyAssistedImport.test.ts`

## Proximas melhorias

- Salvar preset preferido localmente no navegador.
- Criar presets customizados pelo usuario.
- Validar campos obrigatorios antes de enviar para importacao assistida.
- Historico de importacoes revisadas.
- Suporte `.xlsx` apenas se a dependencia for aprovada.
