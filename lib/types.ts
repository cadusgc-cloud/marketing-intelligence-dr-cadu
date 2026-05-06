export type ReportType = "weekly" | "biweekly" | "monthly" | "content" | "traffic" | "mixed";
export type Channel = "meta_ads" | "google_ads" | "instagram_organic" | "consolidated";
export type Platform = "meta_ads" | "instagram_organic" | "google_ads";
export type CreativeFormat = "video" | "carousel" | "image" | "reel" | "story" | "unknown";
export type FunnelStage = "tofu" | "mofu" | "bofu" | "unknown";
export type Diagnosis = "scale" | "keep" | "vary" | "pause" | "investigate" | "unknown";
export type Priority = "low" | "medium" | "high" | "critical";
export type RecommendationCategory = "tofu" | "mofu" | "bofu" | "google_ads" | "content" | "validation" | "compliance" | "budget" | "creative";

export type ParsedChannel = {
  channel: Channel;
  investment?: number | null;
  reach?: number | null;
  impressions?: number | null;
  frequency?: number | null;
  clicks?: number | null;
  profileVisits?: number | null;
  newFollowers?: number | null;
  followersTotal?: number | null;
  conversations?: number | null;
  conversions?: number | null;
  opportunities?: number | null;
  cpl?: number | null;
  cpa?: number | null;
  cps?: number | null;
  cpc?: number | null;
  ctr?: number | null;
  engagementRate?: number | null;
  storyCount?: number | null;
  storyViews?: number | null;
  storyRetention?: number | null;
  reelCount?: number | null;
  postCount?: number | null;
};

export type ParsedCreative = {
  platform: Platform;
  name: string;
  format?: CreativeFormat;
  funnelStage?: FunnelStage;
  investment?: number | null;
  conversations?: number | null;
  conversions?: number | null;
  leads?: number | null;
  cpl?: number | null;
  cpa?: number | null;
  profileVisits?: number | null;
  reach?: number | null;
  impressions?: number | null;
  interactions?: number | null;
  saves?: number | null;
  shares?: number | null;
  comments?: number | null;
  diagnosis?: Diagnosis;
};

export type ParsedKeyword = {
  keyword: string;
  investment?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  cpa?: number | null;
  diagnosis?: Diagnosis;
};

export type ParsedRecommendation = {
  category: RecommendationCategory;
  priority: Priority;
  title: string;
  evidence: string;
  recommendation: string;
  confidence: number;
};

export type ParsedDataIssue = {
  severity: Priority;
  issueType: "period_conflict" | "metric_mismatch" | "duplicated_period" | "inferred_metric" | "template_error" | "missing_data" | "operational_anomaly";
  description: string;
  fieldName?: string | null;
  expectedValue?: string | null;
  foundValue?: string | null;
};

export type ParsedReport = {
  title: string;
  rawText: string;
  reportType: ReportType;
  periodStart: Date | null;
  periodEnd: Date | null;
  receivedAt: Date | null;
  sourceLabel: string | null;
  isOperationalAnomaly: boolean;
  anomalyReason: string | null;
  confidenceScore: number;
  channels: ParsedChannel[];
  creatives: ParsedCreative[];
  keywords: ParsedKeyword[];
  recommendations: ParsedRecommendation[];
  dataIssues: ParsedDataIssue[];
};
