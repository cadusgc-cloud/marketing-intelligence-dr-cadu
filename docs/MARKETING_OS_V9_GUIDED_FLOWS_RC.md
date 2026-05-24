# Marketing OS v9 - Fluxos Guiados, Command Center e Release Candidate

## Visao geral

A V9 transforma o Marketing OS em um produto operacional guiado. Em vez de o usuario lembrar a ordem das rotas, o sistema apresenta um Command Center, uma lista de fluxos passo a passo, um runner local, uma proxima acao recomendada e uma tela de Release Candidate.

Tudo permanece local, deterministico e seguro. A V9 nao conecta APIs, nao publica conteudo, nao faz upload, nao altera banco, nao usa dados de pacientes e nao modifica `.env`.

## Command Center

A rota `/command-center` e a entrada principal. Ela responde "o que eu faco agora?" mostrando:

- status geral do sistema;
- workspace ativo e semana ativa;
- proxima acao operacional;
- fluxos prioritarios;
- alertas de workspace, safety e QA;
- atalhos para fechamento semanal, importacoes, performance, estrategia, studio, gravacao, revisao, exports, workspace, runbook e release;
- status resumido de release readiness.

## Fluxos Guiados

A rota `/flows` lista o catalogo operacional. Cada fluxo tem duracao, complexidade, pre-requisitos, etapas, rotas relacionadas, outputs e riscos.

Fluxos principais:

- Fechamento semanal completo;
- Importar relatorio manual;
- Gerar plano da proxima semana;
- Produzir conteudo da semana;
- Planejar gravacao em lote;
- Revisar conteudos antes de publicar manualmente;
- Exportar pacote para Etus/manual;
- Gerar campanha mensal;
- Rodar auditoria de seguranca;
- Fazer backup local;
- Restaurar backup tecnico;
- Preparar PR/release local;
- Criar experimento editorial;
- Revisar performance semanal;
- Montar pacote de stories do dia.

## Executar fluxo

A rota dinamica `/flows/[id]` abre o runner do fluxo. O runner mostra:

- pre-requisitos;
- etapas;
- progresso local;
- validacoes;
- saidas esperadas;
- checklist;
- exportacao do fluxo.

O progresso e opcional e fica apenas no navegador via localStorage quando disponivel. O sistema nao executa acoes externas.

## Release Candidate

A rota `/release` mostra se o projeto esta pronto para push/PR do ponto de vista local. Ela inclui checklist de rotas, scripts, docs, seguranca, riscos remanescentes, rascunho de PR e comando futuro de push como texto.

O sistema nao executa push, merge, tag ou chamada para GitHub.

## Onboarding

A rota `/onboarding` orienta o uso do zero:

1. Abrir `/command-center`.
2. Ver a proxima acao.
3. Abrir `/flows`.
4. Executar fechamento semanal.
5. Importar metricas manuais.
6. Gerar plano.
7. Abrir `/studio`.
8. Revisar em `/review`.
9. Exportar em `/exports`.
10. Criar backup em `/workspace`.

## Proxima acao

O motor `generateNextOperationalAction` considera workspace, importacao, fechamento semanal, safety, backup e contexto operacional. Ele retorna acao principal, motivo, rota, tempo estimado, risco, pre-requisitos, output esperado e alternativa curta.

## Preparar PR local

Use `/release` e os scripts:

```bash
npm run flows:check
npm run rc:check
npm run qa:flows
npm run health:routes
npm run build
```

Depois, se tudo estiver aprovado, o usuario pode executar manualmente:

```bash
git push -u origin codex/marketing-os-v9-guided-flows-rc
```

## Limites eticos e seguranca

- Sem API externa.
- Sem publicacao automatica.
- Sem upload.
- Sem backend real.
- Sem dados de pacientes.
- Sem prontuario, documento medico, token, senha, cookie ou segredo.
- Sem promessa de resultado.
- Sem antes/depois.
- Sem CTA agressivo.
- Sem diagnostico ou prescricao individual.

## Scripts novos

```bash
npm run flows:check
npm run rc:check
npm run qa:flows
```

## Relatorios

Os relatorios versionados ficam em `reports/marketing-os-v9/`:

- `command-center-summary.md`;
- `guided-flows-catalog.md`;
- `flow-runner-report.md`;
- `next-action-report.md`;
- `release-readiness-report.md`;
- `pr-draft.md`;
- `onboarding-report.md`;
- `workflow-quality-report.md`;
- `route-health-v9.md`;
- `pr-readiness-v9.md`.

## Troubleshooting

Se o dev server abrir sem CSS apos `npm run build`, pare o processo antigo, reinicie `npm run dev -- --port 3010` e rode `npm run health:routes:local`.

Se a porta 3010 estiver ocupada, identifique o processo antigo antes de reiniciar.

Se o runner nao salvar progresso, o navegador pode estar bloqueando localStorage. O fluxo continua funcionando sem persistencia.

## Proximos passos

Depois do PR da V9, o proximo ciclo pode consolidar UX, reduzir duplicidade visual entre rotas e transformar o Command Center na home principal.
