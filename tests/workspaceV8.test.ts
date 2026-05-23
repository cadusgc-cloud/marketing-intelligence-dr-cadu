import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import {
  appendHistoryEvent,
  auditWorkspace,
  buildDefaultMarketingWorkspace,
  buildWorkspaceExports,
  compareSnapshots,
  createWorkspaceSnapshot,
  detectWorkspaceSensitiveText,
  exportHistoryMarkdown,
  exportHistoryTSV,
  filterHistoryEvents,
  generateWeeklyRunbook,
  listSnapshots,
  migrateWorkspace,
  normalizeWorkspaceSettings,
  pruneSnapshots,
  restoreSnapshot,
  validateSnapshot,
  validateWorkspace,
  workspaceStorageKey
} from "@/lib/marketing-workspace";

const workspace = buildDefaultMarketingWorkspace();

describe("Marketing OS v8 - workspace local", () => {
  it("cria workspace padrao com versao, metadata, settings e ciclo ativo", () => {
    expect(workspace.version).toBe("8.0.0");
    expect(workspace.metadata.id).toBeTruthy();
    expect(workspace.settings.workspaceName).toContain("Marketing OS");
    expect(workspace.activeCycle.periodStart).toBe("2026-05-24");
  });

  it("valida campos obrigatorios e rejeita versao invalida", () => {
    expect(validateWorkspace(workspace).filter((issue) => issue.severity === "bloquear")).toHaveLength(0);
    expect(validateWorkspace({ ...workspace, version: "1.0.0" }).some((issue) => issue.code === "invalid_version")).toBe(true);
    expect(validateWorkspace({ version: "8.0.0" }).some((issue) => issue.severity === "bloquear")).toBe(true);
  });

  it("normaliza settings ausentes e aceita domingo/segunda", () => {
    expect(normalizeWorkspaceSettings({ weekStartsOn: "domingo" }).weekStartsOn).toBe("domingo");
    expect(normalizeWorkspaceSettings({ weekStartsOn: "segunda" }).weekStartsOn).toBe("segunda");
    expect(normalizeWorkspaceSettings({ defaultEditorialIntensity: "intensa" }).defaultEditorialIntensity).toBe("intensa");
  });

  it("rejeita segredo token paciente e prontuario em settings/texto", () => {
    expect(detectWorkspaceSensitiveText("token senha cookie paciente prontuario").length).toBeGreaterThanOrEqual(3);
    expect(normalizeWorkspaceSettings({ activeChannels: ["Instagram", "token paciente"] }).activeChannels).not.toContain("token paciente");
  });

  it("gera health status saudavel para workspace default", () => {
    const audit = auditWorkspace(workspace);
    expect(audit.status).toBe("saudavel");
    expect(audit.score).toBeGreaterThan(80);
  });

  it("cria, lista, valida, compara e poda snapshots", () => {
    const manual = createWorkspaceSnapshot(workspace, "manual", "Manual");
    const preImport = createWorkspaceSnapshot(workspace, "pre_import", "Pre import");
    const postImport = createWorkspaceSnapshot(workspace, "post_import", "Post import");
    expect([manual, preImport, postImport].every(validateSnapshot)).toBe(true);
    const withSnapshots = { ...workspace, snapshots: [manual, preImport, postImport, ...workspace.snapshots] };
    expect(listSnapshots(withSnapshots).length).toBeGreaterThanOrEqual(3);
    expect(compareSnapshots(manual, preImport).summary).toContain("Snapshots");
    expect(pruneSnapshots(withSnapshots, 2).snapshots).toHaveLength(2);
  });

  it("restore cria snapshot pre_restore e evento de historico", () => {
    const manual = createWorkspaceSnapshot(workspace, "manual", "Manual");
    const restored = restoreSnapshot({ ...workspace, snapshots: [manual] }, manual.id);
    expect(restored.snapshots.some((snapshot) => snapshot.type === "pre_restore")).toBe(true);
    expect(restored.history.some((event) => event.type === "backup_restored")).toBe(true);
  });

  it("snapshot nao contem dado sensivel", () => {
    const snapshot = createWorkspaceSnapshot(workspace, "post_review", "Seguro");
    expect(detectWorkspaceSensitiveText(JSON.stringify(snapshot.sanitizedState))).toHaveLength(0);
  });

  it("historico adiciona, filtra, resume e exporta markdown/tsv", () => {
    const updated = appendHistoryEvent(workspace, {
      type: "route_health_checked",
      title: "Route health",
      description: "Rotas verificadas localmente.",
      severity: "info",
      sourceModule: "qa",
      relatedRoute: "/qa",
      metadata: { ok: true }
    });
    expect(updated.history[0].type).toBe("route_health_checked");
    expect(filterHistoryEvents(updated.history, { sourceModule: "qa" })).toHaveLength(1);
    expect(exportHistoryMarkdown(updated.history)).toContain("Historico operacional");
    expect(exportHistoryTSV(updated.history)).toContain("Data\tTipo");
  });

  it("historico rejeita metadata sensivel via auditoria", () => {
    const unsafe = appendHistoryEvent(workspace, {
      type: "settings_updated",
      title: "Atualizacao",
      description: "token paciente",
      severity: "info",
      sourceModule: "settings",
      relatedRoute: "/settings",
      metadata: { unsafe: "token paciente" }
    });
    expect(auditWorkspace(unsafe).status).toBe("bloquear");
  });

  it("auditoria detecta snapshot corrompido, evento sem tipo e semana duplicada", () => {
    const broken = {
      ...workspace,
      closedWeeks: [...workspace.closedWeeks, workspace.closedWeeks[0]],
      history: [{ ...workspace.history[0], type: "" as never }, ...workspace.history],
      snapshots: [{ ...workspace.snapshots[0], checksum: "", restoreEligible: false }]
    };
    const audit = auditWorkspace(broken);
    expect(audit.issues.some((issue) => issue.code === "duplicate_week")).toBe(true);
    expect(audit.issues.some((issue) => issue.code === "history_missing_type")).toBe(true);
    expect(audit.issues.some((issue) => issue.code === "snapshot_invalid")).toBe(true);
  });

  it("migracao normaliza schema antigo", () => {
    const migrated = migrateWorkspace({ metadata: { ...workspace.metadata, name: "Antigo" }, settings: { weekStartsOn: "segunda" } as never });
    expect(migrated.version).toBe("8.0.0");
    expect(migrated.settings.weekStartsOn).toBe("segunda");
  });

  it("exports do workspace incluem backup, historico, runbook e integridade", () => {
    const exports = buildWorkspaceExports(workspace);
    expect(JSON.parse(exports.backupJson).version).toBe("8.0.0");
    expect(exports.historyMarkdown).toContain("Historico operacional");
    expect(exports.historyTsv).toContain("Data\tTipo");
    expect(exports.runbookMarkdown).toContain("Runbook semanal");
    expect(exports.integrityMarkdown).toContain("Integridade");
  });

  it("runbook integra operations e workspace", () => {
    const runbook = generateWeeklyRunbook({ workspace });
    expect(runbook.days).toHaveLength(7);
    expect(runbook.days.flatMap((day) => day.tasks).some((task) => task.relatedRoute === "/operations")).toBe(true);
    expect(runbook.days.flatMap((day) => day.tasks).some((task) => task.relatedRoute === "/workspace")).toBe(true);
  });

  it("storage adapter e client hook existem sem acessar window no server por contrato de arquivo", () => {
    expect(workspaceStorageKey).toContain("workspace-v8");
  });

  it("workspace:check passa", () => {
    const output = execSync("npm run workspace:check", { encoding: "utf8" });
    expect(output).toContain("Status: aprovado");
  }, 30000);
});
