import { describe, expect, it } from "vitest";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import {
  buildWeeklyCommandResult,
  buildWeeklyPriorityLevers,
  buildWeeklyValidHistoryContext,
  buildWeeklyResultMetricCards,
  interpretCadenceVsQuality,
  isWeeklyMarketingDataOperationalAnomaly
} from "@/lib/weeklyCommandResult";
import { buildWeeklyStrategicDecisionReport } from "@/lib/weeklyStrategicDecision";
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

describe("Weekly Command Center result screen domain", () => {
  it("gera tela de resultado com titulo, status e diagnostico executivo", () => {
    const report = buildWeeklyCommandResult(makeWeek(), makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10" }));

    expect(report.title).toBe("Weekly Command Center");
    expect(report.statusLabel).toMatch(/Semana/);
    expect(report.diagnosis.improved.length).toBeGreaterThan(0);
    expect(report.finalActions.map((item) => item.href)).toEqual(
      expect.arrayContaining(["/weekly", "/signals", "/audit", "/calendar", "/content", "/data"])
    );
  });

  it("trata primeira semana como leitura insuficiente/basal sem delta comparativo", () => {
    const report = buildWeeklyCommandResult(makeWeek(), null);

    expect(report.status).toBe("insufficient_data");
    expect(report.diagnosis.inconclusive.join(" ")).toContain("semana anterior valida");
    expect(report.coreMetrics.find((metric) => metric.key === "instagramProfileVisits")?.previousValue).toBeNull();
  });

  it("calcula deltas para metricas centrais quando ha semana anterior valida", () => {
    const previous = makeWeek({
      id: "week-previous",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      instagramProfileVisits: 600
    });
    const current = makeWeek({ instagramProfileVisits: 900 });
    const metric = buildWeeklyResultMetricCards(current, previous).find((item) => item.key === "instagramProfileVisits");

    expect(metric).toEqual(
      expect.objectContaining({
        value: 900,
        previousValue: 600,
        deltaAbsolute: 300,
        deltaPercent: 0.5
      })
    );
  });

  it("gera contexto de semanas validas com media historica recente", () => {
    const current = makeWeek({ instagramProfileVisits: 1200, whatsappTotal: 150 });
    const history = [
      makeWeek({ id: "week-previous-1", startDate: "2026-05-04", endDate: "2026-05-10", instagramProfileVisits: 900, whatsappTotal: 100 }),
      makeWeek({ id: "week-previous-2", startDate: "2026-04-27", endDate: "2026-05-03", instagramProfileVisits: 700, whatsappTotal: 90 }),
      makeWeek({ id: "week-previous-3", startDate: "2026-04-20", endDate: "2026-04-26", instagramProfileVisits: 800, whatsappTotal: 110 })
    ];
    const context = buildWeeklyValidHistoryContext(current, history);
    const profileMetric = context.metrics.find((metric) => metric.key === "instagramProfileVisits");

    expect(context.status).toBe("ready");
    expect(context.validWeeksUsed).toBe(3);
    expect(profileMetric).toEqual(
      expect.objectContaining({
        averageValue: 800,
        differenceAbsolute: 400,
        differencePercent: 0.5,
        direction: "above_average"
      })
    );
  });

  it("exclui dezembro de 2025 do contexto historico multi-semana", () => {
    const current = makeWeek({ startDate: "2026-01-12", endDate: "2026-01-18" });
    const history = [
      makeWeek({ id: "december-week", weekLabel: "Dezembro 2025", startDate: "2025-12-08", endDate: "2025-12-14" }),
      makeWeek({ id: "valid-week", weekLabel: "Semana valida", startDate: "2025-11-24", endDate: "2025-11-30" })
    ];
    const report = buildWeeklyCommandResult(current, history[0], undefined, undefined, history);

    expect(report.historyContext.validWeeksUsed).toBe(1);
    expect(report.historyContext.weeksConsidered.join(" ")).toContain("Semana valida");
    expect(report.historyContext.weeksConsidered.join(" ")).not.toContain("Dezembro 2025");
  });

  it("classifica queda por cadencia quando performance cai junto com volume menor", () => {
    const previous = makeWeek({
      id: "week-previous",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      instagramStories: 60,
      instagramReels: 5,
      instagramPosts: 3,
      instagramProfileVisits: 1500,
      whatsappTotal: 140,
      qualifiedConversations: 55,
      metaWhatsappConversations: 130,
      googleConversions: 5
    });
    const current = makeWeek({
      instagramStories: 20,
      instagramReels: 1,
      instagramPosts: 1,
      instagramProfileVisits: 850,
      whatsappTotal: 70,
      qualifiedConversations: 20,
      metaWhatsappConversations: 60,
      googleConversions: 1
    });
    const report = buildWeeklyCommandResult(current, previous);

    expect(report.status).toBe("cadence_drop");
    expect(interpretCadenceVsQuality(current, previous).title.toLocaleLowerCase("pt-BR")).toContain("cadencia");
  });

  it("classifica queda por qualidade quando cadencia esta adequada e demanda cai", () => {
    const previous = makeWeek({
      id: "week-previous",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      instagramProfileVisits: 1500,
      whatsappTotal: 140,
      qualifiedConversations: 55,
      metaWhatsappConversations: 130,
      googleConversions: 5
    });
    const current = makeWeek({
      instagramStories: 50,
      instagramReels: 4,
      instagramPosts: 3,
      instagramProfileVisits: 850,
      whatsappTotal: 70,
      qualifiedConversations: 20,
      metaWhatsappConversations: 60,
      googleConversions: 1
    });

    expect(buildWeeklyCommandResult(current, previous).status).toBe("quality_drop");
  });

  it("inclui aprendizado por funcoes de conteudo e presenca diaria de Stories", () => {
    const report = buildWeeklyCommandResult(makeWeek({ instagramStories: 44 }), makeWeek({ id: "week-previous" }));

    expect(report.contentLearning.map((item) => item.functionName)).toEqual(
      expect.arrayContaining(["autoridade", "confianca", "educacao", "desejo", "conversao", "distribuicao"])
    );
    expect(report.storiesPresence.links.map((item) => item.href)).toContain("/stories/today");
  });

  it("gera plano da proxima semana sem envio automatico para a equipe", () => {
    const report = buildWeeklyCommandResult(makeWeek(), makeWeek({ id: "week-previous" }));

    expect(report.nextWeekPlan.repeat.length).toBeGreaterThan(0);
    expect(report.nextWeekPlan.adjust.length).toBeGreaterThan(0);
    expect(report.nextWeekPlan.test.length).toBeGreaterThan(0);
    expect(report.nextWeekPlan.avoid.join(" ")).toContain("Nao enviar recomendacoes automaticamente");
  });

  it("ranqueia alavancas da proxima semana por prioridade e score", () => {
    const current = makeWeek({
      googleConversions: 0,
      instagramStories: 20,
      instagramReels: 1,
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    });
    const previous = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10", googleConversions: 4, instagramStories: 60 });
    const report = buildWeeklyCommandResult(current, previous);

    expect(report.priorityLevers.length).toBeGreaterThan(2);
    expect(report.priorityLevers[0].rank).toBe(1);
    expect(report.priorityLevers.map((lever) => lever.score)).toEqual([...report.priorityLevers.map((lever) => lever.score)].sort((a, b) => b - a));
    expect(report.priorityLevers.map((lever) => lever.id)).toEqual(
      expect.arrayContaining(["restore-organic-cadence", "pause-google-scale-until-tracking", "complete-commercial-funnel"])
    );
  });

  it("gera pausa de Google quando conversoes estao zeradas", () => {
    const current = makeWeek({ googleConversions: 0 });
    const previous = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10", googleConversions: 4 });
    const report = buildWeeklyCommandResult(current, previous);
    const googleLever = report.priorityLevers.find((lever) => lever.id === "pause-google-scale-until-tracking");

    expect(googleLever).toEqual(
      expect.objectContaining({
        action: "pause",
        area: "google",
        priority: "high"
      })
    );
    expect(googleLever?.guardrail).toContain("Nao redistribuir verba");
  });

  it("mantem alavancas internas, sem automacao externa ou promessa", () => {
    const current = makeWeek({ googleConversions: 0, instagramStories: 20, consultationsScheduled: null });
    const previous = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10" });
    const text = JSON.stringify(buildWeeklyCommandResult(current, previous).priorityLevers).toLocaleLowerCase("pt-BR");

    expect(text).toContain("revisao humana");
    expect(text).toContain("sem publicacao automatica");
    expect(text).not.toMatch(/resultado garantido|garante|envio autom[aá]tico para a equipe/);
  });

  it("permite montar alavancas diretamente a partir do contexto historico", () => {
    const current = makeWeek({ whatsappTotal: 70, qualifiedConversations: 20 });
    const previous = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10", whatsappTotal: 120, qualifiedConversations: 50 });
    const center = buildWeeklyCommandCenter(current);
    const strategic = buildWeeklyStrategicDecisionReport(current, previous);
    const historyContext = buildWeeklyValidHistoryContext(current, [
      previous,
      makeWeek({ id: "week-2", startDate: "2026-04-27", endDate: "2026-05-03", whatsappTotal: 130, qualifiedConversations: 45 })
    ]);
    const levers = buildWeeklyPriorityLevers(current, previous, center, interpretCadenceVsQuality(current, previous), historyContext, strategic);

    expect(levers.some((lever) => lever.id === "audit-demand-to-commercial-passage")).toBe(true);
  });

  it("ignora dezembro de 2025 como semana anterior normal", () => {
    const decemberWeek = makeWeek({
      id: "week-december-2025",
      weekLabel: "Semana Dezembro 2025",
      startDate: "2025-12-08",
      endDate: "2025-12-14",
      instagramProfileVisits: 5000
    });
    const current = makeWeek({ startDate: "2026-01-05", endDate: "2026-01-11", instagramProfileVisits: 900 });
    const report = buildWeeklyCommandResult(current, decemberWeek);

    expect(isWeeklyMarketingDataOperationalAnomaly(decemberWeek)).toBe(true);
    expect(report.coreMetrics.find((metric) => metric.key === "instagramProfileVisits")?.previousValue).toBeNull();
    expect(report.diagnosis.inconclusive.join(" ")).toContain("semana anterior valida");
  });

  it("mantem linguagem interna, conservadora e sem promessa de resultado", () => {
    const current = makeWeek();
    const previous = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10" });
    const center = buildWeeklyCommandCenter(current);
    const strategic = buildWeeklyStrategicDecisionReport(current, previous);
    const text = JSON.stringify(buildWeeklyCommandResult(current, previous, center, strategic)).toLocaleLowerCase("pt-BR");

    expect(text).toContain("revisao humana");
    expect(text).toContain("nao publica");
    expect(text).not.toMatch(/resultado garantido|postagem autom[aá]tica|garante/);
  });
});
