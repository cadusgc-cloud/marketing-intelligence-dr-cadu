import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { buildCommandCenterDashboard, generateNextOperationalAction, getGuidedFlowCatalog } from "@/lib/guided-flows";

describe("Marketing OS v9 - Command Center e onboarding", () => {
  const dashboard = buildCommandCenterDashboard();

  it("gera dashboard com status geral", () => {
    expect(["operacional", "atencao", "bloqueado"]).toContain(dashboard.systemStatus);
    expect(dashboard.workspaceName).toContain("Marketing OS");
    expect(dashboard.activeWeek).toBeTruthy();
  });

  it("dashboard tem proxima acao", () => {
    expect(dashboard.nextAction.title).toBeTruthy();
    expect(dashboard.nextAction.reason.length).toBeGreaterThan(20);
    expect(dashboard.nextAction.recommendedRoute).toBeTruthy();
    expect(dashboard.nextAction.estimatedMinutes).toBeGreaterThan(0);
  });

  it("dashboard tem fluxos, alertas, atalhos e release", () => {
    expect(dashboard.prioritizedFlows.length).toBeGreaterThanOrEqual(6);
    expect(dashboard.alerts.length).toBeGreaterThan(0);
    expect(dashboard.shortcuts.some((item) => item.route === "/release")).toBe(true);
    expect(dashboard.releaseStatus).toContain("release");
  });

  it("dashboard nao quebra sem workspace salvo", () => {
    const action = generateNextOperationalAction({ hasWorkspace: false });
    expect(action.recommendedRoute).toBe("/workspace");
  });

  it("catalogo priorizado aparece no command center", () => {
    const ids = getGuidedFlowCatalog().slice(0, 6).map((flow) => flow.id);
    expect(dashboard.prioritizedFlows.map((flow) => flow.id)).toEqual(ids);
  });

  it("acao com importacao pendente direciona imports", () => {
    expect(generateNextOperationalAction({ hasImportedData: false }).recommendedRoute).toBe("/imports");
  });

  it("acao com weekly review pendente direciona weekly-review", () => {
    expect(generateNextOperationalAction({ hasWeeklyReview: false }).recommendedRoute).toBe("/weekly-review");
  });

  it("acao com safety pendente direciona safety", () => {
    expect(generateNextOperationalAction({ hasSafetyReview: false }).recommendedRoute).toBe("/safety");
  });

  it("acao com backup antigo direciona workspace", () => {
    expect(generateNextOperationalAction({ hasBackup: false }).recommendedRoute).toBe("/workspace");
  });

  it("proxima acao tem alternativa curta e output esperado", () => {
    const action = generateNextOperationalAction();
    expect(action.shortAlternative.length).toBeGreaterThan(10);
    expect(action.expectedOutput.length).toBeGreaterThan(10);
  });

  it("route health estatico inclui rotas novas", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("OK\t/command-center");
    expect(output).toContain("OK\t/flows");
    expect(output).toContain("OK\t/flows/fechamento-semanal-completo");
    expect(output).toContain("OK\t/release");
    expect(output).toContain("OK\t/onboarding");
  }, 30000);

  it("route health estatico inclui engines V9", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("OK\tengine:guided-flows");
    expect(output).toContain("OK\tengine:command-center");
    expect(output).toContain("OK\tengine:release-readiness");
  }, 30000);
});
