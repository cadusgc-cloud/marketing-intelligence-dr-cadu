import type { MarketingWorkspace, SnapshotType, WorkspaceSnapshot } from "@/lib/marketing-workspace/types";
import { auditWorkspace } from "@/lib/marketing-workspace/audit";

export function stableChecksum(value: unknown): string {
  const text = JSON.stringify(value, Object.keys(flattenForSort(value)).sort());
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  return hash.toString(16).padStart(8, "0");
}

function flattenForSort(value: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  JSON.stringify(value, (key, val) => {
    if (key) out[key] = val;
    return val;
  });
  return out;
}

export function createWorkspaceSnapshot(workspace: MarketingWorkspace, type: SnapshotType = "manual", label = "Snapshot manual", createdAt = "2026-05-23T12:00:00.000Z"): WorkspaceSnapshot {
  const sanitizedState = {
    metadata: workspace.metadata,
    settings: workspace.settings,
    activeCycle: workspace.activeCycle,
    historyCount: workspace.history.length,
    snapshotCount: workspace.snapshots.length
  };
  const audit = auditWorkspace({ ...workspace, snapshots: [] });
  const checksum = stableChecksum(sanitizedState);
  const serialized = JSON.stringify(sanitizedState);
  return {
    id: `${type}-${createdAt.slice(0, 10)}-${checksum}`,
    createdAt,
    type,
    label,
    version: workspace.version,
    summary: `${label}: ${workspace.activeCycle.weekId}, ${workspace.history.length} eventos.`,
    sanitizedState,
    checksum,
    safetyStatus: audit.status,
    sizeEstimateBytes: serialized.length,
    restoreEligible: audit.status !== "bloquear"
  };
}

export function listSnapshots(workspace: MarketingWorkspace): WorkspaceSnapshot[] {
  return [...workspace.snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function validateSnapshot(snapshot: WorkspaceSnapshot): boolean {
  return Boolean(snapshot.id && snapshot.version && snapshot.checksum && snapshot.restoreEligible && snapshot.sanitizedState?.metadata?.id);
}

export function pruneSnapshots(workspace: MarketingWorkspace, policy = workspace.settings.snapshotRetention): MarketingWorkspace {
  return { ...workspace, snapshots: listSnapshots(workspace).slice(0, Math.max(1, policy)) };
}

export function restoreSnapshot(workspace: MarketingWorkspace, snapshotId: string): MarketingWorkspace {
  const snapshot = workspace.snapshots.find((item) => item.id === snapshotId);
  if (!snapshot || !validateSnapshot(snapshot)) return workspace;
  const preRestore = createWorkspaceSnapshot(workspace, "pre_restore", "Antes de restaurar snapshot");
  return {
    ...workspace,
    metadata: { ...snapshot.sanitizedState.metadata, updatedAt: "2026-05-23T12:00:00.000Z" },
    settings: snapshot.sanitizedState.settings,
    activeCycle: snapshot.sanitizedState.activeCycle,
    snapshots: [preRestore, ...workspace.snapshots],
    history: [
      {
        id: `history-restore-${snapshot.id}`,
        timestamp: "2026-05-23T12:00:00.000Z",
        type: "backup_restored",
        title: "Snapshot restaurado",
        description: `Snapshot ${snapshot.label} restaurado localmente.`,
        severity: "atencao",
        sourceModule: "workspace",
        relatedRoute: "/workspace",
        relatedEntityId: snapshot.id,
        metadata: { snapshotId },
        safetyStatus: "atencao"
      },
      ...workspace.history
    ]
  };
}

export function compareSnapshots(a: WorkspaceSnapshot, b: WorkspaceSnapshot): { changed: boolean; summary: string } {
  return {
    changed: a.checksum !== b.checksum,
    summary: a.checksum === b.checksum ? "Snapshots equivalentes." : `Snapshots diferentes: ${a.checksum} vs ${b.checksum}.`
  };
}
