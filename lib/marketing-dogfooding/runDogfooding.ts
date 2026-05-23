import { buildPilotWeekScenario } from "@/lib/marketing-scenarios";
import { runMarketingQualityAudit } from "@/lib/marketing-quality";
import { collectDogfoodingFailures } from "@/lib/marketing-dogfooding/assertions";
import type { DogfoodingOptions, DogfoodingReport } from "@/lib/marketing-dogfooding/types";

const injectedBlockingText = "resultado garantido antes e depois agende agora paciente de hoje cirurgia de hoje sem risco";

export function runMarketingDogfoodingScenario(options: DogfoodingOptions = {}): DogfoodingReport {
  const scenario = buildPilotWeekScenario();
  const quality = runMarketingQualityAudit({
    scenario,
    injectedText: options.injectBlockedContent ? injectedBlockingText : undefined
  });
  const draft: Omit<DogfoodingReport, "failures" | "finalStatus"> = {
    id: `dogfood-${scenario.id}`,
    scenario,
    quality,
    totalDays: scenario.summary.totalDays,
    totalStories: scenario.summary.totalStories,
    totalReels: scenario.summary.totalReels,
    totalPostsAndCarousels: scenario.summary.totalPostsAndCarousels,
    totalTasks: scenario.summary.totalTasks,
    totalAlerts: scenario.summary.totalSafetyAlerts + quality.issues.length,
    totalBlocks: scenario.summary.totalBlockedItems + quality.issues.filter((issue) => issue.severity === "blocking").length,
    dailyReadiness: scenario.days.map((day) => ({
      date: day.editorialDay.date,
      score: day.readiness.score,
      status: day.readiness.status,
      risk: day.execution.risk
    })),
    weeklyReadiness: scenario.summary.averageReadiness,
    blockedContent: scenario.days.filter((day) => day.safetyGate.blocks).map((day) => `${day.editorialDay.date} - ${day.editorialDay.theme}`),
    sensitiveTermsDetected: Array.from(new Set(scenario.days.flatMap((day) => day.safetyGate.detectedTerms).concat(quality.issues.map((issue) => issue.message)))).slice(0, 20),
    exportsGenerated: Object.keys(scenario.exports),
    generatedAt: new Date("2026-05-23T12:00:00.000Z")
  };
  const reportWithoutStatus = { ...draft, failures: [], finalStatus: "aprovado" as const };
  const failures = collectDogfoodingFailures(reportWithoutStatus);
  const finalStatus: DogfoodingReport["finalStatus"] = failures.some((failure) => failure.severity === "blocking")
    ? "bloqueado"
    : draft.weeklyReadiness < 70
      ? "revisar"
      : "aprovado";

  return {
    ...draft,
    failures,
    finalStatus
  };
}
