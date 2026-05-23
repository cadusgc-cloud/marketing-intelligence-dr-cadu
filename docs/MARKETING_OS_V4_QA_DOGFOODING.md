# Marketing OS v4 - QA, dogfooding e semana real

## Visao geral

A V4 transforma o Marketing Intelligence OS em um sistema que prova automaticamente que consegue gerar, validar, auditar e exportar uma semana realista de marketing medico seguro.

O foco nao e publicar. O foco e preparar o trabalho interno: stories, reels, posts, midias naturais, tarefas, exports e safety gate, sempre com revisao humana antes de qualquer uso externo.

## Por que a V4 existe

A V3 criou a Central Operacional. A V4 adiciona uma camada de dogfooding: o proprio sistema usa seus motores para gerar uma semana piloto e depois testa o resultado.

Isso reduz dependencia de revisao manual inicial e cria um pacote de PR readiness.

## Semana piloto

Periodo: 2026-05-24 a 2026-05-30.

Campanha: Semana Piloto - Cirurgia Plastica Sem Promessa.

Temas:

- Domingo: desacelerar, organizar ideias e expectativa realista.
- Segunda: cirurgia plastica nao combina com pressa.
- Terca: naturalidade tambem e planejamento.
- Quarta: consulta nao e venda.
- Quinta: cicatrizacao e paciencia.
- Sexta: o que o marketing nao mostra.
- Sabado: estetica natural e identidade.

## Dogfooding

O dogfooding fica em `lib/marketing-dogfooding/`.

Ele:

- gera a semana piloto;
- reutiliza StoryOps;
- reutiliza a camada mensal;
- reutiliza Marketing Ops;
- roda QA automatico;
- valida exports;
- calcula readiness;
- retorna status final: `aprovado`, `revisar` ou `bloqueado`.

Comando:

```bash
npm run dogfood:marketing
```

## QA automatico

O QA fica em `lib/marketing-quality/`.

Ele valida:

- 6 stories por dia;
- texto curto de story;
- midia sugerida;
- observacao de seguranca;
- reels com gancho, roteiro e texto na tela;
- posts/carrosseis com estrutura segura;
- termos proibidos;
- exportacoes Google Sheets, Google Agenda, Etus/manual e backup JSON;
- ausencia de JSON bruto em exports comuns;
- readiness entre 0 e 100.

## Safety gate

O safety gate bloqueia ou alerta sobre:

- promessa de resultado;
- antes/depois;
- CTA agressivo;
- diagnostico;
- prescricao;
- conduta individual;
- paciente, prontuario, documento ou exame;
- localizacao real;
- bastidor inventado;
- urgencia artificial;
- tom comercial exagerado.

## Route health

O script `npm run health:routes` valida rotas e motores sem servidor.

Com o dev server ativo:

```bash
npm run health:routes:local
```

Rotas esperadas:

- `/`
- `/storyops`
- `/campaigns`
- `/operations`
- `/exports`
- `/safety`
- `/qa`

## Relatorios

Snapshots versionados:

- `reports/marketing-os-v4/pilot-week-summary.md`
- `reports/marketing-os-v4/pilot-week-exports.md`
- `reports/marketing-os-v4/safety-audit.md`
- `reports/marketing-os-v4/qa-report.md`
- `reports/marketing-os-v4/pr-readiness.md`
- `reports/marketing-os-v4/route-health.md`

## Como rodar localmente

```bash
npm install
npm test
npx tsc --noEmit
npm run smoke:marketing
npm run dogfood:marketing
npm run health:routes
npm run build
npm run dev -- --port 3010
```

Com servidor ativo:

```bash
npm run health:routes:local
```

## Troubleshooting

### Dev server sem CSS apos build

Se a UI aparecer sem CSS depois de `npm run build`, reinicie o dev server. O build altera `.next`, e o servidor de desenvolvimento pode ficar visualmente inconsistente ate reiniciar.

Procedimento seguro:

1. Parar o processo na porta local.
2. Reiniciar `npm run dev -- --port 3010`.
3. Reabrir as rotas principais.

### Conflito de porta

Se a porta 3010 estiver ocupada, use outra porta local e ajuste o comando de health:

```bash
npm run dev -- --port 3011
node scripts/marketing-os-route-health.mjs --base http://localhost:3011
```

### Build passa, visual falha

Use `npm run health:routes` para validar motores e arquivos. Depois reinicie o dev server e faca checagem visual.

## O que nao faz

- Nao conecta Instagram, Meta, TikTok, YouTube, Google, Etus, WhatsApp ou OpenAI.
- Nao publica.
- Nao agenda.
- Nao envia mensagem.
- Nao usa paciente, prontuario ou dado sensivel.
- Nao altera banco.
- Nao usa `.env`.

## Proximos passos

- Conectar os exports a um fluxo manual de revisao semanal.
- Criar tela de comparacao entre semana piloto e semana real preenchida pelo usuario.
- Preparar adaptadores futuros, ainda sem chamada real, para importacao manual de relatorios.
