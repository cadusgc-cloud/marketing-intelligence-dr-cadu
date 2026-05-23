# Weekly Command Center Result Screen v2.0

## Objetivo

Transformar `/weekly` em uma tela de resultado operacional: ao abrir a Central Semanal, Dr. Cadu deve entender rapidamente o que aconteceu na semana de marketing, quais sinais merecem atencao e qual plano interno deve orientar a proxima semana.

## O que a tela faz

- Resume a semana selecionada com status executivo.
- Compara metricas disponiveis com a semana anterior valida.
- Separa leitura de cadencia e qualidade.
- Mostra sinais positivos, alertas, anomalias e lacunas de dados.
- Mostra aprendizado por funcoes de conteudo: autoridade, confianca, educacao, desejo, conversao e distribuicao.
- Organiza Stories e presenca diaria sem inventar eventos reais.
- Gera um plano interno com o que repetir, ajustar, testar e evitar.
- Mantem Team Audit Mode como leitura interna de execucao.
- Linka os modulos de historico, sinais, auditoria, conteudo, calendario e dados semanais.

## O que a tela nao faz

- Nao publica conteudo.
- Nao envia mensagens para equipe, pacientes, WhatsApp, Instagram ou e-mail.
- Nao conecta APIs externas.
- Nao usa dados pessoais, DMs, prontuarios, nomes, fotos privadas ou material identificavel.
- Nao substitui revisao humana.
- Nao altera schema Prisma, nao cria migration e nao altera banco real.

## Metricas usadas

A camada usa apenas dados agregados ja presentes em `WeeklyMarketingData`:

- visitas ao perfil Instagram;
- volume de conteudo publicado;
- Stories;
- Reels/Shorts;
- posts;
- conversas Meta;
- WhatsApps totais;
- conversas qualificadas;
- conversoes Google;
- consultas marcadas;
- consultas comparecidas;
- cirurgias fechadas;
- custo por conversa Meta;
- taxa de conversao Google.

Campos ainda nao modelados, como alcance, impressoes, interacoes e seguidores, aparecem como estado vazio seguro.

## Cadencia x Qualidade

A leitura separa hipoteses simples:

- queda por cadencia: demanda cai junto com reducao relevante de Stories/Reels/posts;
- queda por qualidade: cadencia esta adequada, mas sinais de demanda pioram;
- crescimento com volume: performance melhora junto com aumento de presenca;
- crescimento com qualidade: performance melhora sem depender claramente de mais volume;
- insuficiente: nao ha semana anterior valida, ha anomalia ou lacunas fortes.

Essa classificacao e deterministica, conservadora e deve orientar conversa humana, nao decisao automatica.

## Dezembro/2025

Dezembro de 2025 continua marcado como anomalia operacional por hackeamento. Semanas que cruzam esse periodo ficam fora de comparacoes normais, benchmarks, medias, projecoes e recomendacoes.

## Team Audit Mode

O painel de Team Audit Mode permanece interno por padrao. Ele ajuda a auditar decisoes e execucao de marketing, mas nao envia recomendacoes para a equipe e nao interfere externamente sem pedido explicito.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Tambem e recomendavel abrir `/weekly` no servidor local e confirmar a presenca das secoes:

- Weekly Command Center;
- Diagnostico executivo;
- Cadencia x Qualidade;
- Sinais;
- Funcoes de conteudo;
- Stories e rotina editorial;
- Plano da proxima semana;
- Team Audit Mode.

## Proximas melhorias

- Salvar classificacao real de conteudo por funcao editorial.
- Criar comparacao visual com tres a quatro semanas validas.
- Adicionar ranking de criativos quando houver dados agregados suficientes.
- Melhorar leitura de historias diarias com resultados semanais consolidados.
- Criar revisao mensal sem incluir dezembro/2025 em benchmarks normais.
