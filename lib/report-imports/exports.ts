import type { NormalizedReportRow, ReportImportExportBundle, ReportImportResult, SensitiveDataIssue } from "@/lib/report-imports/types";

export function buildReportImportExports(result: Omit<ReportImportResult, "exports">): ReportImportExportBundle {
  return {
    normalizedTsv: exportNormalizedRowsToTsv(result.normalizedRows),
    qualityMarkdown: buildImportQualityMarkdown(result),
    sensitiveAuditMarkdown: buildSensitiveAuditMarkdown(result.sensitiveIssues),
    technicalJson: JSON.stringify(
      {
        source: result.source,
        quality: result.quality,
        rows: result.normalizedRows,
        mapping: result.mapping
      },
      null,
      2
    )
  };
}

export function exportNormalizedRowsToTsv(rows: NormalizedReportRow[]): string {
  const header = [
    "Data",
    "Canal",
    "Formato",
    "Titulo",
    "Tema",
    "Pilar",
    "Alcance",
    "Impressoes",
    "Curtidas",
    "Comentarios",
    "Compartilhamentos",
    "Salvamentos",
    "Respostas",
    "Cliques",
    "Gasto",
    "CPC",
    "CPM",
    "CTR",
    "Frequencia",
    "Leads",
    "Resultados",
    "Risco",
    "Observacoes"
  ];
  const lines = rows.map((row) =>
    [
      row.date ?? "",
      row.channel,
      row.format,
      row.title,
      row.theme,
      row.pillar,
      row.metrics.reach ?? "",
      row.metrics.impressions ?? "",
      row.metrics.likes ?? "",
      row.metrics.comments ?? "",
      row.metrics.shares ?? "",
      row.metrics.saves ?? "",
      row.metrics.replies ?? "",
      row.metrics.clicks ?? "",
      row.metrics.spend ?? "",
      row.metrics.cpc ?? "",
      row.metrics.cpm ?? "",
      row.metrics.ctr ?? "",
      row.metrics.frequency ?? "",
      row.metrics.leads ?? "",
      row.metrics.results ?? "",
      row.risk ?? "",
      row.notes ?? ""
    ].join("\t")
  );
  return [header.join("\t"), ...lines].join("\n");
}

export function buildImportQualityMarkdown(result: Omit<ReportImportResult, "exports">): string {
  return [
    "# Qualidade da importacao",
    "",
    `Fonte: ${result.source}`,
    `Status: ${result.quality.status}`,
    `Score geral: ${result.quality.overallQualityScore}/100`,
    `Completude: ${result.quality.completenessScore}/100`,
    `Schema: ${result.quality.schemaMatchScore}/100`,
    `Cobertura de datas: ${result.quality.dateCoverageScore}/100`,
    `Validade de metricas: ${result.quality.metricValidityScore}/100`,
    `Duplicidades: ${result.quality.duplicateScore}/100`,
    `Dados sensiveis: ${result.quality.sensitiveDataScore}/100`,
    "",
    "## Motivos",
    ...result.quality.reasons.map((reason) => `- ${reason}`),
    "",
    "## Issues",
    ...(result.issues.length ? result.issues.map((issue) => `- ${issue.severity}: linha ${issue.row ?? "-"} ${issue.field ?? ""} ${issue.message}`) : ["- nenhuma issue relevante"])
  ].join("\n");
}

export function buildSensitiveAuditMarkdown(issues: SensitiveDataIssue[]): string {
  return [
    "# Auditoria de dados sensiveis",
    "",
    `Status: ${issues.some((issue) => issue.classification === "bloquear") ? "bloquear" : issues.length ? "revisar" : "seguro"}`,
    "",
    ...(issues.length
      ? issues.map((issue) => `- ${issue.classification}: linha ${issue.row ?? "-"} campo ${issue.field ?? "-"} | ${issue.term} | ${issue.message}`)
      : ["- Nenhum dado sensivel detectado no dataset avaliado."])
  ].join("\n");
}
