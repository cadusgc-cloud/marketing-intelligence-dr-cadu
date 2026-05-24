"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarketingWorkspace } from "@/lib/marketing-workspace";
import { buildDefaultMarketingWorkspace, buildWorkspaceExports, createWorkspaceSnapshot, appendHistoryEvent } from "@/lib/marketing-workspace";
import { loadWorkspaceFromLocalStorage, resetWorkspaceLocalStorage, saveWorkspaceToLocalStorage } from "@/lib/marketing-workspace/client/workspaceStorage";

export function useMarketingWorkspace() {
  const [workspace, setWorkspace] = useState<MarketingWorkspace>(() => buildDefaultMarketingWorkspace());
  const [storageStatus, setStorageStatus] = useState("carregando");

  useEffect(() => {
    const loaded = loadWorkspaceFromLocalStorage();
    setWorkspace(loaded.workspace ?? buildDefaultMarketingWorkspace());
    setStorageStatus(loaded.ok ? "localStorage ativo" : loaded.error ?? "fallback seguro");
  }, []);

  function persist(next: MarketingWorkspace) {
    setWorkspace(next);
    const result = saveWorkspaceToLocalStorage(next);
    setStorageStatus(result.ok ? "salvo localmente" : result.error ?? "fallback seguro");
  }

  function saveWeeklyReviewSnapshot() {
    const snapshot = createWorkspaceSnapshot(workspace, "post_review", "Fechamento semanal salvo localmente");
    const next = appendHistoryEvent(
      { ...workspace, snapshots: [snapshot, ...workspace.snapshots] },
      {
        type: "weekly_review_completed",
        title: "Fechamento salvo no workspace",
        description: "Resumo semanal sanitizado salvo localmente.",
        severity: "info",
        sourceModule: "weekly-review",
        relatedRoute: "/weekly-review",
        relatedEntityId: snapshot.id,
        metadata: { snapshot: snapshot.id }
      }
    );
    persist(next);
  }

  function resetLocalWorkspace(confirmReset: boolean) {
    const result = resetWorkspaceLocalStorage(confirmReset);
    setWorkspace(result.workspace ?? buildDefaultMarketingWorkspace());
    setStorageStatus(result.ok ? "dados locais limpos" : result.error ?? "reset cancelado");
  }

  const exports = useMemo(() => buildWorkspaceExports(workspace), [workspace]);

  return {
    workspace,
    storageStatus,
    exports,
    persist,
    saveWeeklyReviewSnapshot,
    resetLocalWorkspace
  };
}
