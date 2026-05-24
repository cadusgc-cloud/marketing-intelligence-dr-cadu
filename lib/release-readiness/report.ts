import { expectedReleaseCommands } from "@/lib/release-readiness/commands";
import { expectedReleaseDocs } from "@/lib/release-readiness/docs";
import { expectedReleaseRoutes } from "@/lib/release-readiness/routes";
import { buildReleaseChecklist } from "@/lib/release-readiness/checklist";
import type { PullRequestDraft, ReleaseReadinessInput, ReleaseReadinessReport, ReleaseReadinessStatus } from "@/lib/release-readiness/types";

function overallStatus(statuses: ReleaseReadinessStatus[]): ReleaseReadinessStatus {
  if (statuses.includes("bloqueado")) return "bloqueado";
  if (statuses.includes("revisar")) return "revisar";
  return "aprovado";
}

export function generatePullRequestDraft(report: Omit<ReleaseReadinessReport, "prDraft" | "reportMarkdown">): PullRequestDraft {
  const title = "Marketing OS v9 - Fluxos Guiados, Command Center e Release Candidate";
  const markdown = [
    "## Resumo",
    "Adiciona a fase Marketing OS v9 com Command Center, fluxos guiados, runner local, next action engine, release readiness local, onboarding e rascunho de PR.",
    "",
    "## Escopo",
    "- Command Center como ponto inicial operacional",
    "- Catalogo com pelo menos 15 fluxos guiados",
    "- Runner local com progresso e exportacao",
    "- Release Candidate local e PR draft",
    "- Onboarding de uso do Marketing OS",
    "",
    "## Rotas",
    ...report.routes.map((route) => `- ${route.route}: ${route.status}`),
    "",
    "## Scripts",
    ...report.commands.map((command) => `- ${command.command}: ${command.status}`),
    "",
    "## Seguranca",
    "- Sem API externa",
    "- Sem publicacao automatica",
    "- Sem dados de pacientes",
    "- Sem alteracao de .env",
    "- Sem push, merge ou tag executados",
    "",
    "## O que nao foi feito",
    "- Nao conectou Instagram, Meta, Reportei, OpenAI, Etus, WhatsApp ou Google",
    "- Nao publicou conteudo",
    "- Nao criou backend real",
    "",
    "## Como testar localmente",
    "1. npm test",
    "2. npx tsc --noEmit",
    "3. npm run flows:check",
    "4. npm run rc:check",
    "5. npm run build",
    "6. npm run health:routes:local",
    "",
    "## Riscos remanescentes",
    ...report.risks.map((risk) => `- ${risk.severity}: ${risk.description}`)
  ].join("\n");
  return { title, markdown };
}

export function generateReleaseReadinessReport(input: ReleaseReadinessInput = {}): ReleaseReadinessReport {
  const branchBase = input.branchBase ?? "codex/marketing-os-v8-workspace-history";
  const branchFeature = input.branchFeature ?? "codex/marketing-os-v9-guided-flows-rc";
  const missingRoutes = new Set(input.missingRoutes ?? []);
  const missingDocs = new Set(input.missingDocs ?? []);
  const failingCommands = new Set(input.failingCommands ?? []);
  const routes = expectedReleaseRoutes.map(([route, expectedText]) => ({
    route,
    expectedText,
    status: missingRoutes.has(route) ? "bloqueado" as const : "aprovado" as const
  }));
  const commands = expectedReleaseCommands.map((command) => ({
    command,
    expected: "passar localmente",
    status: failingCommands.has(command) ? "bloqueado" as const : "aprovado" as const
  }));
  const docs = expectedReleaseDocs.map((path) => ({
    path,
    status: missingDocs.has(path) ? "revisar" as const : "aprovado" as const
  }));
  const checklist = buildReleaseChecklist(input);
  const safety = {
    noExternalApi: true,
    noAutoPublishing: true,
    noPatientData: true,
    noEnvChange: true,
    noPushMergeTag: true
  };
  const risks = [
    { id: "dev-cache", severity: "baixo" as const, description: "Dev server pode precisar reinicio apos build.", mitigation: "Reiniciar porta 3010 e rodar health local." },
    { id: "manual-review", severity: "baixo" as const, description: "Fluxos orientam, mas nao substituem revisao humana.", mitigation: "Manter Safety e Review antes de uso externo." }
  ];
  const status = overallStatus([...checklist.map((item) => item.status), ...routes.map((item) => item.status), ...commands.map((item) => item.status), ...docs.map((item) => item.status)]);
  const partial = {
    status,
    branchBase,
    branchFeature,
    checklist,
    routes,
    commands,
    docs,
    safety,
    risks,
    recommendations: ["Abrir /command-center como entrada principal.", "Rodar todos os scripts antes de push.", "Criar PR contra a branch correta do projeto."],
    pushCommandText: `git push -u origin ${branchFeature}`
  };
  const prDraft = generatePullRequestDraft(partial);
  const reportMarkdown = [
    "# Release Candidate V9",
    "",
    `Status: ${status}`,
    `Branch base: ${branchBase}`,
    `Branch feature: ${branchFeature}`,
    "",
    "## Checklist",
    ...checklist.map((item) => `- ${item.status}: ${item.label} (${item.evidence})`),
    "",
    "## Comando futuro",
    partial.pushCommandText,
    "",
    "Nao executar push automaticamente."
  ].join("\n");
  return { ...partial, prDraft, reportMarkdown };
}
