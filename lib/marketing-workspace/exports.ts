import type { MarketingWorkspace, WorkspaceExportBundle } from "@/lib/marketing-workspace/types";
import { exportWorkspaceBackup, serializeWorkspaceBackup } from "@/lib/marketing-workspace/backup";
import { exportHistoryMarkdown, exportHistoryTSV } from "@/lib/marketing-workspace/history";
import { auditWorkspace } from "@/lib/marketing-workspace/audit";
import { generateWeeklyRunbook } from "@/lib/marketing-workspace/runbook";

export function buildWorkspaceExports(workspace: MarketingWorkspace): WorkspaceExportBundle {
  const audit = auditWorkspace(workspace);
  const runbook = generateWeeklyRunbook({ workspace });
  return {
    backupJson: serializeWorkspaceBackup(exportWorkspaceBackup(workspace)),
    historyMarkdown: exportHistoryMarkdown(workspace.history),
    historyTsv: exportHistoryTSV(workspace.history),
    runbookMarkdown: runbook.exportMarkdown,
    snapshotsMarkdown: ["# Snapshots", "", ...workspace.snapshots.map((snapshot) => `- ${snapshot.createdAt} | ${snapshot.type} | ${snapshot.label} | ${snapshot.checksum}`)].join("\n"),
    integrityMarkdown: ["# Integridade do workspace", "", `Status: ${audit.status}`, `Score: ${audit.score}/100`, "", ...audit.issues.map((issue) => `- ${issue.severity}: ${issue.message}`)].join("\n")
  };
}
