import { describe, expect, it } from "vitest";
import { generateRecommendations, generateRecommendationsWithHistory } from "@/lib/engine/recommendationEngine";
import type { ParsedReport } from "@/lib/types";

function date(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

function report(overrides: Partial<ParsedReport> = {}): ParsedReport {
  return {
    title: "Relatório sintético",
    rawText: "Relatório sintético com métricas agregadas de marketing",
    reportType: "weekly",
    periodStart: date("2026-04-20"),
    periodEnd: date("2026-04-26"),
    receivedAt: date("2026-04-27"),
    sourceLabel: null,
    isOperationalAnomaly: false,
    anomalyReason: null,
    confidenceScore: 1,
    channels: [
      {
        channel: "consolidated",
        investment: 750,
        reach: 90000,
        impressions: 150000,
        newFollowers: 400,
        opportunities: 30
      },
      {
        channel: "meta_ads",
        investment: 620,
        conversations: 27,
        cpl: 23,
        reach: 90000,
        impressions: 150000
      },
      {
        channel: "google_ads",
        investment: 130,
        conversions: 4,
        cpa: 31.96
      },
      {
        channel: "instagram_organic",
        reach: 90000,
        impressions: 150000,
        newFollowers: 400
      }
    ],
    creatives: [],
    keywords: [],
    recommendations: [],
    dataIssues: [],
    ...overrides
  };
}

function previous(overrides: Partial<ParsedReport> = {}) {
  return report({
    title: "Histórico sintético",
    periodStart: date("2026-04-13"),
    periodEnd: date("2026-04-19"),
    channels: [
      {
        channel: "consolidated",
        reach: 120000,
        impressions: 100000,
        newFollowers: 600
      },
      {
        channel: "google_ads",
        conversions: 6,
        cpa: 24
      },
      {
        channel: "instagram_organic",
        storyCount: 20,
        storyRetention: 0.76
      }
    ],
    ...overrides
  });
}

function titles(analysis: ReturnType<typeof generateRecommendationsWithHistory>) {
  return analysis.recommendations.map((item) => item.title);
}

describe("recommendationEngine", () => {
  it("mantém generateRecommendations funcionando sem histórico", () => {
    const analysis = generateRecommendations(
      report({
        creatives: [{ platform: "meta_ads", name: "Resultado 3 meses pós", cpl: 3.35, conversations: 12, leads: 12 }],
        keywords: [{ keyword: "lipoaspiração", cpa: 4.93, conversions: 2 }]
      })
    );

    expect(analysis.creatives[0].diagnosis).toBe("scale");
    expect(analysis.keywords[0].diagnosis).toBe("scale");
    expect(titles(analysis)).toContain("Keyword vencedora: lipoaspiração");
  });

  it("gera recomendação de queda real de ToFu quando alcance cai acima do benchmark", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "consolidated", reach: 90000, impressions: 100000, newFollowers: 400 }] }),
      [previous({ channels: [{ channel: "consolidated", reach: 120000, impressions: 100000, newFollowers: 600 }] })]
    );

    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ category: "tofu", title: "Queda real de ToFu" }));
    expect(analysis.recommendations.find((item) => item.title === "Queda real de ToFu")?.evidence).toContain("Seguidores caíram");
  });

  it("detecta saturação quando impressões sobem e alcance cai", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "consolidated", reach: 90000, impressions: 167000, newFollowers: 500 }] }),
      [previous({ channels: [{ channel: "consolidated", reach: 120000, impressions: 100000, newFollowers: 500 }] })]
    );

    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ title: "Saturação de audiência" }));
    expect(analysis.recommendations.find((item) => item.title === "Saturação de audiência")?.evidence).toContain("Impressões subiram");
  });

  it("detecta queda de cadência em stories com retenção boa", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "instagram_organic", storyCount: 8, storyRetention: 0.8 }] }),
      [previous({ channels: [{ channel: "instagram_organic", storyCount: 20, storyRetention: 0.78 }] })]
    );

    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ title: "Queda de cadência em stories" }));
    expect(analysis.recommendations.find((item) => item.title === "Queda de cadência em stories")?.recommendation).toContain("não queda de qualidade");
  });

  it("gera recomendação crítica quando CPA Google passa de 30", () => {
    const analysis = generateRecommendationsWithHistory(report({ channels: [{ channel: "google_ads", conversions: 4, cpa: 31.96 }] }), []);

    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ priority: "critical", category: "google_ads", title: "Google Ads em CPA crítico" }));
  });

  it("gera recomendação quando conversões Google caem mais de 30%", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "google_ads", conversions: 4, cpa: 20 }] }),
      [previous({ channels: [{ channel: "google_ads", conversions: 6, cpa: 24 }] })]
    );

    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ title: "Queda crítica de conversões Google" }));
  });

  it("consolida CPA crítico e queda de conversões em uma recomendação", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "google_ads", conversions: 4, cpa: 31.96 }] }),
      [previous({ channels: [{ channel: "google_ads", conversions: 6, cpa: 24 }] })]
    );
    const googleCritical = analysis.recommendations.filter((item) => item.category === "google_ads" && item.priority === "critical");

    expect(googleCritical).toHaveLength(1);
    expect(googleCritical[0].title).toBe("Google Ads em estado crítico");
  });

  it("classifica criativo BoFu vencedor como scale", () => {
    const analysis = generateRecommendationsWithHistory(
      report({
        creatives: [{ platform: "meta_ads", name: "Resultado 3 meses pós", funnelStage: "bofu", cpl: 5.89, conversations: 9, leads: 9 }]
      }),
      []
    );

    expect(analysis.creatives[0].diagnosis).toBe("scale");
    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ category: "bofu", title: "Escalar criativo: Resultado 3 meses pós" }));
  });

  it("classifica G1_IMG como criativo problemático", () => {
    const analysis = generateRecommendationsWithHistory(
      report({
        creatives: [{ platform: "meta_ads", name: "G1_IMG", investment: 215, profileVisits: 899, conversations: 1 }]
      }),
      []
    );

    expect(["investigate", "pause"]).toContain(analysis.creatives[0].diagnosis);
    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ priority: "high", title: "Criativo problemático: G1_IMG" }));
  });

  it("classifica criativo problemático usando leads quando conversas não existem", () => {
    const analysis = generateRecommendationsWithHistory(
      report({
        creatives: [{ platform: "meta_ads", name: "G1_IMG", investment: 215, profileVisits: 899, leads: 1 }]
      }),
      []
    );

    expect(["investigate", "pause"]).toContain(analysis.creatives[0].diagnosis);
    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ priority: "high", title: "Criativo problemático: G1_IMG" }));
  });

  it("gera recomendação quando top 2 criativos concentram 74% das conversas", () => {
    const analysis = generateRecommendationsWithHistory(
      report({
        creatives: [
          { platform: "meta_ads", name: "Resultado 3 meses pós", conversations: 12, cpl: 3.35 },
          { platform: "meta_ads", name: "Nem toda mulher", conversations: 8, cpl: 5.03 },
          { platform: "meta_ads", name: "Outro criativo", conversations: 7, cpl: 12 }
        ]
      }),
      []
    );

    expect(analysis.recommendations).toContainEqual(expect.objectContaining({ title: "Concentração perigosa em poucos criativos" }));
  });

  it("ignora histórico de dezembro de 2025 ao escolher relatório anterior", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "consolidated", reach: 90000, impressions: 90000, newFollowers: 400 }] }),
      [
        previous({
          periodStart: date("2025-12-01"),
          periodEnd: date("2025-12-07"),
          channels: [{ channel: "consolidated", reach: 200000, impressions: 90000, newFollowers: 800 }]
        })
      ]
    );

    expect(titles(analysis)).not.toContain("Queda real de ToFu");
  });

  it("ignora histórico com anomalia operacional", () => {
    const analysis = generateRecommendationsWithHistory(
      report({ channels: [{ channel: "consolidated", reach: 90000, impressions: 90000, newFollowers: 400 }] }),
      [
        previous({
          isOperationalAnomaly: true,
          channels: [{ channel: "consolidated", reach: 200000, impressions: 90000, newFollowers: 800 }]
        })
      ]
    );

    expect(titles(analysis)).not.toContain("Queda real de ToFu");
  });
});
