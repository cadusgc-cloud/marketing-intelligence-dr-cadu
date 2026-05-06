import type { ParsedReport } from "@/lib/types";
import { generateRecommendations } from "@/lib/engine/recommendationEngine";
import { validateReport } from "@/lib/engine/validationEngine";
import { parseReport } from "@/lib/parser/reportParser";

export function analyzeReport(rawText: string): ParsedReport {
  const parsed = parseReport(rawText);
  const issues = validateReport(parsed);
  const generated = generateRecommendations({ ...parsed, dataIssues: issues });
  return {
    ...parsed,
    dataIssues: issues,
    creatives: generated.creatives,
    keywords: generated.keywords,
    recommendations: generated.recommendations
  };
}
