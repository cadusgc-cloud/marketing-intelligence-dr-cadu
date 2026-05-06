import type { ParsedReport } from "@/lib/types";
import {
  generateRecommendations,
  generateRecommendationsWithHistory,
  type RecommendationBenchmarks,
  type RecommendationHistoryReport
} from "@/lib/engine/recommendationEngine";
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
  existingReports: RecommendationHistoryReport[],
  benchmarks?: Partial<RecommendationBenchmarks>
): ParsedReport {
  const issues = validateReportWithHistory(parsed, existingReports);
  return applyAnalysis(parsed, issues, existingReports, benchmarks);
}

function applyAnalysis(
  parsed: ParsedReport,
  issues: ParsedReport["dataIssues"],
  history: RecommendationHistoryReport[] = [],
  benchmarks?: Partial<RecommendationBenchmarks>
): ParsedReport {
  const analyzed = { ...parsed, dataIssues: issues };
  const generated = history.length || benchmarks ? generateRecommendationsWithHistory(analyzed, history, benchmarks) : generateRecommendations(analyzed);
  return {
    ...parsed,
    dataIssues: issues,
    creatives: generated.creatives,
    keywords: generated.keywords,
    recommendations: generated.recommendations
  };
}
