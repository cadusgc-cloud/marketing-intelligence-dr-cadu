# Weekly Collection Packet v2.6

## Objetivo

O Weekly Collection Packet transforma o guia de coleta semanal em artefatos copiaveis para uso manual: checklist, template `campo: valor`, modelo CSV/TSV e handoff interno.

Ele existe para responder, de forma operacional, de onde tirar os dados antes de gerar relatórios no Marketing Intelligence OS. A diretriz continua sendo coleta manual ou deterministica de metricas agregadas.

## O que o pacote faz

- Mostra uma checklist de fechamento da semana.
- Gera um template de texto para preencher Instagram, Meta Ads, Google Ads, WhatsApp/funil e contexto.
- Gera um modelo CSV/TSV com colunas `campo;valor;fonte;observacao`.
- Agrupa handoffs por origem de dado.
- Define gates de privacidade, periodo, revisao humana e bloqueio de envio externo.
- Linka o fluxo para `/data`, `/weekly`, `/weekly/execution` e `/weekly/execution/packet`.

## O que o pacote nao faz

- Nao conecta Instagram, Meta, Google, WhatsApp ou qualquer API externa.
- Nao usa OAuth, tokens, credenciais ou arquivo `.env`.
- Nao publica conteudo.
- Nao envia mensagem para equipe, e-mail, WhatsApp ou rede social.
- Nao salva a semana automaticamente.
- Nao altera campanhas, verba, banco, schema Prisma ou migrations.
- Nao usa dados pessoais, conversas, nomes, prints, fotos privadas ou informacao clinica.

## Fontes manuais previstas

### Instagram organico

Usar Instagram Insights, Meta Business Suite, Reportei ou conferencia editorial para coletar:

- Stories publicados.
- Reels/Shorts publicados.
- Posts publicados.
- Visitas ao perfil.
- Alcance, impressoes e interacoes apenas em observacoes enquanto nao houver campo dedicado.

### Meta Ads

Usar Meta Ads Manager, Meta Business Suite ou relatorio consolidado para coletar:

- Investimento Meta Ads.
- Conversas Meta.
- Visitas ao perfil Meta, quando disponivel.

### Google Ads

Usar Google Ads ou relatorio consolidado para coletar:

- Investimento Google Ads.
- Cliques Google Ads.
- Conversoes Google Ads.

### WhatsApp e funil comercial

Usar planilha interna, atendimento, agenda ou CRM simples para coletar apenas totais:

- WhatsApps totais.
- Conversas qualificadas.
- Consultas marcadas.
- Consultas comparecidas.
- Cirurgias fechadas.

### Contexto editorial e anomalias

Usar revisao humana e calendario editorial para registrar:

- O que foi executado.
- Baixa cadencia, feriado, problema tecnico ou mudanca de campanha.
- Funcoes de conteudo quando houver classificacao.
- Anomalia operacional, incluindo Dezembro/2025 quando aplicavel.

## Gates de revisao

Antes de salvar em `/data`, conferir:

1. Todas as fontes usam o mesmo periodo.
2. O material contem somente metricas agregadas.
3. Zeros e dados ausentes foram diferenciados.
4. Observacoes nao contem dados sensiveis.
5. Dezembro/2025 nao esta sendo usado como benchmark normal.
6. O pacote nao esta sendo usado para enviar ou publicar nada automaticamente.

## Fluxo recomendado

1. Abrir `/data/collection-guide`.
2. Abrir `/data/collection-packet`.
3. Copiar o template mais adequado.
4. Preencher com numeros agregados da semana.
5. Revisar manualmente.
6. Preencher ou importar em `/data`.
7. Salvar a semana.
8. Ler `/weekly`.
9. Abrir `/weekly/execution` e `/weekly/execution/packet` para plano manual.

## Limitacoes

- Ainda depende de coleta manual.
- Alcance, impressoes e interacoes agregadas ficam em observacoes ate haver campo dedicado.
- Handoff interno e apenas texto copiavel, nao envio automatico.
- O pacote nao substitui revisao humana de qualidade, funil, campanha ou comunicacao medica.

## Como testar

```bash
npm test -- --run tests/weeklyCollectionPacket.test.ts tests/weeklyDataCollectionGuide.test.ts tests/weeklyCommandCenter.test.ts tests/weeklyCommandResult.test.ts tests/weeklyManualExecutionPacket.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```
