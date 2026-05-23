import type { NormalizedReportRow } from "@/lib/report-imports/types";
import type { WeeklyGroupSummary, WeeklyMetricSummary, WeeklyMetricTotals } from "@/lib/weekly-review/types";
import { weekdayLabel } from "@/lib/weekly-review/week";

export const emptyTotals: WeeklyMetricTotals = {
  reach: 0,
  impressions: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  replies: 0,
  clicks: 0,
  profileVisits: 0,
  follows: 0,
  spend: 0,
  leads: 0,
  results: 0
};

export function summarizeMetrics(records: NormalizedReportRow[]): WeeklyMetricSummary {
  const totals = records.reduce<WeeklyMetricTotals>((acc, record) => addMetrics(acc, record), { ...emptyTotals });
  const interactions = totals.likes + totals.comments + totals.shares + totals.saves + totals.replies;
  return {
    records: records.length,
    totals,
    engagementRate: roundPercent(interactions, totals.reach || totals.impressions),
    saveShareRate: roundPercent(totals.saves + totals.shares, totals.reach || totals.impressions),
    paidEfficiency: totals.spend > 0 ? Number((totals.clicks / totals.spend).toFixed(2)) : 0
  };
}

export function groupSummary(records: NormalizedReportRow[], grouper: (record: NormalizedReportRow) => string): WeeklyGroupSummary[] {
  const groups = new Map<string, NormalizedReportRow[]>();
  records.forEach((record) => {
    const key = grouper(record) || "sem_classificacao";
    groups.set(key, [...(groups.get(key) ?? []), record]);
  });
  return [...groups.entries()]
    .map(([key, items]) => {
      const summary = summarizeMetrics(items);
      const score = calculateGroupScore(summary);
      return {
        key,
        label: labelize(key),
        records: items.length,
        totals: summary.totals,
        score,
        signal: score >= 75 ? "forte" : score >= 55 ? "promissor" : "revisar"
      };
    })
    .sort((a, b) => b.score - a.score || b.records - a.records);
}

export function weekdaySummary(records: NormalizedReportRow[]): WeeklyGroupSummary[] {
  return groupSummary(records.filter((record) => record.date), (record) => weekdayLabel(record.date ?? "2026-01-01"));
}

export function addMetrics(acc: WeeklyMetricTotals, record: NormalizedReportRow): WeeklyMetricTotals {
  return {
    reach: acc.reach + (record.metrics.reach ?? 0),
    impressions: acc.impressions + (record.metrics.impressions ?? 0),
    likes: acc.likes + (record.metrics.likes ?? 0),
    comments: acc.comments + (record.metrics.comments ?? 0),
    shares: acc.shares + (record.metrics.shares ?? 0),
    saves: acc.saves + (record.metrics.saves ?? 0),
    replies: acc.replies + (record.metrics.replies ?? 0),
    clicks: acc.clicks + (record.metrics.clicks ?? 0),
    profileVisits: acc.profileVisits + (record.metrics.profileVisits ?? 0),
    follows: acc.follows + (record.metrics.follows ?? 0),
    spend: acc.spend + (record.metrics.spend ?? 0),
    leads: acc.leads + (record.metrics.leads ?? 0),
    results: acc.results + (record.metrics.results ?? 0)
  };
}

export function calculateGroupScore(summary: WeeklyMetricSummary): number {
  if (!summary.records) return 0;
  const saveShare = Math.min(35, summary.saveShareRate * 260);
  const engagement = Math.min(30, summary.engagementRate * 130);
  const reach = Math.min(20, summary.totals.reach / 600);
  const conversation = Math.min(15, (summary.totals.replies + summary.totals.comments) / Math.max(summary.records, 1));
  return Math.round(saveShare + engagement + reach + conversation);
}

function roundPercent(numerator: number, denominator?: number): number {
  if (!denominator) return 0;
  return Number((numerator / denominator).toFixed(4));
}

function labelize(value: string): string {
  return value.replace(/_/g, " ");
}
