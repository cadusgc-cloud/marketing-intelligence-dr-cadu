export type WorkspaceHealthStatus = "saudavel" | "atencao" | "revisar" | "bloquear";
export type SnapshotType =
  | "daily"
  | "weekly"
  | "pre_import"
  | "post_import"
  | "pre_review"
  | "post_review"
  | "pre_strategy"
  | "post_strategy"
  | "manual"
  | "pre_restore"
  | "post_restore";
export type WorkspaceHistoryEventType =
  | "workspace_created"
  | "settings_updated"
  | "import_started"
  | "import_validated"
  | "weekly_review_completed"
  | "strategy_generated"
  | "content_package_generated"
  | "recording_session_planned"
  | "export_generated"
  | "safety_issue_detected"
  | "task_completed"
  | "snapshot_created"
  | "backup_exported"
  | "backup_restored"
  | "local_data_reset"
  | "route_health_checked"
  | "qa_checked";
export type WorkspaceEventSeverity = "info" | "atencao" | "revisar" | "bloquear";
export type RunbookTaskStatus = "pendente" | "em_andamento" | "pronto" | "feito" | "bloqueado";
export type RunbookTaskPriority = "baixa" | "media" | "alta" | "critica";

export type WorkspaceMetadata = {
  id: string;
  name: string;
  ownerLabel: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
  notice: string;
};

export type WorkspaceSettings = {
  workspaceName: string;
  weekStartsOn: "domingo" | "segunda";
  defaultEditorialIntensity: "leve" | "padrao" | "intensa";
  activeChannels: string[];
  activeFormats: string[];
  priorityPillars: string[];
  safetyLimits: {
    safeMode: boolean;
    blockSensitiveData: boolean;
    requireRestoreConfirmation: boolean;
  };
  exportPreference: "markdown" | "tsv" | "agenda" | "etus_manual";
  snapshotRetention: number;
};

export type ActiveCycle = {
  weekId: string;
  periodStart: string;
  periodEnd: string;
  campaignName: string;
  currentFocus: string;
  lastWeeklyReviewId?: string;
  nextRecommendedCycle: string;
  readinessScore: number;
  riskStatus: WorkspaceHealthStatus;
};

export type WorkspaceSnapshot = {
  id: string;
  createdAt: string;
  type: SnapshotType;
  label: string;
  version: string;
  summary: string;
  sanitizedState: Pick<MarketingWorkspace, "metadata" | "settings" | "activeCycle"> & {
    historyCount: number;
    snapshotCount: number;
  };
  checksum: string;
  safetyStatus: WorkspaceHealthStatus;
  sizeEstimateBytes: number;
  restoreEligible: boolean;
};

export type WorkspaceHistoryEvent = {
  id: string;
  timestamp: string;
  type: WorkspaceHistoryEventType;
  title: string;
  description: string;
  severity: WorkspaceEventSeverity;
  sourceModule: string;
  relatedRoute: string;
  relatedEntityId?: string;
  metadata: Record<string, string | number | boolean>;
  safetyStatus: WorkspaceHealthStatus;
};

export type WorkspaceAuditEvent = WorkspaceHistoryEvent;

export type WorkspaceValidationIssue = {
  code: string;
  message: string;
  severity: WorkspaceEventSeverity;
  path?: string;
};

export type WorkspaceIntegrityReport = {
  status: WorkspaceHealthStatus;
  score: number;
  issues: WorkspaceValidationIssue[];
  checkedAt: string;
  summary: string;
};

export type WorkspaceBackup = {
  version: string;
  createdAt: string;
  warning: string;
  workspace: MarketingWorkspace;
  checksum: string;
};

export type WorkspaceRestoreResult = {
  ok: boolean;
  restored?: MarketingWorkspace;
  issues: WorkspaceValidationIssue[];
  preRestoreSnapshot?: WorkspaceSnapshot;
  reportMarkdown: string;
};

export type RunbookTask = {
  id: string;
  title: string;
  description: string;
  priority: RunbookTaskPriority;
  estimatedMinutes: number;
  relatedRoute: string;
  prerequisites: string[];
  status: RunbookTaskStatus;
};

export type RunbookDay = {
  date: string;
  weekday: string;
  objective: string;
  tasks: RunbookTask[];
  exportText: string;
};

export type RunbookPlan = {
  id: string;
  weekStart: string;
  weekEnd: string;
  status: WorkspaceHealthStatus;
  days: RunbookDay[];
  totalEstimatedMinutes: number;
  exportMarkdown: string;
  checklistText: string;
};

export type WorkspaceExportBundle = {
  backupJson: string;
  historyMarkdown: string;
  historyTsv: string;
  runbookMarkdown: string;
  snapshotsMarkdown: string;
  integrityMarkdown: string;
};

export type WorkspaceMigration = {
  fromVersion: string;
  toVersion: string;
  description: string;
};

export type LocalStorageAdapterResult = {
  ok: boolean;
  workspace?: MarketingWorkspace;
  error?: string;
};

export type MarketingWorkspace = {
  version: string;
  metadata: WorkspaceMetadata;
  settings: WorkspaceSettings;
  activeCycle: ActiveCycle;
  snapshots: WorkspaceSnapshot[];
  history: WorkspaceHistoryEvent[];
  auditTrail: WorkspaceAuditEvent[];
  closedWeeks: Array<{
    weekId: string;
    periodStart: string;
    periodEnd: string;
    summary: string;
    readinessScore: number;
    riskStatus: WorkspaceHealthStatus;
  }>;
};
