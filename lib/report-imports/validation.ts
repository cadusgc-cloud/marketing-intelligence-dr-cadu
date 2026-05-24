import { getSourcePreset } from "@/lib/report-imports/sources";
import type { ImportValidationIssue, NormalizedReportRow, RawReportRow, ReportColumnMapping, ReportImportInput } from "@/lib/report-imports/types";

export function validateImportRows(
  rows: RawReportRow[],
  normalizedRows: NormalizedReportRow[],
  mapping: ReportColumnMapping,
  input: ReportImportInput
): ImportValidationIssue[] {
  const preset = getSourcePreset(input.source);
  const issues: ImportValidationIssue[] = [];

  if (!rows.length) {
    issues.push({ severity: "blocking", message: "Importacao sem linhas." });
  }
  mapping.unknownHeaders.forEach((header) => {
    issues.push({ field: header, severity: "warning", message: `Coluna nao reconhecida: ${header}` });
  });
  mapping.missingRequiredFields.forEach((field) => {
    issues.push({ field, severity: "blocking", message: `Campo obrigatorio ausente para ${preset.label}: ${field}` });
  });

  const seen = new Set<string>();
  normalizedRows.forEach((row) => {
    if (!row.date) issues.push({ row: row.rowNumber, field: "date", severity: "warning", message: "Data ausente ou invalida." });
    if (input.periodStart && row.date && row.date < input.periodStart) {
      issues.push({ row: row.rowNumber, field: "date", severity: "warning", message: "Data fora do inicio do periodo informado." });
    }
    if (input.periodEnd && row.date && row.date > input.periodEnd) {
      issues.push({ row: row.rowNumber, field: "date", severity: "warning", message: "Data fora do fim do periodo informado." });
    }
    Object.entries(row.metrics).forEach(([field, value]) => {
      if (typeof value === "number" && value < 0) {
        issues.push({ row: row.rowNumber, field, severity: "blocking", message: `Metrica negativa em ${field}.` });
      }
    });
    const hasMetric = Object.values(row.metrics).some((value) => typeof value === "number");
    if (!hasMetric) issues.push({ row: row.rowNumber, severity: "warning", message: "Linha sem metrica numerica reconhecida." });

    const duplicateKey = `${row.date ?? "sem-data"}|${row.channel}|${row.format}|${row.title.toLowerCase()}`;
    if (seen.has(duplicateKey)) {
      issues.push({ row: row.rowNumber, severity: "warning", message: "Possivel duplicidade de conteudo." });
    }
    seen.add(duplicateKey);
  });

  return issues;
}
