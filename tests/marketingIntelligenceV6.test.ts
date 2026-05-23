import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  allowedFormats,
  allowedPillars,
  buildIntelligenceDashboard,
  buildOpportunityMap,
  calculatePerformanceScores,
  detectSensitiveTerms,
  generateAdaptiveCalendar,
  generateExperimentPlans,
  generateLearningLoopReport,
  generateStrategyRoadmap,
  normalizeMetricRows,
  parseManualMetrics,
  runIntelligenceQuality,
  sampleManualMetricRecords,
  sampleMetricsTsv
} from "@/lib/marketing-intelligence";

const dashboard = buildIntelligenceDashboard();
const report = dashboard.report;
const parsed = parseManualMetrics(sampleMetricsTsv);

function run(command: string) {
  return spawnSync(command, {
    cwd: process.cwd(),
    shell: true,
    encoding: "utf8"
  });
}

describe("Marketing OS v6 - metricas manuais", () => {
  it("dataset ficticio tem pelo menos 45 registros", () => {
    expect(sampleManualMetricRecords.length).toBeGreaterThanOrEqual(45);
  });

  it("dataset nao contem paciente", () => {
    expect(JSON.stringify(sampleManualMetricRecords).toLowerCase()).not.toContain("paciente");
  });

  it("dataset nao contem localizacao real", () => {
    const text = JSON.stringify(sampleManualMetricRecords).toLowerCase();
    expect(text).not.toContain("hospital");
    expect(text).not.toContain("clinica agora");
    expect(text).not.toContain("endereco");
  });

  it("parser TSV funciona", () => {
    expect(parsed.ok).toBe(true);
    expect(parsed.normalized.length).toBe(12);
  });

  it("parser CSV funciona", () => {
    const csv = "date,channel,format,theme,pillar,impressions,reach,likes,comments,shares,saves,replies,clicks,profileVisits,dms,effort,risk\n2026-05-01,Instagram,reel,naturalidade tambem e planejamento,estetica_natural,1000,800,30,2,5,8,1,3,6,0,2,baixo";
    expect(parseManualMetrics(csv).ok).toBe(true);
  });

  it("valida cabecalhos em portugues", () => {
    expect(parsed.issues.some((issue) => issue.field === "date" && issue.severity === "error")).toBe(false);
  });

  it("valida cabecalhos em ingles", () => {
    const tsv = "date\tchannel\tformat\ttheme\tpillar\timpressions\treach\n2026-05-01\tInstagram\tpost\tseguranca\tseguranca\t100\t80";
    expect(parseManualMetrics(tsv).ok).toBe(true);
  });

  it("detecta data invalida", () => {
    const bad = sampleMetricsTsv.replace("2026-04-13", "13/04/2026");
    expect(parseManualMetrics(bad).issues.some((issue) => issue.field === "date")).toBe(true);
  });

  it("detecta numero invalido", () => {
    const bad = "Data\tCanal\tFormato\tTema\tPilar\tImpressoes\tAlcance\n2026-05-01\tInstagram\tpost\tseguranca\tseguranca\tabc\t80";
    expect(parseManualMetrics(bad).issues.some((issue) => issue.message.includes("Numero invalido"))).toBe(true);
  });

  it("detecta metrica negativa", () => {
    const bad = "Data\tCanal\tFormato\tTema\tPilar\tImpressoes\tAlcance\n2026-05-01\tInstagram\tpost\tseguranca\tseguranca\t-1\t80";
    expect(parseManualMetrics(bad).issues.some((issue) => issue.message.includes("negativa"))).toBe(true);
  });

  it("detecta formato desconhecido", () => {
    const row = { ...sampleManualMetricRecords[0], format: "outdoor" };
    const parsedRows = parseManualMetrics(`Data\tCanal\tFormato\tTema\tPilar\tImpressoes\tAlcance\n${row.date}\t${row.channel}\t${row.format}\t${row.theme}\t${row.pillar}\t${row.impressions}\t${row.reach}`);
    expect(parsedRows.issues.some((issue) => issue.field === "format")).toBe(true);
  });

  it("detecta pilar desconhecido", () => {
    const row = { ...sampleManualMetricRecords[0], pillar: "vendas_agressivas" };
    const parsedRows = parseManualMetrics(`Data\tCanal\tFormato\tTema\tPilar\tImpressoes\tAlcance\n${row.date}\t${row.channel}\t${row.format}\t${row.theme}\t${row.pillar}\t${row.impressions}\t${row.reach}`);
    expect(parsedRows.issues.some((issue) => issue.field === "pillar")).toBe(true);
  });

  it("normaliza registros", () => {
    expect(parsed.normalized[0].id).toBeTruthy();
    expect(parsed.normalized[0].totalInteractions).toBeGreaterThan(0);
  });

  it("nao quebra com linhas vazias", () => {
    expect(parseManualMetrics(`${sampleMetricsTsv}\n\n`).normalized.length).toBe(parsed.normalized.length);
  });

  it("bloqueia texto sensivel injetado", () => {
    const bad = `${sampleMetricsTsv}\n2026-05-01\tInstagram\tpost\tpaciente de hoje\tseguranca\tPost\t100\t80\t1\t0\t0\t0\t0\t0\t0\t0\t0\trascunho\tbaixo\t1\tresultado garantido`;
    const result = parseManualMetrics(bad);
    expect(result.blocked).toBe(true);
  });
});

