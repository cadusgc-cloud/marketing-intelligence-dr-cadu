import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  buildCommandCenterDashboard,
  buildDefaultGuidedFlowState,
  buildFlowExportBundle,
  canStartFlow,
  completeFlowStep,
  createFlowRun,
  generateNextOperationalAction,
  getGuidedFlowById,
  getGuidedFlowCatalog,
  resetFlowRun,
  resumeFlowRun,
  validateGuidedFlowCatalog
} from "../lib/guided-flows";
import { buildDefaultReleaseReadinessReport } from "../lib/release-readiness";

function fail(message: string): never {
  throw new Error(message);
}

function writeReports(files: Record<string, string>) {
  mkdirSync("reports/marketing-os-v9", { recursive: true });
  Object.entries(files).forEach(([file, content]) => writeFileSync(`reports/marketing-os-v9/${file}`, `${content.trim()}\n`));
}

export function buildV9FlowReportFiles() {
  const flows = getGuidedFlowCatalog();
  const validation = validateGuidedFlowCatalog(flows);
  const dashboard = buildCommandCenterDashboard();
  const weeklyFlow = getGuidedFlowById("fechamento-semanal-completo");
  if (!weeklyFlow) fail("Fluxo semanal ausente.");
  const run = completeFlowStep(createFlowRun(weeklyFlow.id, { completedStepIds: ["abrir-imports", "colar-relatorio"] }), "validar-importacao");
  const exports = buildFlowExportBundle(weeklyFlow, run);
  const release = buildDefaultReleaseReadinessReport();
  const nextActions = [
    generateNextOperationalAction({ hasWorkspace: false }),
    generateNextOperationalAction({ hasImportedData: false }),
    generateNextOperationalAction({ hasWeeklyReview: false }),
    generateNextOperationalAction({ hasSafetyReview: false }),
    generateNextOperationalAction({ hasBackup: false }),
    generateNextOperationalAction()
  ];
  return {
    "command-center-summary.md": [
      "# Command Center V9",
      "",
      "Ponto inicial operacional para responder o que fazer agora.",
      `Status: ${dashboard.systemStatus}`,
      `Workspace: ${dashboard.workspaceName}`,
      `Proxima acao: ${dashboard.nextAction.title}`,
      "",
      "## Atalhos",
      ...dashboard.shortcuts.map((item) => `- ${item.label}: ${item.route} (${item.reason})`)
    ].join("\n"),
    "guided-flows-catalog.md": [
      "# Catalogo de fluxos guiados V9",
      "",
      `Fluxos: ${flows.length}`,
      `Validacao: ${validation.ok ? "aprovado" : "revisar"}`,
      "",
      ...flows.flatMap((flow) => [
        `## ${flow.name}`,
        flow.description,
        `- ID: ${flow.id}`,
        `- Duracao: ${flow.estimatedMinutes} min`,
        `- Complexidade: ${flow.complexity}`,
        `- Etapas: ${flow.steps.length}`,
        `- Outputs: ${flow.outputs.map((item) => item.label).join(", ")}`,
        ""
      ])
    ].join("\n"),
    "flow-runner-report.md": [
      "# Flow runner V9",
      "",
      `Fluxo: ${weeklyFlow.name}`,
      `Status: ${run.status}`,
      `Progresso: ${run.progressPercent}%`,
      "",
      exports.flowChecklistMarkdown
    ].join("\n"),
    "next-action-report.md": [
      "# Next Action Engine V9",
      "",
      ...nextActions.map((action) => `- ${action.title} -> ${action.recommendedRoute} (${action.estimatedMinutes} min): ${action.reason}`)
    ].join("\n"),
    "release-readiness-report.md": release.reportMarkdown,
    "pr-draft.md": [`# ${release.prDraft.title}`, "", release.prDraft.markdown].join("\n"),
    "onboarding-report.md": [
      "# Onboarding V9",
      "",
      "Primeiros passos: abrir /command-center, seguir proxima acao, importar metricas, fechar semana, produzir conteudo, revisar safety, exportar e criar backup.",
      "",
      "Checklist minimo:",
      "- Abrir /command-center",
      "- Abrir /flows",
      "- Executar fechamento semanal",
      "- Revisar /release"
    ].join("\n"),
    "workflow-quality-report.md": [
      "# QA dos fluxos V9",
      "",
      `Bloqueios: ${validation.blockingIssues.length}`,
      `Avisos: ${validation.warnings.length}`,
      "- Sem API externa.",
      "- Sem publicacao automatica.",
      "- Sem paciente, prontuario, token ou senha."
    ].join("\n"),
    "route-health-v9.md": [
      "# Route health V9",
      "",
      "- /command-center",
      "- /flows",
      "- /flows/fechamento-semanal-completo",
      "- /release",
      "- /onboarding"
    ].join("\n"),
    "pr-readiness-v9.md": [
      "# PR readiness V9",
      "",
      "- Branch base: codex/marketing-os-v8-workspace-history",
      "- Branch feature: codex/marketing-os-v9-guided-flows-rc",
      "- Escopo: Command Center, fluxos guiados, runner, RC local, PR draft e onboarding.",
      "- Sem API externa.",
      "- Sem backend real.",
      "- Sem publicacao automatica.",
      "- Sem dados de pacientes.",
      "- Sem alteracao de .env.",
      "- Sem push, merge ou tag.",
      "",
      "Comando futuro, nao executado:",
      "git push -u origin codex/marketing-os-v9-guided-flows-rc"
    ].join("\n")
  };
}

