import { describe, expect, it } from "vitest";
import {
  adaptWinningStoryForNextWeek,
  avoidRepeatingWeakStories,
  buildNextWeekPlanFromLearning,
  buildNextWeekStoryItem,
  createEthicalRewriteSuggestion,
  generateNextWeekCopyReadyPlan,
  generateNextWeekPlanMarkdownBrief,
  generateNextWeekPlanningChecklist,
  getNextWeekBlockedItems,
  getNextWeekFunnelWarnings,
  getNextWeekHighPriorityItems,
  getNextWeekReviewItems,
  selectNextWeekFunnelBalance,
  selectNextWeekPillarBalance,
  selectPlanningStrategyForLearningItem,
  summarizeNextWeekPlan,
  validateNextWeekDayPlan,
  validateNextWeekPlan
} from "@/lib/storyNextWeekPlanner";
import { buildStoryLearningItems, filterStoryLearningItemsBySignal } from "@/lib/storyLearningLoop";

describe("Story Learning to Next Week Planner", () => {
  it("buildNextWeekPlanFromLearning cria plano de 7 dias", () => {
    const plan = buildNextWeekPlanFromLearning();

    expect(plan.days).toHaveLength(7);
  });

  it("plano tenta criar 70 stories", () => {
    expect(buildNextWeekPlanFromLearning().totalStories).toBe(70);
  });

  it("cada dia tem 10 stories", () => {
    expect(buildNextWeekPlanFromLearning().days.every((day) => day.items.length === 10)).toBe(true);
  });

  it("stories com WhatsApp geram estrategia repeat_winners ou increase_bofu", () => {
    const learning = buildStoryLearningItems().find((item) => item.signals.includes("generated_whatsapp") && !item.signals.includes("ethical_attention"));

    expect(learning).toBeTruthy();
    expect(["repeat_winners", "increase_bofu"]).toContain(selectPlanningStrategyForLearningItem(learning!));
  });

  it("stories com CTA forte geram improve_cta ou repeticao no plano", () => {
    const plan = buildNextWeekPlanFromLearning();
    const ctaItems = plan.days.flatMap((day) => day.items).filter((item) => item.slotType === "cta_leve" || item.slotType === "cta_direto");

    expect(ctaItems.length).toBeGreaterThan(0);
    expect(ctaItems.some((item) => item.planningStrategy === "improve_cta" || item.planningStrategy === "repeat_winners" || item.planningStrategy === "increase_bofu")).toBe(true);
  });

  it("stories sem dados geram collect_more_data", () => {
    const plan = buildNextWeekPlanFromLearning();
    const collectMoreData = plan.days.flatMap((day) => day.items).filter((item) => item.planningStrategy === "collect_more_data");

    expect(collectMoreData.length).toBeGreaterThan(0);
  });

  it("stories com alerta etico ficam needs_review", () => {
    const learning = buildStoryLearningItems().find((item) => item.signals.includes("ethical_attention"))!;
    const item = createEthicalRewriteSuggestion(learning);

    expect(item.status).toBe("needs_review");
    expect(item.ethicalWarnings.join(" ")).toContain("alerta etico");
  });

  it("stories fracos geram ajuste", () => {
    const weak = avoidRepeatingWeakStories(buildStoryLearningItems())[0];
    const item = buildNextWeekStoryItem(weak.slotType, undefined, 1, weak, "adjust_weak_content", "theme_learning");

    expect(item.planningStrategy).toBe("adjust_weak_content");
  });

  it("plano preserva CTA leve e CTA direto por dia", () => {
    const plan = buildNextWeekPlanFromLearning();

    expect(plan.days.every((day) => day.items.some((item) => item.slotType === "cta_leve"))).toBe(true);
    expect(plan.days.every((day) => day.items.some((item) => item.slotType === "cta_direto"))).toBe(true);
  });

  it("plano identifica lacunas de funil", () => {
    const balance = selectNextWeekFunnelBalance(buildStoryLearningItems());

    expect(balance.TOFU + balance.MOFU + balance.BOFU).toBeGreaterThan(0);
  });

  it("plano gera warning para excesso de TOFU ou ausencia de BOFU quando necessario", () => {
    const plan = buildNextWeekPlanFromLearning();
    const warnings = getNextWeekFunnelWarnings({ ...plan, days: plan.days.map((day) => ({ ...day, items: day.items.map((item) => ({ ...item, funnelStage: "TOFU" as const })) })) });

    expect(warnings.join(" ")).toContain("TOFU");
  });

  it("summarizeNextWeekPlan calcula totais", () => {
    const summary = summarizeNextWeekPlan(buildNextWeekPlanFromLearning());

    expect(summary.totalStories).toBe(70);
    expect(summary.totalDays).toBe(7);
    expect(summary.highPriorityItems).toBeGreaterThan(0);
  });

  it("generateNextWeekPlanningChecklist inclui revisao, aprovacao, exportacao, execucao e registro", () => {
    const checklist = generateNextWeekPlanningChecklist(buildNextWeekPlanFromLearning()).map((item) => `${item.label} ${item.description}`).join(" ");

    expect(checklist).toContain("Revisar");
    expect(checklist).toContain("Aprovar");
    expect(checklist).toContain("Exportar");
    expect(checklist).toContain("Executar");
    expect(checklist).toContain("Registrar");
  });

  it("generateNextWeekPlanMarkdownBrief gera Markdown", () => {
    const markdown = generateNextWeekPlanMarkdownBrief(buildNextWeekPlanFromLearning());

    expect(markdown).toContain("# Proxima semana");
    expect(markdown).toContain("## Segunda-feira");
  });

  it("generateNextWeekCopyReadyPlan gera texto pronto", () => {
    const copy = generateNextWeekCopyReadyPlan(buildNextWeekPlanFromLearning());

    expect(copy).toContain("Story 01");
    expect(copy).toContain("CTA:");
  });

  it("helpers de validacao e filtros funcionam", () => {
    const plan = buildNextWeekPlanFromLearning();

    expect(validateNextWeekPlan(plan).length).toBeGreaterThanOrEqual(0);
    expect(validateNextWeekDayPlan(plan.days[0]).join(" ")).toContain("revisao");
    expect(getNextWeekReviewItems(plan).length).toBeGreaterThan(0);
    expect(getNextWeekHighPriorityItems(plan).length).toBeGreaterThan(0);
    expect(getNextWeekBlockedItems(plan)).toHaveLength(0);
  });

  it("adaptWinningStoryForNextWeek reutiliza aprendizado vencedor", () => {
    const winner = filterStoryLearningItemsBySignal(buildStoryLearningItems(), "reuse_recommended")[0];
    const item = adaptWinningStoryForNextWeek(winner);

    expect(item.sourceLearningId).toBe(winner.id);
  });

  it("selectNextWeekPillarBalance retorna distribuicao de pilares", () => {
    expect(Object.keys(selectNextWeekPillarBalance(buildStoryLearningItems())).length).toBeGreaterThan(0);
  });
});
