# Weekly Next Week Levers v2.2

## Objetivo

Adicionar ao Weekly Command Center uma camada de prioridades para a proxima semana. A camada transforma sinais, contexto historico, cadencia, funil, Meta, Google e Team Audit Mode em alavancas internas ranqueadas.

## O que a camada faz

- Ranqueia alavancas com score deterministico.
- Separa a acao recomendada em repetir, ajustar, pausar ou testar.
- Mostra area responsavel: Meta, Google, Instagram, conteudo, comercial, tracking ou equipe.
- Explica racional, evidencias, responsavel sugerido, janela de acao e guardrail.
- Mantem a leitura como apoio interno para revisao humana.

## Exemplos de alavancas

- Recuperar cadencia organica antes de julgar qualidade.
- Repetir padrao de Meta que gerou demanda agregada.
- Segurar escala de Google ate validar conversoes.
- Fechar lacunas do funil comercial.
- Testar hipotese de qualidade criativa.
- Auditar passagem de demanda para conversa qualificada.
- Usar Team Audit Mode internamente.

## Guardrails

- Nao publica conteudo.
- Nao envia recomendacoes para a equipe automaticamente.
- Nao conecta APIs externas.
- Nao usa dados pessoais, DMs, prontuarios, nomes, prints ou fotos privadas.
- Nao usa dezembro/2025 como benchmark normal.
- Nao autoriza decisao automatica de verba, equipe ou comunicacao.

## Como testar

```bash
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Na tela `/weekly`, conferir o bloco "Prioridades da proxima semana" abaixo do plano da proxima semana.

## Limites da versao

- O score e heuristico e conservador.
- O ranking ainda nao usa ranking real por criativo individual.
- A alavanca de equipe continua apenas interna, respeitando Team Audit Mode.
