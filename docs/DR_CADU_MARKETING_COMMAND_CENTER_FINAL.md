# Finalizacao Local do Marketing Intelligence OS - Dr. Cadu

## Objetivo

Esta fase transforma o app em um centro interno local para inteligencia de marketing, analise de conteudo e producao semanal do Dr. Cadu Gazzinelli.

O sistema permanece privado, deterministico e sem integracoes externas reais.

## O que ficou disponivel

- Dashboard principal com resumo da semana, sinais, oportunidades e atalhos.
- Plano semanal com 7 dias, stories diarios e 1 conteudo principal por dia.
- Pacotes completos de conteudo para feed, carrossel, stories, Reels/TikTok/Shorts e YouTube.
- Biblioteca de prompts copiaveis para uso manual no ChatGPT ou ferramenta aprovada.
- Exportacao local em Markdown, JSON e CSV.
- Perfil editorial do Dr. Cadu com pilares, tom de voz, CTAs permitidos, temas sensiveis e termos a evitar.
- Analise local demo com metricas agregadas e sem dados pessoais.
- Interfaces futuras preparadas: AnalyticsProvider, SocialAccountProvider, PublishingProvider, AIProvider e AssetProvider.

## O que o app nao faz

- Nao conecta Meta, Instagram, TikTok, YouTube, Facebook, Google, OpenAI, Etus ou qualquer servico externo.
- Nao publica automaticamente.
- Nao envia mensagens para equipe, pacientes ou usuarios externos.
- Nao usa dados de pacientes, DMs, nomes, prontuarios, fotos privadas ou material identificavel.
- Nao altera banco de producao.
- Nao cria credenciais, tokens, OAuth ou arquivos `.env`.

## Fluxo de uso interno

1. Abrir o dashboard em `/`.
2. Ver diagnostico, sinais, oportunidades e conteudos com maior potencial.
3. Abrir `/plan` para revisar a semana completa.
4. Abrir um pacote em `/content/[id]`.
5. Copiar legenda, hashtags, prompts ou pacote completo.
6. Abrir `/prompts` para prompts avulsos.
7. Abrir `/export` para copiar Markdown, JSON ou CSV.
8. Revisar checklist etico antes de qualquer publicacao manual.

## Guardrails

- Toda recomendacao e interna.
- Todo conteudo exige revisao humana antes de publicacao real.
- Dezembro/2025 segue excluido de benchmarks, medias, scores e recomendacoes normais.
- Termos de promessa, antes/depois indevido, medo como venda e captacao agressiva devem ser bloqueados ou reescritos.

## Integracoes futuras preparadas

- `AnalyticsProvider`: entrada futura de metricas agregadas.
- `SocialAccountProvider`: representacao futura de contas, sem auth atual.
- `PublishingProvider`: preparacao futura de payload manual, sem publicacao automatica.
- `AIProvider`: prompts para uso manual, sem chamada de API.
- `AssetProvider`: biblioteca futura de assets aprovados, sem upload real nesta fase.

## Como validar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Scripts `lint` e `check` devem ser usados se forem adicionados no futuro.
