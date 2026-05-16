# v1.4 - Importacao CSV/Planilha

## Objetivo

A v1.4 adiciona uma etapa assistida para importar dados semanais a partir de CSV, TSV ou texto copiado de planilha.

Ela nao substitui a revisao humana: a tabela e convertida para texto `campo: valor`, passa pela importacao assistida existente e so depois pode ser aplicada aos campos da semana.

## O que entrou

- Parser puro `lib/weeklyCsvImport.ts`.
- Painel "Importacao por CSV/planilha" em `/data`.
- Campo para colar CSV/TSV.
- Carregamento local de arquivos `.csv`, `.tsv` ou `.txt`.
- Previa do texto convertido para importacao assistida.
- Botao para enviar o resultado ao fluxo de importacao assistida.
- Testes em `tests/weeklyCsvImport.test.ts`.

## Formatos aceitos

Tabela campo/valor:

```text
Campo;Valor
Periodo;11/05/2026 a 17/05/2026
Rotulo da semana;Semana 11/05 a 17/05/2026
Investimento Meta Ads;R$ 780,00
Conversas Meta;118
Stories publicados;42
```

Tabela larga com cabecalho:

```text
Periodo,Rotulo da semana,Investimento Meta Ads,Conversas Meta
"11/05/2026 a 17/05/2026","Semana 11/05 a 17/05/2026","R$ 780,00",118
```

TSV copiado de planilha:

```text
Campo	Valor
Investimento Google Ads	220
Conversoes Google Ads	0
Consultas marcadas	12
```

## Regras de seguranca

- Usar apenas numeros consolidados.
- Nao importar nomes, telefones, DMs, conversas individuais ou dados clinicos.
- Linhas sensiveis geram alerta de revisao humana.
- O CSV nao salva nada sozinho.
- A aplicacao final continua dependendo de revisao e clique manual.

## O que a v1.4 nao faz

- Nao le arquivos `.xlsx` diretamente.
- Nao conecta Google Sheets.
- Nao conecta APIs de Meta, Instagram ou Google.
- Nao usa tokens.
- Nao cria credenciais.
- Nao altera schema Prisma.
- Nao cria migration.
- Nao roda seed.

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
- `tests/weeklyCollectionTemplate.test.ts`

## Proxima evolucao

Depois da importacao CSV/TSV, os proximos passos naturais sao:

- mapeamento manual de colunas quando o nome do cabecalho nao for reconhecido;
- historico de importacoes;
- validacao visual de campos obrigatorios antes de aplicar;
- suporte real a `.xlsx` somente se houver decisao de dependencia;
- integracoes oficiais apenas depois de validar o fluxo manual.
