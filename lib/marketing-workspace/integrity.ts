import type { MarketingWorkspace, WorkspaceIntegrityReport } from "@/lib/marketing-workspace/types";
import { auditWorkspace } from "@/lib/marketing-workspace/audit";

export function buildWorkspaceIntegrityReport(workspace: MarketingWorkspace): WorkspaceIntegrityReport {
  return auditWorkspace(workspace);
}
