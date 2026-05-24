import type { MarketingWorkspace, WorkspaceHealthStatus, WorkspaceValidationIssue } from "@/lib/marketing-workspace/types";
import { detectWorkspaceSensitiveText } from "@/lib/marketing-workspace/validation";
import { workspaceSchemaVersion } from "@/lib/marketing-workspace/schema";

export function auditWorkspace(workspace: MarketingWorkspace): {
  status: WorkspaceHealthStatus;
  score: number;
  issues: WorkspaceValidationIssue[];
  checkedAt: string;
  summary: string;
} {
  const issues: WorkspaceValidationIssue[] = [];
  if (workspace.version !== workspaceSchemaVersion) {
    issues.push({ code: "version_incompatible", message: "Versao do workspace diferente do schema atual.", severity: "revisar", path: "version" });
  }
  if (!workspace.metadata?.id || !workspace.settings || !workspace.activeCycle) {
    issues.push({ code: "required_missing", message: "Campos obrigatorios ausentes.", severity: "bloquear" });
  }
  if (workspace.settings.snapshotRetention < 1 || workspace.settings.snapshotRetention > 52) {
    issues.push({ code: "retention_invalid", message: "Retencao de snapshots fora do intervalo seguro.", severity: "revisar", path: "settings.snapshotRetention" });
  }
  const duplicatedWeeks = new Set<string>();
  const seenWeeks = new Set<string>();
  workspace.closedWeeks.forEach((week) => {
    if (seenWeeks.has(week.weekId)) duplicatedWeeks.add(week.weekId);
    seenWeeks.add(week.weekId);
  });
  duplicatedWeeks.forEach((weekId) => issues.push({ code: "duplicate_week", message: `Semana duplicada: ${weekId}.`, severity: "revisar", path: "closedWeeks" }));

  workspace.history.forEach((event, index) => {
    if (!event.type) issues.push({ code: "history_missing_type", message: "Evento sem tipo.", severity: "bloquear", path: `history.${index}` });
    const sensitive = detectWorkspaceSensitiveText(JSON.stringify(event.metadata));
    if (sensitive.length) issues.push({ code: "history_sensitive_metadata", message: "Metadata de historico contem dado sensivel.", severity: "bloquear", path: `history.${index}.metadata` });
  });

  workspace.snapshots.forEach((snapshot, index) => {
    if (!snapshot.checksum || !snapshot.restoreEligible) {
      issues.push({ code: "snapshot_invalid", message: `Snapshot invalido ou inelegivel: ${snapshot.id}.`, severity: "revisar", path: `snapshots.${index}` });
    }
    const sensitive = detectWorkspaceSensitiveText(JSON.stringify(snapshot.sanitizedState));
    if (sensitive.length) issues.push({ code: "snapshot_sensitive", message: "Snapshot contem dado sensivel.", severity: "bloquear", path: `snapshots.${index}` });
  });

  const fullSensitive = detectWorkspaceSensitiveText(JSON.stringify({
    metadata: workspace.metadata,
    settings: workspace.settings,
    activeCycle: workspace.activeCycle,
    closedWeeks: workspace.closedWeeks
  }));
  if (fullSensitive.length) {
    issues.push({ code: "workspace_sensitive", message: "Workspace contem termo sensivel ou credencial.", severity: "bloquear" });
  }

  const blocking = issues.some((issue) => issue.severity === "bloquear");
  const reviewing = issues.some((issue) => issue.severity === "revisar");
  const warning = issues.some((issue) => issue.severity === "atencao");
  const status: WorkspaceHealthStatus = blocking ? "bloquear" : reviewing ? "revisar" : warning ? "atencao" : "saudavel";
  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + (issue.severity === "bloquear" ? 35 : issue.severity === "revisar" ? 18 : 8), 0));
  return {
    status,
    score,
    issues,
    checkedAt: "2026-05-23T12:00:00.000Z",
    summary: issues.length ? `${issues.length} pontos de atencao encontrados.` : "Workspace local saudavel e sem dados sensiveis detectados."
  };
}
