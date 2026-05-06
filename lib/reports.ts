import { prisma } from "@/lib/db";
import { mapBenchmarkSettingsToRecommendationBenchmarks } from "@/lib/benchmarks";
import type { RecommendationHistoryReport } from "@/lib/engine/recommendationEngine";
import { analyzeParsedReportWithHistory } from "@/lib/engine/analyzeReport";
import { parseReport } from "@/lib/parser/reportParser";
import type { Channel, CreativeFormat, Diagnosis, FunnelStage, ParsedReport, Platform } from "@/lib/types";

type ReportHistoryRecord = {
  title: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  isOperationalAnomaly: boolean;
  channelSummaries: Array<{
    channel: string;
    investment: number | null;
    reach: number | null;
    impressions: number | null;
    frequency: number | null;
    clicks: number | null;
    profileVisits: number | null;
    newFollowers: number | null;
    followersTotal: number | null;
    conversations: number | null;
    conversions: number | null;
    opportunities: number | null;
    cpl: number | null;
    cpa: number | null;
    cps: number | null;
    cpc: number | null;
    ctr: number | null;
    engagementRate: number | null;
    storyCount: number | null;
    storyViews: number | null;
    storyRetention: number | null;
    reelCount: number | null;
    postCount: number | null;
  }>;
  creatives: Array<{
    platform: string;
    name: string;
    format: string;
    funnelStage: string;
    investment: number | null;
    conversations: number | null;
    conversions: number | null;
    leads: number | null;
    cpl: number | null;
    cpa: number | null;
    profileVisits: number | null;
    reach: number | null;
    impressions: number | null;
    interactions: number | null;
    saves: number | null;
    shares: number | null;
    comments: number | null;
    diagnosis: string;
  }>;
  keywords: Array<{
    keyword: string;
    investment: number | null;
    clicks: number | null;
    conversions: number | null;
    cpa: number | null;
    diagnosis: string;
  }>;
};

export async function saveAnalyzedReport(rawText: string) {
  const parsed = parseReport(rawText);
  const existingReports = await prisma.report.findMany({
    select: {
      title: true,
      periodStart: true,
      periodEnd: true,
      isOperationalAnomaly: true,
      channelSummaries: true,
      creatives: true,
      keywords: true
    }
  });
  const benchmarkSettings = await prisma.benchmarkSetting.findMany({
    select: {
      key: true,
      value: true,
      unit: true
    }
  });
  const benchmarks = mapBenchmarkSettingsToRecommendationBenchmarks(benchmarkSettings);
  const analyzed = analyzeParsedReportWithHistory(parsed, existingReports.map(mapReportToRecommendationHistory), benchmarks);
  return createReportFromParsed(analyzed);
}

function mapReportToRecommendationHistory(report: ReportHistoryRecord): RecommendationHistoryReport {
  return {
    title: report.title,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    isOperationalAnomaly: report.isOperationalAnomaly,
    channels: report.channelSummaries.map((channel) => ({
      channel: channel.channel as Channel,
      investment: channel.investment,
      reach: channel.reach,
      impressions: channel.impressions,
      frequency: channel.frequency,
      clicks: channel.clicks,
      profileVisits: channel.profileVisits,
      newFollowers: channel.newFollowers,
      followersTotal: channel.followersTotal,
      conversations: channel.conversations,
      conversions: channel.conversions,
      opportunities: channel.opportunities,
      cpl: channel.cpl,
      cpa: channel.cpa,
      cps: channel.cps,
      cpc: channel.cpc,
      ctr: channel.ctr,
      engagementRate: channel.engagementRate,
      storyCount: channel.storyCount,
      storyViews: channel.storyViews,
      storyRetention: channel.storyRetention,
      reelCount: channel.reelCount,
      postCount: channel.postCount
    })),
    creatives: report.creatives.map((creative) => ({
      platform: creative.platform as Platform,
      name: creative.name,
      format: creative.format as CreativeFormat,
      funnelStage: creative.funnelStage as FunnelStage,
      investment: creative.investment,
      conversations: creative.conversations,
      conversions: creative.conversions,
      leads: creative.leads,
      cpl: creative.cpl,
      cpa: creative.cpa,
      profileVisits: creative.profileVisits,
      reach: creative.reach,
      impressions: creative.impressions,
      interactions: creative.interactions,
      saves: creative.saves,
      shares: creative.shares,
      comments: creative.comments,
      diagnosis: creative.diagnosis as Diagnosis
    })),
    keywords: report.keywords.map((keyword) => ({
      keyword: keyword.keyword,
      investment: keyword.investment,
      clicks: keyword.clicks,
      conversions: keyword.conversions,
      cpa: keyword.cpa,
      diagnosis: keyword.diagnosis as Diagnosis
    }))
  };
}

