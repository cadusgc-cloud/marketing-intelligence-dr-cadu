import { describe, expect, it } from "vitest";
import {
  STORY_WEEK_SIMULATED_MANIFEST,
  buildStoryWeekPlanFromCatalog,
  calculateStoryWeekSummary,
  generateCTAForSlot,
  generateDailyStoriesMarkdownBrief,
  generateStickerSuggestionForSlot,
  generateStoryTextForSlot,
  generateStoryWeekExportDraft,
  getDaysBelowStoryTarget,
  getHighRiskStorySlots,
  getStoryWeekFunnelBalance,
  validateStoryWeekPlan
} from "@/lib/storyWeekBuilder";

describe("Story Week Builder", () => {
  it("buildStoryWeekPlanFromCatalog cria 7 dias", () => {
    const plan = buildStoryWeekPlanFromCatalog();

    expect(plan.days).toHaveLength(7);
    expect(plan.weekLabel).toContain("Semana");
  });

  it("plano semanal tenta criar 70 stories", () => {
    const plan = buildStoryWeekPlanFromCatalog();

    expect(plan.totalStories).toBe(70);
    expect(plan.averageStoriesPerDay).toBe(10);
  });

  it("cada dia tem 10 slots", () => {
    const plan = buildStoryWeekPlanFromCatalog();

    expect(plan.days.every((day) => day.slots.length === 10)).toBe(true);
    expect(plan.days.every((day) => day.totalStories === 10)).toBe(true);
  });

  it("cada dia contem CTA leve e CTA direto", () => {
    const plan = buildStoryWeekPlanFromCatalog();

    plan.days.forEach((day) => {
      const slotTypes = day.slots.map((slot) => slot.slotType);
      expect(slotTypes).toContain("cta_leve");
      expect(slotTypes).toContain("cta_direto");
    });
  });

  it("cada dia contem bastidor, autoridade e procedimento", () => {
    const plan = buildStoryWeekPlanFromCatalog();

    expect(plan.days.every((day) => day.hasBastidor)).toBe(true);
    expect(plan.days.every((day) => day.hasAutoridade)).toBe(true);
    expect(plan.days.every((day) => day.hasProcedimento)).toBe(true);
  });

  it("plano identifica itens de risco etico", () => {
    const plan = buildStoryWeekPlanFromCatalog();
    const highRisk = getHighRiskStorySlots(plan.days.flatMap((day) => day.slots));

    expect(highRisk.length).toBeGreaterThan(0);
    expect(plan.ethicalReviewItems.length).toBeGreaterThan(0);
  });

  it("arquivos com paciente, resultado, antes-depois ou depoimento ficam needs_review", () => {
    const plan = buildStoryWeekPlanFromCatalog(STORY_WEEK_SIMULATED_MANIFEST.join("\n"));
    const riskySlots = plan.days
      .flatMap((day) => day.slots)
      .filter((slot) => /paciente|resultado|antes-depois|depoimento/.test(slot.suggestedFilename));

    expect(riskySlots.length).toBeGreaterThan(0);
    expect(riskySlots.every((slot) => slot.status === "needs_review")).toBe(true);
    expect(riskySlots.every((slot) => slot.ethicalWarnings.join(" ").includes("revisao"))).toBe(true);
  });

  it("plano calcula media de stories por dia", () => {
    const summary = calculateStoryWeekSummary(buildStoryWeekPlanFromCatalog());

    expect(summary.averageStoriesPerDay).toBe(10);
    expect(summary.totalStories).toBe(70);
  });

  it("plano identifica dias abaixo da meta", () => {
    const plan = buildStoryWeekPlanFromCatalog();
    const reducedDays = [{ ...plan.days[0], slots: plan.days[0].slots.slice(0, 8), totalStories: 8 }];

    expect(getDaysBelowStoryTarget(reducedDays)).toEqual(["Segunda-feira"]);
  });

  it("plano calcula equilibrio de funil", () => {
    const plan = buildStoryWeekPlanFromCatalog();
    const balance = getStoryWeekFunnelBalance(plan.days.flatMap((day) => day.slots));

    expect(balance.TOFU).toBeGreaterThan(0);
    expect(balance.MOFU).toBeGreaterThan(0);
    expect(balance.BOFU).toBeGreaterThan(0);
  });

  it("plano gera warning para excesso de TOFU ou ausencia de BOFU", () => {
    const plan = buildStoryWeekPlanFromCatalog();
    const tofuOnlyPlan = {
      ...plan,
      days: plan.days.map((day) => ({
        ...day,
        slots: day.slots.map((slot) => ({ ...slot, funnelStage: "TOFU" as const }))
      })),
      funnelBalance: { TOFU: 70, MOFU: 0, BOFU: 0 }
    };

    expect(validateStoryWeekPlan(tofuOnlyPlan).join(" ")).toContain("Ausencia de BOFU");
  });

  it("generateStoryTextForSlot retorna texto em portugues", () => {
    expect(generateStoryTextForSlot("procedimento", "mamas_protese")).toContain("Protese de silicone");
    expect(generateStoryTextForSlot("maternidade_naturalidade")).toContain("Maternidade");
  });

  it("generateStickerSuggestionForSlot retorna sugestao de sticker", () => {
    expect(generateStickerSuggestionForSlot("duvida_frequente")).toContain("Caixinha");
  });

  it("generateCTAForSlot retorna CTA adequado", () => {
    expect(generateCTAForSlot("cta_direto")).toContain("WhatsApp");
  });

  it("generateStoryWeekExportDraft gera copy-ready text", () => {
    const draft = generateStoryWeekExportDraft(buildStoryWeekPlanFromCatalog());

    expect(draft.copyReadyText).toContain("Story 1");
    expect(draft.copyReadyText).toContain("CTA");
    expect(draft.status).toBe("needs_review");
  });

  it("generateDailyStoriesMarkdownBrief gera Markdown", () => {
    const plan = buildStoryWeekPlanFromCatalog();
    const markdown = generateDailyStoriesMarkdownBrief(plan.days[0]);

    expect(markdown).toContain("# Segunda-feira");
    expect(markdown).toContain("## Story 1");
  });
});
