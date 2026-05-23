export type ReleaseReadinessStatus = "aprovado" | "revisar" | "bloqueado";

export type ReleaseChecklistItem = {
  id: string;
  label: string;
  status: ReleaseReadinessStatus;
  evidence: string;
  required: boolean;
};

export type ReleaseRisk = {
  id: string;
  severity: "baixo" | "medio" | "alto";
  description: string;
  mitigation: string;
};

export type ReleaseRouteStatus = {
  route: string;
  expectedText: string;
  status: ReleaseReadinessStatus;
};

export type ReleaseCommandStatus = {
  command: string;
  status: ReleaseReadinessStatus;
  expected: string;
};

export type ReleaseDocStatus = {
  path: string;
  status: ReleaseReadinessStatus;
};

export type ReleaseSafetyStatus = {
  noExternalApi: boolean;
  noAutoPublishing: boolean;
  noPatientData: boolean;
  noEnvChange: boolean;
  noPushMergeTag: boolean;
};

export type PullRequestDraft = {
  title: string;
  markdown: string;
};

export type ReleaseReadinessReport = {
  status: ReleaseReadinessStatus;
  branchBase: string;
  branchFeature: string;
  checklist: ReleaseChecklistItem[];
  routes: ReleaseRouteStatus[];
  commands: ReleaseCommandStatus[];
  docs: ReleaseDocStatus[];
  safety: ReleaseSafetyStatus;
  risks: ReleaseRisk[];
  recommendations: string[];
  pushCommandText: string;
  prDraft: PullRequestDraft;
  reportMarkdown: string;
};

export type ReleaseReadinessInput = {
  branchBase?: string;
  branchFeature?: string;
  missingRoutes?: string[];
  missingDocs?: string[];
  failingCommands?: string[];
};
