# v1.2 — Importacao Assistida de Dados Semanais

## Objetivo

A v1.2 adiciona uma etapa intermediaria antes de qualquer API externa: o usuario pode colar dados agregados de Instagram, Meta Ads, Google Ads e funil comercial em `/data`, gerar uma previa e aplicar os campos detectados aos inputs semanais.

## Por que nao API ainda

- Evita custo e burocracia de OAuth nesta fase.
- Evita tokens e permissoes de Meta/Google antes de validar o fluxo real.
- Mantem o MVP sem integracoes externas.
- Reduz o risco de coletar dados pessoais por engano.
- Permite testar quais metricas realmente sao usadas na Central Semanal.

## O que a importacao aceita

A importacao assistida aceita linhas em texto simples:

```text
Periodo: 11/05/2026 a 17/05/2026
Investimento Meta Ads: R$ 780,00
Conversas Meta: 118
Investimento Google Ads: R$ 220,00
Stories publicados: 42
Consultas marcadas: 12
```

Tambem aceita linhas semicolonadas ou tabuladas:

```text
Investimento Meta Ads;780
Conversas Meta;118
Cliques Google Ads;48
```

## Campos detectados

- Rotulo da semana.
- Inicio e fim do periodo.
- Investimento Meta Ads.
- Conversas Meta/WhatsApp.
- Visitas ao perfil via Meta.
- Investimento Google Ads.
- Cliques e conversoes Google Ads.
- Stories, Reels/Shorts, posts e visitas ao perfil Instagram.
- WhatsApps totais.
- Conversas qualificadas.
- Consultas marcadas e comparecidas.
- Cirurgias fechadas.
- Observacoes.

## Segurança

A importacao e assistida, nao automatica. O usuario precisa:

1. colar dados agregados;
2. gerar a previa;
3. revisar campos detectados;
4. aplicar aos inputs;
5. salvar a semana.

Linhas com termos como paciente, prontuario, CPF, RG, telefone ou conversa individual geram alerta e bloqueiam a aplicacao automatica ate revisao humana.

## O que nao fazer

- Nao colar nomes de pacientes.
- Nao colar telefones.
- Nao colar DMs ou conversas individuais.
- Nao colar prontuarios.
- Nao colar informacoes clinicas identificaveis.
- Nao usar a importacao como integracao automatica com Meta, Instagram ou Google.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Testes principais:

- `tests/weeklyAssistedImport.test.ts`
- `tests/weeklyDataInput.test.ts`
- `tests/weeklyMarketingForm.test.ts`

## Proxima evolucao

Depois que o fluxo de colar/prever/aplicar estiver estavel, os proximos passos naturais sao:

- upload de CSV/Excel;
- mapeamento manual de colunas;
- historico de importacoes;
- integracao Google Ads API;
- integracao Meta/Instagram API.
