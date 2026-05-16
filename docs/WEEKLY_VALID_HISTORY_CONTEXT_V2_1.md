# Weekly Valid History Context v2.1

## Objetivo

Adicionar ao Weekly Command Center uma leitura de contexto com semanas anteriores validas. A ideia e evitar que a semana atual seja interpretada apenas contra a semana imediatamente anterior quando ja existe historico salvo suficiente.

## O que foi adicionado

- Busca de uma janela recente de semanas anteriores validas.
- Exclusao deterministica de semanas que cruzam dezembro/2025.
- Media simples das metricas agregadas disponiveis.
- Classificacao da semana atual como acima da media, abaixo da media, perto da media, sem dado ou sem historico suficiente.
- Painel visual em `/weekly` chamado "Contexto das semanas validas".

## Metricas acompanhadas

- Visitas ao perfil Instagram.
- Conteudo publicado.
- Stories.
- Reels/Shorts.
- Conversas Meta.
- WhatsApps totais.
- Conversas qualificadas.
- Conversoes Google.
- Consultas marcadas, quando preenchidas.

## Guardrails

- Dezembro/2025 permanece fora de medias, benchmarks, projecoes e recomendacoes.
- A media historica recente nao e previsao de resultado.
- A leitura usa apenas metricas agregadas.
- O painel nao publica, nao envia mensagens e nao aciona equipe externa.
- Team Audit Mode permanece interno por padrao.

## Limites da versao

- A media e simples, sem ponderacao por investimento ou mix de canais.
- Nao ha ranking real de criativos por funcao editorial ainda.
- Sem dados de alcance, impressoes, interacoes e seguidores no modelo semanal, esses campos continuam como estado vazio seguro.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Em `/weekly`, conferir se o painel "Contexto das semanas validas" aparece e se a pagina continua mostrando diagnostico executivo, Cadencia x Qualidade, sinais, Stories e plano da proxima semana.
