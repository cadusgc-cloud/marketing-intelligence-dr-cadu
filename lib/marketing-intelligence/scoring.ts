import type { NormalizedMetricRecord, PerformanceClassification, PerformanceScore } from "@/lib/marketing-intelligence/types";
import { clampScore } from "@/lib/marketing-intelligence/normalization";

function percentileBase(records: NormalizedMetricRecord[], selector: (record: NormalizedMetricRecord) => number) {
  const values = records.map(selector).filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!values.length) return 1;
  return values[Math.max(0, Math.floor(values.length * 0.75) - 1)] || values[values.length - 1] || 1;
}

function classify(score: number, record: NormalizedMetricRecord, safetyPenalty: number): PerformanceClassification {
  if (!record.safeForLearning || safetyPenalty >= 45) return "bloquear";
  if (safetyPenalty >= 25) return "revisar";
  if (score >= 78) return "forte";
  if (score >= 62) return "promissor";
  if (score >= 44) return "neutro";
  return "fraco";
}

export function calculatePerformanceScores(records: NormalizedMetricRecord[]): PerformanceScore[] {
  const reachBase = percentileBase(records, (record) => record.reach);
  const weightedBase = percentileBase(records, (record) => record.weightedInteractions);
  const conversationBase = percentileBase(records, (record) => record.replies + record.dms * 2 + record.comments);
  const saveShareBase = percentileBase(records, (record) => record.saves * 1.4 + record.shares * 1.6);

  return records.map((record) => {
    const engagementScore = clampScore((record.weightedInteractions / weightedBase) * 70 + 15);
    const saveShareScore = clampScore(((record.saves * 1.4 + record.shares * 1.6) / saveShareBase) * 72 + 12);
    const conversationScore = clampScore(((record.replies + record.dms * 2 + record.comments) / conversationBase) * 70 + 10);
    const reachScore = clampScore((record.reach / reachBase) * 65 + 15);
    const efficiencyScore = clampScore((record.weightedInteractions / Math.max(1, record.effort)) / Math.max(1, weightedBase / 3) * 70 + 10);
    const safetyPenalty = record.risk === "bloquear" ? 60 : record.risk === "revisar" ? 34 : record.risk === "atencao" ? 14 : record.sensitiveFlags.length ? 45 : 0;
    const effortPenalty = record.effort >= 5 && efficiencyScore < 45 ? 18 : record.effort >= 4 && efficiencyScore < 50 ? 10 : 0;
    const strategicFitScore = clampScore(
      64 +
      (["expectativa_realista", "seguranca", "estetica_natural", "consulta_nao_e_venda"].includes(record.normalizedPillar) ? 18 : 8) +
      (record.normalizedFormat === "reel" || record.normalizedFormat === "carrossel" ? 8 : 0)
    );
    const repeatPotentialScore = clampScore(
      saveShareScore * 0.35 +
      conversationScore * 0.25 +
      efficiencyScore * 0.2 +
      strategicFitScore * 0.2 -
      safetyPenalty -
      effortPenalty
    );
    const overallPerformanceScore = clampScore(
      engagementScore * 0.2 +
      saveShareScore * 0.24 +
      conversationScore * 0.18 +
      reachScore * 0.12 +
      efficiencyScore * 0.14 +
      strategicFitScore * 0.12 -
      safetyPenalty -
      effortPenalty
    );
    const alerts: string[] = [];
    if (record.effort >= 4 && overallPerformanceScore < 50) alerts.push("alto esforco com baixo retorno agregado");
    if (record.effort <= 2 && overallPerformanceScore >= 65) alerts.push("baixo esforco com boa resposta: oportunidade");
    if (safetyPenalty > 0) alerts.push("revisar risco editorial antes de repetir");
    if (saveShareScore >= 75) alerts.push("bom potencial de salvamento/compartilhamento");

    return {
      recordId: record.id,
      engagementScore,
      saveShareScore,
      conversationScore,
      reachScore,
      efficiencyScore,
      safetyPenalty,
      effortPenalty,
      strategicFitScore,
      repeatPotentialScore,
      overallPerformanceScore,
      classification: classify(overallPerformanceScore, record, safetyPenalty),
      alerts
    };
  });
}
