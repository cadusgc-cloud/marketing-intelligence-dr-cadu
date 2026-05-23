"use client";

import type { MarketingWorkspace, LocalStorageAdapterResult } from "@/lib/marketing-workspace/types";
import { buildDefaultMarketingWorkspace, migrateWorkspace, validateWorkspace, workspaceStorageKey } from "@/lib/marketing-workspace";

export function canUseWorkspaceLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadWorkspaceFromLocalStorage(): LocalStorageAdapterResult {
  if (!canUseWorkspaceLocalStorage()) return { ok: false, workspace: buildDefaultMarketingWorkspace(), error: "localStorage indisponivel" };
  try {
    const raw = window.localStorage.getItem(workspaceStorageKey);
    if (!raw) return { ok: true, workspace: buildDefaultMarketingWorkspace() };
    const parsed = JSON.parse(raw) as Partial<MarketingWorkspace>;
    const migrated = migrateWorkspace(parsed);
    const issues = validateWorkspace(migrated);
    if (issues.some((issue) => issue.severity === "bloquear")) {
      return { ok: false, workspace: buildDefaultMarketingWorkspace(), error: "workspace local bloqueado por validacao" };
    }
    return { ok: true, workspace: migrated };
  } catch {
    return { ok: false, workspace: buildDefaultMarketingWorkspace(), error: "JSON local invalido" };
  }
}

export function saveWorkspaceToLocalStorage(workspace: MarketingWorkspace): LocalStorageAdapterResult {
  const issues = validateWorkspace(workspace);
  if (issues.some((issue) => issue.severity === "bloquear")) return { ok: false, error: "workspace contem dado sensivel ou schema invalido" };
  if (!canUseWorkspaceLocalStorage()) return { ok: false, error: "localStorage indisponivel" };
  window.localStorage.setItem(workspaceStorageKey, JSON.stringify(workspace));
  return { ok: true, workspace };
}

export function resetWorkspaceLocalStorage(confirmReset: boolean): LocalStorageAdapterResult {
  if (!confirmReset) return { ok: false, error: "reset exige confirmacao logica" };
  if (!canUseWorkspaceLocalStorage()) return { ok: false, error: "localStorage indisponivel" };
  window.localStorage.removeItem(workspaceStorageKey);
  return { ok: true, workspace: buildDefaultMarketingWorkspace() };
}
