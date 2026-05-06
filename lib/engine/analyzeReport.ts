import type { ParsedReport } from "@/lib/types";
import { generateRecommendations } from "@/lib/engine/recommendationEngine";
import { validateReport, validateReportWithHistory } from "@/lib/engine/validationEngine";
import { parseReport } from "@/lib/parser/reportParser";

export function analyzeReport(rawText: string): ParsedReport {
  const parsed = parseReport(rawText);
  return analyzeParsedReport(parsed);
}

export function analyzeParsedReport(parsed: ParsedReport): ParsedReport {
  const issues = validateReport(parsed);
  return applyAnalysis(parsed, issues);
}

export function analyzeParsedReportWithHistory(
  parsed: ParsedReport,
  existingReports: Array<Pick<ParsedReport, "periodStart" | "periodEnd" | "isOperationalAnomaly" | "title">>
): ParsedReport {
  const issues = validateReportWithHistory(parsed, existingReports);
  return applyAnalysis(parsed, issues);
}

function applyAnalysis(parsed: ParsedReport, issues: ParsedReport["dataIssues"]): ParsedReport {
  const generated = generateRecommendations({ ...parsed, dataIssues: issues });
  return {
    ...parsed,
    dataIssues: issues,
    creatives: generated.creatives,
    keywords: generated.keywords,
    recommendations: generated.recommendations
  };
}
