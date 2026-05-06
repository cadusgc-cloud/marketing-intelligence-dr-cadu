import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseReport } from "@/lib/parser/reportParser";
import type { Channel, ParsedReport } from "@/lib/types";

function loadFixture(name: string): string {
  return readFileSync(join(process.cwd(), "tests", "fixtures", "reports", name), "utf8");
}

function getChannel(parsed: ParsedReport, channel: Channel) {
  return parsed.channels.find((item) => item.channel === channel);
}

function getCreative(parsed: ParsedReport, nameIncludes: string) {
  const normalizedName = normalizeSearch(nameIncludes);
  return parsed.creatives.find((item) => normalizeSearch(item.name).includes(normalizedName));
}

function getKeyword(parsed: ParsedReport, nameIncludes: string) {
  const normalizedName = normalizeSearch(nameIncludes);
  return parsed.keywords.find((item) => normalizeSearch(item.keyword).includes(normalizedName));
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

describe("parseReport", () => {
  it("extrai métricas centrais com dinheiro brasileiro", () => {
    const parsed = parseReport(`Relatório Semanal — 20/04 a 26/04/2026
Investimento total: R$ 750,71
Meta Ads: R$ 622,87
Google Ads: R$ 127,84
Alcance: 87.698
Impressões: 155.322
Novos seguidores: 436
Conversas Meta: 27
CPL Meta: R$ 23,07
Google conversões: 4
Google CPA: R$ 31,96
Criativos: Você pesquisou — 8 conversas — CPL R$ 4,03
Keywords: lipoaspiração — 2 conversões — CPA R$ 4,93`);

    expect(parsed.periodStart?.getUTCFullYear()).toBe(2026);
    expect(parsed.channels.find((item) => item.channel === "meta_ads")?.investment).toBeCloseTo(622.87);
    expect(parsed.channels.find((item) => item.channel === "google_ads")?.cpa).toBeCloseTo(31.96);
    expect(parsed.creatives[0].name).toContain("Você pesquisou");
    expect(parsed.keywords[0].keyword).toBe("lipoaspiração");
  });

  it("marca dezembro de 2025 como anomalia operacional", () => {
    const parsed = parseReport(`Relatório Semanal — 08/12/2025 a 14/12/2025
Investimento total: R$ 100,00
Conversas Meta: 10
CPL Meta: R$ 10,00`);

    expect(parsed.isOperationalAnomaly).toBe(true);
    expect(parsed.anomalyReason).toContain("Conta hackeada");
  });
});

describe("parseReport fixtures de trafego", () => {
  describe("08/03 a 22/03/2026", () => {
    const parsed = parseReport(loadFixture("traffic-2026-03-08-2026-03-22.txt"));

    it("extrai periodo, tipo e canais principais", () => {
      expect(parsed.periodStart?.toISOString()).toContain("2026-03-08");
      expect(parsed.periodEnd?.toISOString()).toContain("2026-03-22");
      expect(parsed.reportType).toBe("biweekly");
      expect(getChannel(parsed, "consolidated")?.investment).toBeCloseTo(1559.29);
      expect(getChannel(parsed, "meta_ads")?.investment).toBeCloseTo(1351.98);
      expect(getChannel(parsed, "google_ads")?.investment).toBeCloseTo(207.31);
    });

    it("extrai metricas de topo, Meta Ads e Google Ads", () => {
      expect(getChannel(parsed, "consolidated")?.reach).toBe(154382);
      expect(getChannel(parsed, "consolidated")?.impressions).toBe(820856);
      expect(getChannel(parsed, "consolidated")?.newFollowers).toBe(341);
      expect(getChannel(parsed, "meta_ads")?.conversations).toBe(85);
      expect(getChannel(parsed, "meta_ads")?.cpl).toBeCloseTo(15.91);
      expect(getChannel(parsed, "google_ads")?.conversions).toBe(14);
      expect(getChannel(parsed, "google_ads")?.cpa).toBeCloseTo(14.81);
    });

    it("extrai criativos e keywords vencedoras", () => {
      expect(getCreative(parsed, "Resultado 3 meses pos")?.conversations).toBe(33);
      expect(getCreative(parsed, "Resultado 3 meses pos")?.cpl).toBeCloseTo(3.52);
      expect(getCreative(parsed, "Maternidade")?.conversations).toBe(24);
      expect(getKeyword(parsed, "lipoaspiracao")?.cpa).toBeCloseTo(4.93);
      expect(getKeyword(parsed, "cirurgia plastica nos seios")?.cpa).toBeCloseTo(7.34);
    });
  });

  describe("20/04 a 26/04/2026", () => {
    const parsed = parseReport(loadFixture("traffic-2026-04-20-2026-04-26.txt"));

    it("extrai periodo, tipo e investimentos", () => {
      expect(parsed.periodStart?.toISOString()).toContain("2026-04-20");
      expect(parsed.periodEnd?.toISOString()).toContain("2026-04-26");
      expect(parsed.reportType).toBe("weekly");
      expect(getChannel(parsed, "consolidated")?.investment).toBeCloseTo(750.71);
      expect(getChannel(parsed, "meta_ads")?.investment).toBeCloseTo(622.87);
      expect(getChannel(parsed, "google_ads")?.investment).toBeCloseTo(127.84);
    });

    it("extrai metricas de Meta Ads e Google Ads", () => {
      expect(getChannel(parsed, "consolidated")?.reach).toBe(87698);
      expect(getChannel(parsed, "consolidated")?.impressions).toBe(155322);
      expect(getChannel(parsed, "consolidated")?.newFollowers).toBe(436);
      expect(getChannel(parsed, "meta_ads")?.conversations).toBe(27);
      expect(getChannel(parsed, "meta_ads")?.cpl).toBeCloseTo(23.07);
      expect(getChannel(parsed, "google_ads")?.clicks).toBe(49);
      expect(getChannel(parsed, "google_ads")?.conversions).toBe(4);
      expect(getChannel(parsed, "google_ads")?.cpa).toBeCloseTo(31.96);
    });

    it("extrai criativos vencedores e criativo problematico", () => {
      expect(getCreative(parsed, "Resultado 3 meses pos")?.conversations).toBe(9);
      expect(getCreative(parsed, "Resultado 3 meses pos")?.cpl).toBeCloseTo(5.89);
      expect(getCreative(parsed, "Nem toda mulher")?.conversations).toBe(8);
      expect(getCreative(parsed, "Nem toda mulher")?.cpl).toBeCloseTo(4.89);
      expect(getCreative(parsed, "Voce pesquisou")?.conversations).toBe(8);
      expect(getCreative(parsed, "Voce pesquisou")?.cpl).toBeCloseTo(4.03);
      expect(getCreative(parsed, "G1_IMG")?.investment).toBeCloseTo(215);
      expect(getCreative(parsed, "G1_IMG")?.profileVisits).toBe(899);
      expect(getCreative(parsed, "G1_IMG")?.conversations).toBe(1);
    });

    it("extrai keyword com cliques e conversao fracionada", () => {
      expect(getKeyword(parsed, "cirurgia plastica nos seios")?.clicks).toBe(10);
      expect(getKeyword(parsed, "cirurgia plastica nos seios")?.conversions).toBeCloseTo(1.33);
    });
  });
});
