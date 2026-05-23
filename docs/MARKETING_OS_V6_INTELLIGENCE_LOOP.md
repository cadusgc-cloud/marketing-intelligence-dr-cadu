# Marketing OS v6 - Intelligence Loop

## Visao geral

A V6 fecha o ciclo local de inteligencia editorial do Marketing Intelligence OS - Dr. Cadu. Ela transforma metricas manuais agregadas em aprendizado, prioridade, experimentos seguros, calendario adaptativo e estrategia 30/60/90 dias.

O modulo continua interno, deterministico e sem integracao externa. Nenhuma rota publica conteudo, chama rede social, usa API, envia mensagem, faz upload ou grava dado sensivel.

## Rotas

- `/insights`: painel de aprendizado editorial, top conteudos, pilares, formatos, mapa de oportunidades e proximas melhores acoes.
- `/metrics`: area para colar TSV/CSV manual, validar colunas, normalizar metricas e exportar relatorio.
- `/experiments`: experimentos editoriais seguros, como tema A/B, hook A/B, formato e tom.
- `/strategy`: roadmap adaptativo de 30, 60 e 90 dias, proximos 7 dias e exports.

## Metricas manuais

As metricas devem ser inseridas manualmente e de forma agregada. Colunas aceitas:

`Data`, `Canal`, `Formato`, `Tema`, `Pilar`, `Titulo`, `Impressoes`, `Alcance`, `Curtidas`, `Comentarios`, `Compartilhamentos`, `Salvamentos`, `Respostas`, `Cliques`, `Visitas ao perfil`, `DMs`, `Retencao`, `Status`, `Risco`, `Esforco`, `Observacoes`.

Tambem sao aceitos cabecalhos em ingles, como `date`, `channel`, `format`, `theme`, `pillar`, `impressions`, `reach`, `likes`, `comments`, `shares`, `saves`, `replies`, `clicks`, `profileVisits`, `dms`, `effort`, `risk` e `notes`.

## Scores

O score editorial combina:

- engagementScore
- saveShareScore
- conversationScore
- reachScore
- efficiencyScore
- safetyPenalty
- effortPenalty
- strategicFitScore
- repeatPotentialScore
- overallPerformanceScore

Salvamentos e compartilhamentos pesam mais que curtidas. Respostas e DMs sao sinais editoriais agregados, nao conversao medica automatica. Conteudo inseguro recebe penalidade e pode ser bloqueado.

## Learning Loop

O relatorio responde:

- o que repetir;
- o que variar;
- o que pausar;
- o que transformar em reel;
- o que transformar em carrossel;
- o que transformar em stories;
- quais pilares e formatos estao fortes;
- quais temas pedem novo teste;
- quais proximas acoes devem ir para Content Studio, Recording ou Strategy.

## Experimentos

Experimentos suportados:

- tema A vs tema B;
- hook A vs hook B;
- story vs reel;
- carrossel educativo vs post estatico;
- tom reflexivo vs tecnico simples;
- inicio de semana vs fim de semana;
- curto vs levemente explicativo.

Todo experimento inclui hipotese, variantes, metrica primaria, metrica secundaria, duracao sugerida, criterio de sucesso, risco e checklist de seguranca.

## Roadmap 30/60/90

- 30 dias: execucao com base nos temas mais fortes e entrada manual de metricas.
- 60 dias: consolidacao de formatos, series e gravacao em lote.
- 90 dias: autoridade, biblioteca e ciclos mensais de aprendizado.

## Calendario adaptativo

A V6 gera proximos 7 dias sugeridos com tema, pilar, formato, justificativa, safety e texto para Google Agenda. O calendario real nao e alterado automaticamente.

## Integracao com V5

As recomendacoes apontam para:

- `/studio` para gerar pacote de conteudo;
- `/recording` para planejar gravacao em lote;
- `/review` para revisar conteudos;
- `/operations` para acompanhar execucao;
- `/exports` para copiar pacotes manuais.

## Limites eticos e de seguranca

O sistema nao deve receber:

- dados pessoais;
- prontuarios;
- imagens ou nomes identificaveis;
- localizacao real;
- credenciais;
- casos clinicos reais;
- antes/depois;
- promessas de resultado;
- diagnostico ou prescricao individual.

Recomendacoes sao apoio editorial interno e devem ser revisadas por uma pessoa antes de qualquer decisao de investimento, gravacao ou publicacao.

## Scripts

```bash
npm run intelligence:check
npm run qa:intelligence
npm run health:routes
npm run health:routes:local
```

## Relatorios

Os relatorios versionados ficam em:

`reports/marketing-os-v6/`

Arquivos principais:

- `intelligence-summary.md`
- `metrics-sample-report.md`
- `learning-loop-report.md`
- `experiment-plan.md`
- `strategy-roadmap.md`
- `next-best-actions.md`
- `adaptive-calendar.md`
- `content-opportunity-map.md`
- `intelligence-quality-report.md`
- `export-samples.md`
- `pr-readiness-v6.md`

## Troubleshooting

- Se o dev server abrir sem CSS depois de `npm run build`, reinicie o servidor local e, somente se necessario, remova cache `.next`.
- Se a porta `3010` estiver ocupada, valide qual processo esta ouvindo antes de iniciar outro.
- Se o parser bloquear uma linha, remova termos sensiveis e mantenha apenas metricas agregadas.
- Se o score parecer baixo, verifique esforco, risco e se o conteudo tem salvamentos/compartilhamentos suficientes.

## Proximos passos

1. Usar `/metrics` com metricas manuais reais e agregadas.
2. Conferir `/insights`.
3. Transformar as 3 melhores recomendacoes em pacotes no `/studio`.
4. Usar `/strategy` para planejar a proxima semana.
5. Repetir o ciclo semanalmente.
