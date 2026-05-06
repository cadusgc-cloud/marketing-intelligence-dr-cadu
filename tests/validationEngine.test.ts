import { describe, expect, it } from "vitest";
import { validateReport, validateReportWithHistory } from "@/lib/engine/validationEngine";
import type { ParsedReport } from "@/lib/types";

function date(value: string): Date {
  return new Date(`${value}T12:00:00.000Z`);
}

function report(overrides: Partial<ParsedReport> = {}): ParsedReport {
  return {
    title: "Relatório de teste",
    rawText: "Relatório de teste com métricas agregadas",
    reportType: "weekly",
    periodStart: date("2026-04-01"),
    periodEnd: date("2026-04-07"),
    receivedAt: date("2026-04-08"),
    sourceLabel: null,
    isOperationalAnomaly: false,
    anomalyReason: null,
    confidenceScore: 1,
    channels: [
      {
        channel: "consolidated",
        investment: 300,
        opportunities: 30
      },
      {
        channel: "meta_ads",
        investment: 200,
        conversations: 20,
        cpl: 10
      },
      {
        channel: "google_ads",
        investment: 100,
        conversions: 10,
        cpa: 10
      }
    ],
    creatives: [],
    keywords: [],
    recommendations: [],
    dataIssues: [],
    ...overrides
  };
}

describe("validationEngine", () => {
  it("detecta CPL divergente acima de 5%", () => {
    const issues = validateReport(
      report({
        channels: [
          { channel: "consolidated", investment: 300 },
          { channel: "meta_ads", investment: 200, conversations: 20, cpl: 20 },
          { channel: "google_ads", investment: 100, conversions: 10, cpa: 10 }
        ]
      })
    );

    expect(issues).toContainEqual(expect.objectContaining({ issueType: "metric_mismatch", fieldName: "cpl", severity: "high" }));
  });

  it("detecta CPA divergente acima de 5%", () => {
    const issues = validateReport(
      report({
        channels: [
          { channel: "consolidated", investment: 300 },
          { channel: "meta_ads", investment: 200, conversations: 20, cpl: 10 },
          { channel: "google_ads", investment: 100, conversions: 10, cpa: 20 }
        ]
      })
    );

    expect(issues).toContainEqual(expect.objectContaining({ issueType: "metric_mismatch", fieldName: "cpa", severity: "high" }));
  });

  it("detecta investimento total divergente acima de 5%", () => {
    const issues = validateReport(
      report({
        channels: [
          { channel: "consolidated", investment: 400 },
          { channel: "meta_ads", investment: 200 },
          { channel: "google_ads", investment: 100 }
        ]
      })
    );

    expect(issues).toContainEqual(expect.objectContaining({ issueType: "metric_mismatch", fieldName: "investment", severity: "medium" }));
  });

  it("não cria issue quando investimento total difere em até 5%", () => {
    const issues = validateReport(
      report({
        channels: [
          { channel: "consolidated", investment: 315 },
          { channel: "meta_ads", investment: 200 },
          { channel: "google_ads", investment: 100 }
        ]
      })
    );

    expect(issues.some((issue) => issue.fieldName === "investment")).toBe(false);
  });

  it("gera anomalia operacional para dezembro de 2025", () => {
    const issues = validateReport(
      report({
        periodStart: date("2025-12-08"),
        periodEnd: date("2025-12-14")
      })
    );

    expect(issues).toContainEqual(expect.objectContaining({ issueType: "operational_anomaly", severity: "critical" }));
  });

  it("detecta período duplicado no histórico", () => {
    const current = report();
    const issues = validateReportWithHistory(current, [report({ title: "Histórico duplicado" })]);

    expect(issues).toContainEqual(expect.objectContaining({ issueType: "duplicated_period", severity: "high" }));
  });

  it("detecta período parcialmente sobreposto no histórico", () => {
    const current = report({ periodStart: date("2026-04-05"), periodEnd: date("2026-04-12") });
    const issues = validateReportWithHistory(current, [report({ periodStart: date("2026-04-01"), periodEnd: date("2026-04-07") })]);

    expect(issues).toContainEqual(expect.objectContaining({ issueType: "period_conflict", severity: "medium" }));
  });

  it("ignora relatório anômalo do histórico na comparação de período", () => {
    const current = report({ periodStart: date("2026-04-05"), periodEnd: date("2026-04-12") });
    const anomalousHistory = report({
      periodStart: date("2026-04-01"),
      periodEnd: date("2026-04-07"),
      isOperationalAnomaly: true,
      anomalyReason: "Conta hackeada; desconsiderar de benchmarks e médias históricas"
    });

    const issues = validateReportWithHistory(current, [anomalousHistory]);

    expect(issues.some((issue) => issue.issueType === "period_conflict" || issue.issueType === "duplicated_period")).toBe(false);
  });
});
