import type { DogfoodingFailure, DogfoodingReport } from "@/lib/marketing-dogfooding/types";

export function collectDogfoodingFailures(report: DogfoodingReport): DogfoodingFailure[] {
  const failures: DogfoodingFailure[] = [];

  if (report.totalDays !== 7) failures.push(failure("days", "blocking", "Semana piloto precisa ter 7 dias.", "scenario"));
  if (report.totalStories !== 42) failures.push(failure("stories", "blocking", "Semana piloto precisa ter 42 stories.", "storyops"));
  if (report.totalBlocks > 0) failures.push(failure("blocks", "blocking", "Semana piloto tem conteudo bloqueado.", "safety"));
  if (report.weeklyReadiness < 0 || report.weeklyReadiness > 100) failures.push(failure("readiness", "blocking", "Readiness semanal invalido.", "readiness"));
  if (report.exportsGenerated.length < 8) failures.push(failure("exports", "blocking", "Exportacoes da semana piloto estao incompletas.", "exports"));

  return [...failures, ...report.quality.issues.filter((issue) => issue.severity === "blocking").map((issue) => failure(issue.id, "blocking", issue.message, issue.source))];
}

export function assertDogfoodingReport(report: DogfoodingReport): void {
  const failures = collectDogfoodingFailures(report);
  if (failures.some((item) => item.severity === "blocking")) {
    throw new Error(`Dogfooding bloqueado:\n${failures.map((item) => `- ${item.source}: ${item.message}`).join("\n")}`);
  }
}

function failure(id: string, severity: DogfoodingFailure["severity"], message: string, source: string): DogfoodingFailure {
  return { id, severity, message, source };
}
