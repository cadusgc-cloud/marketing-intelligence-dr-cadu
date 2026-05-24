import type { MarketingWorkspace } from "@/lib/marketing-workspace/types";
import { workspaceSchemaVersion } from "@/lib/marketing-workspace/schema";
import { buildDefaultMarketingWorkspace } from "@/lib/marketing-workspace/defaults";
import { normalizeWorkspaceSettings } from "@/lib/marketing-workspace/settings";

export function migrateWorkspace(input: Partial<MarketingWorkspace>): MarketingWorkspace {
  const defaults = buildDefaultMarketingWorkspace();
  return {
    ...defaults,
    ...input,
    version: workspaceSchemaVersion,
    metadata: { ...defaults.metadata, ...input.metadata, schemaVersion: workspaceSchemaVersion },
    settings: normalizeWorkspaceSettings(input.settings),
    activeCycle: { ...defaults.activeCycle, ...input.activeCycle },
    snapshots: Array.isArray(input.snapshots) ? input.snapshots : defaults.snapshots,
    history: Array.isArray(input.history) ? input.history : defaults.history,
    auditTrail: Array.isArray(input.auditTrail) ? input.auditTrail : defaults.auditTrail,
    closedWeeks: Array.isArray(input.closedWeeks) ? input.closedWeeks : defaults.closedWeeks
  };
}
