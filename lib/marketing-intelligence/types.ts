export type ManualMetricFormat = "story" | "reel" | "post" | "carrossel" | "bastidor_neutro" | "reflexao";

export type ManualMetricPillar =
  | "estetica_natural"
  | "expectativa_realista"
  | "seguranca"
  | "cicatrizacao"
  | "consulta_nao_e_venda"
  | "plastica_em_evidencia"
  | "bastidor_neutro"
  | "ciencia_simples";

export type MetricRisk = "baixo" | "atencao" | "revisar" | "bloquear";
export type RecommendationPriority = "baixa" | "media" | "alta" | "critica";
export type RecommendationEffort = "baixo" | "medio" | "alto";
export type RecommendationImpact = "baixo" | "medio" | "alto";
export type PerformanceClassification = "forte" | "promissor" | "neutro" | "fraco" | "revisar" | "bloquear";

export type ManualMetricRecord = {
  date: string;
  channel: string;
  format: ManualMetricFormat | string;
  theme: string;
  pillar: ManualMetricPillar | string;
  title: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  replies: number;
  clicks: number;
  profileVisits: number;
  dms: number;
  retentionSeconds: number;
  status: string;
  risk: MetricRisk | string;
  effort: number;
  notes: string;
};

export type NormalizedMetricRecord = ManualMetricRecord & {
  id: string;
  normalizedFormat: ManualMetricFormat;
  normalizedPillar: ManualMetricPillar;
  totalInteractions: number;
  weightedInteractions: number;
  safeForLearning: boolean;
  sensitiveFlags: string[];
};

export type MetricValidationIssue = {
  row: number;
  field: string;
  message: string;
  severity: "warning" | "error" | "blocking";
};

export type MetricImportResult = {
  rows: ManualMetricRecord[];
  normalized: NormalizedMetricRecord[];
  issues: MetricValidationIssue[];
  ok: boolean;
  blocked: boolean;
  delimiter: "," | ";" | "\t";
};

export type PerformanceScore = {
  recordId: string;
  engagementScore: number;
  saveShareScore: number;
  conversationScore: number;
  reachScore: number;
  efficiencyScore: number;
  safetyPenalty: number;
  effortPenalty: number;
  strategicFitScore: number;
  repeatPotentialScore: number;
  overallPerformanceScore: number;
  classification: PerformanceClassification;
  alerts: string[];
};

export type ContentInsight = {
  record: NormalizedMetricRecord;
  score: PerformanceScore;
  recommendation: string;
};

export type PillarInsight = {
  pillar: ManualMetricPillar;
  label: string;
  averageScore: number;
  records: number;
  recommendation: string;
};

export type FormatInsight = {
  format: ManualMetricFormat;
  label: string;
  averageScore: number;
  records: number;
  recommendation: string;
};

export type TopicInsight = {
  theme: string;
  pillar: ManualMetricPillar;
  averageScore: number;
  saves: number;
  shares: number;
  dms: number;
  recommendation: string;
};

export type Recommendation = {
  id: string;
  title: string;
  rationale: string;
  priority: RecommendationPriority;
  effort: RecommendationEffort;
  expectedImpact: RecommendationImpact;
  risk: MetricRisk;
  suggestedFormat: ManualMetricFormat;
  relatedRoute: string;
  exportText: string;
};

export type NextBestAction = Recommendation & {
  order: number;
};

export type ContentOpportunity = {
  bucket:
    | "alto_desempenho_baixo_esforco"
    | "alto_desempenho_alto_esforco"
    | "baixo_desempenho_baixo_esforco"
    | "baixo_desempenho_alto_esforco"
    | "alto_risco_evitar"
    | "alto_valor_estrategico_manter"
    | "subutilizado_testar"
    | "saturado_variar";
  label: string;
  items: ContentInsight[];
  recommendation: string;
};

export type EditorialLearning = {
  repeat: ContentInsight[];
  vary: ContentInsight[];
  pause: ContentInsight[];
  transformToReel: ContentInsight[];
  transformToCarousel: ContentInsight[];
  transformToStories: ContentInsight[];
  strongPillars: PillarInsight[];
  strongFormats: FormatInsight[];
  imbalanceAlerts: string[];
};

export type LearningLoopReport = {
  generatedAt: string;
  datasetLabel: string;
  records: NormalizedMetricRecord[];
  scores: PerformanceScore[];
  topContents: ContentInsight[];
  weakContents: ContentInsight[];
  pillarInsights: PillarInsight[];
  formatInsights: FormatInsight[];
  topicInsights: TopicInsight[];
  learning: EditorialLearning;
  recommendations: NextBestAction[];
  opportunities: ContentOpportunity[];
  quality: IntelligenceQualityReport;
  summary: string;
};

export type ExperimentVariant = {
  id: string;
  label: string;
  description: string;
  format: ManualMetricFormat;
  safetyNotes: string[];
};

export type ExperimentPlan = {
  id: string;
  title: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  primaryMetric: string;
  secondaryMetric: string;
  suggestedDuration: string;
  successCriteria: string;
  risk: MetricRisk;
  safetyChecklist: string[];
  exportText: string;
  recommendation: string;
};

export type StrategyRoadmap = {
  summary: string;
  thirtyDays: string[];
  sixtyDays: string[];
  ninetyDays: string[];
  priorities: string[];
  risks: string[];
  productionRecommendations: string[];
  adaptiveCalendar: AdaptiveCalendarDay[];
  nextBestActions: NextBestAction[];
  exportText: string;
};

export type AdaptiveCalendarDay = {
  date: string;
  weekday: string;
  theme: string;
  pillar: ManualMetricPillar;
  format: ManualMetricFormat;
  rationale: string;
  safety: MetricRisk;
  exportText: string;
};

export type MetricsExportBundle = {
  insightsMarkdown: string;
  metricsTsv: string;
  googleAgenda: string;
  etusManual: string;
  experimentMarkdown: string;
  roadmapMarkdown: string;
  nextActionsMarkdown: string;
  technicalJson: string;
};

export type IntelligenceQualityReport = {
  score: number;
  status: "aprovado" | "revisar" | "bloqueado";
  blockingIssues: string[];
  warnings: string[];
  checks: string[];
};

export type IntelligenceDashboard = {
  datasetLabel: string;
  recordCount: number;
  intelligenceScore: number;
  report: LearningLoopReport;
  experiments: ExperimentPlan[];
  roadmap: StrategyRoadmap;
  exports: MetricsExportBundle;
};
