import { describe, expect, it } from "vitest";
import { buildStoryWeekPlanFromCatalog } from "@/lib/storyWeekBuilder";
import {
  buildStoryDayExportPackage,
  buildStoryExportSlot,
  buildStoryWeekExportPackage,
  filterStoryExportSlotsByDay,
  filterStoryExportSlotsByStatus,
  generateFullWeekMarkdownBrief,
  generateStoryDayCopyReadySequence,
  generateStoryDayMarkdownBrief,
  generateStoryPublicationChecklist,
  generateStorySlotCopyReadyText,
  getStoryExportBlockedItems,
  getStoryExportDaysNeedingReview,
  getStoryExportEthicalItems,
  getStoryExportReadyDays,
  getStoryExportWarnings,
  summarizeStoryWeekExport,
  validateStoryExportPackage
} from "@/lib/storyWeekExport";

describe("Story Week Export Kit", () => {
  it("buildStoryWeekExportPackage cria pacote semanal", () => {
    const pkg = buildStoryWeekExportPackage();

    expect(pkg.weekLabel).toContain("Semana");
    expect(pkg.fullWeekCopyReadyText).toContain("Story 01");
    expect(pkg.fullWeekMarkdownBrief).toContain("Pacote de Exportacao");
  });

  it("pacote semanal contem 7 dias", () => {
    expect(buildStoryWeekExportPackage().dayPackages).toHaveLength(7);
  });

  it("pacote semanal contem 70 stories ou reflete total do plano", () => {
    const plan = buildStoryWeekPlanFromCatalog();
    const pkg = buildStoryWeekExportPackage(plan);

    expect(pkg.totalStories).toBe(plan.totalStories);
    expect(pkg.totalStories).toBe(70);
  });

  it("buildStoryDayExportPackage cria pacote diario", () => {
    const day = buildStoryWeekPlanFromCatalog().days[0];
    const dayPackage = buildStoryDayExportPackage(day);

    expect(dayPackage.dayLabel).toBe("Segunda-feira");
    expect(dayPackage.slots).toHaveLength(10);
    expect(dayPackage.copyReadySequence).toContain("Story 01");
  });

  it("generateStorySlotCopyReadyText inclui numero, arquivo, texto, sticker e CTA", () => {
    const slot = buildStoryExportSlot(buildStoryWeekPlanFromCatalog().days[0].slots[0]);
    const copy = generateStorySlotCopyReadyText(slot);

    expect(copy).toContain("Story 01");
    expect(copy).toContain("Arquivo sugerido:");
    expect(copy).toContain("Texto:");
    expect(copy).toContain("Sticker:");
    expect(copy).toContain("CTA:");
  });

  it("generateStoryDayCopyReadySequence inclui 10 stories", () => {
    const dayPackage = buildStoryWeekExportPackage().dayPackages[0];
    const copy = generateStoryDayCopyReadySequence(dayPackage.slots);

    expect(copy.match(/Story \d\d/g)).toHaveLength(10);
  });

  it("generateStoryDayMarkdownBrief gera Markdown com titulo do dia", () => {
    const day = buildStoryWeekPlanFromCatalog().days[0];
    const dayPackage = buildStoryDayExportPackage(day);
    const markdown = generateStoryDayMarkdownBrief(day, dayPackage.slots, dayPackage.publicationChecklist);

    expect(markdown).toContain("# Segunda-feira");
    expect(markdown).toContain("## Sequencia de stories");
  });

  it("generateFullWeekMarkdownBrief agrupa 7 dias", () => {
    const dayPackages = buildStoryWeekExportPackage().dayPackages;
    const markdown = generateFullWeekMarkdownBrief(dayPackages);

    expect(dayPackages.every((day) => markdown.includes(day.dayLabel))).toBe(true);
  });

  it("summarizeStoryWeekExport calcula totais", () => {
    const summary = summarizeStoryWeekExport(buildStoryWeekExportPackage());

    expect(summary.totalStories).toBe(70);
    expect(summary.totalDays).toBe(7);
    expect(summary.directCtas).toBe(7);
    expect(summary.lightCtas).toBe(7);
  });

  it("getStoryExportWarnings identifica alertas eticos", () => {
    const warnings = getStoryExportWarnings(buildStoryWeekExportPackage()).join(" ");

    expect(warnings).toContain("Exportacao simulada");
    expect(warnings).toContain("revisao etica");
  });

  it("getStoryExportReadyDays identifica dias prontos", () => {
    const readyDays = getStoryExportReadyDays(buildStoryWeekExportPackage());

    expect(Array.isArray(readyDays)).toBe(true);
  });

  it("getStoryExportDaysNeedingReview identifica dias com revisao", () => {
    const reviewDays = getStoryExportDaysNeedingReview(buildStoryWeekExportPackage());

    expect(reviewDays.length).toBeGreaterThan(0);
  });

  it("getStoryExportEthicalItems lista paciente, resultado, depoimento ou antes-depois", () => {
    const items = getStoryExportEthicalItems(buildStoryWeekExportPackage());

    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item) => /paciente|resultado|depoimento|antes-depois/.test(item.suggestedFilename))).toBe(true);
  });

  it("generateStoryPublicationChecklist inclui revisao etica, CTA, promessa de resultado, midia final e registro de resultado", () => {
    const labels = generateStoryPublicationChecklist().map((item) => `${item.label} ${item.description}`).join(" ");

    expect(labels).toContain("Revisar arquivos");
    expect(labels).toContain("CTAs");
    expect(labels).toContain("promessa de resultado");
    expect(labels).toContain("midia final");
    expect(labels).toContain("Registrar");
  });

  it("validateStoryExportPackage bloqueia ou exige revisao quando houver risco etico", () => {
    const pkg = buildStoryWeekExportPackage();
    const validation = validateStoryExportPackage(pkg).join(" ");

    expect(validation).toContain("revisao etica");
    expect(pkg.status === "blocked" || pkg.status === "needs_review").toBe(true);
  });

  it("filtra slots por status e por dia", () => {
    const pkg = buildStoryWeekExportPackage();
    const slots = pkg.dayPackages.flatMap((day) => day.slots);

    expect(filterStoryExportSlotsByStatus(slots, "needs_review").length).toBeGreaterThan(0);
    expect(filterStoryExportSlotsByDay(slots, "Segunda-feira")).toHaveLength(10);
  });

  it("getStoryExportBlockedItems retorna itens bloqueados quando houver risco critico", () => {
    const blocked = getStoryExportBlockedItems(buildStoryWeekExportPackage());

    expect(blocked.every((slot) => slot.status === "blocked")).toBe(true);
  });
});
