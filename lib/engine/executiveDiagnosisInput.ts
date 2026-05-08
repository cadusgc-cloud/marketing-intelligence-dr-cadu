import type { ExecutiveDiagnosisInput } from "@/lib/engine/executiveDiagnosis";
import type { Diagnosis, ParsedDataIssue, Priority, RecommendationCategory } from "@/lib/types";
import { isExcludedFromNormalAnalysis } from "@/lib/utils/dates";

type ReportLike = NonNullable<ExecutiveDiagnosisInput["report"]> & {
  channelSummaries?: Array<Record<string, unknown>>;
  creatives?: Array<{
    name: string;
    diagnosis?: string | null;
    cpl?: number | null;
    investment?: number | null;
    profileVisits?: number | null;
    conversations?: number | null;
    leads?: number | null;
  }>;
  keywords?: Array<{
    keyword: string;
    diagnosis?: string | null;
    cpa?: number | null;
    conversions?: number | null;
  }>;
  recommendations?: Array<{
    category?: string | null;
    priority?: string | null;
    title: string;
    evidence: string;
    recommendation: string;
    confidence: number;
  }>;
  dataIssues?: Array<{
    severity?: string | null;
    issueType?: string | null;
    description: string;
    fieldName?: string | null;
    expectedValue?: string | null;
    foundValue?: string | null;
  }>;
};

const diagnoses: Diagnosis[] = ["scale", "keep", "vary", "pause", "investigate", "unknown"];
const priorities: Priority[] = ["low", "medium", "high", "critical"];
const recommendationCategories: RecommendationCategory[] = ["tofu", "mofu", "bofu", "google_ads", "content", "validation", "compliance", "budget", "creative"];
const issueTypes: ParsedDataIssue["issueType"][] = ["period_conflict", "metric_mismatch", "duplicated_period", "inferred_metric", "template_error", "missing_data", "operational_anomaly"];

function asDiagnosis(value?: string | null): Diagnosis {
  return diagnoses.includes(value as Diagnosis) ? (value as Diagnosis) : "unknown";
}

function asPriority(value?: string | null): Priority {
  return priorities.includes(value as Priority) ? (value as Priority) : "medium";
}

function asRecommendationCategory(value?: string | null): RecommendationCategory {
  return recommendationCategories.includes(value as RecommendationCategory) ? (value as RecommendationCategory) : "validation";
}

function asIssueType(value?: string | null): ParsedDataIssue["issueType"] {
  return issueTypes.includes(value as ParsedDataIssue["issueType"]) ? (value as ParsedDataIssue["issueType"]) : "template_error";
}

export function isExecutiveDiagnosisEligibleReport(report: Pick<ReportLike, "periodStart" | "periodEnd" | "isOperationalAnomaly">): boolean {
  return !isExcludedFromNormalAnalysis(report);
}

export function findLatestExecutiveDiagnosisReport<T extends ReportLike>(reports: T[]): T | null {
  return reports.find(isExecutiveDiagnosisEligibleReport) ?? null;
}

export function buildExecutiveDiagnosisInput(report: ReportLike): ExecutiveDiagnosisInput {
  return {
    report,
    channels: (report.channelSummaries ?? []).map((channel) => ({ ...channel })),
    creatives: (report.creatives ?? []).map((creative) => ({
      name: creative.name,
      diagnosis: asDiagnosis(creative.diagnosis),
      cpl: creative.cpl,
      investment: creative.investment,
      profileVisits: creative.profileVisits,
      conversations: creative.conversations,
      leads: creative.leads
    })),
    keywords: (report.keywords ?? []).map((keyword) => ({
      keyword: keyword.keyword,
      diagnosis: asDiagnosis(keyword.diagnosis),
      cpa: keyword.cpa,
      conversions: keyword.conversions
    })),
    recommendations: (report.recommendations ?? []).map((recommendation) => ({
      category: asRecommendationCategory(recommendation.category),
      priority: asPriority(recommendation.priority),
      title: recommendation.title,
      evidence: recommendation.evidence,
      recommendation: recommendation.recommendation,
      confidence: recommendation.confidence
    })),
    dataIssues: (report.dataIssues ?? []).map((issue) => ({
      severity: asPriority(issue.severity),
      issueType: asIssueType(issue.issueType),
      description: issue.description,
      fieldName: issue.fieldName,
      expectedValue: issue.expectedValue,
      foundValue: issue.foundValue
    }))
  };
}
