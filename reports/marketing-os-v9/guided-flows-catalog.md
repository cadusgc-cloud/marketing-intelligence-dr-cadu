# Catalogo de fluxos guiados V9

Fluxos: 15
Validacao: aprovado

## Fechamento semanal completo
Conduz importacao, validacao, performance, estrategia, snapshot e exportacao da semana.
- ID: fechamento-semanal-completo
- Duracao: 65 min
- Complexidade: alta
- Etapas: 11
- Outputs: Relatorio semanal, Plano da proxima semana, Snapshot local

## Importar relatorio manual
Mapeia CSV/TSV de Reportei, Instagram, Meta Ads, Etus ou generico sem API externa.
- ID: importar-relatorio-manual
- Duracao: 25 min
- Complexidade: media
- Etapas: 7
- Outputs: TSV normalizado, Qualidade da importacao

## Gerar plano da proxima semana
Transforma fechamento semanal e insights em 7 dias sugeridos para execucao manual.
- ID: gerar-plano-proxima-semana
- Duracao: 35 min
- Complexidade: media
- Etapas: 7
- Outputs: Plano de 7 dias, Google Agenda

## Produzir conteudo da semana
Gera pacotes no Content Studio e organiza revisao, exportacao e registro local.
- ID: produzir-conteudo-semana
- Duracao: 55 min
- Complexidade: alta
- Etapas: 7
- Outputs: Pacote completo, Fila de revisao

## Planejar gravacao em lote
Organiza uma sessao de 8 a 10 videos curtos com roteiro, checklist e briefing.
- ID: planejar-gravacao-lote
- Duracao: 40 min
- Complexidade: media
- Etapas: 7
- Outputs: Plano de gravacao, Briefing de editor

## Revisar conteudos antes de publicar manualmente
Filtra pendencias, confere scores e bloqueia qualquer item arriscado.
- ID: revisar-conteudos
- Duracao: 30 min
- Complexidade: media
- Etapas: 7
- Outputs: Checklist de revisao

## Exportar pacote para Etus/manual
Prepara TSV/manual para ferramenta externa sem conectar API nem publicar.
- ID: exportar-etus-manual
- Duracao: 20 min
- Complexidade: baixa
- Etapas: 6
- Outputs: Etus/manual TSV

## Gerar campanha mensal
Monta campanha de 30 dias e conecta prioridades com strategy e workspace.
- ID: gerar-campanha-mensal
- Duracao: 45 min
- Complexidade: media
- Etapas: 6
- Outputs: Plano mensal

## Rodar auditoria de seguranca
Revisa safety, QA, dados sensiveis e bloqueios antes de qualquer uso externo.
- ID: auditoria-seguranca
- Duracao: 25 min
- Complexidade: media
- Etapas: 5
- Outputs: Relatorio de seguranca

## Fazer backup local
Cria snapshot, exporta backup JSON tecnico e revisa integridade local.
- ID: backup-local
- Duracao: 15 min
- Complexidade: baixa
- Etapas: 5
- Outputs: Backup tecnico JSON

## Restaurar backup tecnico
Valida backup JSON, cria pre_restore, restaura e audita sem upload.
- ID: restore-tecnico
- Duracao: 25 min
- Complexidade: alta
- Etapas: 7
- Outputs: Relatorio de restore

## Preparar PR/release local
Gera checklist local de RC e rascunho de PR sem chamar GitHub ou push.
- ID: preparar-pr-release
- Duracao: 30 min
- Complexidade: media
- Etapas: 6
- Outputs: Rascunho de PR, Release report

## Criar experimento editorial
Planeja experimento seguro de tema, hook, formato ou tom para execucao manual.
- ID: criar-experimento-editorial
- Duracao: 20 min
- Complexidade: baixa
- Etapas: 6
- Outputs: Plano de experimento

## Revisar performance semanal
Le desempenho, oportunidades, saturacao e gargalos com dados agregados manuais.
- ID: revisar-performance-semanal
- Duracao: 25 min
- Complexidade: media
- Etapas: 6
- Outputs: Relatorio de performance

## Montar pacote de stories do dia
Gera ou revisa sequencia de 6 stories com StoryOps e exportacao manual.
- ID: montar-stories-do-dia
- Duracao: 18 min
- Complexidade: baixa
- Etapas: 6
- Outputs: Stories do dia