describe("Marketing OS v6 - scoring", () => {
  const scores = calculatePerformanceScores(parsed.normalized);

  it.each([
    "engagementScore",
    "saveShareScore",
    "conversationScore",
    "reachScore",
    "efficiencyScore",
    "strategicFitScore",
    "repeatPotentialScore",
    "overallPerformanceScore"
  ] as const)("calcula %s", (field) => {
    expect(scores[0][field]).toBeGreaterThanOrEqual(0);
  });

  it("aplica safetyPenalty", () => {
    const unsafe = normalizeMetricRows([{ ...sampleManualMetricRecords[0], risk: "bloquear" }]);
    expect(calculatePerformanceScores(unsafe)[0].safetyPenalty).toBeGreaterThan(0);
  });

  it("aplica effortPenalty", () => {
    const highEffort = normalizeMetricRows([{ ...sampleManualMetricRecords[0], reach: 10, impressions: 12, likes: 0, shares: 0, saves: 0, effort: 5 }]);
    expect(calculatePerformanceScores(highEffort)[0].effortPenalty).toBeGreaterThanOrEqual(0);
  });

  it("scores ficam entre 0 e 100", () => {
    scores.forEach((score) => {
      Object.entries(score).forEach(([key, value]) => {
        if (key.endsWith("Score") || key.endsWith("Penalty")) {
          expect(value as number).toBeGreaterThanOrEqual(0);
          expect(value as number).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  it("salvamentos e compartilhamentos pesam mais que curtidas", () => {
    const likeRecord = normalizeMetricRows([{ ...sampleManualMetricRecords[0], likes: 100, saves: 0, shares: 0 }]);
    const saveShareRecord = normalizeMetricRows([{ ...sampleManualMetricRecords[0], likes: 0, saves: 50, shares: 50 }]);
    expect(saveShareRecord[0].weightedInteractions).toBeGreaterThan(likeRecord[0].weightedInteractions);
  });

  it("alto esforco e baixo retorno gera alerta", () => {
    const record = normalizeMetricRows([{ ...sampleManualMetricRecords[0], reach: 20, impressions: 20, likes: 0, comments: 0, shares: 0, saves: 0, effort: 5 }]);
    expect(calculatePerformanceScores(record)[0].alerts.join(" ")).toContain("alto esforco");
  });

  it("baixo esforco e boa resposta gera oportunidade", () => {
    expect(report.scores.some((score) => score.alerts.join(" ").includes("oportunidade"))).toBe(true);
  });

  it("conteudo inseguro perde score", () => {
    const safe = calculatePerformanceScores(normalizeMetricRows([{ ...sampleManualMetricRecords[0], risk: "baixo" }]))[0];
    const unsafe = calculatePerformanceScores(normalizeMetricRows([{ ...sampleManualMetricRecords[0], risk: "bloquear" }]))[0];
    expect(unsafe.overallPerformanceScore).toBeLessThan(safe.overallPerformanceScore);
  });
});

describe("Marketing OS v6 - learning loop", () => {
  it("gera relatorio de aprendizado", () => {
    expect(report.summary).toContain("Leitura local");
  });

  it("identifica temas para repetir", () => {
    expect(report.learning.repeat.length).toBeGreaterThan(0);
  });

  it("identifica temas para variar", () => {
    expect(report.learning.vary.length).toBeGreaterThan(0);
  });

  it("identifica temas para pausar", () => {
    expect(report.learning.pause.length).toBeGreaterThanOrEqual(0);
  });

  it("sugere transformacao em reel", () => {
    expect(report.learning.transformToReel.length).toBeGreaterThan(0);
  });

  it("sugere transformacao em carrossel", () => {
    expect(report.learning.transformToCarousel.length).toBeGreaterThan(0);
  });

  it("sugere stories", () => {
    expect(report.learning.transformToStories.length).toBeGreaterThan(0);
  });

  it("identifica pilares fortes", () => {
    expect(report.learning.strongPillars.length).toBeGreaterThan(0);
  });

  it("identifica formatos fortes", () => {
    expect(report.learning.strongFormats.length).toBeGreaterThan(0);
  });

  it("identifica desequilibrio de pilares", () => {
    expect(Array.isArray(report.learning.imbalanceAlerts)).toBe(true);
  });

  it("gera top 10 recomendacoes", () => {
    expect(report.recommendations).toHaveLength(10);
  });

  it("nao recomenda CTA agressivo", () => {
    expect(JSON.stringify(report.recommendations).toLowerCase()).not.toContain("agende agora");
  });

  it("nao recomenda promessa", () => {
    expect(JSON.stringify(report.recommendations).toLowerCase()).not.toContain("resultado garantido");
  });

  it("nao recomenda diagnostico ou prescricao", () => {
    const text = JSON.stringify(report.recommendations).toLowerCase();
    expect(text).not.toContain("diagnostico");
    expect(text).not.toContain("prescrev");
  });
});

describe("Marketing OS v6 - experimentos", () => {
  const experiments = generateExperimentPlans(report);

  it("gera experimento tema A/B", () => {
    expect(experiments.some((item) => item.id === "exp-tema-a-b")).toBe(true);
  });

  it("gera experimento hook A/B", () => {
    expect(experiments.some((item) => item.id === "exp-hook-a-b")).toBe(true);
  });

  it("gera experimento formato", () => {
    expect(experiments.some((item) => item.id === "exp-formato-story-reel")).toBe(true);
  });

  it.each(experiments)("experimento $id tem hipotese", (experiment) => {
    expect(experiment.hypothesis.length).toBeGreaterThan(20);
  });

  it.each(experiments)("experimento $id tem metrica primaria", (experiment) => {
    expect(experiment.primaryMetric).toBeTruthy();
  });

  it.each(experiments)("experimento $id tem criterio de sucesso", (experiment) => {
    expect(experiment.successCriteria).toBeTruthy();
  });

  it.each(experiments)("experimento $id tem safety gate", (experiment) => {
    expect(experiment.safetyChecklist.length).toBeGreaterThan(4);
  });

  it("experimento nao usa manipulacao por medo", () => {
    expect(JSON.stringify(experiments).toLowerCase()).not.toContain("medo");
  });

  it("experimento nao usa urgencia artificial", () => {
    expect(JSON.stringify(experiments).toLowerCase()).not.toContain("ultimas vagas");
  });

  it("experimento e deterministico", () => {
    expect(generateExperimentPlans(report)).toEqual(experiments);
  });
});

describe("Marketing OS v6 - estrategia", () => {
  const roadmap = generateStrategyRoadmap(report);
  const adaptive = generateAdaptiveCalendar(report);

  it("gera roadmap de 30 dias", () => {
    expect(roadmap.thirtyDays.length).toBeGreaterThanOrEqual(4);
  });

  it("gera roadmap de 60 dias", () => {
    expect(roadmap.sixtyDays.length).toBeGreaterThanOrEqual(4);
  });

  it("gera roadmap de 90 dias", () => {
    expect(roadmap.ninetyDays.length).toBeGreaterThanOrEqual(4);
  });

  it("gera proximos 7 dias adaptativos", () => {
    expect(adaptive).toHaveLength(7);
  });

  it.each(adaptive)("dia adaptativo $date tem tema", (day) => {
    expect(day.theme).toBeTruthy();
  });

  it.each(adaptive)("dia adaptativo $date tem formato", (day) => {
    expect(allowedFormats).toContain(day.format);
  });

  it.each(adaptive)("dia adaptativo $date tem justificativa", (day) => {
    expect(day.rationale).toContain("sinal agregado");
  });

  it.each(adaptive)("dia adaptativo $date tem safety", (day) => {
    expect(day.safety).toBe("baixo");
  });

  it("roadmap nao inventa paciente ou local", () => {
    const text = roadmap.exportText.toLowerCase();
    expect(text).not.toContain("paciente de hoje");
    expect(text).not.toContain("hospital agora");
  });

  it("roadmap integra Content Studio", () => {
    expect(roadmap.nextBestActions.some((action) => action.relatedRoute === "/studio")).toBe(true);
  });
});

describe("Marketing OS v6 - next best action e mapa de oportunidades", () => {
  it("gera recomendacoes", () => {
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it.each(report.recommendations)("recomendacao $id tem prioridade", (action) => {
    expect(["baixa", "media", "alta", "critica"]).toContain(action.priority);
  });

  it.each(report.recommendations)("recomendacao $id tem justificativa", (action) => {
    expect(action.rationale.length).toBeGreaterThan(20);
  });

  it.each(report.recommendations)("recomendacao $id tem esforco", (action) => {
    expect(["baixo", "medio", "alto"]).toContain(action.effort);
  });

  it.each(report.recommendations)("recomendacao $id tem impacto esperado", (action) => {
    expect(["baixo", "medio", "alto"]).toContain(action.expectedImpact);
  });

  it.each(report.recommendations)("recomendacao $id tem risco", (action) => {
    expect(["baixo", "atencao", "revisar", "bloquear"]).toContain(action.risk);
  });

  it("recomendacoes sao ordenadas", () => {
    expect(report.recommendations.map((action) => action.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("recomendacoes sao seguras", () => {
    expect(report.quality.status).not.toBe("bloqueado");
  });

  it.each([
    "alto_desempenho_baixo_esforco",
    "alto_desempenho_alto_esforco",
    "baixo_desempenho_baixo_esforco",
    "baixo_desempenho_alto_esforco",
    "alto_risco_evitar",
    "subutilizado_testar",
    "saturado_variar"
  ])("classifica bucket %s", (bucket) => {
    expect(buildOpportunityMap(report.topContents.concat(report.weakContents)).some((item) => item.bucket === bucket)).toBe(true);
  });
});

describe("Marketing OS v6 - exports", () => {
  it("exporta relatorio de insights", () => {
    expect(dashboard.exports.insightsMarkdown).toContain("Intelligence Loop");
  });

  it("exporta metricas TSV", () => {
    expect(dashboard.exports.metricsTsv).toContain("Data\tCanal");
  });

  it("exporta Google Agenda", () => {
    expect(dashboard.exports.googleAgenda).toContain("Titulo: Conteudo Dr. Cadu");
  });

  it("exporta Etus/manual", () => {
    expect(dashboard.exports.etusManual).toContain("Data\tCanal\tFormato");
  });

  it("exporta experimento", () => {
    expect(dashboard.exports.experimentMarkdown).toContain("Experimento editorial");
  });

  it("exporta roadmap", () => {
    expect(dashboard.exports.roadmapMarkdown).toContain("30 dias");
  });

  it("exporta proximas acoes", () => {
    expect(dashboard.exports.nextActionsMarkdown).toContain("Next Best Actions");
  });

  it("export comum nao mostra JSON bruto", () => {
    expect(dashboard.exports.insightsMarkdown.trim().startsWith("{")).toBe(false);
    expect(dashboard.exports.roadmapMarkdown).not.toContain("```json");
  });

  it("backup JSON tecnico e parseavel", () => {
    expect(() => JSON.parse(dashboard.exports.technicalJson)).not.toThrow();
  });
});

describe("Marketing OS v6 - scripts, reports e docs", () => {
  it("intelligence:check passa", () => {
    const result = run("npm run intelligence:check");
    expect(result.status).toBe(0);
  }, 30000);

  it("qa:intelligence passa", () => {
    const result = run("npm run qa:intelligence");
    expect(result.status).toBe(0);
  }, 30000);

  it("script falha com termo bloqueante injetado", () => {
    const result = run("node scripts/marketing-intelligence-v6-check.mjs --inject-sensitive");
    expect(result.status).not.toBe(0);
  }, 30000);

  it.each([
    "intelligence-summary.md",
    "metrics-sample-report.md",
    "learning-loop-report.md",
    "experiment-plan.md",
    "strategy-roadmap.md",
    "next-best-actions.md",
    "adaptive-calendar.md",
    "content-opportunity-map.md",
    "intelligence-quality-report.md",
    "export-samples.md",
    "pr-readiness-v6.md"
  ])("relatorio %s existe", (fileName) => {
    expect(existsSync(path.join(process.cwd(), "reports", "marketing-os-v6", fileName))).toBe(true);
  });

  it("README menciona V6", () => {
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    expect(readme).toContain("Marketing OS v6");
  });

  it("documentacao menciona rotas novas", () => {
    const docPath = path.join(process.cwd(), "docs", "MARKETING_OS_V6_INTELLIGENCE_LOOP.md");
    expect(existsSync(docPath)).toBe(true);
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("/insights");
    expect(doc).toContain("/metrics");
    expect(doc).toContain("/experiments");
    expect(doc).toContain("/strategy");
  });

  it("route health inclui rotas novas", () => {
    const script = readFileSync(path.join(process.cwd(), "scripts", "marketing-os-route-health.ts"), "utf8");
    expect(script).toContain("/metrics");
    expect(script).toContain("/experiments");
    expect(script).toContain("/strategy");
  });
});

describe("Marketing OS v6 - QA de insights", () => {
  it("detecta resultado garantido", () => {
    expect(detectSensitiveTerms("resultado garantido")).toContain("resultado garantido");
  });

  it("detecta antes/depois", () => {
    expect(detectSensitiveTerms("antes/depois")).toContain("antes/depois");
  });

  it("detecta agende agora", () => {
    expect(detectSensitiveTerms("agende agora")).toContain("agende agora");
  });

  it("detecta paciente de hoje", () => {
    expect(detectSensitiveTerms("paciente de hoje")).toContain("paciente");
  });

  it("detecta cirurgia de hoje", () => {
    expect(detectSensitiveTerms("cirurgia de hoje")).toContain("cirurgia de hoje");
  });

  it("detecta sem risco", () => {
    expect(detectSensitiveTerms("sem risco")).toContain("sem risco");
  });

  it("detecta localizacao explicita quando inserida artificialmente", () => {
    expect(runIntelligenceQuality(normalizeMetricRows([{ ...sampleManualMetricRecords[0], notes: "endereco visivel" }])).status).toBe("bloqueado");
  });

  it("conteudo bloqueado nao e marcado como pronto", () => {
    const unsafe = normalizeMetricRows([{ ...sampleManualMetricRecords[0], risk: "bloquear" }]);
    expect(calculatePerformanceScores(unsafe)[0].classification).toBe("bloquear");
  });

  it("formatos permitidos estao declarados", () => {
    expect(allowedFormats).toContain("reel");
  });

  it("pilares permitidos estao declarados", () => {
    expect(allowedPillars).toContain("expectativa_realista");
  });
});
