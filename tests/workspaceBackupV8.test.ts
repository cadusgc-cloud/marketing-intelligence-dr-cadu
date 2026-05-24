import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import {
  buildDefaultMarketingWorkspace,
  detectWorkspaceSensitiveText,
  exportWorkspaceBackup,
  parseWorkspaceBackup,
  restoreWorkspaceBackup,
  serializeWorkspaceBackup,
  validateWorkspaceBackup
} from "@/lib/marketing-workspace";

describe("Marketing OS v8 - backup e restore", () => {
  const workspace = buildDefaultMarketingWorkspace();
  const backup = exportWorkspaceBackup(workspace);

  it("exporta, serializa e parseia backup JSON tecnico", () => {
    const serialized = serializeWorkspaceBackup(backup);
    const parsed = parseWorkspaceBackup(serialized);
    expect(JSON.parse(serialized).version).toBe("8.0.0");
    expect(parsed.checksum).toBe(backup.checksum);
    expect(serialized).toContain("Backup tecnico local");
  });

  it("valida backup e rejeita versao incompativel", () => {
    expect(validateWorkspaceBackup(backup).filter((issue) => issue.severity === "bloquear")).toHaveLength(0);
    expect(validateWorkspaceBackup({ ...backup, version: "7.0.0" }).some((issue) => issue.code === "backup_version")).toBe(true);
  });

  it("rejeita backup corrompido e com dado sensivel", () => {
    expect(validateWorkspaceBackup({ ...backup, checksum: "bad" }).some((issue) => issue.code === "backup_checksum")).toBe(true);
    const unsafe = { ...backup, workspace: { ...backup.workspace, metadata: { ...backup.workspace.metadata, name: "paciente token" } }, checksum: "bad" };
    expect(validateWorkspaceBackup(unsafe).some((issue) => issue.severity === "bloquear")).toBe(true);
  });

  it("restaura backup valido com relatorio e integridade", () => {
    const restored = restoreWorkspaceBackup(workspace, backup);
    expect(restored.ok).toBe(true);
    expect(restored.reportMarkdown).toContain("Restore workspace V8");
    expect(restored.preRestoreSnapshot?.type).toBe("pre_restore");
    expect(restored.restored?.history.some((event) => event.type === "backup_restored")).toBe(true);
  });

  it("bloqueia restore de backup invalido", () => {
    const result = restoreWorkspaceBackup(workspace, { ...backup, checksum: "bad" });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.severity === "bloquear")).toBe(true);
  });

  it("detector sensivel cobre credenciais e paciente", () => {
    expect(detectWorkspaceSensitiveText("senha cookie paciente cpf 123.456.789-00").length).toBeGreaterThan(2);
  });

  it("backup:check passa", () => {
    const output = execSync("npm run backup:check", { encoding: "utf8" });
    expect(output).toContain("Status: aprovado");
  }, 30000);

  it("qa:workspace passa", () => {
    const output = execSync("npm run qa:workspace", { encoding: "utf8" });
    expect(output).toContain("Status: aprovado");
  }, 30000);
});