export function runGuidedFlowsV9Check(args: string[] = []): number {
  const flows = getGuidedFlowCatalog();
  if (flows.length < 15) fail("Catalogo deve ter pelo menos 15 fluxos.");
  const validation = validateGuidedFlowCatalog(flows);
  if (!validation.ok) fail(`Catalogo de fluxos invalido: ${validation.blockingIssues.join("; ")}`);
  const defaultState = buildDefaultGuidedFlowState();
  if (defaultState.flows.length !== flows.length) fail("Estado default deve carregar todos os fluxos.");

  for (const flow of flows) {
    if (!flow.id || !flow.name || !flow.description) fail(`Fluxo incompleto: ${flow.id}`);
    if (!flow.steps.length || !flow.prerequisites.length || !flow.outputs.length) fail(`Fluxo sem estrutura suficiente: ${flow.id}`);
    if (!flow.routeLinks.length) fail(`Fluxo sem rotas relacionadas: ${flow.id}`);
  }

  const restoreFlow = getGuidedFlowById("restore-tecnico");
  const weeklyFlowForStart = getGuidedFlowById("fechamento-semanal-completo");
  if (!restoreFlow || !weeklyFlowForStart) fail("Fluxos obrigatorios ausentes.");
  const blocked = canStartFlow(restoreFlow, { hasBackup: false });
  if (blocked) fail("Restore tecnico nao deve iniciar sem backup.");
  const allowed = canStartFlow(weeklyFlowForStart, { hasWorkspace: true, hasImportedData: true, hasSafetyReview: true });
  if (!allowed) fail("Fechamento semanal deveria iniciar com pre-requisitos basicos.");

  const run = createFlowRun("fechamento-semanal-completo", { completedStepIds: ["abrir-imports"] });
  const stepped = completeFlowStep(run, "colar-relatorio");
  if (stepped.progressPercent <= run.progressPercent) fail("Completar etapa deve aumentar progresso.");
  const resumed = resumeFlowRun(stepped);
  if (resumed.progressPercent !== stepped.progressPercent) fail("Retomar fluxo deve preservar progresso.");
  const reset = resetFlowRun(stepped);
  if (reset.progressPercent !== 0) fail("Reset deve voltar a 0%.");

  const dashboard = buildCommandCenterDashboard();
  if (!dashboard.nextAction.recommendedRoute || dashboard.prioritizedFlows.length < 6) fail("Command Center incompleto.");
  const actions = [
    generateNextOperationalAction({ hasWorkspace: false }),
    generateNextOperationalAction({ hasImportedData: false }),
    generateNextOperationalAction({ hasWeeklyReview: false }),
    generateNextOperationalAction({ hasSafetyReview: false }),
    generateNextOperationalAction({ hasBackup: false }),
    generateNextOperationalAction()
  ];
  if (actions.some((action) => /paciente|senha|token/i.test(JSON.stringify(action)))) fail("Next action nao deve conter dado sensivel.");

  const release = buildDefaultReleaseReadinessReport();
  if (release.status !== "aprovado") fail("Release readiness V9 default deve aprovar.");
  if (!release.prDraft.markdown.includes("Sem API externa")) fail("PR draft deve registrar seguranca.");

  const reports = buildV9FlowReportFiles();
  writeReports(reports);
  if (args.includes("--qa") && Object.keys(reports).length < 10) fail("QA V9 deve gerar 10 relatorios.");

  console.log("Marketing OS V9 guided flows check");
  console.log("Status: aprovado");
  console.log(`Fluxos: ${flows.length}`);
  console.log(`Etapas: ${flows.reduce((sum, flow) => sum + flow.steps.length, 0)}`);
  console.log(`Outputs: ${flows.reduce((sum, flow) => sum + flow.outputs.length, 0)}`);
  console.log(`Reports: ${Object.keys(reports).length}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runGuidedFlowsV9Check(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
