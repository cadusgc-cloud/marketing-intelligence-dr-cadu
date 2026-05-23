# Weekly Data Collection Guide v2.5

## Objetivo

A v2.5 cria uma diretriz operacional dentro do produto para responder: de onde tirar os dados semanais antes de preencher `/data`?

O guia fica em:

```text
/data/collection-guide
```

Ele continua manual, deterministico e seguro. Nao usa API externa, nao pede token, nao cria OAuth, nao salva automaticamente e nao altera schema Prisma.

## Principio operacional

Coletar numeros consolidados por semana, revisar manualmente e so entao alimentar o Weekly Command Center.

## Fontes cobertas

### Identidade da semana

- Rotulo da semana.
- Data de inicio.
- Data de fim.

Fonte: calendario operacional interno.

### Instagram organico

- Stories publicados.
- Reels/Shorts publicados.
- Posts publicados.
- Visitas ao perfil Instagram.

Fonte: Instagram Insights, Meta Business Suite, Reportei ou conferencia editorial manual.

Alcance, impressoes e interacoes podem ser registrados em observacoes enquanto nao houver campo dedicado no modelo semanal.

### Meta Ads

- Investimento Meta Ads.
- Conversas Meta.
- Visitas ao perfil Meta, quando disponivel.

Fonte: Meta Ads Manager, Meta Business Suite ou Reportei.

### Google Ads

- Investimento Google Ads.
- Cliques Google Ads.
- Conversoes Google Ads.

Fonte: Google Ads ou relatorio consolidado.

### WhatsApp e funil comercial

- WhatsApps totais.
- Conversas qualificadas.
- Consultas marcadas.
- Consultas comparecidas.
- Cirurgias fechadas.

Fonte: planilha interna, atendimento, agenda ou CRM simples.

### Contexto editorial e anomalias

- Observacoes agregadas.
- Funcoes de conteudo.
- Anomalias operacionais.

Fonte: revisao humana, calendario editorial e observacoes da semana.

## O que nao coletar

- Nomes.
- Telefones.
- DMs.
- Conversas individuais.
- Prints de conversas.
- Dados clinicos.
- Prontuarios.
- Fotos privadas.
- Antes/depois identificavel.
- Credenciais, tokens, senhas ou chaves de API.

## Dezembro/2025

Dezembro/2025 permanece como anomalia operacional por hackeamento e nao deve entrar em medias, benchmarks, projecoes ou recomendacoes normais.

## Fluxo recomendado

1. Abrir `/data/collection-guide`.
2. Fechar o periodo semanal.
3. Coletar Instagram, Meta Ads, Google Ads e funil com o mesmo periodo.
4. Conferir privacidade.
5. Preencher `/data`.
6. Salvar a semana.
7. Abrir `/weekly`.
8. Abrir `/weekly/execution`.
9. Abrir `/weekly/execution/packet`.

## Como testar

```bash
npm test -- --run tests/weeklyDataCollectionGuide.test.ts tests/weeklyCommandCenter.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias

- Modo copiavel do guia.
- Checklist imprimivel.
- Exportacao CSV modelo para coleta.
- Historico de coleta manual, se aprovado.
- Integracoes oficiais apenas depois de fluxo manual validado.
