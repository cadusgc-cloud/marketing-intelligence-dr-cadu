import type { WeeklyReviewReport } from "@/lib/weekly-review/types";

export function buildWeeklyReviewExports(report: Omit<WeeklyReviewReport, "exports">) {
  const weeklyMarkdown = buildWeeklyMarkdown(report);
  const executiveSummary = buildExecutiveSummary(report);
  const googleSheetsTsv = buildGoogleSheetsTsv(report);
  const googleAgenda = report.nextWeekPlan.googleAgenda;
  const etusManual = buildEtusManual(report);
  const recordingPlan = buildRecordingPlan(report);
  const tasksMarkdown = report.tasks.map((task) => `- [${task.priority}] ${task.title} (${task.route})`).join("\n");
  const studioRecommendations = report.recommendations.map((item) => `- ${item.title}: ${item.action}`).join("\n");
  const experimentsMarkdown = report.recommendations.filter((item) => item.type === "testar").map((item) => `- Hipotese: ${item.title}\n  Criterio: comparar salvamentos, compartilhamentos e respostas sem promessa.`).join("\n") || "- Testar tema vencedor em reel vs carrossel.";
  const importQualityMarkdown = `# Qualidade do fechamento\n\nStatus: ${report.quality.status}\nConfianca: ${report.quality.confidence}\nScore: ${report.quality.score}/100\n\n${report.quality.reasons.map((item) => `- ${item}`).join("\n")}`;
  const sensitiveAuditMarkdown = "# Auditoria sensivel semanal\n\n- Nenhum dado sensivel deve ser usado.\n- Importacoes com CPF, telefone, prontuario, antes/depois ou token devem bloquear.\n- A semana padrao usa apenas metricas agregadas ficticias.";
  const paidMetricsMarkdown = ["# Ads manual", "", ...report.paidInsights.map((item) => `- ${item}`)].join("\n");
  const nextCollectionChecklist = [
    "# Checklist da proxima coleta",
    "",
    "- Exportar dados agregados do Reportei ou fonte manual.",
    "- Conferir periodo de 7 dias.",
    "- Remover qualquer dado identificavel antes de colar.",
    "- Validar colunas, duplicidades, datas e metricas negativas.",
    "- Rodar fechamento semanal antes de planejar conteudo."
  ].join("\n");

  return {
    weeklyMarkdown,
    executiveSummary,
    googleSheetsTsv,
    googleAgenda,
    etusManual,
    recordingPlan,
    tasksMarkdown,
    studioRecommendations,
    experimentsMarkdown,
    importQualityMarkdown,
    sensitiveAuditMarkdown,
    technicalJson: JSON.stringify(report, null, 2),
    paidMetricsMarkdown,
    nextCollectionChecklist
  };
}

function buildWeeklyMarkdown(report: Omit<WeeklyReviewReport, "exports">): string {
  return [
    "# Fechamento semanal",
    "",
    `Periodo: ${report.period.label}`,
    `Confianca: ${report.quality.confidence}`,
    `Registros avaliados: ${report.currentRecords.length}`,
    "",
    "## Resumo",
    `- Alcance: ${report.summary.totals.reach}`,
    `- Impressoes: ${report.summary.totals.impressions}`,
    `- Salvamentos: ${report.summary.totals.saves}`,
    `- Compartilhamentos: ${report.summary.totals.shares}`,
    `- Respostas: ${report.summary.totals.replies}`,
    "",
    "## Aprendizados",
    ...report.learnings.map((learning) => `- ${learning.type}: ${learning.title} - ${learning.rationale}`),
    "",
    "## Plano da proxima semana",
    ...report.nextWeekPlan.days.map((day) => `- ${day.date} ${day.weekday}: ${day.theme} (${day.format})`)
  ].join("\n");
}

function buildExecutiveSummary(report: Omit<WeeklyReviewReport, "exports">): string {
  const topTheme = report.themeSummaries[0]?.label ?? "dados insuficientes";
  const weakTheme = [...report.themeSummaries].reverse()[0]?.label ?? "sem sinal claro";
  return [
    "Resumo executivo",
    `Semana ${report.period.label}: ${report.quality.confidence} confianca.`,
    `Vitoria principal: ${topTheme}.`,
    `Gargalo principal: ${weakTheme}.`,
    "Acao: repetir o que gerou salvamento/compartilhamento, revisar baixo retorno e planejar a proxima semana sem automacao externa."
  ].join("\n");
}

function buildGoogleSheetsTsv(report: Omit<WeeklyReviewReport, "exports">): string {
  return [
    "Data\tCanal\tFormato\tTema\tPilar\tAlcance\tImpressoes\tSalvamentos\tCompartilhamentos\tCliques\tGasto\tRisco",
    ...report.currentRecords.map((row) => [row.date ?? "", row.channel, row.format, row.theme, row.pillar, row.metrics.reach ?? "", row.metrics.impressions ?? "", row.metrics.saves ?? "", row.metrics.shares ?? "", row.metrics.clicks ?? "", row.metrics.spend ?? "", row.risk ?? ""].join("\t"))
  ].join("\n");
}

function buildEtusManual(report: Omit<WeeklyReviewReport, "exports">): string {
  return [
    "Data\tCanal\tFormato\tTitulo\tTexto\tMidia necessaria\tRisco\tStatus",
    ...report.nextWeekPlan.days.map((day) => [day.date, "Instagram", day.format, day.theme, day.exportText.replace(/\n/g, " "), day.mediaNeeded.join(", "), day.safety, "planejado_manual"].join("\t"))
  ].join("\n");
}

function buildRecordingPlan(report: Omit<WeeklyReviewReport, "exports">): string {
  return [
    "# Plano de gravacao da proxima semana",
    "",
    ...report.nextWeekPlan.days.filter((day) => day.format === "reel").map((day, index) => `${index + 1}. ${day.theme}\n- Fala curta: explicar o ponto central sem promessa.\n- Cena: video curto falando para camera, sem local identificavel.`)
  ].join("\n");
}
