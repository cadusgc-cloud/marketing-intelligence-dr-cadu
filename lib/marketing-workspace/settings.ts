import type { WorkspaceSettings } from "@/lib/marketing-workspace/types";
import { safeWorkspaceChannels, safeWorkspaceFormats, safeWorkspacePillars } from "@/lib/marketing-workspace/schema";
import { assertSafeWorkspaceText } from "@/lib/marketing-workspace/validation";

export function buildDefaultWorkspaceSettings(): WorkspaceSettings {
  return {
    workspaceName: "Marketing OS Dr. Cadu",
    weekStartsOn: "domingo",
    defaultEditorialIntensity: "padrao",
    activeChannels: safeWorkspaceChannels,
    activeFormats: safeWorkspaceFormats,
    priorityPillars: safeWorkspacePillars,
    safetyLimits: {
      safeMode: true,
      blockSensitiveData: true,
      requireRestoreConfirmation: true
    },
    exportPreference: "markdown",
    snapshotRetention: 12
  };
}

export function normalizeWorkspaceSettings(settings: Partial<WorkspaceSettings> = {}): WorkspaceSettings {
  const defaults = buildDefaultWorkspaceSettings();
  return {
    ...defaults,
    ...settings,
    weekStartsOn: settings.weekStartsOn === "segunda" ? "segunda" : "domingo",
    defaultEditorialIntensity: settings.defaultEditorialIntensity === "leve" || settings.defaultEditorialIntensity === "intensa" ? settings.defaultEditorialIntensity : "padrao",
    activeChannels: (settings.activeChannels?.length ? settings.activeChannels : defaults.activeChannels).filter((item) => !assertSafeWorkspaceText(item).length),
    activeFormats: (settings.activeFormats?.length ? settings.activeFormats : defaults.activeFormats).filter((item) => !assertSafeWorkspaceText(item).length),
    priorityPillars: (settings.priorityPillars?.length ? settings.priorityPillars : defaults.priorityPillars).filter((item) => !assertSafeWorkspaceText(item).length),
    snapshotRetention: Math.max(1, Math.min(52, Number(settings.snapshotRetention ?? defaults.snapshotRetention)))
  };
}