export async function createReportFromParsed(parsed: ParsedReport) {
  return prisma.report.create({
    data: {
      title: parsed.title,
      rawText: parsed.rawText,
      reportType: parsed.reportType,
      periodStart: parsed.periodStart,
      periodEnd: parsed.periodEnd,
      receivedAt: parsed.receivedAt,
      sourceLabel: parsed.sourceLabel,
      isOperationalAnomaly: parsed.isOperationalAnomaly,
      anomalyReason: parsed.anomalyReason,
      confidenceScore: parsed.confidenceScore,
      channelSummaries: {
        create: parsed.channels.map((channel) => ({
          channel: channel.channel,
          investment: channel.investment,
          reach: channel.reach,
          impressions: channel.impressions,
          frequency: channel.frequency,
          clicks: channel.clicks,
          profileVisits: channel.profileVisits,
          newFollowers: channel.newFollowers,
          followersTotal: channel.followersTotal,
          conversations: channel.conversations,
          conversions: channel.conversions,
          opportunities: channel.opportunities,
          cpl: channel.cpl,
          cpa: channel.cpa,
          cps: channel.cps,
          cpc: channel.cpc,
          ctr: channel.ctr,
          engagementRate: channel.engagementRate,
          storyCount: channel.storyCount,
          storyViews: channel.storyViews,
          storyRetention: channel.storyRetention,
          reelCount: channel.reelCount,
          postCount: channel.postCount
        }))
      },
      creatives: {
        create: parsed.creatives.map((creative) => ({
          platform: creative.platform,
          name: creative.name,
          format: creative.format ?? "unknown",
          funnelStage: creative.funnelStage ?? "unknown",
          investment: creative.investment,
          conversations: creative.conversations,
          conversions: creative.conversions,
          leads: creative.leads,
          cpl: creative.cpl,
          cpa: creative.cpa,
          profileVisits: creative.profileVisits,
          reach: creative.reach,
          impressions: creative.impressions,
          interactions: creative.interactions,
          saves: creative.saves,
          shares: creative.shares,
          comments: creative.comments,
          diagnosis: creative.diagnosis ?? "unknown"
        }))
      },
      keywords: {
        create: parsed.keywords.map((keyword) => ({
          keyword: keyword.keyword,
          investment: keyword.investment,
          clicks: keyword.clicks,
          conversions: keyword.conversions,
          cpa: keyword.cpa,
          diagnosis: keyword.diagnosis ?? "unknown"
        }))
      },
      recommendations: {
        create: parsed.recommendations.map((recommendation) => ({
          category: recommendation.category,
          priority: recommendation.priority,
          title: recommendation.title,
          evidence: recommendation.evidence,
          recommendation: recommendation.recommendation,
          confidence: recommendation.confidence
        }))
      },
      dataIssues: {
        create: parsed.dataIssues.map((issue) => ({
          severity: issue.severity,
          issueType: issue.issueType,
          description: issue.description,
          fieldName: issue.fieldName,
          expectedValue: issue.expectedValue,
          foundValue: issue.foundValue
        }))
      }
    }
  });
}

export async function getReports() {
  return prisma.report.findMany({
    orderBy: [{ periodEnd: "desc" }, { createdAt: "desc" }],
    include: {
      channelSummaries: true,
      dataIssues: true,
      recommendations: true,
      creatives: true,
      keywords: true
    }
  });
}

export async function getReport(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: {
      channelSummaries: true,
      dataIssues: true,
      recommendations: true,
      creatives: true,
      keywords: true
    }
  });
}
