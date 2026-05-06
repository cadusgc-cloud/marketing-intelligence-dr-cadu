import { describe, expect, it } from "vitest";
import { parseReport } from "@/lib/parser/reportParser";

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
