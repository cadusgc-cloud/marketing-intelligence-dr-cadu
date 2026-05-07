import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeParsedReport, analyzeParsedReportWithHistory } from "@/lib/engine/analyzeReport";
import { parseReport } from "@/lib/parser/reportParser";
import type { Channel, ParsedReport, RecommendationCategory } from "@/lib/types";

function loadFixture(name: string): string {
  return readFileSync(join(process.cwd(), "tests", "fixtures", "reports", name), "utf8");
}

function parseFixture(name: string): ParsedReport {
  return parseReport(loadFixture(name));
}

function getChannel(parsed: ParsedReport, channel: Channel) {
  return parsed.channels.find((item) => item.channel === channel);
}

function getCreative(parsed: ParsedReport, nameIncludes: string) {
  const needle = normalizeSearch(nameIncludes);
  return parsed.creatives.find((item) => normalizeSearch(item.name).includes(needle));
}

function hasRecommendation(parsed: ParsedReport, category: RecommendationCategory, titleIncludes: string): boolean {
  const needle = normalizeSearch(titleIncludes);
  return parsed.recommendations.some((item) => item.category === category && normalizeSearch(item.title).includes(needle));
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

describe("fixtures reais ligadas ao motor de recomendacoes", () => {
  it("calcula concentracao top 2 a partir dos dados estruturados da fixture 13/04", () => {
    const parsed = parseFixture("traffic-2026-04-13-2026-04-19.txt");

    expect(getChannel(parsed, "meta_ads")?.conversations).toBe(27);
    expect(getCreative(parsed, "Resultado 3 meses pos")?.conversations).toBe(12);
    expect(getCreative(parsed, "Resultado 3 meses pos")?.cpl).toBeCloseTo(3.35);
    expect(getCreative(parsed, "Nem toda mulher")?.conversations).toBe(8);
    expect(getCreative(parsed, "Nem toda mulher")?.cpl).toBeCloseTo(5.03);

    const analyzed = analyzeParsedReport(parsed);

    expect(hasRecommendation(analyzed, "creative", "Concentracao perigosa")).toBe(true);
  });

  it("gera Google critico, criativo problematico e escala criativos vencedores na fixture 20/04", () => {
    const analyzed = analyzeParsedReport(parseFixture("traffic-2026-04-20-2026-04-26.txt"));

    expect(hasRecommendation(analyzed, "google_ads", "Google Ads em CPA critico")).toBe(true);
    expect(hasRecommendation(analyzed, "creative", "Criativo problematico: G1_IMG")).toBe(true);
    expect(["investigate", "pause"]).toContain(getCreative(analyzed, "G1_IMG")?.diagnosis);
    expect(getCreative(analyzed, "Resultado 3 meses pos")?.diagnosis).toBe("scale");
    expect(getCreative(analyzed, "Nem toda mulher")?.diagnosis).toBe("scale");
    expect(getCreative(analyzed, "Voce pesquisou")?.diagnosis).toBe("scale");
  });

  it("analisa fixture organica sem falso positivo de boa retencao de stories", () => {
    const parsed = parseFixture("content-2026-03-09-2026-03-15.txt");
    const organic = getChannel(parsed, "instagram_organic");

    expect(organic?.storyCount).toBe(2);
    expect(organic?.storyRetention).toBeCloseTo(0.6713);
    expect(organic?.postCount).toBe(4);
    expect(organic?.reelCount).toBe(1);
    expect(getCreative(parsed, "Dreno na cirurgia plastica")?.platform).toBe("instagram_organic");

    const analyzed = analyzeParsedReport(parsed);

    expect(hasRecommendation(analyzed, "content", "Stories sao ativo")).toBe(false);
  });

  it("gera queda real de ToFu e saturacao com historico sintetico para fixture 08/03", () => {
    const current = parseFixture("traffic-2026-03-08-2026-03-22.txt");
    const previous = {
      ...parseFixture("content-2026-03-09-2026-03-15.txt"),
      periodStart: new Date("2026-02-16T12:00:00.000Z"),
      periodEnd: new Date("2026-03-01T12:00:00.000Z"),
      isOperationalAnomaly: false,
      channels: [{ channel: "consolidated" as const, reach: 200000, impressions: 490000, newFollowers: 500 }]
    };

    const analyzed = analyzeParsedReportWithHistory(current, [previous]);

    expect(hasRecommendation(analyzed, "tofu", "Queda real de ToFu")).toBe(true);
    expect(hasRecommendation(analyzed, "tofu", "Saturacao de audiencia")).toBe(true);
  });
});
