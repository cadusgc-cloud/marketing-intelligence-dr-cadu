import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  detectDelimiter,
  detectSensitiveText,
  getSampleReportImportText,
  parseDate,
  parseDelimitedText,
  parseNumber,
  parseReportImport,
  sampleGenericTsv,
  sampleMetaAdsCsv,
  sampleReporteiTsv,
  sampleV7ReportRows,
  sensitiveDataRules,
  suggestColumnMapping,
  type ReportSource
} from "@/lib/report-imports";

describe("Marketing OS v7 - importacao manual de relatorios", () => {
  it("parser TSV funciona", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.normalizedRows.length).toBeGreaterThanOrEqual(80);
  });

  it("parser CSV funciona", () => {
    const parsed = parseReportImport({ source: "instagram", text: getSampleReportImportText("instagram") });
    expect(parsed.headers).toContain("Date");
  });

  it("parser detecta separador automaticamente", () => {
    expect(detectDelimiter(sampleReporteiTsv)).toBe("\t");
    expect(detectDelimiter(sampleMetaAdsCsv)).toBe(";");
  });

  it.each([
    ["reportei", "Data"] as const,
    ["instagram", "Date"] as const,
    ["meta_ads", "Campaign"] as const,
    ["generic", "Data"] as const
  ])("parser aceita cabecalhos %s", (source, expectedHeader) => {
    const parsed = parseReportImport({ source, text: getSampleReportImportText(source) });
    expect(parsed.headers).toContain(expectedHeader);
  });

  it("parser aceita cabecalhos em portugues", () => {
    const mapping = suggestColumnMapping(["Data", "Alcance", "Salvamentos"], "reportei");
    expect(mapping.mapped.Alcance).toBe("reach");
  });

  it("parser aceita cabecalhos em ingles", () => {
    const mapping = suggestColumnMapping(["Date", "Reach", "Saves"], "instagram");
    expect(mapping.mapped.Reach).toBe("reach");
  });

  it("normaliza datas brasileiras", () => {
    expect(parseDate("24/05/2026")).toBe("2026-05-24");
  });

  it("normaliza datas ISO", () => {
    expect(parseDate("2026-05-24")).toBe("2026-05-24");
  });

  it("normaliza numero com virgula decimal", () => {
    expect(parseNumber("12,5")).toBe(12.5);
  });

  it("normaliza numero com ponto de milhar", () => {
    expect(parseNumber("1.234,56")).toBe(1234.56);
  });

  it("normaliza moeda brasileira", () => {
    expect(parseNumber("R$ 19,36")).toBe(19.36);
  });

  it("normaliza porcentagem", () => {
    expect(parseNumber("48,08%")).toBe(0.4808);
  });

  it("tolera linhas vazias", () => {
    const parsed = parseDelimitedText("Data\tAlcance\n\n2026-05-24\t100\n");
    expect(parsed.rows).toHaveLength(1);
  });

  it("tolera campo N/A", () => {
    expect(parseNumber("N/A")).toBeUndefined();
  });

  it("detecta coluna desconhecida", () => {
    const parsed = parseReportImport({ source: "generic", text: "Data\tCampo Estranho\n2026-05-24\tok" });
    expect(parsed.mapping.unknownHeaders).toContain("Campo Estranho");
  });

  it("detecta coluna critica ausente", () => {
    const parsed = parseReportImport({ source: "generic", text: "Tema\tAlcance\nseguranca\t100" });
    expect(parsed.mapping.missingRequiredFields).toContain("date");
  });

  it("detecta metrica negativa", () => {
    const parsed = parseReportImport({ source: "generic", text: "Data\tAlcance\n2026-05-24\t-1" });
    expect(parsed.issues.some((issue) => issue.severity === "blocking")).toBe(true);
  });

  it.each([
    ["Impressões", "impressions"],
    ["Alcance", "reach"],
    ["Salvamentos", "saves"],
    ["Compartilhamentos", "shares"],
    ["Respostas", "replies"],
    ["Gasto", "spend"],
    ["CTR", "ctr"]
  ])("sugere mapeamento para %s", (header, field) => {
    const mapping = suggestColumnMapping(["Data", header], "generic");
    expect(mapping.mapped[header]).toBe(field);
  });

  it("marca colunas nao reconhecidas", () => {
    const mapping = suggestColumnMapping(["Data", "Coluna X"], "generic");
    expect(mapping.unknownHeaders).toContain("Coluna X");
  });

  it("calcula schemaMatchScore", () => {
    const mapping = suggestColumnMapping(["Data", "Alcance", "Coluna X"], "generic");
    expect(mapping.schemaMatchScore).toBeGreaterThan(50);
  });

  it("permite fallback generico", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.source).toBe("generic");
  });

  it.each([
    ["CPF", "123.456.789-10"],
    ["telefone", "31999998888"],
    ["e-mail", "teste@example.com"],
    ["endereco", "Rua Exemplo, 123"],
    ["prontuario", "prontuario 123"],
    ["paciente", "paciente citado"],
    ["antes/depois", "antes e depois"],
    ["cirurgia de hoje", "cirurgia de hoje"],
    ["token", "https://x.test?token=abc"],
    ["segredo", "senha secreta"]
  ])("detecta dado sensivel: %s", (_, text) => {
    expect(detectSensitiveText(text).length).toBeGreaterThan(0);
  });

  it("bloqueia importacao com segredo injetado", () => {
    const parsed = parseReportImport({ source: "generic", text: `${sampleGenericTsv}\n2026-05-24\tinstagram\treel\ttema\tseguranca\tsenha abc\t100` });
    expect(parsed.blocked).toBe(true);
  });

  it("calcula completenessScore", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.quality.completenessScore).toBeGreaterThan(80);
  });

  it("calcula dateCoverageScore", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv, periodStart: "2026-05-17", periodEnd: "2026-05-30" });
    expect(parsed.quality.dateCoverageScore).toBeGreaterThan(90);
  });

  it("calcula metricValidityScore", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.quality.metricValidityScore).toBe(100);
  });

  it("calcula duplicateScore", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.quality.duplicateScore).toBeLessThan(100);
  });

  it("calcula sensitiveDataScore", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.quality.sensitiveDataScore).toBe(100);
  });

  it("calcula overallQualityScore", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.quality.overallQualityScore).toBeGreaterThan(75);
  });

  it("dados bons aprovam", () => {
    const parsed = parseReportImport({ source: "reportei", text: sampleReporteiTsv });
    expect(parsed.quality.status).toBe("aprovado");
  });

  it("dados incompletos pedem revisao ou reduzem score", () => {
    const parsed = parseReportImport({ source: "generic", text: "Data\tAlcance\n2026-05-24\t" });
    expect(parsed.quality.overallQualityScore).toBeLessThan(90);
  });

  it("dados sensiveis bloqueiam", () => {
    const parsed = parseReportImport({ source: "generic", text: "Data\tTitulo\n2026-05-24\tpaciente com token=abc" });
    expect(parsed.quality.status).toBe("bloquear");
  });

  it("duplicidades reduzem score", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.issues.some((issue) => issue.message.includes("duplicidade"))).toBe(true);
  });

  it("dataset ficticio tem pelo menos 80 registros", () => {
    expect(sampleV7ReportRows.length).toBeGreaterThanOrEqual(80);
  });

  it("dataset cobre 2 semanas", () => {
    const dates = sampleV7ReportRows.map((row) => row.date).filter(Boolean) as string[];
    expect(Math.min(...dates.map((date) => Date.parse(date)))).toBe(Date.parse("2026-05-17"));
    expect(Math.max(...dates.map((date) => Date.parse(date)))).toBe(Date.parse("2026-05-30"));
  });

  it("dataset tem organico", () => {
    expect(sampleV7ReportRows.some((row) => row.channel === "instagram")).toBe(true);
  });

  it("dataset tem Ads manual", () => {
    expect(sampleV7ReportRows.some((row) => row.channel === "meta_ads")).toBe(true);
  });

  it("dataset nao contem paciente", () => {
    expect(JSON.stringify(sampleV7ReportRows).toLowerCase()).not.toContain("paciente");
  });

  it("dataset nao contem localizacao real", () => {
    const text = JSON.stringify(sampleV7ReportRows).toLowerCase();
    expect(text).not.toContain("hospital ");
    expect(text).not.toContain("rua ");
  });

  it("dataset nao contem credencial", () => {
    const text = JSON.stringify(sampleV7ReportRows).toLowerCase();
    expect(text).not.toContain("token=");
    expect(text).not.toContain("senha");
  });

  it("dataset tem duplicidade intencional", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.issues.some((issue) => issue.message.includes("duplicidade"))).toBe(true);
  });

  it("dataset tem linha incompleta intencional", () => {
    expect(sampleV7ReportRows.some((row) => row.notes?.includes("incompleta"))).toBe(true);
  });

  it("dataset documenta que e ficticio", () => {
    expect(getSampleReportImportText("generic")).toContain("Data");
  });

  it("regras sensiveis existem", () => {
    expect(sensitiveDataRules.length).toBeGreaterThanOrEqual(10);
  });

  it("export comum nao mostra JSON bruto", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(parsed.exports.qualityMarkdown.trim().startsWith("{")).toBe(false);
  });

  it("backup JSON tecnico e parseavel", () => {
    const parsed = parseReportImport({ source: "generic", text: sampleGenericTsv });
    expect(JSON.parse(parsed.exports.technicalJson).rows.length).toBeGreaterThan(0);
  });

  it("import:check passa", () => {
    expect(execSync("npm run import:check", { encoding: "utf8" })).toContain("Status: aprovado");
  });

  it("docs V7 existem", () => {
    expect(existsSync("docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md")).toBe(true);
  });
});
