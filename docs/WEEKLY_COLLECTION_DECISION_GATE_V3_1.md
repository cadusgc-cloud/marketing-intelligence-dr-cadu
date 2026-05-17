# Weekly Collection Decision Gate v3.1

## Objetivo

A v3.1 adiciona um gate local de decisao ao workspace de coleta semanal.

Depois da v3.0 permitir marcar o andamento do checklist no navegador, esta camada responde:

- a coleta ja pode seguir para salvamento manual em `/data`;
- ainda falta coleta;
- falta apenas revisao humana final;
- existe bloqueio que impede conclusao forte.

## Onde aparece

- Em `/data`, dentro do workspace local de coleta.
- Em `/data/collection-workspace`, na rota dedicada de referencia.

## O que faz

- Le o estado local do checklist salvo no `localStorage`.
- Classifica o gate como `ready_to_save`, `needs_collection`, `review_required` ou `blocked`.
- Lista proximas acoes manuais.
- Lista perguntas de revisao humana.
- Mostra bloqueios marcados.
- Gera um resumo copiavel para revisao interna.

## O que nao faz

- Nao salva automaticamente a semana.
- Nao salva progresso no banco.
- Nao cria tabela, schema Prisma ou migration.
- Nao roda seed.
- Nao conecta APIs, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao envia mensagens.
- Nao publica conteudo.
- Nao altera campanhas.
- Nao usa dados pessoais, pacientes, DMs, prints, nomes, telefones ou informacao clinica.
- Nao substitui revisao humana.

## Regras de classificacao

1. Se qualquer item estiver `blocked`, o gate fica `blocked`.
2. Se todos os itens de coleta estiverem concluidos e faltarem apenas `review_gate`, o gate fica `review_required`.
3. Se houver qualquer tarefa, rotina diaria ou fechamento pendente, o gate fica `needs_collection`.
4. Se todos os itens estiverem concluidos e nao houver bloqueio, o gate fica `ready_to_save`.

## Modelo de armazenamento

O gate nao cria armazenamento novo.

Ele usa o mesmo estado local do workspace:

- id do item;
- status: `pending`, `done` ou `blocked`;
- timestamp local de atualizacao.

Nao ha campo livre para observacoes, nomes, conversas, links privados ou qualquer dado identificavel.

## Guardrails

O resumo copiavel reforca:

- somente metricas agregadas;
- sem dados pessoais, clinicos, DMs, conversas, prints privados ou pacientes;
- sem API externa, OAuth, scraping, envio automatico ou publicacao;
- Dezembro/2025 fora de benchmark normal;
- revisao humana antes de salvar e antes de qualquer decisao operacional.

## Como testar

```bash
npm test -- --run tests/weeklyCollectionDecisionGate.test.ts tests/weeklyCollectionWorkspace.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Exportar o gate como Markdown baixavel.
- Mostrar a ultima mudanca de status sem texto livre.
- Usar historico agregado para entender quais fontes bloqueiam mais a coleta.
- Conectar o gate ao pacote manual de execucao sem persistir dados reais.
