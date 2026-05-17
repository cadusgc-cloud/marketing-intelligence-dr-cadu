# Weekly Next Collection Packet v2.9

## Objetivo

A v2.9 transforma o plano de coleta da proxima semana em um pacote copiavel.

A v2.8 ja cria tarefas, responsaveis sugeridos, cadencia, evidencias e criterios de aceite. A v2.9 organiza isso em artefatos de uso manual:

- plano completo;
- roteiro diario;
- fechamento semanal;
- handoff interno;
- briefs por responsavel sugerido.

## Onde aparece

1. Em `/data`, no painel "Plano de coleta da proxima semana", com o botao "Copiar pacote completo".
2. Em `/data/next-collection-plan`, como tela dedicada de referencia e revisao.

A rota dedicada usa dados simulados como modelo operacional. O pacote calculado a partir dos campos atuais fica disponivel no painel de `/data`.

## O que faz

- Gera um texto completo para copiar.
- Agrupa tarefas por responsavel sugerido.
- Mantem checklist diario e checklist de fechamento semanal.
- Inclui handoff interno seguro.
- Lista limites fixos de privacidade, governanca e ausencia de automacao.
- Linka de volta para `/data`, `/data/collection-guide`, `/data/collection-packet` e `/weekly`.

## O que nao faz

- Nao envia o handoff.
- Nao publica conteudo.
- Nao conecta Instagram, Meta, Google, WhatsApp, e-mail ou APIs externas.
- Nao usa OAuth, scraping, token ou credencial.
- Nao salva nada no banco.
- Nao altera schema Prisma.
- Nao cria migration.
- Nao usa dados reais ou pessoais.
- Nao substitui revisao humana.

## Guardrails

O pacote sempre reforca:

- usar somente totais agregados;
- nao incluir nomes, DMs, conversas, prints privados, dados clinicos ou pacientes;
- nao conectar API externa;
- nao enviar automaticamente;
- nao usar Dezembro/2025 como benchmark normal;
- revisar manualmente antes de salvar em `/data`.

## Uso operacional

1. Abrir `/data`.
2. Preencher ou importar metricas agregadas.
3. Revisar a prontidao por fonte.
4. Ler o plano de coleta da proxima semana.
5. Copiar o pacote completo, se fizer sentido.
6. Revisar manualmente antes de usar qualquer texto fora do sistema.
7. Salvar a semana somente depois de checar periodo, privacidade e dados ausentes.

## Como testar

```bash
npm test -- --run tests/weeklyNextCollectionPacket.test.ts tests/weeklyNextCollectionPlan.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Criar estado local para marcar tarefas como coletadas sem salvar dados reais.
- Gerar historico de fontes frequentemente incompletas.
- Conectar o pacote ao board de execucao semanal.
- Exportar o pacote em Markdown baixavel.
- Manter qualquer integracao oficial como decisao futura separada, com custo, privacidade e governanca aprovados.
