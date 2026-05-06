import { execFileSync } from "node:child_process";
import { closeSync, existsSync, openSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const TEST_DATABASE_URL = "file:./test.db";
const TEST_DB_PATH = resolve(process.cwd(), "prisma", "test.db");
const TEST_DB_JOURNAL_PATH = resolve(process.cwd(), "prisma", "test.db-journal");

let prisma: typeof import("@/lib/db").prisma;
let saveAnalyzedReport: typeof import("@/lib/reports").saveAnalyzedReport;
let getReport: typeof import("@/lib/reports").getReport;

function removeTestDatabase() {
  for (const path of [TEST_DB_PATH, TEST_DB_JOURNAL_PATH]) {
    if (existsSync(path)) rmSync(path, { force: true });
  }
}

function prismaCommand() {
  if (process.platform === "win32") {
    return { command: "cmd.exe", args: ["/c", "node_modules\\.bin\\prisma.cmd", "db", "push", "--skip-generate"] };
  }
  return { command: "node_modules/.bin/prisma", args: ["db", "push", "--skip-generate"] };
}

function rawReport(period: string): string {
  return rawReportWithMetrics(period, {});
}

function rawReportWithMetrics(
  period: string,
  overrides: {
    reach?: string;
    impressions?: string;
    googleConversions?: number;
    googleCpa?: string;
  }
): string {
  return `Relatório Semanal — ${period}
Investimento total: R$ 300,00
Meta Ads: R$ 200,00
Google Ads: R$ 100,00
Alcance: ${overrides.reach ?? "50.000"}
Impressões: ${overrides.impressions ?? "80.000"}
Conversas Meta: 20
CPL Meta: R$ 10,00
Google conversões: ${overrides.googleConversions ?? 10}
Google CPA: ${overrides.googleCpa ?? "R$ 10,00"}`;
}

beforeAll(async () => {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  removeTestDatabase();
  closeSync(openSync(TEST_DB_PATH, "a"));
  const command = prismaCommand();
  execFileSync(command.command, command.args, {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "pipe"
  });

  const dbModule = await import("@/lib/db");
  const reportsModule = await import("@/lib/reports");
  prisma = dbModule.prisma;
  saveAnalyzedReport = reportsModule.saveAnalyzedReport;
  getReport = reportsModule.getReport;
});

beforeEach(async () => {
  await prisma.dataIssue.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.keywordPerformance.deleteMany();
  await prisma.creativePerformance.deleteMany();
  await prisma.channelSummary.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.report.deleteMany();
  await prisma.benchmarkSetting.deleteMany();
});

afterAll(async () => {
  await prisma?.$disconnect();
  removeTestDatabase();
});

describe("saveAnalyzedReport persistence", () => {
  it("persiste duplicated_period no segundo relatório salvo com mesmo período", async () => {
    await saveAnalyzedReport(rawReport("13/04/2026 a 19/04/2026"));
    const second = await saveAnalyzedReport(rawReport("13/04/2026 a 19/04/2026"));
    const loaded = await getReport(second.id);

    expect(loaded?.dataIssues).toContainEqual(expect.objectContaining({ issueType: "duplicated_period", severity: "high" }));
  });

  it("persiste period_conflict no segundo relatório salvo com período sobreposto", async () => {
    await saveAnalyzedReport(rawReport("13/04/2026 a 19/04/2026"));
    const second = await saveAnalyzedReport(rawReport("15/04/2026 a 21/04/2026"));
    const loaded = await getReport(second.id);

    expect(loaded?.dataIssues).toContainEqual(expect.objectContaining({ issueType: "period_conflict", severity: "medium" }));
  });

  it("não gera period_conflict quando o histórico sobreposto é anômalo", async () => {
    await saveAnalyzedReport(rawReport("01/12/2025 a 07/12/2025"));
    const second = await saveAnalyzedReport(rawReport("05/12/2025 a 12/12/2025"));
    const loaded = await getReport(second.id);

    expect(loaded?.dataIssues).toContainEqual(expect.objectContaining({ issueType: "operational_anomaly" }));
    expect(loaded?.dataIssues.some((issue) => issue.issueType === "period_conflict")).toBe(false);
  });

  it("não gera period_conflict quando o histórico anômalo fora de dezembro foi criado direto no banco", async () => {
    await prisma.report.create({
      data: {
        title: "Histórico anômalo sintético",
        rawText: rawReport("01/02/2026 a 07/02/2026"),
        reportType: "weekly",
        periodStart: new Date("2026-02-01T12:00:00.000Z"),
        periodEnd: new Date("2026-02-07T12:00:00.000Z"),
        isOperationalAnomaly: true,
        anomalyReason: "Teste de anomalia operacional",
        confidenceScore: 1
      }
    });

    const second = await saveAnalyzedReport(rawReport("03/02/2026 a 09/02/2026"));
    const loaded = await getReport(second.id);

    expect(loaded?.dataIssues.some((issue) => issue.issueType === "period_conflict")).toBe(false);
  });

  it("carrega DataIssues históricos pelo mesmo método usado no detalhe do relatório", async () => {
    await saveAnalyzedReport(rawReport("13/04/2026 a 19/04/2026"));
    const second = await saveAnalyzedReport(rawReport("15/04/2026 a 21/04/2026"));
    const loaded = await getReport(second.id);

    expect(loaded?.id).toBe(second.id);
    expect(loaded?.dataIssues.map((issue) => issue.issueType)).toContain("period_conflict");
  });

  it("persiste recomendação histórica de ToFu", async () => {
    await saveAnalyzedReport(rawReportWithMetrics("13/04/2026 a 19/04/2026", { reach: "120.000", impressions: "100.000" }));
    const second = await saveAnalyzedReport(rawReportWithMetrics("20/04/2026 a 26/04/2026", { reach: "90.000", impressions: "100.000" }));
    const loaded = await getReport(second.id);

    expect(loaded?.recommendations).toContainEqual(expect.objectContaining({ category: "tofu", title: "Queda real de ToFu" }));
  });

  it("persiste recomendação histórica de saturação", async () => {
    await saveAnalyzedReport(rawReportWithMetrics("13/04/2026 a 19/04/2026", { reach: "120.000", impressions: "100.000" }));
    const second = await saveAnalyzedReport(rawReportWithMetrics("20/04/2026 a 26/04/2026", { reach: "90.000", impressions: "167.000" }));
    const loaded = await getReport(second.id);

    expect(loaded?.recommendations).toContainEqual(expect.objectContaining({ category: "tofu", title: "Saturação de audiência" }));
  });

  it("persiste recomendação consolidada de Google Ads crítico sem duplicação excessiva", async () => {
    await saveAnalyzedReport(rawReportWithMetrics("13/04/2026 a 19/04/2026", { googleConversions: 6, googleCpa: "R$ 20,00" }));
    const second = await saveAnalyzedReport(rawReportWithMetrics("20/04/2026 a 26/04/2026", { googleConversions: 4, googleCpa: "R$ 31,96" }));
    const loaded = await getReport(second.id);
    const criticalGoogle = loaded?.recommendations.filter((item) => item.category === "google_ads" && item.priority === "critical") ?? [];

    expect(criticalGoogle).toHaveLength(1);
    expect(criticalGoogle[0].title).toBe("Google Ads em estado crítico");
  });

  it("não persiste recomendação histórica indevida quando o histórico é anômalo", async () => {
    await prisma.report.create({
      data: {
        title: "Histórico anômalo sintético",
        rawText: rawReportWithMetrics("01/02/2026 a 07/02/2026", { reach: "200.000", impressions: "100.000" }),
        reportType: "weekly",
        periodStart: new Date("2026-02-01T12:00:00.000Z"),
        periodEnd: new Date("2026-02-07T12:00:00.000Z"),
        isOperationalAnomaly: true,
        anomalyReason: "Teste de anomalia operacional",
        confidenceScore: 1,
        channelSummaries: {
          create: [{ channel: "consolidated", reach: 200000, impressions: 100000, newFollowers: 800 }]
        }
      }
    });

    const second = await saveAnalyzedReport(rawReportWithMetrics("08/02/2026 a 14/02/2026", { reach: "90.000", impressions: "100.000" }));
    const loaded = await getReport(second.id);

    expect(loaded?.recommendations.some((item) => item.title === "Queda real de ToFu")).toBe(false);
  });

  it("usa BenchmarkSetting real para suprimir ToFu quando queda fica abaixo do limite configurado", async () => {
    await prisma.benchmarkSetting.create({
      data: {
        key: "reach_drop_attention",
        label: "Queda importante de alcance",
        value: 50,
        unit: "%",
        description: "Teste sintético"
      }
    });

    await saveAnalyzedReport(rawReportWithMetrics("13/04/2026 a 19/04/2026", { reach: "120.000", impressions: "100.000" }));
    const second = await saveAnalyzedReport(rawReportWithMetrics("20/04/2026 a 26/04/2026", { reach: "90.000", impressions: "100.000" }));
    const loaded = await getReport(second.id);

    expect(loaded?.recommendations.some((item) => item.title === "Queda real de ToFu")).toBe(false);
  });

  it("usa default quando BenchmarkSetting é inválido", async () => {
    await prisma.benchmarkSetting.create({
      data: {
        key: "reach_drop_attention",
        label: "Queda importante de alcance",
        value: 50,
        unit: "BRL",
        description: "Unidade inválida para teste sintético"
      }
    });

    await saveAnalyzedReport(rawReportWithMetrics("13/04/2026 a 19/04/2026", { reach: "120.000", impressions: "100.000" }));
    const second = await saveAnalyzedReport(rawReportWithMetrics("20/04/2026 a 26/04/2026", { reach: "90.000", impressions: "100.000" }));
    const loaded = await getReport(second.id);

    expect(loaded?.recommendations).toContainEqual(expect.objectContaining({ category: "tofu", title: "Queda real de ToFu" }));
  });
});
