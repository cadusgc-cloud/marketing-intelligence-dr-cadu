import type { MarketingWorkspace, WorkspaceBackup, WorkspaceRestoreResult } from "@/lib/marketing-workspace/types";
import { workspaceSchemaVersion } from "@/lib/marketing-workspace/schema";
import { validateWorkspace } from "@/lib/marketing-workspace/validation";
import { createWorkspaceSnapshot, stableChecksum } from "@/lib/marketing-workspace/snapshots";
import { auditWorkspace } from "@/lib/marketing-workspace/audit";

export function exportWorkspaceBackup(workspace: MarketingWorkspace): WorkspaceBackup {
  return {
    version: workspaceSchemaVersion,
    createdAt: "2026-05-23T12:00:00.000Z",
    warning: "Backup tecnico local. Nao enviar para terceiros. Nao deve conter pacientes, credenciais ou documentos reais.",
    workspace,
    checksum: stableChecksum(workspace)
  };
}

export function serializeWorkspaceBackup(backup: WorkspaceBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function parseWorkspaceBackup(text: string): WorkspaceBackup {
  return JSON.parse(text) as WorkspaceBackup;
}

export function validateWorkspaceBackup(backup: WorkspaceBackup) {
  const issues = validateWorkspace(backup.workspace);
  if (backup.version !== workspaceSchemaVersion) issues.push({ code: "backup_version", message: "Backup com versao incompativel.", severity: "bloquear" as const, path: "version" });
  if (backup.checksum !== stableChecksum(backup.workspace)) issues.push({ code: "backup_checksum", message: "Checksum do backup nao confere.", severity: "bloquear" as const, path: "checksum" });
  return issues;
}

export function restoreWorkspaceBackup(currentWorkspace: MarketingWorkspace, backup: WorkspaceBackup): WorkspaceRestoreResult {
  const issues = validateWorkspaceBackup(backup);
  const preRestoreSnapshot = createWorkspaceSnapshot(currentWorkspace, "pre_restore", "Antes de restaurar backup");
  if (issues.some((issue) => issue.severity === "bloquear")) {
    return {
      ok: false,
      issues,
      preRestoreSnapshot,
      reportMarkdown: buildRestoreReport(false, issues.length)
    };
  }
  const restored: MarketingWorkspace = {
    ...backup.workspace,
    snapshots: [preRestoreSnapshot, ...backup.workspace.snapshots],
    history: [
      {
        id: "event-backup-restored",
        timestamp: "2026-05-23T12:00:00.000Z",
        type: "backup_restored",
        title: "Backup restaurado",
        description: "Backup tecnico local restaurado apos validacao.",
        severity: "atencao",
        sourceModule: "workspace",
        relatedRoute: "/workspace",
        metadata: { checksum: backup.checksum },
        safetyStatus: auditWorkspace(backup.workspace).status
      },
      ...backup.workspace.history
    ]
  };
  return {
    ok: true,
    restored,
    issues,
    preRestoreSnapshot,
    reportMarkdown: buildRestoreReport(true, issues.length)
  };
}

function buildRestoreReport(ok: boolean, issueCount: number): string {
  return [`# Restore workspace V8`, "", `Status: ${ok ? "aprovado" : "bloqueado"}`, `Issues: ${issueCount}`, "", "Restauração sempre local e dependente de confirmação humana."].join("\n");
}
