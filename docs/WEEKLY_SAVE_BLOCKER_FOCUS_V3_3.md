# Weekly Save Blocker Focus v3.3

## Objetivo

A v3.3 adiciona um primeiro foco acionavel ao handoff pre-salvamento.

Antes, o sistema listava bloqueios e pontos de revisao. Agora ele tambem responde:

- qual e o primeiro ponto provavel a corrigir;
- qual area do formulario ou workspace deve ser aberta;
- qual acao manual executar antes de tentar salvar.

## Onde aparece

- No card "Handoff pre-salvamento da semana" em `/data`.
- Na rota dedicada `/data/collection-workspace`.

## Como funciona

O foco e calculado de forma deterministica a partir de:

- status do gate de coleta;
- bloqueios do formulario;
- pontos de revisao do formulario;
- itens pendentes do workspace local.

## Prioridade de decisao

1. Bloqueio no workspace de coleta.
2. Bloqueio essencial no formulario.
3. Coleta ainda pendente.
4. Gate humano final pendente.
5. Revisao operacional do formulario.
6. Semana pronta para salvar manualmente.

## Alvos internos

O foco pode apontar para:

- workspace local de coleta;
- validacao antes de salvar;
- dados da semana;
- midia paga;
- Instagram organico;
- funil comercial;
- botao de salvamento manual.

Os links sao apenas ancoras internas. Nao enviam dados, nao salvam nada e nao conectam servicos externos.

## O que nao faz

- Nao salva automaticamente.
- Nao altera banco.
- Nao cria schema Prisma ou migration.
- Nao roda seed.
- Nao conecta API externa, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao envia recomendacao para equipe.
- Nao publica conteudo.
- Nao usa dado pessoal, clinico, DM, conversa, print privado ou paciente.

## Como testar

```bash
npm test -- --run tests/weeklyCollectionSaveHandoff.test.ts tests/weeklyCollectionWorkspace.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Destacar visualmente o grupo do formulario que recebeu foco.
- Persistir apenas o ultimo foco calculado no navegador, sem texto livre.
- Criar uma trilha de revisao manual exportavel em Markdown.
