import type { MarketingQualityReport } from "@/lib/marketing-quality/types";

export function getBlockingQualityFailures(report: MarketingQualityReport): string[] {
  return report.issues
    .filter((issue) => issue.severity === "blocking")
    .map((issue) => `${issue.source}: ${issue.message}`);
}

export function assertMarketingQuality(report: MarketingQualityReport): void {
  const failures = getBlockingQualityFailures(report);
  if (failures.length > 0) {
    throw new Error(`QA bloqueado:\n${failures.join("\n")}`);
  }
}
