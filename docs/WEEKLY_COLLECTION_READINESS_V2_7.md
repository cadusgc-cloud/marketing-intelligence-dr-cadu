# Weekly Collection Readiness v2.7

## Objetivo

A camada Weekly Collection Readiness mostra, por fonte de dado, se a coleta semanal esta pronta, incompleta, exige revisao ou deve ficar bloqueada antes do salvamento.

Ela complementa o pacote copiavel de coleta: enquanto o pacote ajuda a copiar e preencher os numeros, a prontidao por fonte ajuda a entender o que ainda falta coletar.

## Onde aparece

A camada aparece em `/data`, logo abaixo da validacao antes de salvar.

Ela avalia:

- Identidade da semana.
- Instagram organico.
- Meta Ads.
- Google Ads.
- WhatsApp e funil comercial.
- Contexto editorial e anomalias.

## O que ela faz

- Calcula um score de coleta de 0 a 100.
- Classifica cada fonte como pronta, revisar, sem coleta ou bloqueada.
- Mostra campos preenchidos e ausentes.
- Lista proximas acoes manuais de coleta.
- Reforca guardrails de privacidade e revisao humana.
- Aponta para `/data/collection-packet` e `/data/collection-guide`.

## O que ela nao faz

- Nao salva dados automaticamente.
- Nao conecta APIs externas.
- Nao usa OAuth, tokens ou credenciais.
- Nao publica conteudo.
- Nao envia mensagens para equipe, WhatsApp, e-mail ou redes sociais.
- Nao altera campanhas, verba, banco, schema Prisma ou migrations.
- Nao substitui revisao humana.

## Regras por fonte

### Identidade da semana

Bloqueia quando faltam rotulo, inicio ou fim.

Marca revisao quando o periodo cruza Dezembro/2025, porque esse periodo segue tratado como anomalia operacional causada por hackeamento e nao entra em benchmarks normais.

### Instagram organico

Avalia Stories, Reels/Shorts, posts e visitas ao perfil.

Quando Stories ou Reels estao abaixo da referencia operacional, a camada pede revisao de cadencia antes de concluir queda de qualidade criativa.

### Meta Ads

Avalia investimento, conversas e visitas agregadas.

Quando ha investimento sem conversas, ou conversas sem investimento, a camada pede conferencia do periodo e da coluna de resultado.

### Google Ads

Avalia investimento, cliques e conversoes.

Quando ha custo ou cliques com conversoes zeradas, a camada mantem Google em diagnostico e bloqueia qualquer leitura de escala automatica.

### Funil comercial

Avalia WhatsApps totais, conversas qualificadas, consultas marcadas, consultas comparecidas e cirurgias fechadas.

Dados nulos indicam ausencia de coleta. Zero pode ser valor real, desde que tenha sido revisado.

### Contexto editorial e anomalias

Avalia se ha observacao operacional.

Bloqueia quando as observacoes parecem conter documento, contato individual, identificacao ou conversa privada.

## Guardrails

- Usar somente metricas agregadas.
- Nao usar nomes, telefones, DMs, conversas, prints privados ou informacao clinica.
- Nao conectar API, OAuth, scraping ou envio externo.
- Nao usar Dezembro/2025 como benchmark normal.
- Revisar manualmente antes de salvar e antes de qualquer decisao de investimento.

## Como testar

```bash
npm test -- --run tests/weeklyCollectionReadiness.test.ts tests/weeklyDataInput.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```
