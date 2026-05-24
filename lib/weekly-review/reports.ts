import type { WeeklyReviewReport } from "@/lib/weekly-review/types";

export function buildV7ReportFiles(report: WeeklyReviewReport): Record<string, string> {
  return {
    "weekly-review-summary.md": report.exports.weeklyMarkdown,
    "report-import-quality.md": report.exports.importQualityMarkdown,
    "source-mapping-report.md": buildSourceMappingReport(report),
    "sensitive-data-audit.md": report.exports.sensitiveAuditMarkdown,
    "performance-report.md": buildPerformanceReport(report),
    "next-week-plan.md": report.nextWeekPlan.days.map((day) => `- ${day.date}: ${day.theme} (${day.format}) - ${day.rationale}`).join("\n"),
    "paid-metrics-manual-report.md": report.exports.paidMetricsMarkdown,
    "export-samples.md": ["# Export samples", "", "## TSV", report.exports.googleSheetsTsv, "", "## Agenda", report.exports.googleAgenda, "", "## Etus/manual", report.exports.etusManual].join("\n"),
    "qa-report-v7.md": `# QA V7\n\nStatus: ${report.quality.status}\nScore: ${report.quality.score}/100\n\n${report.quality.reasons.map((item) => `- ${item}`).join("\n")}`,
    "pr-readiness-v7.md": buildPrReadinessV7(report)
  };
}

function buildSourceMappingReport(report: WeeklyReviewReport): string {
  return [
    "# Mapeamento de fontes",
    "",
    "- Reportei: Data, Rede, Tipo, Publicacao, Alcance, Impressoes, Interacoes.",
    "- Instagram: Date, Content type, Caption, Reach, Impressions, Saves, Shares.",
    "- Meta Ads manual: Date, Campaign, Spend, Reach, Impressions, Clicks, CPC, CPM, CTR.",
    "- Generico: date, channel, format, theme, pillar e metricas agregadas.",
    "",
    `Registros consolidados nesta amostra: ${report.currentRecords.length}.`
  ].join("\n");
}

function buildPerformanceReport(report: WeeklyReviewReport): string {
  return [
    "# Performance semanal",
    "",
    "## Rankings",
    ...report.themeSummaries.slice(0, 8).map((item) => `- ${item.label}: ${item.score}/100 (${item.signal})`),
    "",
    "## Comparacoes",
    ...report.comparisons.map((item) => `- ${item.metric}: ${item.direction} (${item.deltaPercent})`),
    "",
    "## Oportunidades",
    ...report.recommendations.map((item) => `- ${item.title}: ${item.action}`)
  ].join("\n");
}

function buildPrReadinessV7(report: WeeklyReviewReport): string {
  return [
    "# PR readiness V7",
    "",
    "- Branch: codex/marketing-os-v7-guided-report-import",
    "- Escopo: coleta semanal guiada, importacao manual, fechamento semanal e performance.",
    "- Sem API externa.",
    "- Sem publicacao automatica.",
    "- Sem dados identificaveis.",
    "- Sem alteracao de .env.",
    `- Quality: ${report.quality.status} ${report.quality.score}/100.`,
    "",
    "Comando futuro, nao executado:",
    "git push -u origin codex/marketing-os-v7-guided-report-import"
  ].join("\n");
}
