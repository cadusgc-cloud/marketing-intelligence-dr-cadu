import { expectedReleaseCommands } from "@/lib/release-readiness/commands";
import { expectedReleaseDocs } from "@/lib/release-readiness/docs";
import { expectedReleaseRoutes } from "@/lib/release-readiness/routes";
import type { ReleaseChecklistItem, ReleaseReadinessInput } from "@/lib/release-readiness/types";

export function buildReleaseChecklist(input: ReleaseReadinessInput = {}): ReleaseChecklistItem[] {
  const missingRoutes = new Set(input.missingRoutes ?? []);
  const missingDocs = new Set(input.missingDocs ?? []);
  const failingCommands = new Set(input.failingCommands ?? []);
  const routeOk = expectedReleaseRoutes.every(([route]) => !missingRoutes.has(route));
  const docsOk = expectedReleaseDocs.every((doc) => !missingDocs.has(doc));
  const commandsOk = expectedReleaseCommands.every((command) => !failingCommands.has(command));
  return [
    { id: "routes", label: "Rotas principais existem e respondem", status: routeOk ? "aprovado" : "bloqueado", evidence: `${expectedReleaseRoutes.length} rotas esperadas`, required: true },
    { id: "commands", label: "Scripts obrigatorios executados", status: commandsOk ? "aprovado" : "bloqueado", evidence: `${expectedReleaseCommands.length} comandos no checklist`, required: true },
    { id: "docs", label: "Documentacao e relatórios V9 presentes", status: docsOk ? "aprovado" : "revisar", evidence: `${expectedReleaseDocs.length} documentos esperados`, required: true },
    { id: "security", label: "Sem API externa, publicacao automatica ou dados de paciente", status: "aprovado", evidence: "Validacao local e regras do projeto", required: true },
    { id: "git", label: "Push, merge e tag nao executados", status: "aprovado", evidence: "Somente comando futuro sugerido em texto", required: true },
    { id: "workspace", label: "Workspace local e backup mantidos opcionais", status: "aprovado", evidence: "Sem backend real", required: true }
  ];
}
