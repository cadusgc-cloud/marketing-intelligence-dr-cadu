import type { IntelligenceDashboard } from "@/lib/marketing-intelligence/types";

export function buildV6ReportFiles(dashboard: IntelligenceDashboard): Record<string, string> {
  const report = dashboard.report;
  const roadmap = dashboard.roadmap;
  return {
    "intelligence-summary.md": [
      "# Marketing OS v6 - Intelligence Loop",
      "",
      `Dataset: ${dashboard.datasetLabel}`,
      `Registros: ${dashboard.recordCount}`,
      `Score de inteligencia editorial: ${dashboard.intelligenceScore}/100`,
      "",
      "## Principais recomendacoes",
      ...report.recommendations.slice(0, 5).map((item) => `- ${item.title}: ${item.rationale}`),
      "",
      "Tudo e local, manual e sem API externa."
    ].join("\n"),
    "metrics-sample-report.md": [
      "# Metricas manuais",
      "",
      "Colunas aceitas: Data, Canal, Formato, Tema, Pilar, Titulo, Impressoes, Alcance, Curtidas, Comentarios, Compartilhamentos, Salvamentos, Respostas, Cliques, Visitas ao perfil, DMs, Retencao, Status, Risco, Esforco, Observacoes.",
      "",
      "As metricas devem ser agregadas e nunca devem conter paciente, prontuario, localizacao, credenciais ou dado sensivel.",
      "",
      "## Amostra TSV",
      "```tsv",
      dashboard.exports.metricsTsv.split("\n").slice(0, 8).join("\n"),
      "```"
    ].join("\n"),
    "learning-loop-report.md": dashboard.exports.insightsMarkdown,
    "experiment-plan.md": dashboard.exports.experimentMarkdown,
    "strategy-roadmap.md": dashboard.exports.roadmapMarkdown,
    "next-best-actions.md": dashboard.exports.nextActionsMarkdown,
    "adaptive-calendar.md": [
      "# Calendario adaptativo - proximos 7 dias",
      "",
      ...roadmap.adaptiveCalendar.map((day) => `- ${day.date} (${day.weekday}): ${day.theme} | ${day.format} | ${day.rationale}`)
    ].join("\n"),
    "content-opportunity-map.md": [
      "# Mapa de oportunidades",
      "",
      ...report.opportunities.map((bucket) => [
        `## ${bucket.label}`,
        bucket.recommendation,
        ...bucket.items.slice(0, 4).map((item) => `- ${item.record.theme}: ${item.score.overallPerformanceScore}/100`)
      ].join("\n"))
    ].join("\n\n"),
    "intelligence-quality-report.md": [
      "# QA de metricas e insights",
      "",
      `Status: ${report.quality.status}`,
      `Score: ${report.quality.score}/100`,
      "",
      "## Checks",
      ...report.quality.checks.map((item) => `- ${item}`),
      "",
      "## Falhas bloqueantes",
      ...(report.quality.blockingIssues.length ? report.quality.blockingIssues.map((item) => `- ${item}`) : ["- nenhuma"]),
      "",
      "## Avisos",
      ...(report.quality.warnings.length ? report.quality.warnings.map((item) => `- ${item}`) : ["- nenhum"])
    ].join("\n"),
    "export-samples.md": [
      "# Amostras de exportacao V6",
      "",
      "## Google Agenda",
      dashboard.exports.googleAgenda,
      "",
      "## Etus/manual",
      "```tsv",
      dashboard.exports.etusManual,
      "```",
      "",
      "## Backup JSON tecnico",
      "```json",
      dashboard.exports.technicalJson,
      "```"
    ].join("\n"),
    "pr-readiness-v6.md": [
      "# PR Readiness - Marketing OS v6",
      "",
      "Branch: codex/marketing-os-v6-intelligence-loop",
      "",
      "## Escopo",
      "- Metricas manuais",
      "- Parser TSV/CSV",
      "- Scoring editorial",
      "- Learning loop",
      "- Experimentos",
      "- Roadmap 30/60/90",
      "- Calendario adaptativo",
      "- Rotas /insights, /metrics, /experiments e /strategy",
      "",
      "## Guardrails",
      "- Sem API externa",
      "- Sem publicacao automatica",
      "- Sem dados de pacientes",
      "- Sem alteracao de .env",
      "- Sem push, merge ou tag nesta fase",
      "",
      "## Comando futuro de push",
      "```bash",
      "git push -u origin codex/marketing-os-v6-intelligence-loop",
      "```"
    ].join("\n")
  };
}
