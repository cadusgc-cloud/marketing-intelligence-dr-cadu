import { runMarketingDogfoodingScenario } from "@/lib/marketing-dogfooding/runDogfooding";

export function buildPilotWeekDogfoodingSnapshot() {
  const report = runMarketingDogfoodingScenario();
  return {
    status: report.finalStatus,
    period: report.scenario.summary.period,
    totalDays: report.totalDays,
    totalStories: report.totalStories,
    readiness: report.weeklyReadiness,
    failures: report.failures.length
  };
}
