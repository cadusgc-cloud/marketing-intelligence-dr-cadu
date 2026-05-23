import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { buildDefaultMarketingWorkspace, generateWeeklyRunbook } from "@/lib/marketing-workspace";

describe("Marketing OS v8 - runbook e rotas", () => {
  const workspace = buildDefaultMarketingWorkspace();
  const runbook = generateWeeklyRunbook({ workspace });

  it("gera runbook de 7 dias com tarefas por dia", () => {
    expect(runbook.days).toHaveLength(7);
    expect(runbook.days.every((day) => day.tasks.length >= 2)).toBe(true);
  });

  it("domingo inclui revisao semanal e importacao", () => {
    const domingo = runbook.days[0];
    expect(domingo.weekday).toBe("domingo");
    expect(domingo.tasks.some((task) => task.relatedRoute === "/weekly-review")).toBe(true);
    expect(domingo.exportText).toContain("Importar metricas");
  });

  it("segunda inclui operations", () => {
    expect(runbook.days[1].tasks.some((task) => task.relatedRoute === "/operations")).toBe(true);
  });

  it("terca inclui studio/review e quarta performance parcial", () => {
    expect(runbook.days[2].tasks.some((task) => task.relatedRoute === "/studio")).toBe(true);
    expect(runbook.days[3].tasks.some((task) => task.relatedRoute === "/performance")).toBe(true);
  });

  it("quinta inclui gravacao e sexta exportacao", () => {
    expect(runbook.days[4].tasks.some((task) => task.relatedRoute === "/recording")).toBe(true);
    expect(runbook.days[5].tasks.some((task) => task.relatedRoute === "/exports")).toBe(true);
  });

  it("sabado inclui backup e snapshot", () => {
    expect(runbook.days[6].tasks.some((task) => task.title.toLowerCase().includes("backup"))).toBe(true);
    expect(runbook.days[6].tasks.some((task) => task.title.toLowerCase().includes("snapshot"))).toBe(true);
  });

  it("tarefas tem prioridade, duracao, rota e status", () => {
    const tasks = runbook.days.flatMap((day) => day.tasks);
    expect(tasks.every((task) => task.priority && task.estimatedMinutes > 0 && task.relatedRoute && task.status)).toBe(true);
  });

  it("runbook nao inventa paciente, cirurgia ou localizacao", () => {
    expect(runbook.exportMarkdown.toLowerCase()).not.toContain("paciente de hoje");
    expect(runbook.exportMarkdown.toLowerCase()).not.toContain("cirurgia de hoje");
    expect(runbook.exportMarkdown.toLowerCase()).not.toContain("hospital");
  });

  it("exporta markdown e checklist", () => {
    expect(runbook.exportMarkdown).toContain("# Runbook semanal");
    expect(runbook.checklistText).toContain("/workspace");
  });

  it("rotas e docs V8 existem", () => {
    ["/workspace", "/history", "/runbook", "/settings", "/audit-log"].forEach((route) => {
      const file = `app${route}/page.tsx`.replace(/\\/g, "/");
      expect(existsSync(file)).toBe(true);
    });
  });
});
