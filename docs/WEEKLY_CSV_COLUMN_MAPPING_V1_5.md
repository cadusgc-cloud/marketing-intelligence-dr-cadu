# v1.5 - Mapeamento manual de colunas CSV

## Objetivo

A v1.5 torna a importacao CSV/TSV mais flexivel para planilhas reais, em que os nomes das colunas nem sempre batem com os campos internos do Marketing Intelligence OS.

O usuario pode revisar cada coluna, escolher o campo correspondente e ignorar colunas que nao devem entrar na semana.

## O que entrou

- Sugestao automatica de mapeamento para cabecalhos comuns.
- Mapeamento manual de colunas no painel de CSV em `/data`.
- Conversao do mapeamento para linhas `campo: valor`.
- Preservacao do fluxo existente de importacao assistida.
- Alertas quando colunas ficam sem mapeamento.
- Bloqueio visual para possiveis dados sensiveis.
- Testes para cabecalhos desconhecidos, colunas ignoradas e alertas sensiveis.

## Como funciona

1. O usuario cola um CSV/TSV ou carrega um arquivo local.
2. O sistema detecta delimitador, cabecalhos e ultima linha de dados.
3. O sistema sugere campos para cabecalhos conhecidos.
4. O usuario ajusta o mapeamento de cada coluna.
5. O sistema monta uma previa em formato `campo: valor`.
6. A previa passa pela importacao assistida existente.
7. O usuario ainda precisa revisar e aplicar manualmente antes de salvar a semana.

## Campos mapeaveis

- Periodo.
- Rotulo da semana.
- Inicio e fim.
- Investimento, conversas e visitas de Meta Ads.
- Investimento, cliques e conversoes de Google Ads.
- Stories, Reels, posts e visitas ao perfil do Instagram.
- WhatsApps totais e conversas qualificadas.
- Consultas marcadas e comparecidas.
- Cirurgias fechadas.
- Observacoes.

## Regras de seguranca

- Nao conecta APIs externas.
- Nao usa tokens.
- Nao acessa Instagram, Meta Ads, Google Ads ou Google Sheets.
- Nao salva automaticamente.
- Nao altera schema Prisma.
- Nao cria migration.
- Nao roda seed.
- Nao usa dados pessoais.
- Colunas com nomes, telefones, DMs, pacientes ou conversas individuais exigem revisao humana.

## O que a v1.5 nao faz

- Nao le `.xlsx` diretamente.
- Nao cria historico de importacoes.
- Nao deduz a origem oficial dos dados.
- Nao corrige dados errados na planilha.
- Nao toma decisao de investimento.
- Nao substitui revisao humana.

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
- `tests/weeklyDataInput.test.ts`

## Proximas melhorias

- Validacao visual de campos obrigatorios antes de enviar para a importacao assistida.
- Presets de mapeamento por origem de planilha.
- Historico local de importacoes revisadas.
- Suporte `.xlsx` somente se houver decisao sobre dependencia.
- Integracoes oficiais apenas depois de validar o fluxo manual e decidir custos de API.
