import { describe, expect, it } from "vitest";
import {
  buildSimulatedStoryResultItems,
  buildStoryLearningItem,
  buildStoryLearningItems,
  buildWeeklyStoryLearningSummary,
  detectStoryLearningSignals,
  filterStoryLearningItemsByPriority,
  filterStoryLearningItemsByRecommendationType,
  filterStoryLearningItemsBySignal,
  generateNextWeekStoryRecommendations,
  getStoriesToAvoidRepeating,
  getStoryReuseCandidates,
  getTopPerformingCtas,
  getTopPerformingStoryThemes,
  getWeakPerformingCtas,
  getWeakPerformingStoryThemes,
  groupStoryLearningByFunnelStage,
  groupStoryLearningByPillar,
  summarizeLearningByCta,
  summarizeLearningByTheme
} from "@/lib/storyLearningLoop";

describe("Weekly Story Learning Loop", () => {
  it("buildStoryLearningItems cria itens de aprendizado", () => {
    const items = buildStoryLearningItems();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].learning).toBeTruthy();
  });

  it("detectStoryLearningSignals detecta WhatsApp", () => {
    const result = buildSimulatedStoryResultItems().find((item) => (item.whatsappConversations ?? 0) > 0);

    expect(result).toBeTruthy();
    expect(detectStoryLearningSignals(result!)).toContain("generated_whatsapp");
  });

  it("detectStoryLearningSignals detecta replies", () => {
    const result = buildSimulatedStoryResultItems().find((item) => (item.replies ?? 0) > 0);

    expect(result).toBeTruthy();
    expect(detectStoryLearningSignals(result!)).toContain("generated_replies");
  });

  it("detectStoryLearningSignals detecta CTA forte", () => {
    const result = buildSimulatedStoryResultItems().find((item) => (item.linkClicks ?? 0) > 0 || (item.whatsappConversations ?? 0) > 0);

    expect(result).toBeTruthy();
    expect(detectStoryLearningSignals(result!)).toContain("strong_cta");
  });

  it("story sem dados gera missing_data", () => {
    const result = buildSimulatedStoryResultItems().find((item) => item.views === null);

    expect(result).toBeTruthy();
    expect(detectStoryLearningSignals(result!)).toContain("missing_data");
  });

  it("story com alerta etico mantem ethical_attention", () => {
    const result = buildSimulatedStoryResultItems().find((item) => item.ethicalWarnings.length > 0 || /paciente|resultado|depoimento|antes-depois/.test(item.suggestedFilename));

    expect(result).toBeTruthy();
    expect(detectStoryLearningSignals(result!)).toContain("ethical_attention");
  });

  it("getStoryReuseCandidates retorna itens com bom desempenho", () => {
    const candidates = getStoryReuseCandidates(buildStoryLearningItems());

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((item) => item.signals.includes("reuse_recommended"))).toBe(true);
  });

  it("getStoriesToAvoidRepeating retorna itens fracos ou de ajuste", () => {
    const avoid = getStoriesToAvoidRepeating(buildStoryLearningItems());

    expect(avoid.length).toBeGreaterThan(0);
    expect(avoid.some((item) => item.signals.includes("low_engagement") || item.recommendationType === "adjust")).toBe(true);
  });

  it("summarizeLearningByTheme calcula temas fortes", () => {
    const themes = summarizeLearningByTheme(buildStoryLearningItems());

    expect(themes.length).toBeGreaterThan(0);
    expect(themes[0].totalStories).toBeGreaterThan(0);
  });

  it("summarizeLearningByCta calcula CTAs fortes e fracos", () => {
    const ctas = summarizeLearningByCta(buildStoryLearningItems());

    expect(ctas.length).toBeGreaterThan(0);
    expect(ctas.some((cta) => cta.performanceLabel === "strong")).toBe(true);
  });

  it("buildWeeklyStoryLearningSummary calcula totais", () => {
    const summary = buildWeeklyStoryLearningSummary();

    expect(summary.totalStoriesAnalyzed).toBeGreaterThan(0);
    expect(summary.storiesWithResults).toBeGreaterThan(0);
    expect(summary.nextWeekRecommendations.length).toBeGreaterThan(0);
  });

  it("generateNextWeekStoryRecommendations gera recomendacoes", () => {
    const recommendations = generateNextWeekStoryRecommendations(buildStoryLearningItems());

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].suggestedText).toBeTruthy();
  });

  it("recomendacoes nao sugerem reutilizacao automatica de item com alerta etico sem revisao", () => {
    const ethicalLearning = buildStoryLearningItems().find((item) => item.signals.includes("ethical_attention") && item.engagementScore > 0);

    expect(ethicalLearning).toBeTruthy();
    expect(ethicalLearning?.recommendationType).toBe("adjust");
    expect(ethicalLearning?.nextWeekSuggestion).toContain("Revisar");
  });

  it("filtros por sinal funcionam", () => {
    const items = buildStoryLearningItems();

    expect(filterStoryLearningItemsBySignal(items, "generated_whatsapp").length).toBeGreaterThan(0);
  });

  it("filtros por recomendacao funcionam", () => {
    const items = buildStoryLearningItems();

    expect(filterStoryLearningItemsByRecommendationType(items, "increase_frequency").length).toBeGreaterThan(0);
  });

  it("filtros por prioridade funcionam", () => {
    const items = buildStoryLearningItems();

    expect(filterStoryLearningItemsByPriority(items, "high").length).toBeGreaterThan(0);
  });

  it("agrupamentos por pilar e funil funcionam", () => {
    const items = buildStoryLearningItems();

    expect(Object.keys(groupStoryLearningByPillar(items)).length).toBeGreaterThan(0);
    expect(groupStoryLearningByFunnelStage(items).TOFU.length + groupStoryLearningByFunnelStage(items).MOFU.length + groupStoryLearningByFunnelStage(items).BOFU.length).toBe(items.length);
  });

  it("top e weak helpers retornam colecoes", () => {
    const items = buildStoryLearningItems();

    expect(Array.isArray(getTopPerformingStoryThemes(items))).toBe(true);
    expect(Array.isArray(getWeakPerformingStoryThemes(items))).toBe(true);
    expect(Array.isArray(getTopPerformingCtas(items))).toBe(true);
    expect(Array.isArray(getWeakPerformingCtas(items))).toBe(true);
  });

  it("buildStoryLearningItem gera texto e recomendacao", () => {
    const result = buildSimulatedStoryResultItems().find((item) => (item.whatsappConversations ?? 0) > 0 && item.ethicalWarnings.length === 0)!;
    const learning = buildStoryLearningItem(result);

    expect(learning.learning).toContain("WhatsApp");
    expect(learning.priority).toBe("high");
  });
});
