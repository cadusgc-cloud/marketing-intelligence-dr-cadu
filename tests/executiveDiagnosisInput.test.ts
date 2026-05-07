import { describe, expect, it } from "vitest";
import { generateExecutiveDiagnosis } from "@/lib/engine/executiveDiagnosis";
import { buildExecutiveDiagnosisInput } from "@/lib/engine/executiveDiagnosisInput";

function makeReport() {
  return {
    title: "Relatório sintético de marketing",
    periodStart: new Date("2026-04-20T00:00:00.000Z"),
    periodEnd: new Date("2026-04-26T00:00:00.000Z"),
    channelSummaries: [
      {
        channel: "meta_ads",
        investment: 622.87,
        reach: 87698,
        conversations: 27
      }
    ],
    creatives: [
      {
        name: "Resultado 3 meses pós",
        diagnosis: "scale",
        cpl: 5.89,
        investment: null,
        profileVisits: null,
        conversations: 9,
        leads: 9
      }
    ],
    keywords: [
      {
        keyword: "cirurgia plástica nos seios",
        diagnosis: "scale",
        cpa: 6.5,
        conversions: 3
      }
    ],
    recommendations: [
      {
        category: "google_ads",
        priority: "critical",
        title: "Google Ads crítico",
        evidence: "CPA acima do limite",
        recommendation: "Revisar termos de pesquisa e tracking.",
        confidence: 0.9
      }
    ],
    dataIssues: [
      {
        severity: "high",
        issueType: "duplicated_period",
        description: "Relatório com período duplicado",
        fieldName: "periodStart",
        expectedValue: "período único",
        foundValue: "período repetido"
      }
    ]
  };
}

describe("buildExecutiveDiagnosisInput", () => {
  it("mapeia channels sem depender da referência original", () => {
    const report = makeReport();
    const input = buildExecutiveDiagnosisInput(report);

    expect(input.channels).toEqual(report.channelSummaries);
    expect(input.channels?.[0]).not.toBe(report.channelSummaries[0]);
  });

  it("mapeia creatives com diagnosis persistido como string", () => {
    const input = buildExecutiveDiagnosisInput(makeReport());

    expect(input.creatives).toEqual([
      {
        name: "Resultado 3 meses pós",
        diagnosis: "scale",
        cpl: 5.89,
        investment: null,
        profileVisits: null,
        conversations: 9,
        leads: 9
      }
    ]);
  });

  it("mapeia recommendations com category e priority persistidos", () => {
    const input = buildExecutiveDiagnosisInput(makeReport());

    expect(input.recommendations?.[0]).toMatchObject({
      category: "google_ads",
      priority: "critical",
      title: "Google Ads crítico"
    });
  });

  it("mapeia dataIssues com severity e issueType persistidos", () => {
    const input = buildExecutiveDiagnosisInput(makeReport());

    expect(input.dataIssues?.[0]).toMatchObject({
      severity: "high",
      issueType: "duplicated_period",
      description: "Relatório com período duplicado"
    });
  });

  it("usa fallback seguro para valores desconhecidos", () => {
    const report = makeReport();
    report.creatives[0].diagnosis = "surprising";
    report.keywords[0].diagnosis = "surprising";
    report.recommendations[0].category = "unknown_category";
    report.recommendations[0].priority = "urgent";
    report.dataIssues[0].severity = "urgent";
    report.dataIssues[0].issueType = "unknown_issue";
    const input = buildExecutiveDiagnosisInput(report);

    expect(input.creatives?.[0].diagnosis).toBe("unknown");
    expect(input.keywords?.[0].diagnosis).toBe("unknown");
    expect(input.recommendations?.[0].category).toBe("validation");
    expect(input.recommendations?.[0].priority).toBe("medium");
    expect(input.dataIssues?.[0].severity).toBe("medium");
    expect(input.dataIssues?.[0].issueType).toBe("template_error");
  });

  it("gera input consumível por generateExecutiveDiagnosis", () => {
    const diagnosis = generateExecutiveDiagnosis(buildExecutiveDiagnosisInput(makeReport()));

    expect(diagnosis.summary).toContain("Google Ads crítico");
    expect(diagnosis.topWins.join(" ")).toContain("Resultado 3 meses pós");
  });

  it("não modifica o objeto original", () => {
    const report = makeReport();
    const before = JSON.stringify(report);
    const input = buildExecutiveDiagnosisInput(report);

    input.channels?.push({ channel: "google_ads", investment: 100 });
    input.creatives?.push({ name: "Novo criativo", diagnosis: "scale" });

    expect(JSON.stringify(report)).toBe(before);
  });
});
