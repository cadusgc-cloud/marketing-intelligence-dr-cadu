# Weekly Save Confirmation Focus v3.7

## Objetivo

A v3.7 adiciona um primeiro foco acionavel ao gate final de salvamento da semana em `/data`.

Em vez de obrigar a leitura de todos os checks antes de agir, o painel destaca o primeiro ponto que precisa de atencao:

- primeiro bloqueio, quando existir;
- primeira revisao, quando nao houver bloqueio;
- acao de salvamento manual, quando todos os checks estiverem ok.

## Onde aparece

- Em `/data`, dentro do painel "Gate final v3.7".
- O bloco fica acima dos cards de checks e aponta para a area interna correspondente.

## Como funciona

O dominio puro `lib/weeklySaveConfirmationGate.ts` agora retorna `focus` junto com o status geral do gate.

O foco contem:

- status: `ok`, `review` ou `blocked`;
- titulo;
- detalhe;
- area sugerida;
- link interno;
- acao pratica.

A prioridade e deterministica:

1. Formulario semanal.
2. Mapa de origem.
3. Prontidao por fonte.
4. Privacidade e seguranca.
5. Revisao humana.

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
npm test -- --run tests/weeklySaveConfirmationGate.test.ts tests/weeklyDataInput.test.ts tests/weeklySourceEvidenceLedger.test.ts
npm test
npx tsc --noEmit
npm run build
git diff --check
```

## Proximas melhorias possiveis

- Criar impressao local compacta da conferencia final.
- Exibir uma revisao compacta depois que a semana for salva.
- Permitir filtro visual por bloqueio, revisao e ok sem salvar estado sensivel.
