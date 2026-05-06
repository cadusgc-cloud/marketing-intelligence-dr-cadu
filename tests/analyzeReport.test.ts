import { describe, expect, it } from "vitest";
import { analyzeParsedReportWithHistory, analyzeReport } from "@/lib/engine/analyzeReport";
import { parseReport } from "@/lib/parser/reportParser";

function rawReport(period: string): string {
  return `Relatório Semanal — ${period}
Investimento total: R$ 300,00
Meta Ads: R$ 200,00
Google Ads: R$ 100,00
Conversas Meta: 20
CPL Meta: R$ 10,00
Google conversões: 10
Google CPA: R$ 10,00`;
}

describe("analyzeParsedReportWithHistory", () => {
  it("gera duplicated_period quando o período já existe no histórico", () => {
    const current = parseReport(rawReport("01/04/2026 a 07/04/2026"));
    const existing = analyzeReport(rawReport("01/04/2026 a 07/04/2026"));
    const analyzed = analyzeParsedReportWithHistory(current, [existing]);

    expect(analyzed.dataIssues).toContainEqual(expect.objectContaining({ issueType: "duplicated_period", severity: "high" }));
  });

  it("gera period_conflict quando o período cruza parcialmente outro relatório", () => {
    const current = parseReport(rawReport("05/04/2026 a 12/04/2026"));
    const existing = analyzeReport(rawReport("01/04/2026 a 07/04/2026"));
    const analyzed = analyzeParsedReportWithHistory(current, [existing]);

    expect(analyzed.dataIssues).toContainEqual(expect.objectContaining({ issueType: "period_conflict", severity: "medium" }));
  });

  it("não acusa conflito quando só sobrepõe relatório anômalo", () => {
    const current = parseReport(rawReport("05/04/2026 a 12/04/2026"));
    const existing = {
      ...analyzeReport(rawReport("01/04/2026 a 07/04/2026")),
      isOperationalAnomaly: true
    };
    const analyzed = analyzeParsedReportWithHistory(current, [existing]);

    expect(analyzed.dataIssues.some((issue) => issue.issueType === "period_conflict" || issue.issueType === "duplicated_period")).toBe(false);
  });

  it("mantém o comportamento atual quando não há histórico", () => {
    const current = parseReport(rawReport("01/04/2026 a 07/04/2026"));
    const withoutHistory = analyzeParsedReportWithHistory(current, []);
    const baseline = analyzeReport(rawReport("01/04/2026 a 07/04/2026"));

    expect(withoutHistory.dataIssues).toEqual(baseline.dataIssues);
  });

  it("não gera period_conflict adicional quando o período é duplicado", () => {
    const current = parseReport(rawReport("01/04/2026 a 07/04/2026"));
    const existing = analyzeReport(rawReport("01/04/2026 a 07/04/2026"));
    const analyzed = analyzeParsedReportWithHistory(current, [existing]);

    expect(analyzed.dataIssues.filter((issue) => issue.issueType === "duplicated_period")).toHaveLength(1);
    expect(analyzed.dataIssues.some((issue) => issue.issueType === "period_conflict")).toBe(false);
  });

  it("ignora histórico de dezembro de 2025 mesmo quando não está marcado como anômalo", () => {
    const current = parseReport(rawReport("05/12/2025 a 12/12/2025").replace("2025", "2026").replace("12/12/2025", "12/12/2026"));
    const existing = {
      ...analyzeReport(rawReport("01/12/2025 a 07/12/2025")),
      isOperationalAnomaly: false
    };
    const analyzed = analyzeParsedReportWithHistory(current, [existing]);

    expect(analyzed.dataIssues.some((issue) => issue.issueType === "period_conflict" || issue.issueType === "duplicated_period")).toBe(false);
  });

  it("mantém analyzeReport sem histórico funcionando", () => {
    const analyzed = analyzeReport(rawReport("01/04/2026 a 07/04/2026"));

    expect(analyzed.recommendations.length).toBeGreaterThan(0);
    expect(analyzed.dataIssues).toEqual([]);
  });

  it("gera recomendação histórica de ToFu quando alcance cai vs histórico", () => {
    const current = {
      ...parseReport(rawReport("08/04/2026 a 14/04/2026")),
      channels: [{ channel: "consolidated" as const, reach: 90000, impressions: 100000, newFollowers: 400 }]
    };
    const existing = {
      ...parseReport(rawReport("01/04/2026 a 07/04/2026")),
      channels: [{ channel: "consolidated" as const, reach: 120000, impressions: 100000, newFollowers: 600 }]
    };

    const analyzed = analyzeParsedReportWithHistory(current, [existing]);

    expect(analyzed.recommendations).toContainEqual(expect.objectContaining({ category: "tofu", title: "Queda real de ToFu" }));
  });

  it("gera recomendação consolidada quando CPA crítico e conversões Google caem", () => {
    const current = {
      ...parseReport(rawReport("08/04/2026 a 14/04/2026")),
      channels: [{ channel: "google_ads" as const, conversions: 4, cpa: 31.96 }]
    };
    const existing = {
      ...parseReport(rawReport("01/04/2026 a 07/04/2026")),
      channels: [{ channel: "google_ads" as const, conversions: 6, cpa: 20 }]
    };

    const analyzed = analyzeParsedReportWithHistory(current, [existing]);
    const criticalGoogle = analyzed.recommendations.filter((item) => item.category === "google_ads" && item.priority === "critical");

    expect(criticalGoogle).toHaveLength(1);
    expect(criticalGoogle[0].title).toBe("Google Ads em estado crítico");
  });
});
