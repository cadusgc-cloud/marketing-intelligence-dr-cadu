import { describe, expect, it } from "vitest";
import {
  MEDIA_ASSETS,
  buildDailyStoryPlan,
  buildWeeklyStoryPlan,
  calculateStoriesPerDayAverage,
  filterMediaAssetsByApprovalStatus,
  filterMediaAssetsByPillar,
  filterMediaAssetsByType,
  filterMediaAssetsByUsageStatus,
  getApprovedMediaAssets,
  getDaysBelowStoryTarget,
  getMediaLibraryWarnings,
  getUnusedMediaAssets,
  recommendMediaForStorySlot,
  summarizeMediaLibrary,
  summarizeWeeklyStoryPlan,
  validateDailyStoryPlan,
  validateWeeklyStoryPlan
} from "@/lib/mediaLibrary";

describe("Media Library & Story Planner", () => {
  it("possui pelo menos 20 midias simuladas", () => {
    expect(MEDIA_ASSETS.length).toBeGreaterThanOrEqual(20);
    expect(MEDIA_ASSETS.some((asset) => asset.filename === "cadu-consultorio-bastidor-01.jpg")).toBe(true);
  });

  it("filtra midias por tipo", () => {
    const videos = filterMediaAssetsByType(MEDIA_ASSETS, "video");

    expect(videos.length).toBeGreaterThan(0);
    expect(videos.every((asset) => asset.assetType === "video")).toBe(true);
  });

  it("filtra midias por pilar", () => {
    const assets = filterMediaAssetsByPillar(MEDIA_ASSETS, "Naturalidade e seguranca");

    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((asset) => asset.pillar === "Naturalidade e seguranca")).toBe(true);
  });

  it("filtra midias por status de uso", () => {
    const unused = filterMediaAssetsByUsageStatus(MEDIA_ASSETS, "unused");

    expect(unused.length).toBeGreaterThan(0);
    expect(unused.every((asset) => asset.usageStatus === "unused")).toBe(true);
  });

  it("filtra midias por status de aprovacao", () => {
    const approved = filterMediaAssetsByApprovalStatus(MEDIA_ASSETS, "approved");

    expect(approved.length).toBeGreaterThan(0);
    expect(approved.every((asset) => asset.approvalStatus === "approved")).toBe(true);
  });

  it("identifica midias aprovadas e nao usadas", () => {
    expect(getApprovedMediaAssets(MEDIA_ASSETS).every((asset) => asset.approvalStatus === "approved")).toBe(true);
    expect(getUnusedMediaAssets(MEDIA_ASSETS).every((asset) => asset.usageStatus === "unused")).toBe(true);
  });

  it("recomenda midia para slot de story", () => {
    const recommendation = recommendMediaForStorySlot("human_bastidor", MEDIA_ASSETS);

    expect(recommendation).toBeTruthy();
    expect(recommendation?.approvalStatus).toBe("approved");
    expect(recommendation?.tags).toEqual(expect.arrayContaining(["bastidor"]));
  });

  it("buildDailyStoryPlan cria 10 slots", () => {
    const plan = buildDailyStoryPlan();

    expect(plan.slots).toHaveLength(10);
    expect(plan.totalStories).toBe(10);
  });

  it("plano diario inclui CTA leve e CTA direto", () => {
    const slotTypes = buildDailyStoryPlan().slots.map((slot) => slot.slotType);

    expect(slotTypes).toContain("cta_leve");
    expect(slotTypes).toContain("cta_direto");
  });

  it("plano diario inclui bastidor, autoridade e procedimento", () => {
    const slotTypes = buildDailyStoryPlan().slots.map((slot) => slot.slotType);

    expect(slotTypes).toContain("human_bastidor");
    expect(slotTypes).toContain("autoridade");
    expect(slotTypes).toContain("procedimento");
  });

  it("calculateStoriesPerDayAverage calcula media semanal", () => {
    const weeklyPlan = buildWeeklyStoryPlan();

    expect(calculateStoriesPerDayAverage(weeklyPlan.dailyPlans)).toBe(10);
  });

  it("getDaysBelowStoryTarget identifica dias abaixo de 10 stories", () => {
    const dailyPlan = buildDailyStoryPlan();
    const shortPlan = { ...dailyPlan, dayLabel: "Domingo", slots: dailyPlan.slots.slice(0, 8), totalStories: 8 };

    expect(getDaysBelowStoryTarget([dailyPlan, shortPlan])).toEqual(["Domingo"]);
  });

  it("validateDailyStoryPlan gera alertas quando necessario", () => {
    const dailyPlan = buildDailyStoryPlan();
    const invalidPlan = { ...dailyPlan, slots: dailyPlan.slots.filter((slot) => slot.slotType !== "cta_direto"), totalStories: 9 };
    const warnings = validateDailyStoryPlan(invalidPlan);

    expect(warnings.join(" ")).toContain("CTA direto");
    expect(warnings.join(" ")).toContain("abaixo da meta");
  });

  it("validateWeeklyStoryPlan gera alertas quando necessario", () => {
    const weeklyPlan = buildWeeklyStoryPlan();
    const shortPlan = { ...weeklyPlan.dailyPlans[0], dayLabel: "Segunda-feira", slots: weeklyPlan.dailyPlans[0].slots.slice(0, 8), totalStories: 8 };
    const invalidWeeklyPlan = { ...weeklyPlan, dailyPlans: [shortPlan, ...weeklyPlan.dailyPlans.slice(1, 6)] };
    const warnings = validateWeeklyStoryPlan(invalidWeeklyPlan);

    expect(warnings.join(" ")).toContain("abaixo da meta");
    expect(warnings.join(" ")).toContain("Dias sem planejamento");
  });

  it("summarizeMediaLibrary calcula totais", () => {
    const summary = summarizeMediaLibrary(MEDIA_ASSETS);

    expect(summary.totalAssets).toBe(MEDIA_ASSETS.length);
    expect(summary.photos).toBeGreaterThan(0);
    expect(summary.videos).toBeGreaterThan(0);
    expect(summary.approvedAssets).toBeGreaterThan(0);
    expect(summary.highPrivacyRiskAssets).toBeGreaterThan(0);
    expect(summary.assetsByPillar["Naturalidade e seguranca"]).toBeGreaterThan(0);
  });

  it("summarizeWeeklyStoryPlan calcula total e media", () => {
    const weeklyPlan = buildWeeklyStoryPlan();
    const summary = summarizeWeeklyStoryPlan(weeklyPlan);

    expect(summary.totalStoriesPlanned).toBe(70);
    expect(summary.averageStoriesPerDay).toBe(10);
    expect(summary.recommendedAdjustments.length).toBeGreaterThan(0);
  });

  it("warnings deixam claro que midias sao simuladas e nenhum arquivo real e lido", () => {
    const warnings = getMediaLibraryWarnings(MEDIA_ASSETS);

    expect(warnings.join(" ")).toContain("midias sao simuladas");
    expect(warnings.join(" ")).toContain("nenhum arquivo real e lido");
  });
});
