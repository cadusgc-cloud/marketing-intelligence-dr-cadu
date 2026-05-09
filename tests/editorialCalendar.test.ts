import { describe, expect, it } from "vitest";
import {
  EDITORIAL_CALENDAR_ITEMS,
  WEEKLY_CONTENT_RULES,
  buildEditorialCalendarIndicators,
  expandedFormats,
  filterEditorialCalendarItems,
  getEditorialBottlenecks
} from "@/lib/editorialCalendar";

describe("Editorial Calendar", () => {
  it("possui uma semana editorial com pelo menos sete itens e os sete dias", () => {
    expect(EDITORIAL_CALENDAR_ITEMS.length).toBeGreaterThanOrEqual(7);
    expect(EDITORIAL_CALENDAR_ITEMS.map((item) => item.weekLabel)).toEqual([
      "Segunda-feira",
      "Terca-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sabado",
      "Domingo"
    ]);
  });

  it("calcula indicadores rapidos da semana", () => {
    const indicators = buildEditorialCalendarIndicators(EDITORIAL_CALENDAR_ITEMS);

    expect(indicators.total).toBe(7);
    expect(indicators.scripted).toBe(2);
    expect(indicators.recorded).toBe(1);
    expect(indicators.edited).toBe(1);
    expect(indicators.scheduled).toBe(1);
    expect(indicators.published).toBe(0);
    expect(indicators.highPriority).toBe(5);
    expect(indicators.byFunnelStage).toEqual({ TOFU: 3, MOFU: 2, BOFU: 2 });
    expect(indicators.funnelBalance).toBe("TOFU 3 / MOFU 2 / BOFU 2");
  });

  it("inclui conteudos para Stories, Reels/Shorts e TikTok", () => {
    const formats = new Set(EDITORIAL_CALENDAR_ITEMS.flatMap((item) => expandedFormats(item.format)));

    expect(formats.has("stories")).toBe(true);
    expect(formats.has("reels")).toBe(true);
    expect(formats.has("shorts")).toBe(true);
    expect(formats.has("tiktok")).toBe(true);
  });

  it("filtra por status, pilar, formato, prioridade e fase do funil", () => {
    expect(filterEditorialCalendarItems(EDITORIAL_CALENDAR_ITEMS, { productionStatus: "scheduled" }).map((item) => item.title)).toEqual([
      "Resultado com 3 meses: o que ja da para avaliar"
    ]);

    expect(filterEditorialCalendarItems(EDITORIAL_CALENDAR_ITEMS, { pillar: "Naturalidade e seguranca" })).toHaveLength(2);
    expect(filterEditorialCalendarItems(EDITORIAL_CALENDAR_ITEMS, { format: "tiktok" })).toHaveLength(6);
    expect(filterEditorialCalendarItems(EDITORIAL_CALENDAR_ITEMS, { priority: "high" })).toHaveLength(5);
    expect(filterEditorialCalendarItems(EDITORIAL_CALENDAR_ITEMS, { funnelStage: "BOFU" }).map((item) => item.title)).toEqual([
      "Mamoplastia redutora nao e so diminuir a mama",
      "Resultado com 3 meses: o que ja da para avaliar"
    ]);
  });

  it("mantem regras fixas do plano da semana", () => {
    expect(WEEKLY_CONTENT_RULES).toContain("Minimo 6 stories por dia.");
    expect(WEEKLY_CONTENT_RULES).toContain("3 reels/shorts por semana.");
    expect(WEEKLY_CONTENT_RULES).toContain("CTA diario para WhatsApp.");
    expect(WEEKLY_CONTENT_RULES.join(" ")).toContain("Stories + Reels/Shorts + TikTok");
  });

  it("identifica gargalos operacionais da semana", () => {
    const bottlenecks = getEditorialBottlenecks(EDITORIAL_CALENDAR_ITEMS);

    expect(bottlenecks).toContain("Falta gravar parte da semana.");
    expect(bottlenecks).toContain("Falta editar conteudos ja gravados.");
    expect(bottlenecks).toContain("Falta agendar conteudos editados.");
  });
});
