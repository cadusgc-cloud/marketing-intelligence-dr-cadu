import { describe, expect, it } from "vitest";
import { ANOMALY_EXECUTIVE_DIAGNOSIS_MESSAGE, generateExecutiveDiagnosis } from "@/lib/engine/executiveDiagnosis";
import type { ParsedDataIssue, ParsedRecommendation } from "@/lib/types";

function recommendation(overrides: Partial<ParsedRecommendation>): ParsedRecommendation {
  return {
    category: "creative",
    priority: "medium",
    title: "Recomendação sintética",
    evidence: "Evidência agregada de marketing",
    recommendation: "Executar ajuste operacional",
    confidence: 0.8,
    ...overrides
  };
}

function dataIssue(overrides: Partial<ParsedDataIssue>): ParsedDataIssue {
  return {
    severity: "medium",
    issueType: "metric_mismatch",
    description: "Divergência sintética de métrica",
    ...overrides
  };
}

describe("generateExecutiveDiagnosis", () => {
  it("sintetiza Google crítico, G1_IMG problemático e criativos vencedores", () => {
    const diagnosis = generateExecutiveDiagnosis({
      creatives: [
        { name: "Resultado 3 meses pós", diagnosis: "scale", cpl: 5.89, leads: 9 },
        { name: "Nem toda mulher", diagnosis: "scale", cpl: 4.89, leads: 8 },
        { name: "Você pesquisou", diagnosis: "scale", cpl: 4.03, leads: 8 },
        { name: "G1_IMG", diagnosis: "investigate", investment: 215, profileVisits: 899, leads: 1 }
      ],
      recommendations: [
        recommendation({
          category: "google_ads",
          priority: "critical",
          title: "Google Ads crítico",
          recommendation: "Revisar keywords, termos de pesquisa, landing page e tracking."
        }),
        recommendation({
          category: "tofu",
          priority: "high",
          title: "Queda real de ToFu",
          recommendation: "Renovar criativos de topo de funil."
        }),
        recommendation({
          category: "creative",
          priority: "high",
          title: "Criativo problemático: G1_IMG",
          recommendation: "Pausar ou investigar o criativo G1_IMG antes de ampliar verba."
        })
      ]
    });

    expect(diagnosis.summary).toContain("Google Ads crítico");
    expect(diagnosis.summary).toContain("criativos");
    expect(diagnosis.wastePoints.join(" ")).toContain("G1_IMG");
    expect(diagnosis.investigateOrPause.join(" ")).toContain("G1_IMG");
    expect(diagnosis.topWins.join(" ")).toContain("Resultado 3 meses pós");
    expect(diagnosis.scalePoints.join(" ")).toContain("Você pesquisou");
    expect(diagnosis.healthScore).toBeGreaterThan(0);
    expect(diagnosis.healthScore).toBeLessThan(75);
  });

  it("inclui DataIssue high em alertas críticos e reduz o health score", () => {
    const clean = generateExecutiveDiagnosis({});
    const withIssue = generateExecutiveDiagnosis({
      dataIssues: [
        dataIssue({
          severity: "high",
          description: "CPL informado diverge do investimento dividido por conversas"
        })
      ]
    });

    expect(withIssue.criticalAlerts).toContain("Validação de dados: CPL informado diverge do investimento dividido por conversas");
    expect(withIssue.healthScore).toBeLessThan(clean.healthScore);
  });

  it("agrupa problema de ToFu e leva a ação para o plano da próxima semana", () => {
    const diagnosis = generateExecutiveDiagnosis({
      recommendations: [
        recommendation({
          category: "tofu",
          priority: "high",
          title: "Queda real de ToFu",
          recommendation: "Renovar criativos de topo de funil e revisar públicos."
        })
      ]
    });

    expect(diagnosis.mainProblemAreas).toContain("Topo de funil");
    expect(diagnosis.nextWeekActionPlan.join(" ")).toMatch(/topo de funil/i);
    expect(diagnosis.creativeSuggestions.join(" ")).toMatch(/topo de funil/i);
  });

  it("prioriza recomendações críticas antes das altas e limita o plano a 5 itens", () => {
    const diagnosis = generateExecutiveDiagnosis({
      recommendations: [
        recommendation({
          category: "google_ads",
          priority: "critical",
          title: "Google Ads crítico",
          recommendation: "Revisar Google Ads antes de qualquer aumento de orçamento."
        }),
        ...Array.from({ length: 6 }, (_, index) =>
          recommendation({
            priority: "high",
            title: `Ação alta ${index + 1}`,
            recommendation: `Executar ação de alta prioridade ${index + 1}.`
          })
        )
      ]
    });

    expect(diagnosis.nextWeekActionPlan.length).toBeLessThanOrEqual(5);
    expect(diagnosis.nextWeekActionPlan[0]).toContain("Google Ads");
  });

  it("retorna diagnóstico estável quando não há problemas ou alertas", () => {
    const diagnosis = generateExecutiveDiagnosis({});

    expect(diagnosis.status).toBe("stable");
    expect(diagnosis.healthScore).toBe(75);
    expect(diagnosis.summary).toContain("sem alertas críticos");
    expect(diagnosis.criticalAlerts).toEqual([]);
    expect(diagnosis.wastePoints).toEqual([]);
  });

  it("não quebra com input incompleto", () => {
    const diagnosis = generateExecutiveDiagnosis({
      report: { title: "Relatório sintético" }
    });

    expect(diagnosis.summary).toBeTruthy();
    expect(diagnosis.healthScore).toBeTypeOf("number");
    expect(diagnosis.topWins).toEqual([]);
    expect(diagnosis.nextWeekActionPlan).toEqual([]);
  });

  it("desativa score e recomendações executivas para relatório anômalo", () => {
    const diagnosis = generateExecutiveDiagnosis({
      report: {
        title: "Dezembro 2025",
        periodStart: new Date("2025-12-01T00:00:00.000Z"),
        periodEnd: new Date("2025-12-31T00:00:00.000Z"),
        isOperationalAnomaly: true,
        anomalyReason: "Teste de anomalia operacional"
      },
      creatives: [
        { name: "Criativo vencedor sintético", diagnosis: "scale", cpl: 4.5, leads: 12 },
        { name: "Criativo problemático sintético", diagnosis: "pause", investment: 250, leads: 1 }
      ],
      recommendations: [
        recommendation({
          category: "google_ads",
          priority: "critical",
          title: "Google Ads crítico",
          recommendation: "Revisar Google Ads."
        }),
        recommendation({
          category: "creative",
          priority: "high",
          title: "Escalar criativo vencedor",
          recommendation: "Escalar criativo vencedor."
        })
      ],
      dataIssues: [
        dataIssue({
          severity: "critical",
          issueType: "operational_anomaly",
          description: "Período mantido como contexto histórico"
        })
      ]
    });

    expect(diagnosis.summary).toBe(ANOMALY_EXECUTIVE_DIAGNOSIS_MESSAGE);
    expect(diagnosis.healthScore).toBe(0);
    expect(diagnosis.criticalAlerts).toEqual([]);
    expect(diagnosis.topWins).toEqual([]);
    expect(diagnosis.nextWeekActionPlan).toEqual([]);
    expect(diagnosis.budgetSuggestions).toEqual([]);
    expect(diagnosis.creativeSuggestions).toEqual([]);
  });

  it("mantém o health score entre 0 e 100", () => {
    const manyProblems = generateExecutiveDiagnosis({
      recommendations: Array.from({ length: 10 }, (_, index) =>
        recommendation({
          priority: "critical",
          title: `Crítico ${index + 1}`,
          recommendation: `Resolver crítico ${index + 1}.`
        })
      ),
      dataIssues: Array.from({ length: 10 }, (_, index) =>
        dataIssue({
          severity: "critical",
          description: `Issue crítica ${index + 1}`
        })
      ),
      creatives: Array.from({ length: 10 }, (_, index) => ({
        name: `Criativo problemático ${index + 1}`,
        diagnosis: "pause" as const,
        investment: 250,
        leads: 1
      }))
    });

    const manyWins = generateExecutiveDiagnosis({
      creatives: Array.from({ length: 20 }, (_, index) => ({
        name: `Criativo vencedor ${index + 1}`,
        diagnosis: "scale" as const,
        cpl: 4,
        leads: 8
      })),
      keywords: Array.from({ length: 20 }, (_, index) => ({
        keyword: `keyword vencedora ${index + 1}`,
        diagnosis: "scale" as const,
        cpa: 5,
        conversions: 3
      }))
    });

    expect(manyProblems.healthScore).toBeGreaterThanOrEqual(0);
    expect(manyProblems.healthScore).toBeLessThanOrEqual(100);
    expect(manyWins.healthScore).toBeLessThanOrEqual(100);
    expect(manyWins.status).toBe("good");
  });

  it("mantém topWins limpo, sem investimento ausente e sem duplicar recomendação de escala", () => {
    const diagnosis = generateExecutiveDiagnosis({
      creatives: [
        { name: "Resultado 3 meses pós", diagnosis: "scale", cpl: 5.89, leads: 9 }
      ],
      recommendations: [
        recommendation({
          category: "creative",
          priority: "high",
          title: "Escalar criativo: Resultado 3 meses pós",
          recommendation: "Escalar Resultado 3 meses pós e criar variações."
        })
      ]
    });

    expect(diagnosis.topWins).toEqual(["Resultado 3 meses pós: 9 leads, CPL R$ 5,89"]);
    expect(diagnosis.topWins.join(" ")).not.toContain("investidos");
  });

  it("penaliza período duplicado menos que Google Ads crítico", () => {
    const duplicatedPeriod = generateExecutiveDiagnosis({
      dataIssues: [
        dataIssue({
          severity: "high",
          issueType: "duplicated_period",
          description: "Relatório com período duplicado"
        })
      ]
    });
    const googleCritical = generateExecutiveDiagnosis({
      recommendations: [
        recommendation({
          category: "google_ads",
          priority: "critical",
          title: "Google Ads crítico",
          recommendation: "Revisar Google Ads antes de ampliar orçamento."
        })
      ]
    });

    expect(duplicatedPeriod.criticalAlerts).toContain("Validação de dados: Relatório com período duplicado");
    expect(duplicatedPeriod.healthScore).toBeGreaterThan(googleCritical.healthScore);
  });

  it("não trata período duplicado isolado como piora de marketing", () => {
    const diagnosis = generateExecutiveDiagnosis({
      dataIssues: [
        dataIssue({
          severity: "high",
          issueType: "duplicated_period",
          description: "Relatório com período duplicado"
        })
      ]
    });

    expect(diagnosis.summary).toContain("desempenho estável");
    expect(diagnosis.wastePoints).toEqual([]);
  });

  it("deduplica ações quase iguais no plano da próxima semana", () => {
    const diagnosis = generateExecutiveDiagnosis({
      recommendations: [
        recommendation({
          category: "google_ads",
          priority: "critical",
          title: "Google Ads crítico",
          recommendation: "Revisar Google Ads antes de ampliar orçamento."
        }),
        recommendation({
          category: "google_ads",
          priority: "high",
          title: "Google Ads com queda de conversões",
          recommendation: "Revisar Google Ads e tracking antes de aumentar verba."
        }),
        recommendation({
          category: "creative",
          priority: "high",
          title: "Criativo problemático",
          recommendation: "Pausar criativo problemático."
        })
      ]
    });

    expect(diagnosis.nextWeekActionPlan.filter((action) => /Google Ads/i.test(action))).toHaveLength(1);
    expect(diagnosis.nextWeekActionPlan).toContain("Pausar criativo problemático.");
  });
});
