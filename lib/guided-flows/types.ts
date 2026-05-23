export type GuidedFlowStatus = "nao_iniciado" | "em_andamento" | "aguardando_dados" | "bloqueado" | "concluido";
export type FlowStepStatus = "pendente" | "concluida" | "bloqueada";
export type FlowPrerequisiteStatus = "ok" | "atencao" | "ausente" | "bloqueante";
export type FlowComplexity = "baixa" | "media" | "alta";
export type FlowRiskLevel = "baixo" | "medio" | "alto";
export type FlowOutputType = "markdown" | "tsv" | "agenda" | "etus" | "backup_json" | "checklist" | "pr_draft";

export type FlowRouteLink = {
  route: string;
  label: string;
  reason: string;
};

export type FlowPrerequisite = {
  id: string;
  description: string;
  status: FlowPrerequisiteStatus;
  routeToResolve: string;
  suggestion: string;
  severity: "info" | "atencao" | "bloqueante";
};

export type GuidedFlowStep = {
  id: string;
  title: string;
  description: string;
  route: string;
  expectedOutput: string;
  validation: string;
  risk: FlowRiskLevel;
  estimatedMinutes: number;
};

export type FlowOutput = {
  id: string;
  label: string;
  type: FlowOutputType;
  description: string;
};

export type GuidedFlow = {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  complexity: FlowComplexity;
  modulesUsed: string[];
  routeLinks: FlowRouteLink[];
  prerequisites: FlowPrerequisite[];
  steps: GuidedFlowStep[];
  outputs: FlowOutput[];
  risks: string[];
  status: GuidedFlowStatus;
  lastRunLabel: string;
};

export type FlowRunContext = {
  now?: string;
  hasWorkspace?: boolean;
  hasImportedData?: boolean;
  hasWeeklyReview?: boolean;
  hasBackup?: boolean;
  hasSafetyReview?: boolean;
  hasThemes?: boolean;
  hasReleaseChecks?: boolean;
  currentRoute?: string;
  weekday?: "domingo" | "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado";
  completedStepIds?: string[];
};

export type GuidedFlowRun = {
  id: string;
  flowId: string;
  startedAt: string;
  updatedAt: string;
  status: GuidedFlowStatus;
  completedStepIds: string[];
  currentStepId?: string;
  progressPercent: number;
  exportText: string;
};

export type FlowProgress = {
  totalSteps: number;
  completedSteps: number;
  progressPercent: number;
  status: GuidedFlowStatus;
  nextStep?: GuidedFlowStep;
};

export type FlowValidationResult = {
  ok: boolean;
  blockingIssues: string[];
  warnings: string[];
};

export type FlowRecommendation = {
  flowId: string;
  priority: "baixa" | "media" | "alta" | "critica";
  reason: string;
  route: string;
};

export type FlowExportBundle = {
  flowSummaryMarkdown: string;
  flowChecklistMarkdown: string;
  flowOutputsTsv: string;
};

export type NextOperationalAction = {
  title: string;
  reason: string;
  recommendedRoute: string;
  estimatedMinutes: number;
  risk: FlowRiskLevel;
  prerequisites: string[];
  expectedOutput: string;
  shortAlternative: string;
};

export type CommandCenterDashboard = {
  systemStatus: "operacional" | "atencao" | "bloqueado";
  workspaceName: string;
  activeWeek: string;
  readinessScore: number;
  safetyStatus: string;
  qaStatus: string;
  routeStatus: string;
  nextAction: NextOperationalAction;
  prioritizedFlows: GuidedFlow[];
  alerts: string[];
  shortcuts: FlowRouteLink[];
  releaseStatus: string;
};
