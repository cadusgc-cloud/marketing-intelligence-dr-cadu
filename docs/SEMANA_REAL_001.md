# Semana Real 001 - Importacao dos dados reais do Instagram

## O que e

A rota `/real-week` recebe os CSVs exportados manualmente do Meta Business Suite e transforma em:

- painel semanal com dados reais (posts, alcance, curtidas, comentarios, compartilhamentos, salvamentos, alcance da conta e seguidores);
- relatorio exportavel "Baseline da equipe atual", o numero contra o qual a operacao propria vai se provar.

Tudo roda no navegador. Nenhum dado sai da maquina, nenhuma API e chamada, nada e publicado.

## Como exportar do Meta Business Suite

1. Abra business.facebook.com e escolha a conta do consultorio.
2. Menu Insights > Conteudo.
3. Ajuste o periodo para os ultimos 30 dias.
4. Clique em Exportar dados e baixe o CSV. Este e o arquivo de posts.
5. Volte em Insights > Resultados.
6. Mesmo periodo, clique em Exportar e baixe o(s) CSV(s) de alcance por dia e de seguidores. Estes sao os arquivos de conta.

## Como importar no app

1. Abra `/real-week`.
2. Passo 1: envie (ou cole) o CSV de Conteudo. O painel mostra quantos posts foram reconhecidos.
3. Passo 2 (opcional): envie os CSVs de Resultados. Pode enviar mais de um (um de alcance, um de seguidores).
4. Confira o painel semanal e o baseline.
5. Clique em "Salvar semana real no navegador". O dashboard passa a mostrar os numeros reais, separados dos dados de demonstracao.

## O que o import aceita

- Cabecalhos em portugues e em ingles (ex.: "Horario de publicacao"/"Publish time", "Alcance"/"Reach", "Salvamentos"/"Saves").
- Separador virgula, ponto e virgula ou tabulacao.
- Datas dd/mm/aaaa, mm/dd/aaaa (com deteccao automatica) e aaaa-mm-dd.
- Numeros com separador de milhar brasileiro (1.234) e americano (1,234).
- Arquivo com BOM (byte order mark) do Excel.

## Quando o arquivo nao e entendido

O import nunca falha mudo. A tela diz, em portugues:

- qual coluna obrigatoria faltou (ex.: "Nao encontrei a coluna de alcance. Procurei por: Alcance, Reach.");
- qual coluna recomendada faltou (vira aviso, nao bloqueio);
- o que fazer (conferir se o export veio de Insights > Conteudo ou Insights > Resultados).

## Definicoes dos numeros

- Engajamento por post = curtidas + comentarios + compartilhamentos + salvamentos.
- Alcance medio por post = soma do alcance / posts que informaram alcance.
- Taxa de engajamento = engajamento dos posts com alcance / alcance total.
- Crescimento de seguidores: com serie de "Seguidores" (total acumulado), e a diferenca entre o ultimo e o primeiro dia; com "Novos seguidores" (valor diario), e a soma do periodo.
- Semana comeca na segunda-feira.

## O que fica de fora (de proposito)

- Legendas, descricoes e links dos posts nao sao guardados nem exibidos: o painel so precisa dos numeros, e isso elimina qualquer risco de dado sensivel em texto de post.
- Stories nao entram nesta versao: o export de Conteudo do Meta cobre posts do feed/Reels.
- Nenhuma conexao com API do Meta: a coleta e sempre por export manual.

## Testes

Fixtures 100% ficticios em `tests/fixtures/meta/` no formato exato dos exports, e testes em `tests/realWeekImport.test.ts` provando arquivo -> numeros certos no painel semanal e no baseline.

```bash
npm test
```
