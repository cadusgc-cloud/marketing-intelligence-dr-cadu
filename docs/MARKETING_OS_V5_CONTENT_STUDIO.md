# Marketing OS v5 - Content Studio

## Visao geral

A V5 adiciona uma fabrica editorial local para transformar pilares e temas em pacotes completos de producao: stories, reels, carrosseis, posts, legendas, briefing para editor, checklist de midia, fila de revisao e planejamento de gravacao em lote.

O sistema continua interno, deterministico e manual. Ele nao publica, nao envia arquivos, nao chama APIs externas e nao usa dados de pacientes.

## Rotas

- `/studio`: gera pacote completo de conteudo para um tema.
- `/library`: mostra biblioteca editorial, pilares, temas, hooks, frases e templates.
- `/recording`: planeja uma sessao de 8 a 10 videos curtos.
- `/review`: mostra fila de revisao e fila de producao.
- `/exports`: inclui exportacoes V5.
- `/safety`: inclui quality unificado do Content Studio.
- `/qa`: inclui o resultado do check V5.

## Como usar `/studio`

1. Escolher um tema seguro.
2. Escolher um pilar editorial.
3. Escolher o formato principal.
4. Revisar scores de voz, safety e readiness.
5. Copiar pacote completo, briefing, stories ou checklist.
6. Usar apenas em fluxo manual e com revisao humana.

## Como usar `/library`

A biblioteca contem:

- 12 pilares editoriais.
- 60+ temas seguros.
- 80+ hooks.
- 80+ frases curtas de stories.
- 40+ ganchos de reels.
- 20+ templates de carrossel.
- 40+ legendas.
- termos de risco para bloqueio/revisao.

## Como usar `/recording`

A rota gera uma sessao de gravacao mensal com 8 a 10 videos. Cada video tem:

- ordem de gravacao;
- tema;
- fala principal;
- roteiro curto;
- takes de apoio;
- checklist de midia;
- reaproveitamentos;
- nota de seguranca.

## Como usar `/review`

A fila de revisao mostra:

- formato;
- tema;
- status;
- voice score;
- safety score;
- readiness;
- riscos;
- exportacao copiavel.

A fila de producao organiza tarefas de stories, reels, carrosseis, briefing e gravacao.

## Scores

O quality unificado retorna:

- `voiceScore`: aderencia ao tom humano, tecnico simples e anti-marketing elegante.
- `safetyScore`: ausencia de promessa, antes/depois, paciente, local, diagnostico e prescricao.
- `readinessScore`: combinacao operacional para uso manual.
- `status`: aprovado, revisar ou bloquear.

## Regras de seguranca

Bloquear ou revisar:

- promessa de resultado;
- antes/depois;
- paciente ou caso real;
- cirurgia do dia;
- local real;
- prontuario, exame, documento ou tela sensivel;
- diagnostico ou prescricao;
- CTA agressivo;
- urgencia artificial;
- linguagem sensacionalista.

## Exportacoes

A V5 exporta:

- pacote completo do tema;
- pacote de gravacao;
- briefing para editor;
- Google Sheets TSV;
- Google Agenda em texto;
- Etus/manual em texto;
- stories;
- roteiro de reels;
- carrossel;
- legendas;
- checklist de midia;
- checklist de revisao;
- relatorio de QA;
- backup JSON tecnico.

Exportacoes comuns nao mostram JSON bruto. O JSON aparece apenas no backup tecnico.

## Scripts

```bash
npm run studio:check
npm run qa:studio
npm run smoke:marketing
npm run health:routes
npm run health:routes:local
```

## Relatorios

Os snapshots ficam em:

```text
reports/marketing-os-v5/
```

Arquivos principais:

- `content-studio-summary.md`
- `brand-voice-audit.md`
- `library-inventory.md`
- `recording-session-plan.md`
- `production-queue-snapshot.md`
- `review-queue-snapshot.md`
- `studio-quality-report.md`
- `export-samples.md`
- `pr-readiness-v5.md`

## Troubleshooting

Se o dev server ficar sem CSS depois de `npm run build`, reinicie o servidor local. Se persistir, limpar apenas `.next` pode ser aceitavel como cache local seguro, sem apagar codigo ou dados.

Se houver conflito de porta, iniciar com outra porta ou encerrar apenas o processo local do dev server.

Se `studio:check` falhar, revisar primeiro falhas bloqueantes de quality, biblioteca insuficiente ou exportacao vazia.

## O que nao faz

- Nao integra Instagram, Meta, TikTok, YouTube, Google, OpenAI, Etus ou WhatsApp.
- Nao publica automaticamente.
- Nao faz upload real.
- Nao usa banco externo.
- Nao usa dados de pacientes.
- Nao cria autenticacao.
- Nao altera `.env`.

## Proximos passos

- Transformar status de revisao em persistencia local mais rica.
- Permitir importar temas semanais aprovados.
- Conectar futuramente com APIs oficiais somente se aprovado, com credenciais externas e sem dados sensiveis.
