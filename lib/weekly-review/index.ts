export * from "@/lib/weekly-review/types";
export * from "@/lib/weekly-review/week";
export * from "@/lib/weekly-review/consolidation";
export * from "@/lib/weekly-review/comparisons";
export * from "@/lib/weekly-review/learnings";
export * from "@/lib/weekly-review/nextWeek";
export * from "@/lib/weekly-review/tasks";
export * from "@/lib/weekly-review/quality";
export * from "@/lib/weekly-review/matching";
export * from "@/lib/weekly-review/paid";
export * from "@/lib/weekly-review/exports";
export * from "@/lib/weekly-review/reports";
export * from "@/lib/weekly-review/defaults";

import type { WeeklyReviewInput, WeeklyReviewReport } from "@/lib/weekly-review/types";
import { compareWeeklySummaries } from "@/lib/weekly-review/comparisons";
import { buildWeeklyReviewExports } from "@/lib/weekly-review/exports";
import { generateWeeklyLearnings, generateWeeklyRecommendations } from "@/lib/weekly-review/learnings";
import { matchMetricsToContent } from "@/lib/weekly-review/matching";
import { generateNextWeekPlan } from "@/lib/weekly-review/nextWeek";
import { generatePaidMetricsInsights } from "@/lib/weekly-review/paid";
import { scoreWeeklyReviewQuality } from "@/lib/weekly-review/quality";
import { buildWeeklyTasks } from "@/lib/weekly-review/tasks";
import { groupSummary, summarizeMetrics, weekdaySummary } from "@/lib/weekly-review/consolidation";
import { buildDefaultContentItems, buildDefaultWeeklyReviewInput } from "@/lib/weekly-review/defaults";

export function generateWeeklyReview(input: WeeklyReviewInput): WeeklyReviewReport {
  const currentRecords = input.records.filter((record) => record.date && record.date >= input.period.startDate && record.date <= input.period.endDate);
  const previousRecords = input.previousRecords ?? [];
  const summary = summarizeMetrics(currentRecords);
  const previousSummary = summarizeMetrics(previousRecords);
  const channelSummaries = groupSummary(currentRecords, (record) => record.channel);
  const formatSummaries = groupSummary(currentRecords, (record) => record.format);
  const pillarSummaries = groupSummary(currentRecords, (record) => record.pillar);
  const themeSummaries = groupSummary(currentRecords, (record) => record.theme);
  const weekdaySummaries = weekdaySummary(currentRecords);
  const comparisons = compareWeeklySummaries(summary, previousSummary);
  const learnings = generateWeeklyLearnings({ summary, formatSummaries, pillarSummaries, themeSummaries });
  const recommendations = generateWeeklyRecommendations(learnings);
  const nextWeekPlan = generateNextWeekPlan(input.period, recommendations);
  const tasks = buildWeeklyTasks(recommendations, nextWeekPlan);
  const contentMatches = matchMetricsToContent(currentRecords, buildDefaultContentItems());
  const quality = scoreWeeklyReviewQuality(summary, currentRecords.length, previousRecords.length);
  const paidInsights = generatePaidMetricsInsights(currentRecords);
  const base = {
    period: input.period,
    currentRecords,
    previousRecords,
    summary,
    previousSummary,
    channelSummaries,
    formatSummaries,
    pillarSummaries,
    themeSummaries,
    weekdaySummaries,
    comparisons,
    learnings,
    recommendations,
    nextWeekPlan,
    tasks,
    contentMatches,
    quality,
    paidInsights
  };
  return {
    ...base,
    exports: buildWeeklyReviewExports(base)
  };
}

export function buildDefaultWeeklyReview(): WeeklyReviewReport {
  return generateWeeklyReview(buildDefaultWeeklyReviewInput());
}
