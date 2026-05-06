import { prisma } from "@/lib/db";
import { analyzeParsedReportWithHistory } from "@/lib/engine/analyzeReport";
import { parseReport } from "@/lib/parser/reportParser";
import type { ParsedReport } from "@/lib/types";

export async function saveAnalyzedReport(rawText: string) {
  const parsed = parseReport(rawText);
  const existingReports = await prisma.report.findMany({
    select: {
      title: true,
      periodStart: true,
      periodEnd: true,
      isOperationalAnomaly: true
    }
  });
  const analyzed = analyzeParsedReportWithHistory(parsed, existingReports);
  return createReportFromParsed(analyzed);
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
