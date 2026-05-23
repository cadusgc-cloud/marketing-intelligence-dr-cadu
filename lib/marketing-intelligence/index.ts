export * from "@/lib/marketing-intelligence/types";
export * from "@/lib/marketing-intelligence/sampleData";
export * from "@/lib/marketing-intelligence/normalization";
export * from "@/lib/marketing-intelligence/imports";
export * from "@/lib/marketing-intelligence/scoring";
export * from "@/lib/marketing-intelligence/insights";
export * from "@/lib/marketing-intelligence/experiments";
export * from "@/lib/marketing-intelligence/strategy";
export * from "@/lib/marketing-intelligence/exports";
export * from "@/lib/marketing-intelligence/reports";

import { buildMetricsExportBundle } from "@/lib/marketing-intelligence/exports";
import { generateExperimentPlans } from "@/lib/marketing-intelligence/experiments";
import { generateLearningLoopReport } from "@/lib/marketing-intelligence/insights";
import { normalizeMetricRows } from "@/lib/marketing-intelligence/normalization";
import { sampleDatasetNotice, sampleManualMetricRecords } from "@/lib/marketing-intelligence/sampleData";
import { generateStrategyRoadmap } from "@/lib/marketing-intelligence/strategy";
import type { IntelligenceDashboard, ManualMetricRecord } from "@/lib/marketing-intelligence/types";

export function buildIntelligenceDashboard(records: ManualMetricRecord[] = sampleManualMetricRecords): IntelligenceDashboard {
  const normalized = normalizeMetricRows(records);
  const report = generateLearningLoopReport(normalized);
  const experiments = generateExperimentPlans(report);
  const roadmap = generateStrategyRoadmap(report);
  const exports = buildMetricsExportBundle(report, experiments, roadmap);

  return {
    datasetLabel: sampleDatasetNotice,
    recordCount: normalized.length,
    intelligenceScore: report.quality.score,
    report,
    experiments,
    roadmap,
    exports
  };
}
