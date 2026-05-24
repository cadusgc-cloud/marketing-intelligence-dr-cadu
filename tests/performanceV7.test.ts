import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";

describe("Marketing OS v7 - performance, rotas e docs", () => {
  const review = buildDefaultWeeklyReview();

  it("performance tem ranking de formatos", () => {
    expect(review.formatSummaries.length).toBeGreaterThan(0);
  });

  it("performance tem ranking de pilares", () => {
    expect(review.pillarSummaries.length).toBeGreaterThan(0);
  });

  it("performance tem ranking de temas", () => {
    expect(review.themeSummaries.length).toBeGreaterThan(0);
  });

  it("performance tem ranking por dia da semana", () => {
    expect(review.weekdaySummaries.length).toBeGreaterThan(0);
  });

  it("comparacao de alcance existe", () => {
    expect(review.comparisons.find((item) => item.metric === "reach")).toBeDefined();
  });

  it("comparacao de impressoes existe", () => {
    expect(review.comparisons.find((item) => item.metric === "impressions")).toBeDefined();
  });

  it("comparacao de salvamentos existe", () => {
    expect(review.comparisons.find((item) => item.metric === "saves")).toBeDefined();
  });

  it("comparacao de compartilhamentos existe", () => {
    expect(review.comparisons.find((item) => item.metric === "shares")).toBeDefined();
  });

  it("comparacao de respostas existe", () => {
    expect(review.comparisons.find((item) => item.metric === "replies")).toBeDefined();
  });

  it("comparacao de cliques existe", () => {
    expect(review.comparisons.find((item) => item.metric === "clicks")).toBeDefined();
  });

  it("comparacao de gasto existe", () => {
    expect(review.comparisons.find((item) => item.metric === "spend")).toBeDefined();
  });

  it("mapa de esforco x resultado usa recomendacoes", () => {
    expect(review.recommendations.every((item) => item.priority)).toBe(true);
  });

  it("plano proxima semana exporta TSV", () => {
    expect(review.nextWeekPlan.tsv).toContain("Data\tDia\tTema");
  });

  it("plano proxima semana exporta agenda", () => {
    expect(review.nextWeekPlan.googleAgenda).toContain("Titulo: Conteudo Dr. Cadu");
  });

  it("relatorio de Ads manual existe", () => {
    expect(review.exports.paidMetricsMarkdown).toContain("# Ads manual");
  });

  it("checklist de coleta existe", () => {
    expect(review.exports.nextCollectionChecklist).toContain("Checklist");
  });

  it("docs V7 existem", () => {
    expect(existsSync("docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md")).toBe(true);
  });

  it("PR readiness V7 existe", () => {
    expect(existsSync("docs/PR_READINESS_MARKETING_OS_V7.md")).toBe(true);
  });

  it("relatorio weekly-review-summary existe", () => {
    expect(existsSync("reports/marketing-os-v7/weekly-review-summary.md")).toBe(true);
  });

  it("relatorio report-import-quality existe", () => {
    expect(existsSync("reports/marketing-os-v7/report-import-quality.md")).toBe(true);
  });

  it("relatorio source-mapping existe", () => {
    expect(existsSync("reports/marketing-os-v7/source-mapping-report.md")).toBe(true);
  });

  it("relatorio sensitive-data-audit existe", () => {
    expect(existsSync("reports/marketing-os-v7/sensitive-data-audit.md")).toBe(true);
  });

  it("relatorio performance existe", () => {
    expect(existsSync("reports/marketing-os-v7/performance-report.md")).toBe(true);
  });

  it("relatorio next-week-plan existe", () => {
    expect(existsSync("reports/marketing-os-v7/next-week-plan.md")).toBe(true);
  });

  it("relatorio paid-metrics existe", () => {
    expect(existsSync("reports/marketing-os-v7/paid-metrics-manual-report.md")).toBe(true);
  });

  it("relatorio export-samples existe", () => {
    expect(existsSync("reports/marketing-os-v7/export-samples.md")).toBe(true);
  });

  it("relatorio qa-report-v7 existe", () => {
    expect(existsSync("reports/marketing-os-v7/qa-report-v7.md")).toBe(true);
  });

  it("health:routes inclui weekly-review", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("/weekly-review");
  });

  it("health:routes inclui imports", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("/imports");
  });

  it("health:routes inclui performance", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("/performance");
  });

  it("health:routes inclui engine report-imports", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("engine:report-imports");
  });

  it("health:routes inclui engine weekly-review", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("engine:weekly-review");
  });
});
