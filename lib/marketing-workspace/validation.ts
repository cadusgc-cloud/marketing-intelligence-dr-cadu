import type { MarketingWorkspace, WorkspaceValidationIssue } from "@/lib/marketing-workspace/types";
import { workspaceSchemaVersion } from "@/lib/marketing-workspace/schema";

const sensitivePatterns: Array<{ code: string; pattern: RegExp; message: string }> = [
  { code: "patient", pattern: /\bpaciente\b/i, message: "Possivel paciente." },
  { code: "medical_record", pattern: /\bprontuario\b|\bprontu.rio\b/i, message: "Possivel prontuario." },
  { code: "document", pattern: /\bcpf\b|\brg\b|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{11}\b/i, message: "Possivel documento pessoal." },
  { code: "contact", pattern: /[\w.-]+@[\w.-]+\.\w+|\(?\d{2}\)?\s?\d{4,5}-?\d{4}/i, message: "Possivel contato pessoal." },
  { code: "credential", pattern: /\btoken\b|\bsecret\b|\bapi_key\b|\baccess_token\b/i, message: "Possivel credencial." },
  { code: "password", pattern: /\bsenha\b|\bpassword\b|\bcookie\b|\blogin\b/i, message: "Possivel senha, cookie ou login." },
  { code: "location", pattern: /\bendereco\b|\bendere.o\b|\bhospital\b|\bclinica\b|\bcl.nica\b|\baqui no\b/i, message: "Possivel localizacao especifica." },
  { code: "clinical", pattern: /antes\/depois|antes e depois|cirurgia de hoje|paciente de hoje|caso real/i, message: "Possivel dado medico ou bastidor sensivel." }
];

export function detectWorkspaceSensitiveText(text: string): string[] {
  return sensitivePatterns.filter((item) => item.pattern.test(text)).map((item) => item.code);
}

export function validateWorkspace(workspace: Partial<MarketingWorkspace>): WorkspaceValidationIssue[] {
  const issues: WorkspaceValidationIssue[] = [];
  if (!workspace.version) issues.push({ code: "missing_version", message: "Workspace sem versao.", severity: "bloquear", path: "version" });
  if (workspace.version && workspace.version !== workspaceSchemaVersion) issues.push({ code: "invalid_version", message: "Versao nao corresponde ao schema V8.", severity: "revisar", path: "version" });
  if (!workspace.metadata?.id) issues.push({ code: "missing_metadata", message: "Metadata obrigatoria ausente.", severity: "bloquear", path: "metadata" });
  if (!workspace.settings) issues.push({ code: "missing_settings", message: "Settings obrigatorias ausentes.", severity: "bloquear", path: "settings" });
  if (!workspace.activeCycle) issues.push({ code: "missing_cycle", message: "Ciclo ativo ausente.", severity: "bloquear", path: "activeCycle" });
  if (!Array.isArray(workspace.snapshots)) issues.push({ code: "missing_snapshots", message: "Lista de snapshots ausente.", severity: "revisar", path: "snapshots" });
  if (!Array.isArray(workspace.history)) issues.push({ code: "missing_history", message: "Historico ausente.", severity: "revisar", path: "history" });
  const sensitive = detectWorkspaceSensitiveText(JSON.stringify(workspace));
  if (sensitive.length) issues.push({ code: "sensitive_data", message: `Termos sensiveis detectados: ${sensitive.join(", ")}.`, severity: "bloquear" });
  return issues;
}

export function assertSafeWorkspaceText(text: string, path = "text"): WorkspaceValidationIssue[] {
  return detectWorkspaceSensitiveText(text).map((code) => ({
    code,
    message: `Conteudo sensivel detectado em ${path}: ${code}.`,
    severity: "bloquear" as const,
    path
  }));
}
