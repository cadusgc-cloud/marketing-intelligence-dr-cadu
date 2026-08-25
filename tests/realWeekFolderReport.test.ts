import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildRealWeekFolderReport } from "@/lib/real-week";

function readFixture(name: string): string {
  return readFileSync(fileURLToPath(new URL(`./fixtures/meta/${name}`, import.meta.url)), "utf8");
}

const generatedAt = "2026-08-25T09:00:00.000Z";

describe("Semana Real 002 - relatorio a partir de uma pasta de CSVs", () => {
  it("classifica cada arquivo sozinho e monta o painel completo", () => {
    const report = buildRealWeekFolderReport(
      [
        { name: "export-conteudo.csv", text: readFixture("conteudo-pt.csv") },
        { name: "export-alcance.csv", text: readFixture("resultados-alcance-pt.csv") },
        { name: "export-seguidores.csv", text: readFixture("resultados-seguidores-pt.csv") }
      ],
      generatedAt
    );

    expect(report.ok).toBe(true);
    expect(report.files.map((file) => file.kind)).toEqual(["conteudo", "conta", "conta"]);
    expect(report.posts).toHaveLength(6);
    expect(report.panel?.weeks).toHaveLength(2);
    expect(report.baseline?.reachAvgPerPost).toBe(960);
    expect(report.baseline?.followerGrowth).toBe(150);
  });

  it("arquivo estranho nao derruba o resto e aparece explicado", () => {
    const report = buildRealWeekFolderReport(
      [
        { name: "export-conteudo.csv", text: readFixture("conteudo-pt.csv") },
        { name: "planilha-de-estoque.csv", text: readFixture("arquivo-errado.csv") }
      ],
      generatedAt
    );

    expect(report.ok).toBe(true);
    expect(report.posts).toHaveLength(6);
    const strange = report.files.find((file) => file.name === "planilha-de-estoque.csv");
    expect(strange?.kind).toBe("nao-reconhecido");
    expect(strange?.errors.join(" ")).toContain("Meta Business Suite");
  });

  it("mesmo export solto duas vezes nao duplica os numeros", () => {
    const report = buildRealWeekFolderReport(
      [
        { name: "export-1.csv", text: readFixture("conteudo-pt.csv") },
        { name: "export-2.csv", text: readFixture("conteudo-pt.csv") }
      ],
      generatedAt
    );

    expect(report.posts).toHaveLength(6);
    expect(report.baseline?.postsTotal).toBe(6);
    expect(report.warnings.some((warning) => warning.includes("duplicad"))).toBe(true);
  });

  it("sem nenhum arquivo valido o relatorio explica o que fazer", () => {
    const report = buildRealWeekFolderReport(
      [{ name: "planilha-de-estoque.csv", text: readFixture("arquivo-errado.csv") }],
      generatedAt
    );

    expect(report.ok).toBe(false);
    expect(report.panel).toBeNull();
    expect(report.reportMarkdown).toContain("Nenhum CSV valido");
    expect(report.reportMarkdown).toContain("Insights");
  });

  it("pasta vazia gera orientacao completa de exportacao", () => {
    const report = buildRealWeekFolderReport([], generatedAt);

    expect(report.ok).toBe(false);
    expect(report.reportMarkdown).toContain("business.facebook.com");
  });

  it("o relatorio markdown traz painel semanal, baseline e arquivos lidos", () => {
    const report = buildRealWeekFolderReport(
      [
        { name: "export-conteudo.csv", text: readFixture("conteudo-pt.csv") },
        { name: "export-seguidores.csv", text: readFixture("resultados-seguidores-pt.csv") }
      ],
      generatedAt
    );

    expect(report.reportMarkdown).toContain("# Semana real");
    expect(report.reportMarkdown).toContain("25/08/2026");
    expect(report.reportMarkdown).toContain("export-conteudo.csv");
    expect(report.reportMarkdown).toContain("| 03/08/2026 a 09/08/2026 |");
    expect(report.reportMarkdown).toContain("Baseline da equipe atual");
    expect(report.reportMarkdown).toContain("960");
  });
});
