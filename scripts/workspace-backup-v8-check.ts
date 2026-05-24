import { pathToFileURL } from "node:url";
import {
  buildDefaultMarketingWorkspace,
  detectWorkspaceSensitiveText,
  exportWorkspaceBackup,
  parseWorkspaceBackup,
  restoreWorkspaceBackup,
  serializeWorkspaceBackup,
  validateWorkspaceBackup
} from "../lib/marketing-workspace";

function fail(message: string): never {
  throw new Error(message);
}

export function runWorkspaceBackupV8Check(): number {
  const workspace = buildDefaultMarketingWorkspace();
  const backup = exportWorkspaceBackup(workspace);
  const serialized = serializeWorkspaceBackup(backup);
  const parsed = parseWorkspaceBackup(serialized);
  if (validateWorkspaceBackup(parsed).some((issue) => issue.severity === "bloquear")) fail("Backup valido nao deveria bloquear.");
  const restored = restoreWorkspaceBackup(workspace, parsed);
  if (!restored.ok || !restored.restored) fail("Restore de backup valido falhou.");
  if (!restored.restored.snapshots.some((snapshot) => snapshot.type === "pre_restore")) fail("Restore deve criar snapshot pre_restore.");

  const incompatible = { ...parsed, version: "1.0.0" };
  if (!validateWorkspaceBackup(incompatible).some((issue) => issue.code === "backup_version")) fail("Backup com versao incompativel deveria falhar.");
  const corrupted = { ...parsed, checksum: "bad" };
  if (!validateWorkspaceBackup(corrupted).some((issue) => issue.code === "backup_checksum")) fail("Backup corrompido deveria falhar.");
  const unsafe = {
    ...parsed,
    workspace: {
      ...parsed.workspace,
      metadata: { ...parsed.workspace.metadata, name: "paciente token" }
    },
    checksum: "invalid"
  };
  if (!validateWorkspaceBackup(unsafe).some((issue) => issue.severity === "bloquear")) fail("Backup com dado sensivel deveria bloquear.");
  try {
    parseWorkspaceBackup("{ json invalido");
    fail("JSON invalido deveria falhar.");
  } catch {
    // esperado
  }
  if (!detectWorkspaceSensitiveText("senha cookie paciente").length) fail("Detector sensivel do backup falhou.");

  console.log("Marketing OS V8 backup check");
  console.log("Status: aprovado");
  console.log(`Backup bytes: ${serialized.length}`);
  console.log("Restore: aprovado");
  console.log("Sensibilidade injetada: bloqueada");
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runWorkspaceBackupV8Check());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
