import { describe, expect, it } from "vitest";
import { buildStoryWeekExportPackage } from "@/lib/storyWeekExport";
import { buildStoryDayExecutionBoard, buildStoryExecutionBoardFromExportPackage } from "@/lib/storyExecutionBoard";
import {
  buildStoryResultItem,
  buildStoryResultItemsFromExecutionBoard,
  calculateStoryEngagementScore,
  detectStoryResultSignals,
  filterStoryResultsByDay,
  filterStoryResultsBySignal,
  filterStoryResultsByStatus,
  generateStoryResultLearning,
  getAvoidRepeatingItems,
  getBestPerformingStory,
  getNextWeekRecommendationsFromResults,
  getReuseCandidates,
  getStoriesMissingResults,
  getWeakestPerformingStory,
  summarizeStoryDayResults,
  summarizeStoryWeekResults,
  updateStoryResultMetric,
  updateStoryResultNotes,
  updateStoryResultPublishedUrl,
  validateStoryResultItem
} from "@/lib/storyResults";

function resultItems() {
  return buildStoryResultItemsFromExecutionBoard(buildStoryDayExecutionBoard());
}

function itemWithMetrics() {
  const item = resultItems()[0];
  return buildStoryResultItem(
    {
      ...buildStoryDayExecutionBoard().items[0],
      executionStatus: "manually_published",
      publishedAt: "publicado manualmente"
    },
    {
      views: 100,
      replies: 4,
      stickerInteractions: 8,
      linkClicks: 2,
      profileVisits: 5,
      whatsappConversations: 1
    }
  );
}

describe("Story Results Logging", () => {
  it("buildStoryResultItemsFromExecutionBoard cria itens de resultado", () => {
    const items = resultItems();

    expect(items).toHaveLength(10);
    expect(items[0].dayLabel).toBe("Segunda-feira");
  });

  it("updateStoryResultMetric atualiza metrica", () => {
    const items = resultItems();
    const updated = updateStoryResultMetric(items, items[0].id, "views", 120);

    expect(updated[0].views).toBe(120);
  });

  it("updateStoryResultPublishedUrl registra URL simulada", () => {
    const items = resultItems();
    const updated = updateStoryResultPublishedUrl(items, items[0].id, "https://instagram.com/stories/exemplo");

    expect(updated[0].publishedUrl).toContain("instagram.com");
  });

  it("updateStoryResultNotes altera observacao", () => {
    const items = resultItems();
    const updated = updateStoryResultNotes(items, items[0].id, "Responderam bem ao CTA.");

    expect(updated[0].notes).toContain("CTA");
  });

  it("calculateStoryEngagementScore calcula score", () => {
    expect(calculateStoryEngagementScore(itemWithMetrics())).toBeGreaterThan(0);
  });

  it("detectStoryResultSignals detecta replies", () => {
    expect(detectStoryResultSignals(itemWithMetrics())).toContain("generated_replies");
  });

  it("detectStoryResultSignals detecta WhatsApp", () => {
    expect(detectStoryResultSignals(itemWithMetrics())).toContain("generated_whatsapp");
  });

  it("detectStoryResultSignals detecta CTA bom", () => {
    expect(detectStoryResultSignals(itemWithMetrics())).toContain("good_cta");
  });

  it("story sem metricas gera needs_more_data", () => {
    expect(detectStoryResultSignals(resultItems()[0])).toContain("needs_more_data");
  });

  it("summarizeStoryDayResults calcula totais do dia", () => {
    const [first, ...rest] = resultItems();
    const items = [buildStoryResultItem(buildStoryDayExecutionBoard().items[0], { views: 80, replies: 2 }), ...rest];
    const summary = summarizeStoryDayResults(items, "Segunda-feira");

    expect(summary.totalStories).toBe(10);
    expect(summary.totalViews).toBe(80);
    expect(summary.totalReplies).toBe(2);
  });

  it("summarizeStoryWeekResults calcula totais da semana", () => {
    const board = buildStoryExecutionBoardFromExportPackage(buildStoryWeekExportPackage(), "Segunda-feira");
    const items = buildStoryResultItemsFromExecutionBoard(board);
    const updated = updateStoryResultMetric(items, items[0].id, "views", 90);
    const summary = summarizeStoryWeekResults(updated);

    expect(summary.totalStories).toBe(10);
    expect(summary.totalViews).toBe(90);
    expect(summary.daySummaries).toHaveLength(1);
  });

  it("getBestPerformingStory retorna melhor item", () => {
    const items = resultItems();
    const updated = updateStoryResultMetric(updateStoryResultMetric(items, items[0].id, "views", 100), items[0].id, "whatsappConversations", 2);

    expect(getBestPerformingStory(updated)?.id).toBe(items[0].id);
  });

  it("getWeakestPerformingStory retorna item mais fraco", () => {
    const items = resultItems();
    const updated = updateStoryResultMetric(items, items[0].id, "views", 20);

    expect(getWeakestPerformingStory(updated)?.id).toBe(items[0].id);
  });

  it("getReuseCandidates retorna itens reutilizaveis", () => {
    const item = itemWithMetrics();

    expect(getReuseCandidates([item])).toHaveLength(1);
  });

  it("getAvoidRepeatingItems retorna itens a evitar", () => {
    const weakItem = buildStoryResultItem(buildStoryDayExecutionBoard().items[0], { views: 10, replies: 0, linkClicks: 0, whatsappConversations: 0 });

    expect(getAvoidRepeatingItems([weakItem])).toHaveLength(1);
  });

  it("getStoriesMissingResults identifica lacunas", () => {
    expect(getStoriesMissingResults(resultItems()).length).toBeGreaterThan(0);
  });

  it("getNextWeekRecommendationsFromResults gera recomendacoes", () => {
    const recommendations = getNextWeekRecommendationsFromResults([itemWithMetrics()]).join(" ");

    expect(recommendations).toContain("WhatsApp");
    expect(recommendations).toContain("/data");
  });

  it("validateStoryResultItem valida dados negativos como invalidos ou warning", () => {
    const invalidItem = buildStoryResultItem(buildStoryDayExecutionBoard().items[0], { views: -1 });

    expect(validateStoryResultItem(invalidItem).join(" ")).toContain("negativa");
  });

  it("filtros por status, sinal e dia funcionam", () => {
    const strongItem = itemWithMetrics();
    const items = [strongItem, ...resultItems().slice(1)];

    expect(filterStoryResultsByStatus(items, strongItem.resultStatus)).toContain(strongItem);
    expect(filterStoryResultsBySignal(items, "generated_whatsapp")).toContain(strongItem);
    expect(filterStoryResultsByDay(items, "Segunda-feira")).toHaveLength(10);
  });

  it("generateStoryResultLearning descreve aprendizado operacional", () => {
    expect(generateStoryResultLearning(itemWithMetrics())).toContain("WhatsApp");
  });
});
