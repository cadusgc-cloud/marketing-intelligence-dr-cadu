import type { NormalizedReportRow } from "@/lib/report-imports/types";

export type ConfidenceLevel = "alto" | "moderado" | "baixo" | "insuficiente";
export type WeeklyRecommendationType = "repetir" | "variar" | "pausar" | "transformar" | "testar" | "gravar" | "revisar";

export type WeekPeriod = {
  startDate: string;
  endDate: string;
  label: string;
};

export type WeeklyReviewInput = {
  period: WeekPeriod;
  records: NormalizedReportRow[];
  previousRecords?: NormalizedReportRow[];
  objective?: string;
};

export type WeeklyMetricTotals = {
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  replies: number;
  clicks: number;
  profileVisits: number;
  follows: number;
  spend: number;
  leads: number;
  results: number;
};

export type WeeklyMetricSummary = {
  records: number;
  totals: WeeklyMetricTotals;
  engagementRate: number;
  saveShareRate: number;
  paidEfficiency: number;
};

export type WeeklyGroupSummary = {
  key: string;
  label: string;
  records: number;
  totals: WeeklyMetricTotals;
  score: number;
  signal: string;
};

export type WeeklyComparison = {
  metric: keyof WeeklyMetricTotals | "engagementRate" | "saveShareRate";
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
  direction: "up" | "down" | "stable";
};

export type WeeklyLearning = {
  type: WeeklyRecommendationType;
  title: string;
  rationale: string;
  relatedTheme?: string;
  confidence: ConfidenceLevel;
};

export type WeeklyRecommendation = WeeklyLearning & {
  priority: "alta" | "media" | "baixa";
  action: string;
  exportText: string;
};

export type NextWeekDayPlan = {
  date: string;
  weekday: string;
  theme: string;
  pillar: string;
  format: string;
  stories: string[];
  mediaNeeded: string[];
  rationale: string;
  safety: "seguro" | "atencao" | "revisar";
  readiness: number;
  exportText: string;
};

export type NextWeekPlan = {
  period: WeekPeriod;
  days: NextWeekDayPlan[];
  googleAgenda: string;
  tsv: string;
};

export type WeeklyTask = {
  id: string;
  title: string;
  priority: "alta" | "media" | "baixa";
  status: "pendente" | "revisar" | "pronto" | "bloqueado";
  route: string;
  exportText: string;
};

export type ContentMatchInput = {
  id: string;
  date?: string;
  format?: string;
  title?: string;
  theme?: string;
  pillar?: string;
};

export type ContentMatchResult = {
  strongMatches: Array<{ record: NormalizedReportRow; content: ContentMatchInput; confidence: number }>;
  probableMatches: Array<{ record: NormalizedReportRow; content: ContentMatchInput; confidence: number }>;
  unmatched: NormalizedReportRow[];
  conflicts: string[];
  duplicates: string[];
};

export type WeeklyReviewQualityResult = {
  score: number;
  confidence: ConfidenceLevel;
  status: "aprovado" | "revisar" | "insuficiente";
  reasons: string[];
};

export type WeeklyExportBundle = {
  weeklyMarkdown: string;
  executiveSummary: string;
  googleSheetsTsv: string;
  googleAgenda: string;
  etusManual: string;
  recordingPlan: string;
  tasksMarkdown: string;
  studioRecommendations: string;
  experimentsMarkdown: string;
  importQualityMarkdown: string;
  sensitiveAuditMarkdown: string;
  technicalJson: string;
  paidMetricsMarkdown: string;
  nextCollectionChecklist: string;
};

export type WeeklyReviewReport = {
  period: WeekPeriod;
  currentRecords: NormalizedReportRow[];
  previousRecords: NormalizedReportRow[];
  summary: WeeklyMetricSummary;
  previousSummary: WeeklyMetricSummary;
  channelSummaries: WeeklyGroupSummary[];
  formatSummaries: WeeklyGroupSummary[];
  pillarSummaries: WeeklyGroupSummary[];
  themeSummaries: WeeklyGroupSummary[];
  weekdaySummaries: WeeklyGroupSummary[];
  comparisons: WeeklyComparison[];
  learnings: WeeklyLearning[];
  recommendations: WeeklyRecommendation[];
  nextWeekPlan: NextWeekPlan;
  tasks: WeeklyTask[];
  contentMatches: ContentMatchResult;
  quality: WeeklyReviewQualityResult;
  exports: WeeklyExportBundle;
  paidInsights: string[];
};
