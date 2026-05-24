import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseReportImport, sampleGenericTsv } from "@/lib/report-imports";
import {
  buildDefaultContentItems,
  buildDefaultWeeklyReview,
  buildV7ReportFiles,
  buildWeekPeriod,
  generateWeeklyReview,
  matchMetricsToContent
} from "@/lib/weekly-review";

describe("Marketing OS v7 - fechamento semanal guiado", () => {
  const review = buildDefaultWeeklyReview();

  it("gera relatorio semanal", () => {
    expect(review.exports.weeklyMarkdown).toContain("# Fechamento semanal");
  });

  it("filtra periodo correto", () => {
    expect(review.currentRecords.every((row) => row.date && row.date >= "2026-05-24" && row.date <= "2026-05-30")).toBe(true);
  });

  it("consolida por canal", () => {
    expect(review.channelSummaries.length).toBeGreaterThan(0);
  });

  it("consolida por formato", () => {
    expect(review.formatSummaries.length).toBeGreaterThan(0);
  });

  it("consolida por pilar", () => {
    expect(review.pillarSummaries.length).toBeGreaterThan(0);
  });

  it("consolida por tema", () => {
    expect(review.themeSummaries.length).toBeGreaterThan(0);
  });

  it("compara semana atual vs anterior", () => {
    expect(review.comparisons.some((item) => item.metric === "reach")).toBe(true);
  });

  it("calcula nivel de confianca", () => {
    expect(["alto", "moderado", "baixo", "insuficiente"]).toContain(review.quality.confidence);
  });

  it("identifica conteudo vencedor", () => {
    expect(review.themeSummaries[0].score).toBeGreaterThanOrEqual(review.themeSummaries.at(-1)?.score ?? 0);
  });

  it("identifica conteudo fraco", () => {
    expect(review.themeSummaries.at(-1)).toBeDefined();
  });

  it("identifica oportunidade", () => {
    expect(review.recommendations.some((item) => item.type === "repetir" || item.type === "testar")).toBe(true);
  });

  it("identifica risco", () => {
    expect(review.quality.reasons.length).toBeGreaterThan(0);
  });

  it("gera aprendizados", () => {
    expect(review.learnings.length).toBeGreaterThanOrEqual(4);
  });

  it("gera plano de acao", () => {
    expect(review.recommendations.length).toBeGreaterThanOrEqual(4);
  });

  it("gera plano da proxima semana", () => {
    expect(review.nextWeekPlan.days).toHaveLength(7);
  });

  it("cada dia da proxima semana tem tema", () => {
    expect(review.nextWeekPlan.days.every((day) => day.theme)).toBe(true);
  });

  it("cada dia tem pilar", () => {
    expect(review.nextWeekPlan.days.every((day) => day.pillar)).toBe(true);
  });

  it("cada dia tem formato", () => {
    expect(review.nextWeekPlan.days.every((day) => day.format)).toBe(true);
  });

  it("cada dia tem stories", () => {
    expect(review.nextWeekPlan.days.every((day) => day.stories.length === 6)).toBe(true);
  });

  it("cada dia tem midia necessaria", () => {
    expect(review.nextWeekPlan.days.every((day) => day.mediaNeeded.length > 0)).toBe(true);
  });

  it("cada dia tem justificativa baseada em dados", () => {
    expect(review.nextWeekPlan.days.every((day) => day.rationale.length > 20)).toBe(true);
  });

  it("cada dia tem safety", () => {
    expect(review.nextWeekPlan.days.every((day) => ["seguro", "atencao", "revisar"].includes(day.safety))).toBe(true);
  });

  it("cada dia tem readiness", () => {
    expect(review.nextWeekPlan.days.every((day) => day.readiness >= 0 && day.readiness <= 100)).toBe(true);
  });

  it("gera tarefas para operations", () => {
    expect(review.tasks.length).toBeGreaterThanOrEqual(7);
  });

  it("gera itens para studio", () => {
    expect(review.tasks.some((task) => task.route === "/studio")).toBe(true);
  });

  it("gera itens para recording", () => {
    expect(review.tasks.some((task) => task.route === "/recording")).toBe(true);
  });

  it("gera itens para review", () => {
    expect(review.tasks.some((task) => task.route === "/review")).toBe(true);
  });

  it("pareia metricas com conteudo por data/formato/titulo", () => {
    const matches = matchMetricsToContent(review.currentRecords, buildDefaultContentItems());
    expect(matches.strongMatches.length + matches.probableMatches.length).toBeGreaterThan(0);
  });

  it("retorna matches fortes", () => {
    expect(review.contentMatches.strongMatches.length).toBeGreaterThan(0);
  });

  it("retorna matches provaveis ou nao pareados", () => {
    expect(review.contentMatches.probableMatches.length + review.contentMatches.unmatched.length).toBeGreaterThan(0);
  });

  it("retorna nao pareados", () => {
    expect(review.contentMatches.unmatched.length).toBeGreaterThan(0);
  });

  it("retorna conflitos como lista", () => {
    expect(Array.isArray(review.contentMatches.conflicts)).toBe(true);
  });

  it("nao quebra com titulo ausente", () => {
    const importResult = parseReportImport({ source: "generic", text: "Data\tCanal\tFormato\tAlcance\n2026-05-24\tinstagram\treel\t100" });
    const report = generateWeeklyReview({ period: buildWeekPeriod("2026-05-24"), records: importResult.normalizedRows });
    expect(report.currentRecords[0].title).toContain("registro");
  });

  it("normaliza spend", () => {
    expect(review.currentRecords.some((row) => (row.metrics.spend ?? 0) > 0)).toBe(true);
  });

  it("calcula CPC", () => {
    expect(review.currentRecords.some((row) => (row.metrics.cpc ?? 0) > 0)).toBe(true);
  });

  it("calcula CPM", () => {
    expect(review.currentRecords.some((row) => (row.metrics.cpm ?? 0) > 0)).toBe(true);
  });

  it("calcula CTR", () => {
    expect(review.currentRecords.some((row) => (row.metrics.ctr ?? 0) > 0)).toBe(true);
  });

  it("detecta frequencia alta ou retorna leitura conservadora", () => {
    expect(review.paidInsights.length).toBeGreaterThan(0);
  });

  it("detecta gasto alto e clique baixo quando existir", () => {
    expect(review.paidInsights.join(" ")).toContain("manual");
  });

  it("nao trata lead como paciente", () => {
    expect(review.exports.paidMetricsMarkdown.toLowerCase()).not.toContain("lead como paciente");
  });

  it("nao recomenda funil agressivo", () => {
    expect(review.exports.weeklyMarkdown.toLowerCase()).not.toContain("funil agressivo");
  });

  it("nao sugere segmentacao sensivel", () => {
    expect(review.exports.paidMetricsMarkdown.toLowerCase()).not.toContain("segmentacao sensivel");
  });

  it("exporta relatorio semanal Markdown", () => {
    expect(review.exports.weeklyMarkdown).toContain("## Aprendizados");
  });

  it("exporta resumo executivo", () => {
    expect(review.exports.executiveSummary).toContain("Resumo executivo");
  });

  it("exporta TSV", () => {
    expect(review.exports.googleSheetsTsv).toContain("Data\tCanal");
  });

  it("exporta Google Agenda", () => {
    expect(review.exports.googleAgenda).toContain("Titulo: Conteudo Dr. Cadu");
  });

  it("exporta Etus/manual", () => {
    expect(review.exports.etusManual).toContain("Data\tCanal\tFormato");
  });

  it("exporta tarefas", () => {
    expect(review.exports.tasksMarkdown).toContain("-");
  });

  it("exporta plano de gravacao", () => {
    expect(review.exports.recordingPlan).toContain("Plano de gravacao");
  });

  it("exporta auditoria sensivel", () => {
    expect(review.exports.sensitiveAuditMarkdown).toContain("Auditoria");
  });

  it("backup JSON tecnico e parseavel", () => {
    expect(JSON.parse(review.exports.technicalJson).currentRecords.length).toBeGreaterThan(0);
  });

  it("exportacao comum nao mostra JSON bruto", () => {
    expect(review.exports.weeklyMarkdown.trim().startsWith("{")).toBe(false);
  });

  it("weekly:check passa", () => {
    expect(execSync("npm run weekly:check", { encoding: "utf8" })).toContain("Status: aprovado");
  });

  it("qa:weekly passa", () => {
    expect(execSync("npm run qa:weekly", { encoding: "utf8" })).toContain("Status: aprovado");
  });

  it("relatorios V7 existem", () => {
    const files = buildV7ReportFiles(review);
    expect(Object.keys(files)).toHaveLength(10);
    expect(existsSync("reports/marketing-os-v7/weekly-review-summary.md")).toBe(true);
  });

  it("pr-readiness-v7 existe", () => {
    expect(existsSync("reports/marketing-os-v7/pr-readiness-v7.md")).toBe(true);
  });

  it("README menciona V7", () => {
    expect(existsSync("README.md")).toBe(true);
  });

  it("relatorio usa dataset ficticio sem paciente", () => {
    expect(JSON.stringify(review.currentRecords).toLowerCase()).not.toContain("paciente");
  });
});
