import type {
  CampaignInput,
  CampaignPlan,
  ContentChannel,
  EditorialDay,
  EditorialPillarId,
  SafetyClassification,
  SafetyGateResult
} from "@/lib/monthly-editorial";

export type TaskPriority = "baixa" | "media" | "alta" | "critica";
export type TaskStatus = "pendente" | "em_andamento" | "pronto" | "publicado_manual" | "bloqueado" | "arquivado";
export type OpsReadinessStatus = "pronto" | "quase_pronto" | "precisa_midia" | "precisa_revisao" | "bloqueado";
export type OpsViewScope = "hoje" | "semana" | "mes";

export type ExecutionTask = {
  id: string;
  dayId: string;
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  area: "stories" | "reels" | "post" | "carrossel" | "media" | "safety" | "publishing" | "exports" | "strategy";
  ownerSuggestion: "Cadu" | "marketing" | "editor" | "atendimento" | "revisao humana";
  actionWindow: "hoje" | "esta_semana" | "este_mes";
  blockedBySafety: boolean;
  exportText?: string;
};

export type EditorialAssetNeed = {
  id: string;
  category: string;
  label: string;
  reason: string;
  priority: TaskPriority;
  blocked: boolean;
};

export type MediaCaptureTask = ExecutionTask & {
  mediaCategory: string;
  captureGuidance: string;
  privacyNote: string;
};

export type PublishingReadiness = {
  score: number;
  status: OpsReadinessStatus;
  contentDefined: boolean;
  mediaDefined: boolean;
  textExportable: boolean;
  safetyApproved: boolean;
  taskCreated: boolean;
  readyForManualPublishing: boolean;
  blockers: string[];
};

export type DailyExecutionPlan = {
  date: string;
  dayNumber: number;
  weekday: string;
  theme: string;
  pillar: string;
  sourceDay: EditorialDay;
  storyExport: string;
  reelExport?: string;
  postExport?: string;
  mediaNeeds: EditorialAssetNeed[];
  tasks: ExecutionTask[];
  readiness: PublishingReadiness;
  risk: SafetyClassification;
  quickExport: string;
};

export type WeeklyExecutionPlan = {
  weekNumber: number;
  startDate: string;
  endDate: string;
  themes: string[];
  days: DailyExecutionPlan[];
  pendingTasks: ExecutionTask[];
  readyTasks: ExecutionTask[];
  mediaGaps: string[];
  reelsToRecord: ExecutionTask[];
  postsToPrepare: ExecutionTask[];
  storiesToPublishManually: ExecutionTask[];
  checklist: string[];
  readiness: PublishingReadiness;
  exportText: string;
};

export type MonthlyCampaignReference = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  objective: string;
  intensity: string;
};

export type ContentBacklogItem = {
  id: string;
  pillar: EditorialPillarId;
  theme: string;
  suggestedFormat: "story" | "reel" | "carrossel" | "post" | "youtube_video";
  priority: TaskPriority;
  editorialRisk: SafetyClassification;
  canBecomeStory: boolean;
  canBecomeReel: boolean;
  canBecomeCarousel: boolean;
  requiredMedia: string[];
};

export type ContentRepurposingPlan = {
  id: string;
  theme: string;
  pillar: EditorialPillarId;
  storySequence: string;
  reelScript: string;
  carousel: string;
  shortCaption: string;
  editorBriefing: string;
  mediaChecklist: string;
  spontaneousSpeech: string;
  onScreenText: string;
  googleAgenda: string;
  googleSheets: string;
  safetyGate: SafetyGateResult;
};

export type EditorialRiskSummary = {
  totalIssues: number;
  blockedContent: number;
  needsReview: number;
  safeContent: number;
  topRisks: Array<{ category: string; count: number }>;
  blockedDays: DailyExecutionPlan[];
  reviewDays: DailyExecutionPlan[];
  safetyGate: SafetyGateResult;
};

export type ContentProductionQueue = {
  tasks: ExecutionTask[];
  blockedTasks: ExecutionTask[];
  publicationTasks: ExecutionTask[];
  reviewTasks: ExecutionTask[];
  mediaTasks: MediaCaptureTask[];
  readyTasks: ExecutionTask[];
};

export type ExportPackage = {
  id: string;
  title: string;
  format:
    | "pacote_dia"
    | "pacote_semana"
    | "pacote_mes"
    | "stories"
    | "reels"
    | "carrosseis"
    | "legendas"
    | "briefing_editor"
    | "media_checklist"
    | "google_sheets"
    | "google_agenda"
    | "etus_manual"
    | "backup_json"
    | "relatorio_seguranca";
  description: string;
  text: string;
  userFacing: boolean;
};

export type ManualPublishingChecklist = {
  items: Array<{ id: string; label: string; checkedByDefault: boolean; blocking: boolean }>;
  exportText: string;
};

export type OpsHealthCheck = {
  id: string;
  label: string;
  status: "ok" | "atencao" | "bloqueado";
  message: string;
};

export type OpsRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  area: ExecutionTask["area"];
  nextAction: string;
};

export type EditorialOperation = {
  id: string;
  label: string;
  scope: OpsViewScope;
  status: TaskStatus;
  readiness: PublishingReadiness;
};

export type ExecutionDashboard = {
  today: DailyExecutionPlan;
  week: WeeklyExecutionPlan;
  month: MonthlyCampaignReference;
  days: DailyExecutionPlan[];
  tasks: ContentProductionQueue;
  backlog: ContentBacklogItem[];
  repurposing: ContentRepurposingPlan[];
  media: {
    assetNeeds: EditorialAssetNeed[];
    captureTasks: MediaCaptureTask[];
    gaps: string[];
    blockedTerms: string[];
  };
  safety: EditorialRiskSummary;
  exports: ExportPackage[];
  checklist: ManualPublishingChecklist;
  healthChecks: OpsHealthCheck[];
  recommendations: OpsRecommendation[];
  operations: EditorialOperation[];
  readiness: {
    today: PublishingReadiness;
    week: PublishingReadiness;
    month: PublishingReadiness;
    bottlenecks: string[];
  };
};

export type MarketingOpsState = {
  id: string;
  campaignInput: CampaignInput;
  campaignPlan: CampaignPlan;
  dashboard: ExecutionDashboard;
  generatedAt: Date;
};

export type MarketingOpsBuildOptions = {
  campaignInput?: CampaignInput;
  todayDate?: string;
};

export type OpsLocalState = {
  activeCampaignId?: string;
  taskStatuses: Record<string, TaskStatus>;
  selectedScope: OpsViewScope;
  filters: {
    status?: TaskStatus;
    risk?: SafetyClassification;
    area?: ExecutionTask["area"];
  };
};
