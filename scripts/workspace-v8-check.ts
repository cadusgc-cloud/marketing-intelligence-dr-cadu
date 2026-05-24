import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
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
  generateWeeklyRunbook,
  listSnapshots,
  pruneSnapshots,
  restoreSnapshot,
  validateSnapshot,
  validateWorkspace
} from "../lib/marketing-workspace";

function fail(message: string): never {
  throw new Error(message);
}

export function buildV8ReportFiles() {
  const workspace = buildDefaultMarketingWorkspace();
  const snapshot = createWorkspaceSnapshot(workspace, "manual", "Snapshot manual de QA");
  const withSnapshot = { ...workspace, snapshots: [snapshot, ...workspace.snapshots] };
  const audit = auditWorkspace(withSnapshot);
  const runbook = generateWeeklyRunbook({ workspace: withSnapshot });
  const exports = buildWorkspaceExports(withSnapshot);
  return {
    "workspace-summary.md": ["# Workspace V8", "", "Estado local, historico, snapshots, backup e recuperacao.", `Rotas novas: /workspace, /history, /runbook, /settings, /audit-log.`, `Status: ${audit.status} ${audit.score}/100.`].join("\n"),
    "snapshot-report.md": ["# Snapshots V8", "", `Snapshots: ${withSnapshot.snapshots.length}`, ...withSnapshot.snapshots.map((item) => `- ${item.type}: ${item.label} (${item.checksum})`)].join("\n"),
    "backup-restore-report.md": ["# Backup e restore V8", "", "Backup tecnico JSON local, sem upload e sem API.", "Restore valida schema, checksum e dados sensiveis."].join("\n"),
    "history-audit-report.md": exportHistoryMarkdown(withSnapshot.history),
    "runbook-sample.md": runbook.exportMarkdown,
    "workspace-integrity-report.md": exports.integrityMarkdown,
    "local-storage-safety-report.md": ["# Local storage safety", "", "- Pode salvar settings, status, snapshots e historico sanitizado.", "- Nunca salvar token, senha, cookie, paciente, prontuario ou documento real.", "- Fallback seguro quando localStorage estiver indisponivel."].join("\n"),
    "export-samples.md": ["# Export samples V8", "", "## Backup", exports.backupJson.slice(0, 1200), "", "## Historico TSV", exports.historyTsv, "", "## Runbook", exports.runbookMarkdown.slice(0, 1600)].join("\n"),
    "qa-report-v8.md": ["# QA V8", "", `Status: ${audit.status}`, `Score: ${audit.score}/100`, "- workspace:check executa snapshots, historico, auditoria e runbook.", "- backup:check executa backup, parse e restore."].join("\n"),
    "pr-readiness-v8.md": ["# PR readiness V8", "", "- Branch: codex/marketing-os-v8-workspace-history", "- Sem API externa.", "- Sem backend real.", "- Sem publicacao automatica.", "- Sem dados de pacientes.", "- Sem alteracao de .env.", "", "Comando futuro, nao executado:", "git push -u origin codex/marketing-os-v8-workspace-history"].join("\n")
  };
}

export function runWorkspaceV8Check(args: string[] = []): number {
  const workspace = buildDefaultMarketingWorkspace();
  if (workspace.version !== "8.0.0") fail("Workspace deve ter versao 8.0.0.");
  if (!workspace.metadata.id || !workspace.settings || !workspace.activeCycle) fail("Workspace default incompleto.");
  if (validateWorkspace(workspace).some((issue) => issue.severity === "bloquear")) fail("Workspace default nao deve bloquear.");

  const manual = createWorkspaceSnapshot(workspace, "manual", "Snapshot manual");
  const preImport = createWorkspaceSnapshot(workspace, "pre_import", "Antes de importar");
  const postImport = createWorkspaceSnapshot(workspace, "post_import", "Depois de importar");
  if (![manual, preImport, postImport].every(validateSnapshot)) fail("Snapshots V8 devem validar.");

  const pruned = pruneSnapshots({ ...workspace, snapshots: [manual, preImport, postImport, ...workspace.snapshots] }, 2);
  if (pruned.snapshots.length !== 2) fail("Prune de snapshots falhou.");
  if (!compareSnapshots(manual, preImport).summary.includes("Snapshots")) fail("Comparacao de snapshots falhou.");

  const restored = restoreSnapshot({ ...workspace, snapshots: [manual, ...workspace.snapshots] }, manual.id);
  if (!restored.history.some((event) => event.type === "backup_restored")) fail("Restore de snapshot deve registrar evento.");
  if (!restored.snapshots.some((snapshot) => snapshot.type === "pre_restore")) fail("Restore de snapshot deve criar pre_restore.");

  const withEvent = appendHistoryEvent(workspace, {
    type: "qa_checked",
    title: "QA workspace executado",
    description: "Validacao local executada sem API.",
    severity: "info",
    sourceModule: "workspace",
    relatedRoute: "/qa",
    metadata: { ok: true }
  });
  if (!withEvent.history.some((event) => event.type === "qa_checked")) fail("Historico nao recebeu evento.");
  if (exportHistoryTSV(withEvent.history).split("\n").length < 2) fail("Export TSV de historico falhou.");

  const audit = auditWorkspace(withEvent);
  if (audit.status === "bloquear") fail("Workspace default nao deve bloquear na auditoria.");
  const sensitive = appendHistoryEvent(workspace, {
    type: "settings_updated",
    title: "token paciente",
    description: "paciente token",
    severity: "info",
    sourceModule: "workspace",
    relatedRoute: "/settings",
    metadata: { unsafe: "token paciente" }
  });
  if (!auditWorkspace(sensitive).issues.some((issue) => issue.severity === "bloquear")) fail("Auditoria deveria bloquear dado sensivel injetado.");
  if (!detectWorkspaceSensitiveText("paciente token senha").length) fail("Detector sensivel V8 falhou.");

  const runbook = generateWeeklyRunbook({ workspace });
  if (runbook.days.length !== 7) fail("Runbook deve ter 7 dias.");
  if (!runbook.days[0].tasks.some((task) => task.relatedRoute === "/weekly-review")) fail("Domingo deve incluir fechamento semanal.");
  if (!runbook.days[6].tasks.some((task) => task.title.toLowerCase().includes("backup"))) fail("Sabado deve incluir backup.");
  if (/paciente|cirurgia de hoje|hospital/i.test(runbook.exportMarkdown)) fail("Runbook nao deve inventar paciente/local/cirurgia.");

  const exports = buildWorkspaceExports(workspace);
  JSON.parse(exports.backupJson);
  if (!exports.historyMarkdown.includes("Historico operacional")) fail("Export historico Markdown falhou.");

  mkdirSync("reports/marketing-os-v8", { recursive: true });
  const reportFiles = buildV8ReportFiles();
  Object.entries(reportFiles).forEach(([file, content]) => writeFileSync(`reports/marketing-os-v8/${file}`, content));
  if (args.includes("--qa") && Object.keys(reportFiles).length < 10) fail("QA V8 deve gerar 10 relatorios.");

  console.log("Marketing OS V8 workspace check");
  console.log("Status: aprovado");
  console.log(`Eventos: ${workspace.history.length}`);
  console.log(`Snapshots: ${workspace.snapshots.length}`);
  console.log(`Runbook: ${runbook.days.length} dias`);
  console.log(`Integridade: ${audit.status} ${audit.score}/100`);
  console.log(`Reports: ${Object.keys(reportFiles).length}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runWorkspaceV8Check(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
