import type { WeeklyComparison, WeeklyMetricSummary, WeeklyMetricTotals } from "@/lib/weekly-review/types";

const comparisonMetrics: Array<keyof WeeklyMetricTotals> = ["reach", "impressions", "saves", "shares", "replies", "clicks", "spend"];

export function compareWeeklySummaries(current: WeeklyMetricSummary, previous: WeeklyMetricSummary): WeeklyComparison[] {
  const metricComparisons = comparisonMetrics.map((metric) => buildComparison(metric, current.totals[metric], previous.totals[metric]));
  return [
    ...metricComparisons,
    buildComparison("engagementRate", current.engagementRate, previous.engagementRate),
    buildComparison("saveShareRate", current.saveShareRate, previous.saveShareRate)
  ];
}

function buildComparison(metric: WeeklyComparison["metric"], current: number, previous: number): WeeklyComparison {
  const delta = Number((current - previous).toFixed(4));
  const deltaPercent = previous ? Number((delta / previous).toFixed(4)) : current ? 1 : 0;
  return {
    metric,
    current,
    previous,
    delta,
    deltaPercent,
    direction: Math.abs(deltaPercent) < 0.05 ? "stable" : delta > 0 ? "up" : "down"
  };
}
