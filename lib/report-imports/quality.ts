import { sensitiveScore } from "@/lib/report-imports/sensitiveData";
import type { ImportQualityScore, ImportValidationIssue, NormalizedReportRow, ReportColumnMapping, SensitiveDataIssue } from "@/lib/report-imports/types";

export function scoreImportQuality(
  rows: NormalizedReportRow[],
  mapping: ReportColumnMapping,
  issues: ImportValidationIssue[],
  sensitiveIssues: SensitiveDataIssue[],
  periodStart?: string,
  periodEnd?: string
): ImportQualityScore {
  const reasons: string[] = [];
  const completenessScore = scoreCompleteness(rows);
  const dateCoverageScore = scoreDateCoverage(rows, periodStart, periodEnd);
  const metricValidityScore = issues.some((issue) => issue.severity === "blocking" && String(issue.message).includes("negativa")) ? 20 : 100;
  const duplicateScore = scoreDuplicates(rows);
  const sensitiveDataScore = sensitiveScore(sensitiveIssues);
  const schemaMatchScore = mapping.schemaMatchScore;
  const overallQualityScore = Math.round(
    completenessScore * 0.2 +
      schemaMatchScore * 0.2 +
      dateCoverageScore * 0.15 +
      metricValidityScore * 0.15 +
      duplicateScore * 0.1 +
      sensitiveDataScore * 0.2
  );

  if (completenessScore < 80) reasons.push("ha linhas com campos centrais ausentes");
  if (schemaMatchScore < 75) reasons.push("mapeamento de colunas precisa revisao");
  if (dateCoverageScore < 80) reasons.push("periodo incompleto ou datas fora da semana");
  if (duplicateScore < 90) reasons.push("possiveis duplicidades detectadas");
  if (sensitiveDataScore < 100) reasons.push("ha possivel dado sensivel no import");
  if (metricValidityScore < 100) reasons.push("ha metrica negativa ou invalida");

  const hasBlocking = issues.some((issue) => issue.severity === "blocking") || sensitiveIssues.some((issue) => issue.classification === "bloquear");
  const status = hasBlocking || overallQualityScore < 45 ? "bloquear" : overallQualityScore < 78 ? "revisar" : "aprovado";

  return {
    completenessScore,
    schemaMatchScore,
    dateCoverageScore,
    metricValidityScore,
    duplicateScore,
    sensitiveDataScore,
    overallQualityScore,
    status,
    reasons: reasons.length ? reasons : ["importacao coerente para fechamento semanal"]
  };
}

function scoreCompleteness(rows: NormalizedReportRow[]): number {
  if (!rows.length) return 0;
  const complete = rows.filter((row) => row.date && row.channel && row.format && row.title && Object.values(row.metrics).some((value) => typeof value === "number")).length;
  return Math.round((complete / rows.length) * 100);
}

function scoreDateCoverage(rows: NormalizedReportRow[], periodStart?: string, periodEnd?: string): number {
  const dated = rows.filter((row) => row.date);
  if (!rows.length) return 0;
  if (!periodStart || !periodEnd) return Math.round((dated.length / rows.length) * 100);
  const inPeriod = dated.filter((row) => row.date && row.date >= periodStart && row.date <= periodEnd).length;
  return Math.round((inPeriod / Math.max(dated.length, 1)) * 100);
}

function scoreDuplicates(rows: NormalizedReportRow[]): number {
  if (!rows.length) return 0;
  const keys = new Set<string>();
  let duplicates = 0;
  rows.forEach((row) => {
    const key = `${row.date}|${row.channel}|${row.format}|${row.title.toLowerCase()}`;
    if (keys.has(key)) duplicates += 1;
    keys.add(key);
  });
  return Math.max(0, Math.round(100 - (duplicates / rows.length) * 100));
}
