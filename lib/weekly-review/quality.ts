import type { ConfidenceLevel, WeeklyMetricSummary, WeeklyReviewQualityResult } from "@/lib/weekly-review/types";

export function scoreWeeklyReviewQuality(summary: WeeklyMetricSummary, currentRecords: number, previousRecords: number): WeeklyReviewQualityResult {
  const reasons: string[] = [];
  let score = 100;
  if (currentRecords < 5) {
    score -= 45;
    reasons.push("semana atual tem poucos registros para conclusao firme");
  }
  if (previousRecords < 5) {
    score -= 20;
    reasons.push("comparacao com semana anterior tem baixa cobertura");
  }
  if (!summary.totals.reach && !summary.totals.impressions) {
    score -= 25;
    reasons.push("sem alcance ou impressoes reconhecidos");
  }
  if (!summary.totals.saves && !summary.totals.shares && !summary.totals.replies) {
    score -= 10;
    reasons.push("sinais qualitativos fracos ou ausentes");
  }
  const finalScore = Math.max(0, score);
  return {
    score: finalScore,
    confidence: confidenceFromScore(finalScore),
    status: finalScore >= 78 ? "aprovado" : finalScore >= 45 ? "revisar" : "insuficiente",
    reasons: reasons.length ? reasons : ["cobertura suficiente para fechamento semanal conservador"]
  };
}

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 85) return "alto";
  if (score >= 65) return "moderado";
  if (score >= 40) return "baixo";
  return "insuficiente";
}
