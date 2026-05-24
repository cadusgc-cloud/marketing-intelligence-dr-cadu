# Marketing OS v8 - Workspace Local, Historico e Recuperacao

## Visao geral

A V8 cria uma camada local de continuidade para o Marketing OS. O objetivo e permitir que o usuario retome o ciclo semanal sem depender de memoria: workspace ativo, historico, snapshots, backup tecnico, restore validado, auditoria local e runbook semanal.

Tudo permanece local, deterministico e manual. Nao ha API externa, backend real, upload, publicacao automatica, credenciais ou dados de pacientes.

## Rotas

- `/workspace`: painel de estado local, snapshots, backup, integridade e atalhos.
- `/history`: historico operacional sanitizado, filtros logicos e exportacao Markdown/TSV.
- `/runbook`: rotina semanal com checklist por dia.
- `/settings`: configuracoes locais em localStorage com fallback seguro.
- `/audit-log`: registro operacional e auditoria local.

## Workspace

O workspace guarda somente dados operacionais nao sensiveis:

- metadata do workspace;
- settings locais;
- ciclo ativo;
- historico sanitizado;
- snapshots sanitizados;
- semanas fechadas agregadas;
- preferencias de visualizacao e execucao.

Nunca deve guardar paciente, prontuario, documento real, senha, cookie, token, segredo, localizacao precisa, login ou dados medicos identificaveis.

## Snapshots

Tipos suportados:

- `daily`
- `weekly`
- `pre_import`
- `post_import`
- `pre_review`
- `post_review`
- `pre_strategy`
- `post_strategy`
- `manual`
- `pre_restore`
- `post_restore`

Cada snapshot tem id, data, tipo, label, resumo, estado sanitizado, checksum simples, status de seguranca, estimativa de tamanho e elegibilidade de restore.

## Backup e restore

O backup e JSON tecnico local. Ele pode ser copiado pelo usuario, mas nao e enviado para servidor.

O restore:

- valida schema;
- valida checksum;
- detecta dados sensiveis;
- cria snapshot `pre_restore`;
- registra evento de historico;
- retorna relatorio de restauracao.

## Historico e auditoria

Eventos suportados incluem:

- `workspace_created`
- `settings_updated`
- `import_started`
- `import_validated`
- `weekly_review_completed`
- `strategy_generated`
- `content_package_generated`
- `recording_session_planned`
- `export_generated`
- `safety_issue_detected`
- `task_completed`
- `snapshot_created`
- `backup_exported`
- `backup_restored`
- `local_data_reset`
- `route_health_checked`
- `qa_checked`

A auditoria detecta dados sensiveis, versao incompativel, snapshots invalidos, eventos sem tipo, semanas duplicadas e metadata perigosa.

## Runbook semanal

O runbook organiza:

- domingo: revisar semana anterior, importar metricas e fechar weekly-review;
- segunda: conferir operations e publicar manualmente apenas depois de revisao;
- terca: usar studio e review;
- quarta: revisar performance parcial;
- quinta: planejar gravacao/edicao;
- sexta: revisar exportacoes;
- sabado: backup, snapshot e reflexao leve.

O runbook nao inventa paciente, cirurgia do dia, localizacao, hospital, consulta ou bastidor em tempo real.

## Scripts

```bash
npm run workspace:check
npm run backup:check
npm run qa:workspace
```

## Troubleshooting

- Se o dev server na porta `3010` retornar 500 apos build, reinicie o processo `next dev`.
- Se o localStorage tiver JSON invalido, o adaptador cai para workspace default seguro.
- Se um backup falhar por checksum, nao restaure.
- Se houver dado sensivel detectado, limpe o texto antes de salvar ou restaurar.

## Proximos passos

- Permitir que cada modulo envie eventos sanitizados para o workspace.
- Criar import/export visual de backup com arquivo local, ainda sem upload.
- Ampliar filtros do historico com estado client-side.
