# Marketing OS v7 - Coleta Semanal Guiada

## Visao geral

A V7 transforma o Marketing Intelligence OS em uma rotina semanal operacional. O usuario cola dados exportados manualmente de Reportei, Instagram Insights, Meta Ads manual, Google Sheets ou CSV/TSV generico, valida a qualidade, consolida a semana e gera plano da proxima semana.

Tudo permanece local, deterministico e sem API externa.

## Rotas

- `/imports`: cola CSV/TSV, escolhe origem, mapeia colunas, valida dados sensiveis e exporta dados normalizados.
- `/weekly-review`: assistente de sete etapas para fechar a semana e gerar plano da proxima semana.
- `/performance`: comparacao semanal, rankings, sinais de oportunidade, gargalos e leitura de Ads manual.

## Como usar

1. Exporte manualmente o relatorio da fonte desejada.
2. Abra `/imports`.
3. Escolha a origem: Reportei, Instagram, Meta Ads manual ou generico.
4. Cole o CSV/TSV.
5. Verifique mapeamento, qualidade, duplicidades, datas e dados sensiveis.
6. Abra `/weekly-review`.
7. Defina o inicio da semana e objetivo.
8. Gere o fechamento e copie as exportacoes.
9. Abra `/performance` para ler rankings e comparacoes.

## Colunas aceitas

O importador reconhece cabecalhos em portugues e ingles:

- Data/date
- Canal/channel
- Tipo/content type/formato
- Publicacao/title/campaign
- Legenda/caption/texto
- Alcance/reach
- Impressoes/impressions
- Curtidas/likes
- Comentarios/comments
- Compartilhamentos/shares
- Salvamentos/saves
- Respostas/replies
- Cliques/clicks
- Visitas ao perfil/profile visits
- Gasto/spend
- CPC, CPM, CTR, frequencia/frequency, leads, results

## Qualidade de importacao

O score considera:

- completude
- aderencia ao schema
- cobertura de datas
- validade das metricas
- duplicidades
- dados sensiveis

Status possiveis: `aprovado`, `revisar`, `bloquear`.

## Dados sensiveis

A V7 sinaliza ou bloqueia:

- CPF, telefone, e-mail e endereco
- prontuario, documento medico e processo judicial
- referencia a paciente ou caso real
- antes/depois
- cirurgia de hoje
- links com token, senha, login ou cookie
- hospital/clinica identificavel

## Fechamento semanal

O fechamento consolida:

- canal
- formato
- pilar
- tema
- dia da semana
- semana atual vs semana anterior
- Ads manual quando houver gasto colado

As conclusoes trazem nivel de confianca e nao devem ser tratadas como verdade absoluta quando os dados estiverem incompletos.

## Plano da proxima semana

O plano gera sete dias com:

- tema
- pilar
- formato
- stories
- midia necessaria
- justificativa baseada nos dados
- safety
- readiness
- TSV e Google Agenda

## Scripts

```bash
npm run import:check
npm run weekly:check
npm run qa:weekly
```

## O que nao faz

- Nao conecta Reportei, Instagram, Meta ou qualquer API.
- Nao publica conteudo.
- Nao cria upload real.
- Nao salva credenciais.
- Nao altera banco.
- Nao usa dados identificaveis.

## Troubleshooting

- Se o dev server ficar sem CSS apos build, reinicie `npm run dev -- --port 3010`.
- Se uma importacao bloquear, confira dados sensiveis, metricas negativas e periodo.
- Se a comparacao ficar com confianca baixa, colete tambem a semana anterior.

## Proximos passos

A evolucao natural e permitir presets salvos localmente de mapeamento e uma rotina de checklist semanal mais integrada ao `/data`, ainda sem API externa.
