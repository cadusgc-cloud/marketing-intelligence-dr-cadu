import type { PilotWeekScenario } from "@/lib/marketing-scenarios";

export type QualitySeverity = "info" | "warning" | "blocking";
export type QualityArea = "stories" | "reels" | "posts" | "exports" | "safety" | "routes" | "pr_readiness";

export type QualityIssue = {
  id: string;
  area: QualityArea;
  severity: QualitySeverity;
  message: string;
  source: string;
  suggestion: string;
};

export type QualityCheckResult = {
  id: string;
  label: string;
  area: QualityArea;
  passed: boolean;
  severity: QualitySeverity;
  issues: QualityIssue[];
};

export type QualityReportStatus = "aprovado" | "revisar" | "bloqueado";

export type MarketingQualityReport = {
  id: string;
  scenarioId: string;
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  blockingChecks: number;
  score: number;
  status: QualityReportStatus;
  issues: QualityIssue[];
  checks: QualityCheckResult[];
  exportValidation: {
    googleSheets: boolean;
    googleAgenda: boolean;
    etusManual: boolean;
    dailyPackages: boolean;
    weeklyPackage: boolean;
    backupJson: boolean;
    userExportsWithoutRawJson: boolean;
  };
};

export type MarketingQualityInput = {
  scenario?: PilotWeekScenario;
  injectedText?: string;
};
