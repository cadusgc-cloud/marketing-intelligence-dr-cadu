import { describe, expect, it } from "vitest";
import {
  DECISION_RULES,
  DECISION_SIGNAL_INPUTS,
  evaluateDecisionRule,
  evaluateDecisionSignals,
  filterSignalsByChannel,
  filterSignalsByDecisionType,
  filterSignalsBySeverity,
  getCriticalSignals,
  getSignalsByDecisionType,
  getTriggeredSignals,
  summarizeDecisionSignals,
  type DecisionSignalInput
} from "@/lib/decisionSignals";

const baseInput: DecisionSignalInput = {
  id: "test-input",
  periodLabel: "Teste",
  channel: "meta",
  metric: "meta_bofu_whatsapp_cost",
  value: 0,
  unit: "BRL",
  context: "Teste sintetico",
  source: "unit-test",
  createdAt: new Date("2026-05-09T12:00:00.000Z")
};

describe("Decision Signals", () => {
  it("possui regras para Meta, Google, Instagram, Content, Funnel e Budget", () => {
    expect(new Set(DECISION_RULES.map((rule) => rule.channel))).toEqual(new Set(["meta", "google", "instagram", "content", "funnel", "budget"]));
  });

  it("aciona escala para WhatsApp BOFU abaixo de R$ 6,50", () => {
    const rule = DECISION_RULES.find((item) => item.id === "meta-bofu-whatsapp-scale");
    expect(rule).toBeTruthy();

    const result = evaluateDecisionRule({ ...baseInput, value: 5.9 }, rule!);

    expect(result.triggered).toBe(true);
    expect(result.decisionType).toBe("scale");
  });

  it("aciona revisao criativa para WhatsApp BOFU acima de R$ 8,00", () => {
    const rule = DECISION_RULES.find((item) => item.id === "meta-bofu-whatsapp-review");
    expect(rule).toBeTruthy();

    const result = evaluateDecisionRule({ ...baseInput, value: 8.5 }, rule!);

    expect(result.triggered).toBe(true);
    expect(result.decisionType).toBe("investigate");
  });

  it("aciona nao escalar Google quando conversoes estao zeradas", () => {
    const results = evaluateDecisionSignals(
      [{ ...baseInput, id: "google-zero", channel: "google", metric: "google_conversions", value: 0, unit: "conversions" }],
      DECISION_RULES
    );

    expect(getTriggeredSignals(results).map((signal) => signal.ruleId)).toContain("google-zero-conversions");
    expect(getTriggeredSignals(results)[0].decisionType).toBe("pause");
  });

  it("aciona pausa ou limite para cirurgia estetica com verba relevante", () => {
    const results = evaluateDecisionSignals(
      [{ ...baseInput, id: "google-term", channel: "google", metric: "google_search_term", value: "cirurgia estetica", unit: "text" }],
      DECISION_RULES
    );

    const signal = getTriggeredSignals(results)[0];
    expect(signal.ruleId).toBe("google-cirurgia-estetica");
    expect(signal.decisionType).toBe("pause");
  });

  it("aciona separacao ou negativacao para Uba com volume relevante", () => {
    const results = evaluateDecisionSignals(
      [{ ...baseInput, id: "google-uba", channel: "google", metric: "google_location_term", value: "Uba", unit: "text" }],
      DECISION_RULES
    );

    const signal = getTriggeredSignals(results)[0];
    expect(signal.ruleId).toBe("google-uba-volume");
    expect(signal.decisionType).toBe("restructure");
  });

  it("aciona alertas para poucos stories e menos de 3 reels/shorts", () => {
    const results = evaluateDecisionSignals(
      [
        { ...baseInput, id: "stories", channel: "instagram", metric: "instagram_daily_stories", value: 3, unit: "stories" },
        { ...baseInput, id: "shorts", channel: "content", metric: "weekly_reels_shorts_count", value: 2, unit: "items" }
      ],
      DECISION_RULES
    );

    expect(getTriggeredSignals(results).map((signal) => signal.ruleId)).toEqual(["instagram-few-stories", "content-less-than-3-shorts"]);
  });

  it("aciona needs_more_data quando faltam dados de consulta marcada", () => {
    const results = evaluateDecisionSignals(
      [{ ...baseInput, id: "missing-consults", channel: "funnel", metric: "scheduled_consults", value: null, unit: "count" }],
      DECISION_RULES
    );

    const signal = getTriggeredSignals(results)[0];
    expect(signal.ruleId).toBe("funnel-missing-consult-data");
    expect(signal.recommendation).toContain("controle de consultas");
  });

  it("filtra sinais por canal, severidade e tipo de decisao", () => {
    const triggered = getTriggeredSignals(evaluateDecisionSignals(DECISION_SIGNAL_INPUTS, DECISION_RULES));

    expect(filterSignalsByChannel(triggered, "google").length).toBeGreaterThan(0);
    expect(filterSignalsBySeverity(triggered, "critical").length).toBeGreaterThan(0);
    expect(filterSignalsByDecisionType(triggered, "scale").length).toBeGreaterThan(0);
  });

  it("gera resumo executivo e inclui severidades/tipos esperados", () => {
    const results = evaluateDecisionSignals(DECISION_SIGNAL_INPUTS, DECISION_RULES);
    const triggered = getTriggeredSignals(results);
    const byDecisionType = getSignalsByDecisionType(results);

    expect(summarizeDecisionSignals(results)).toContain("Meta segue como canal principal de escala");
    expect(getCriticalSignals(results).length).toBeGreaterThanOrEqual(1);
    expect(triggered.some((signal) => signal.severity === "high")).toBe(true);
    expect(byDecisionType.scale).toBeGreaterThanOrEqual(1);
    expect(byDecisionType.pause + byDecisionType.reduce).toBeGreaterThanOrEqual(1);
    expect(byDecisionType.investigate).toBeGreaterThanOrEqual(1);
  });
});
