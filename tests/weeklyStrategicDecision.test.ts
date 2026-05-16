import { describe, expect, it } from "vitest";
import { createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";
import {
  buildWeeklyStrategicDecisionReport,
  calculateMetricDelta,
  compareWeeklyMarketingWeeks,
  detectWeeklyStrategicSignals,
  generateWeeklyRecommendations
} from "@/lib/weeklyStrategicDecision";

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
    instagramStories: 35,
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

describe("Weekly Strategic Decision Layer", () => {
  it("gera leitura basal quando nao existe semana anterior", () => {
    const report = buildWeeklyStrategicDecisionReport(makeWeek(), null);

    expect(report.status).toBe("baseline");
    expect(report.statusMessage).toContain("leitura basal");
    expect(report.comparisonLabel).toContain("Primeira semana salva");
    expect(report.signals.some((signal) => signal.id === "baseline-reading")).toBe(true);
    expect(report.recommendations.some((item) => item.id === "use-baseline-next-week")).toBe(true);
  });

  it("calcula deltas absolutos e percentuais entre semanas", () => {
    const previous = makeWeek({
      id: "week-previous",
      weekLabel: "Semana anterior",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      metaSpend: 500,
      metaWhatsappConversations: 50
    });
    const current = makeWeek({ metaSpend: 600, metaWhatsappConversations: 100 });
    const comparisons = compareWeeklyMarketingWeeks(current, previous);

    expect(comparisons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "metaWhatsappConversations",
          deltaAbsolute: 50,
          deltaPercent: 1,
          direction: "up",
          classification: "improved"
        }),
        expect.objectContaining({
          key: "metaCostPerWhatsapp",
          deltaAbsolute: -4,
          deltaPercent: -0.4,
          direction: "down",
          classification: "improved"
        })
      ])
    );
  });

  it("detecta gargalo comercial quando Meta gera conversas mas poucas consultas", () => {
    const signals = detectWeeklyStrategicSignals(
      makeWeek({
        metaWhatsappConversations: 120,
        whatsappTotal: 140,
        consultationsScheduled: 6,
        consultationsAttended: 4
      }),
      makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10" })
    );

    expect(signals.map((signal) => signal.id)).toEqual(
      expect.arrayContaining(["meta-commercial-bottleneck", "whatsapp-consult-rate-low"])
    );
  });

  it("detecta queda relevante de Stories frente a semana anterior", () => {
    const signals = detectWeeklyStrategicSignals(
      makeWeek({ instagramStories: 30 }),
      makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10", instagramStories: 60 })
    );

    expect(signals.some((signal) => signal.id === "stories-presence-drop")).toBe(true);
  });

  it("alerta quando investimento sobe sem ganho proporcional de demanda", () => {
    const previous = makeWeek({
      id: "week-previous",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      metaSpend: 300,
      googleSpend: 100,
      metaWhatsappConversations: 80,
      googleConversions: 4
    });
    const current = makeWeek({
      metaSpend: 650,
      googleSpend: 250,
      metaWhatsappConversations: 82,
      googleConversions: 4
    });

    expect(detectWeeklyStrategicSignals(current, previous).some((signal) => signal.id === "spend-efficiency-alert")).toBe(true);
  });

  it("nao quebra com dados ausentes, zeros ou divisao por zero", () => {
    const delta = calculateMetricDelta(10, 0);
    const report = buildWeeklyStrategicDecisionReport(
      makeWeek({
        metaSpend: 0,
        metaWhatsappConversations: 0,
        googleSpend: 0,
        googleClicks: 0,
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null
      }),
      makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10", metaSpend: 0, metaWhatsappConversations: 0 })
    );

    expect(delta.deltaPercent).toBeNull();
    expect(JSON.stringify(report)).not.toContain("Infinity");
    expect(report.signals.some((signal) => signal.id === "limited-funnel-data")).toBe(true);
  });

  it("gera recomendacoes com prioridade, tipo e responsavel sugerido", () => {
    const current = makeWeek({ metaWhatsappConversations: 120, whatsappTotal: 140, consultationsScheduled: 6 });
    const previous = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10" });
    const signals = detectWeeklyStrategicSignals(current, previous);
    const recommendations = generateWeeklyRecommendations(current, previous, signals);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "review-whatsapp-flow",
          type: "commercial",
          priority: "high",
          ownerSuggestion: "atendimento",
          actionWindow: "esta semana"
        })
      ])
    );
  });

  it("mantem linguagem conservadora e sem promessa de resultado", () => {
    const report = buildWeeklyStrategicDecisionReport(makeWeek(), makeWeek({ id: "week-previous" }));
    const text = JSON.stringify(report).toLocaleLowerCase("pt-BR");

    expect(text).toContain("revisada por uma pessoa");
    expect(text).not.toMatch(/resultado garantido|decis[aã]o autom[aá]tica|garante/);
  });
});
