import { describe, expect, it } from "vitest";
import { analyzeReport } from "@/lib/engine/analyzeReport";

describe("recommendationEngine", () => {
  it("classifica criativo vencedor e keyword vencedora para escala", () => {
    const report = analyzeReport(`Relatório Semanal — 13/04/2026 a 19/04/2026
Meta Ads: R$ 625,18
Conversas Meta: 27
CPL Meta: R$ 23,15
Google Ads: R$ 14,00
Google conversões: 2
Google CPA: R$ 7,00
Criativos: Resultado 3 meses pós — 12 conversas — CPL R$ 3,35
Keywords: lipoaspiração — 2 conversões — CPA R$ 4,93`);

    expect(report.creatives[0].diagnosis).toBe("scale");
    expect(report.keywords[0].diagnosis).toBe("scale");
    expect(report.recommendations.some((item) => item.title.includes("Escalar criativo"))).toBe(true);
    expect(report.recommendations.some((item) => item.title.includes("Keyword vencedora"))).toBe(true);
  });

  it("gera recomendação crítica quando CPA Google passa de 30", () => {
    const report = analyzeReport(`Relatório Semanal — 20/04/2026 a 26/04/2026
Google Ads: R$ 127,84
Google conversões: 4
Google CPA: R$ 31,96`);

    expect(report.recommendations.some((item) => item.priority === "critical" && item.category === "google_ads")).toBe(true);
  });
});
