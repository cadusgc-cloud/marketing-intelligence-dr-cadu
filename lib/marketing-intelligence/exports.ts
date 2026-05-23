import type { ExperimentPlan, LearningLoopReport, MetricsExportBundle, StrategyRoadmap } from "@/lib/marketing-intelligence/types";
import { formatLabels, pillarLabels } from "@/lib/marketing-intelligence/normalization";

export function exportMetricsTsv(report: LearningLoopReport) {
  return [
    "Data\tCanal\tFormato\tPilar\tTema\tTitulo\tAlcance\tImpressoes\tSalvamentos\tCompartilhamentos\tRespostas\tDMs\tScore\tRisco",
    ...report.records.map((record) => {
      const score = report.scores.find((item) => item.recordId === record.id)?.overallPerformanceScore ?? 0;
      return [
        record.date,
        record.channel,
        record.normalizedFormat,
        record.normalizedPillar,
        record.theme,
        record.title,
        record.reach,
        record.impressions,
        record.saves,
        record.shares,
        record.replies,
        record.dms,
        score,
        record.risk
      ].join("\t");
    })
  ].join("\n");
}

export function exportInsightsMarkdown(report: LearningLoopReport) {
  return [
    "# Intelligence Loop - resumo",
    "",
    report.summary,
    "",
    "## Conteudos para repetir",
    ...report.learning.repeat.slice(0, 5).map((item) => `- ${item.record.theme}: score ${item.score.overallPerformanceScore}/100`),
    "",
    "## Conteudos para variar",
    ...report.learning.vary.slice(0, 5).map((item) => `- ${item.record.theme}: ${item.recommendation}`),
    "",
    "## Conteudos para pausar",
    ...(report.learning.pause.length ? report.learning.pause.map((item) => `- ${item.record.theme}: baixo retorno agregado ou alto esforco`) : ["- nenhum bloqueio automatico; revisar com cautela"]),
    "",
    "## Proximas acoes",
    ...report.recommendations.map((item) => `- ${item.order}. ${item.title} (${item.priority}) - ${item.rationale}`)
  ].join("\n");
}

export function exportGoogleAgenda(roadmap: StrategyRoadmap) {
  return roadmap.adaptiveCalendar.map((day) => [
    `Titulo: Conteudo Dr. Cadu - ${day.theme}`,
    "",
    "Descricao:",
    `- Pilar: ${pillarLabels[day.pillar]}`,
    `- Formato: ${formatLabels[day.format]}`,
    `- Justificativa: ${day.rationale}`,
    "- Seguranca: revisar antes de postar; sem API e sem publicacao automatica",
    "- Status: sugestao local"
  ].join("\n")).join("\n\n---\n\n");
}

export function exportEtusManual(roadmap: StrategyRoadmap) {
  return [
    "Data\tCanal\tFormato\tTitulo interno\tTexto/legenda\tMidia necessaria\tObservacoes\tStatus\tRisco",
    ...roadmap.adaptiveCalendar.map((day) => [
      day.date,
      "Instagram",
      day.format,
      day.theme,
      `Conteudo educativo sobre ${day.theme}. Revisar no Content Studio antes de uso externo.`,
      "Midia natural sem paciente, sem localizacao e sem prontuario",
      day.rationale,
      "planejado_manual",
      day.safety
    ].join("\t"))
  ].join("\n");
}

export function exportExperimentsMarkdown(experiments: ExperimentPlan[]) {
  return experiments.map((experiment) => experiment.exportText).join("\n\n---\n\n");
}

export function exportNextActionsMarkdown(report: LearningLoopReport) {
  return [
    "# Next Best Actions",
    "",
    ...report.recommendations.map((action) => [
      `## ${action.order}. ${action.title}`,
      `Prioridade: ${action.priority}`,
      `Formato: ${action.suggestedFormat}`,
      `Justificativa: ${action.rationale}`,
      `Risco: ${action.risk}`,
      `Rota: ${action.relatedRoute}`,
      "Publicacao: manual, apos revisao humana."
    ].join("\n"))
  ].join("\n\n");
}

export function buildMetricsExportBundle(report: LearningLoopReport, experiments: ExperimentPlan[], roadmap: StrategyRoadmap): MetricsExportBundle {
  return {
    insightsMarkdown: exportInsightsMarkdown(report),
    metricsTsv: exportMetricsTsv(report),
    googleAgenda: exportGoogleAgenda(roadmap),
    etusManual: exportEtusManual(roadmap),
    experimentMarkdown: exportExperimentsMarkdown(experiments),
    roadmapMarkdown: roadmap.exportText,
    nextActionsMarkdown: exportNextActionsMarkdown(report),
    technicalJson: JSON.stringify({
      generatedAt: report.generatedAt,
      records: report.records.length,
      intelligenceScore: report.quality.score,
      recommendations: report.recommendations,
      adaptiveCalendar: roadmap.adaptiveCalendar
    }, null, 2)
  };
}
