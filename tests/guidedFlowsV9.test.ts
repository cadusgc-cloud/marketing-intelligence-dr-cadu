import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  buildDefaultGuidedFlowState,
  buildFlowExportBundle,
  buildFlowHistoryEvents,
  canStartFlow,
  completeFlowStep,
  createFlowRun,
  evaluateFlowPrerequisites,
  exportFlowRunSummary,
  generateNextOperationalAction,
  getGuidedFlowById,
  getGuidedFlowCatalog,
  resetFlowRun,
  resumeFlowRun,
  validateGuidedFlowCatalog
} from "@/lib/guided-flows";

const flows = getGuidedFlowCatalog();
const requiredFlowIds = [
  "fechamento-semanal-completo",
  "importar-relatorio-manual",
  "gerar-plano-proxima-semana",
  "produzir-conteudo-semana",
  "planejar-gravacao-lote",
  "revisar-conteudos",
  "exportar-etus-manual",
  "gerar-campanha-mensal",
  "auditoria-seguranca",
  "backup-local",
  "restore-tecnico",
  "preparar-pr-release",
  "criar-experimento-editorial",
  "revisar-performance-semanal",
  "montar-stories-do-dia"
];

describe("Marketing OS v9 - catalogo de fluxos guiados", () => {
  it("catalogo tem pelo menos 15 fluxos", () => {
    expect(flows.length).toBeGreaterThanOrEqual(15);
  });

  it.each(flows)("fluxo $id tem campos operacionais", (flow) => {
    expect(flow.id).toBeTruthy();
    expect(flow.name).toBeTruthy();
    expect(flow.description.length).toBeGreaterThan(20);
    expect(flow.estimatedMinutes).toBeGreaterThan(0);
    expect(["baixa", "media", "alta"]).toContain(flow.complexity);
    expect(flow.prerequisites.length).toBeGreaterThan(0);
    expect(flow.steps.length).toBeGreaterThan(0);
    expect(flow.outputs.length).toBeGreaterThan(0);
    expect(flow.routeLinks.length).toBeGreaterThan(0);
  });

  it.each(requiredFlowIds)("fluxo obrigatorio %s existe", (flowId) => {
    expect(getGuidedFlowById(flowId)?.id).toBe(flowId);
  });

  it("valida catalogo sem bloqueios", () => {
    const result = validateGuidedFlowCatalog(flows);
    expect(result.ok).toBe(true);
    expect(result.blockingIssues).toHaveLength(0);
  });

  it("estado default inclui fluxos, run, dashboard e proxima acao", () => {
    const state = buildDefaultGuidedFlowState();
    expect(state.flows.length).toBe(flows.length);
    expect(state.run.flowId).toBe(flows[0].id);
    expect(state.dashboard.nextAction.recommendedRoute).toBeTruthy();
  });

  it("pre-requisito ausente gera rota para resolver", () => {
    const flow = getGuidedFlowById("importar-relatorio-manual");
    expect(flow).toBeDefined();
    const prerequisites = evaluateFlowPrerequisites(flow!, { hasImportedData: false });
    expect(prerequisites.some((item) => item.status === "ausente" && item.routeToResolve === "/imports")).toBe(true);
  });

  it("pre-requisito bloqueante bloqueia restore tecnico sem backup", () => {
    const flow = getGuidedFlowById("restore-tecnico");
    expect(flow).toBeDefined();
    expect(canStartFlow(flow!, { hasBackup: false })).toBe(false);
  });

  it("pre-requisitos ok permitem fluxo semanal", () => {
    const flow = getGuidedFlowById("fechamento-semanal-completo");
    expect(flow).toBeDefined();
    expect(canStartFlow(flow!, { hasWorkspace: true, hasImportedData: true, hasSafetyReview: true })).toBe(true);
  });

  it("cria flow run deterministico", () => {
    const one = createFlowRun("fechamento-semanal-completo");
    const two = createFlowRun("fechamento-semanal-completo");
    expect(one).toEqual(two);
  });

  it("marca etapa concluida e calcula progresso", () => {
    const run = createFlowRun("fechamento-semanal-completo");
    const next = completeFlowStep(run, "abrir-imports");
    expect(next.completedStepIds).toContain("abrir-imports");
    expect(next.progressPercent).toBeGreaterThan(run.progressPercent);
    expect(next.progressPercent).toBeLessThanOrEqual(100);
  });

  it("nao permite concluir etapa inexistente", () => {
    const run = createFlowRun("fechamento-semanal-completo");
    expect(() => completeFlowStep(run, "etapa-inexistente")).toThrow();
  });

  it("retoma e reseta fluxo", () => {
    const run = completeFlowStep(createFlowRun("fechamento-semanal-completo"), "abrir-imports");
    expect(resumeFlowRun(run).progressPercent).toBe(run.progressPercent);
    expect(resetFlowRun(run).progressPercent).toBe(0);
  });

  it("registra eventos de inicio etapa e conclusao", () => {
    const flow = getGuidedFlowById("montar-stories-do-dia")!;
    const complete = flow.steps.reduce((run, step) => completeFlowStep(run, step.id), createFlowRun(flow.id));
    const events = buildFlowHistoryEvents(complete);
    expect(events.some((event) => event.type === "flow_started")).toBe(true);
    expect(events.some((event) => event.type === "flow_step_completed")).toBe(true);
    expect(events.some((event) => event.type === "flow_completed")).toBe(true);
  });

  it("exporta resumo do fluxo", () => {
    const flow = getGuidedFlowById("produzir-conteudo-semana")!;
    const text = exportFlowRunSummary(flow, [flow.steps[0].id]);
    expect(text).toContain("Fluxo guiado");
    expect(text).toContain("[x]");
  });

  it("exporta bundle de fluxo sem JSON bruto", () => {
    const flow = getGuidedFlowById("preparar-pr-release")!;
    const bundle = buildFlowExportBundle(flow, createFlowRun(flow.id));
    expect(bundle.flowSummaryMarkdown).toContain(flow.name);
    expect(bundle.flowChecklistMarkdown).toContain("# Checklist");
    expect(bundle.flowOutputsTsv).toContain("Fluxo\tOutput");
    expect(bundle.flowSummaryMarkdown.trim().startsWith("{")).toBe(false);
  });

  it.each([
    [{ hasWorkspace: false }, "/workspace"],
    [{ hasImportedData: false }, "/imports"],
    [{ hasWeeklyReview: false }, "/weekly-review"],
    [{ hasSafetyReview: false }, "/safety"],
    [{ hasBackup: false }, "/workspace"],
    [{}, "/flows/fechamento-semanal-completo"]
  ] as const)("next action escolhe rota %s", (context, route) => {
    expect(generateNextOperationalAction(context).recommendedRoute).toBe(route);
  });

  it("next action nao contem dado sensivel", () => {
    expect(JSON.stringify(generateNextOperationalAction()).toLowerCase()).not.toMatch(/paciente|prontuario|senha|token/);
  });

  it("flows:check passa", () => {
    expect(execSync("npm run flows:check", { encoding: "utf8" })).toContain("Status: aprovado");
  }, 30000);

  it("qa:flows passa", () => {
    expect(execSync("npm run qa:flows", { encoding: "utf8" })).toContain("Status: aprovado");
  }, 30000);
});
