# Weekly Collection Workspace v3.0

## Objetivo

A v3.0 adiciona um workspace local para acompanhar a coleta semanal no navegador.

Depois da v2.8 criar o plano e da v2.9 criar o pacote copiavel, esta camada permite marcar o andamento dos itens como:

- pendente;
- coletado;
- bloqueado.

## Onde aparece

- Em `/data`, logo abaixo do plano de coleta da proxima semana.
- Em `/data/collection-workspace`, como rota dedicada de referencia.

## O que faz

- Transforma tarefas, rotina diaria, fechamento semanal e gates finais em checklist.
- Calcula progresso: concluidos, pendentes, bloqueados e percentual.
- Salva o progresso apenas no navegador via `localStorage`.
- Permite copiar um resumo de status para revisao manual.
- Permite resetar o checklist local.
- Nao oferece campo de texto livre, para reduzir risco de dado pessoal.

## O que nao faz

- Nao salva progresso no banco.
- Nao cria tabela, schema Prisma ou migration.
- Nao envia mensagens.
- Nao conecta APIs, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao publica conteudo.
- Nao altera campanhas.
- Nao usa dados reais, pacientes, DMs, prints, nomes, telefones ou informacao clinica.
- Nao substitui revisao humana.

## Modelo de armazenamento

O estado salvo localmente contem somente:

- id do item;
- status: `pending`, `done` ou `blocked`;
- timestamp local de atualizacao.

Nao ha campo para observacoes, nomes, conversas, links privados ou qualquer dado identificavel.

## Guardrails

O workspace sempre reforca:

- registrar somente status de tarefa;
- usar metricas agregadas;
- nao usar dado pessoal ou clinico;
- nao conectar API externa;
- nao usar Dezembro/2025 como benchmark normal;
- revisar manualmente antes de salvar em `/data`.

## Como testar

```bash
npm test -- --run tests/weeklyCollectionWorkspace.test.ts tests/weeklyNextCollectionPacket.test.ts tests/weeklyNextCollectionPlan.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Exportar o status como Markdown baixavel.
- Mostrar historico local de resets sem dados pessoais.
- Conectar o checklist ao board de execucao semanal sem persistir dados reais.
- Medir quais fontes ficam bloqueadas com mais frequencia usando apenas agregados.
