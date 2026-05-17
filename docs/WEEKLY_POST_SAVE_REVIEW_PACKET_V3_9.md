# Weekly Post Save Review Packet v3.9

## Objetivo

A v3.9 transforma a revisao compacta pos-salvamento em um pacote copiavel e abrivel em rota dedicada.

O objetivo e facilitar o uso real depois que a semana foi salva:

- copiar a revisao compacta em Markdown;
- registrar o primeiro passo humano;
- ver o snapshot salvo;
- revisar checklist compacto;
- abrir os modulos certos em seguida.

## Onde aparece

- Botao "Copiar pacote" dentro do painel de revisao pos-salvamento em `/weekly`.
- Link "Abrir pacote completo" dentro do mesmo painel.
- Rota dedicada: `/weekly/post-save-review`.
- A rota aceita `?week=<id>` para abrir uma semana salva especifica.

## Como funciona

O pacote usa a mesma camada pura `lib/weeklyPostSaveReview.ts`.

A rota dedicada carrega:

- semana selecionada ou semana mais recente;
- semanas anteriores validas;
- Weekly Command Center;
- Strategic Decision Layer;
- revisao compacta pos-salvamento.

Depois renderiza um artefato manual com:

- status e confianca;
- primeiro passo;
- snapshot;
- checklist;
- links de continuidade;
- guardrails.

## O que nao faz

- Nao salva automaticamente.
- Nao altera banco, schema Prisma ou migration.
- Nao roda seed.
- Nao conecta API externa, OAuth, scraping, WhatsApp, e-mail ou redes sociais.
- Nao envia recomendacao para equipe.
- Nao publica conteudo.
- Nao usa dado pessoal, clinico, DM, conversa, print privado, prontuario ou paciente.
- Nao usa Dezembro/2025 como benchmark normal, media, score, projecao ou recomendacao.

## Como testar

```bash
npm test -- --run tests/weeklyPostSaveReview.test.ts tests/weeklyCommandResult.test.ts tests/weeklyCommandCenter.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Criar impressao local do pacote.
- Mostrar comparacao visual entre pacote pos-salvamento e pacote manual de execucao.
- Adicionar uma faixa de "decisao humana registrada" sem persistir dados sensiveis.
