import type { DailyExecutionPlan, EditorialRiskSummary } from "@/lib/marketing-ops/types";
import { mergeSafetyGates } from "@/lib/monthly-editorial";

export function buildEditorialRiskSummary(days: DailyExecutionPlan[]): EditorialRiskSummary {
  const safetyGate = mergeSafetyGates(days.map((day) => day.sourceDay.safetyGate));
  const issues = days.flatMap((day) => day.sourceDay.safetyGate.issues);
  const grouped = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.category] = (acc[issue.category] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalIssues: issues.length,
    blockedContent: days.filter((day) => day.risk === "bloquear").length,
    needsReview: days.filter((day) => day.risk === "revisar_antes_de_postar" || day.risk === "atencao").length,
    safeContent: days.filter((day) => day.risk === "seguro").length,
    topRisks: Object.entries(grouped)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    blockedDays: days.filter((day) => day.risk === "bloquear"),
    reviewDays: days.filter((day) => day.risk === "revisar_antes_de_postar" || day.risk === "atencao"),
    safetyGate
  };
}

export function exportSafetyReport(summary: EditorialRiskSummary): string {
  return [
    "# Relatorio de seguranca editorial",
    "",
    `Classificacao geral: ${summary.safetyGate.classification}`,
    `Score: ${summary.safetyGate.score}/100`,
    `Problemas detectados: ${summary.totalIssues}`,
    `Conteudos bloqueados: ${summary.blockedContent}`,
    `Conteudos para revisar: ${summary.needsReview}`,
    "",
    "## Principais riscos",
    ...(summary.topRisks.length ? summary.topRisks.map((risk) => `- ${risk.category}: ${risk.count}`) : ["- nenhum risco recorrente"]),
    "",
    "## Sugestoes",
    ...(summary.safetyGate.recommendations.length ? summary.safetyGate.recommendations.map((item) => `- ${item}`) : ["- manter revisao humana antes de publicar"])
  ].join("\n");
}
