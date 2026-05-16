import { describe, expect, it } from "vitest";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { buildWeeklyCommandResult } from "@/lib/weeklyCommandResult";
import {
  buildWeeklyExecutionBoard,
  determineExecutionLane,
  determineExecutionRiskLevel,
  determineExecutionStatus
} from "@/lib/weeklyExecutionBoard";
import { createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

function makeWeek(overrides: Partial<WeeklyMarketingData> = {}): WeeklyMarketingData {
  return createWeeklyMarketingDataFromEditableFields({
    id: "week-current",
    weekLabel: "Semana atual",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    metaSpend: 600,
    metaWhatsappConversations: 90,
    metaProfileVisits: 4000,
    googleSpend: 250,
    googleClicks: 80,
    googleConversions: 4,
    instagramStories: 42,
    instagramReels: 3,
    instagramPosts: 2,
    instagramProfileVisits: 900,
    whatsappTotal: 100,
    qualifiedConversations: 35,
    consultationsScheduled: 8,
    consultationsAttended: 6,
    surgeriesClosed: 2,
    notes: "Semana agregada sem dados pessoais.",
    ...overrides
  });
}

function buildReport(current: WeeklyMarketingData, previous: WeeklyMarketingData | null = null) {
  return buildWeeklyCommandResult(current, previous, buildWeeklyCommandCenter(current));
}

describe("Weekly Execution Board", () => {
  it("transforma prioridades semanais em tarefas internas por faixa de execucao", () => {
    const current = makeWeek({
      googleConversions: 0,
      instagramStories: 18,
      instagramReels: 1,
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    });
    const previous = makeWeek({ id: "previous-week", startDate: "2026-05-04", endDate: "2026-05-10", googleConversions: 5, instagramStories: 56 });
    const board = buildWeeklyExecutionBoard(buildReport(current, previous));
    const tasks = board.lanes.flatMap((lane) => lane.tasks);

    expect(board.weekLabel).toBe("Semana atual");
    expect(board.summary.totalTasks).toBeGreaterThanOrEqual(3);
    expect(board.summary.manualReviewRequired).toBe(true);
    expect(board.lanes.map((lane) => lane.id)).toEqual(["today", "this_week", "next_week", "monthly_review"]);
    expect(tasks.map((task) => task.leverId)).toEqual(
      expect.arrayContaining(["restore-organic-cadence", "pause-google-scale-until-tracking", "complete-commercial-funnel"])
    );
  });

  it("coloca prioridades altas da semana atual em hoje ou esta semana", () => {
    const current = makeWeek({ googleConversions: 0, instagramStories: 20, instagramReels: 1 });
    const previous = makeWeek({ id: "previous-week", startDate: "2026-05-04", endDate: "2026-05-10", googleConversions: 4, instagramStories: 60 });
    const board = buildWeeklyExecutionBoard(buildReport(current, previous));
    const topTask = board.lanes.flatMap((lane) => lane.tasks).find((task) => task.rank === 1);

    expect(topTask?.lane).toMatch(/today|this_week/);
    expect(topTask?.priority).toBe("high");
    expect(topTask?.checklist.length).toBeGreaterThan(4);
  });

  it("marca pausa de Google como revisao humana e risco alto", () => {
    const current = makeWeek({ googleConversions: 0 });
    const previous = makeWeek({ id: "previous-week", startDate: "2026-05-04", endDate: "2026-05-10", googleConversions: 4 });
    const report = buildReport(current, previous);
    const googleLever = report.priorityLevers.find((lever) => lever.id === "pause-google-scale-until-tracking")!;
    const board = buildWeeklyExecutionBoard(report);
    const googleTask = board.lanes.flatMap((lane) => lane.tasks).find((task) => task.leverId === googleLever.id);

    expect(determineExecutionStatus(googleLever)).toBe("needs_review");
    expect(determineExecutionRiskLevel(googleLever)).toBe("high");
    expect(googleTask).toEqual(
      expect.objectContaining({
        area: "google",
        action: "pause",
        status: "needs_review",
        riskLevel: "high"
      })
    );
    expect(googleTask?.checklist.join(" ")).toContain("Nao redistribuir verba automaticamente");
  });

  it("bloqueia tarefa de funil quando dados comerciais agregados estao incompletos", () => {
    const current = makeWeek({
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    });
    const board = buildWeeklyExecutionBoard(buildReport(current, makeWeek({ id: "previous-week", startDate: "2026-05-04", endDate: "2026-05-10" })));
    const funnelTask = board.lanes.flatMap((lane) => lane.tasks).find((task) => task.leverId === "complete-commercial-funnel");

    expect(funnelTask?.status).toBe("blocked");
    expect(board.summary.blockedTasks).toBeGreaterThan(0);
    expect(funnelTask?.acceptanceCriteria.join(" ")).toContain("Nenhum dado sensivel");
  });

  it("mantem agenda, diario de decisoes e regras de governanca internas", () => {
    const board = buildWeeklyExecutionBoard(buildReport(makeWeek({ googleConversions: 0 }), makeWeek({ id: "previous-week" })));

    expect(board.agenda.map((item) => item.id)).toEqual(
      expect.arrayContaining(["validate-diagnosis", "choose-top-three", "confirm-governance", "define-learning-log"])
    );
    expect(board.decisionLog.map((item) => item.id)).toContain("team-audit-boundary");
    expect(board.decisionLog.find((item) => item.id === "team-audit-boundary")?.defaultRecommendation).toContain("interno");
    expect(board.operatingRules.join(" ")).toContain("Team Audit Mode permanece interno");
  });

  it("preserva linguagem conservadora e sem automacao externa", () => {
    const board = buildWeeklyExecutionBoard(buildReport(makeWeek({ googleConversions: 0, instagramStories: 20 }), makeWeek({ id: "previous-week" })));
    const text = JSON.stringify(board).toLocaleLowerCase("pt-BR");

    expect(text).toContain("revisao humana");
    expect(text).toContain("metricas agregadas");
    expect(text).toContain("nao publica");
    expect(text).not.toMatch(/resultado garantido|garante|envio automatico para a equipe|postagem automatica/);
  });

  it("mapeia janelas futuras e revisao mensal sem depender de banco ou Next", () => {
    const current = makeWeek({
      metaWhatsappConversations: 140,
      whatsappTotal: 140,
      qualifiedConversations: 70
    });
    const previous = makeWeek({
      id: "previous-week",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      metaWhatsappConversations: 60,
      whatsappTotal: 60,
      qualifiedConversations: 25
    });
    const report = buildReport(current, previous);
    const nextWeekLever = report.priorityLevers.find((lever) => lever.actionWindow === "proxima semana");

    expect(nextWeekLever ? determineExecutionLane(nextWeekLever) : "next_week").toBe("next_week");
  });
});
