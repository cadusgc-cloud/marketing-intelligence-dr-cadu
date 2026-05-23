import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildIntelligenceDashboard,
  buildV6ReportFiles,
  generateLearningLoopReport,
  parseManualMetrics,
  runIntelligenceQuality,
  sampleManualMetricRecords,
  sampleMetricsTsv
} from "../lib/marketing-intelligence";

function fail(message: string) {
  throw new Error(message);
}

export function runMarketingIntelligenceV6Check(args: string[] = []): number {
  const injectSensitive = args.includes("--inject-sensitive");
  const records = injectSensitive
    ? [{ ...sampleManualMetricRecords[0], notes: "paciente de hoje com resultado garantido" }, ...sampleManualMetricRecords.slice(1)]
    : sampleManualMetricRecords;

  const importResult = parseManualMetrics(sampleMetricsTsv);
  if (!importResult.ok) fail(`Importador manual falhou: ${importResult.issues.map((issue) => issue.message).join("; ")}`);
  if (sampleManualMetricRecords.length < 45) fail("Dataset ficticio deve ter pelo menos 45 registros.");

  const dashboard = buildIntelligenceDashboard(records);
  const report = dashboard.report;
  const quality = runIntelligenceQuality(report.records, report.recommendations.map((item) => item.exportText));

  if (report.records.length < 45) fail("Learning loop deve receber pelo menos 45 registros.");
  if (report.recommendations.length < 10) fail("Next best actions deve gerar 10 recomendacoes.");
  if (dashboard.experiments.length < 7) fail("Experiment engine deve gerar experimentos seguros.");
  if (dashboard.roadmap.adaptiveCalendar.length !== 7) fail("Calendario adaptativo deve ter 7 dias.");
  if (!dashboard.exports.metricsTsv.startsWith("Data\tCanal")) fail("Export TSV deve ter cabecalho.");
  if (!dashboard.exports.googleAgenda.includes("Titulo: Conteudo Dr. Cadu")) fail("Google Agenda deve ter titulo copiavel.");
  if (!dashboard.exports.etusManual.includes("Data\tCanal\tFormato")) fail("Etus/manual deve ser TSV copiavel.");
  JSON.parse(dashboard.exports.technicalJson);
  if (quality.status === "bloqueado") fail(`QA de intelligence bloqueou: ${quality.blockingIssues.join("; ")}`);
  if (injectSensitive) fail("Cenario injetado deveria ter sido bloqueado antes deste ponto.");

  const reportsDir = path.join(process.cwd(), "reports", "marketing-os-v6");
  mkdirSync(reportsDir, { recursive: true });
  const files = buildV6ReportFiles(dashboard);
  Object.entries(files).forEach(([fileName, content]) => {
    writeFileSync(path.join(reportsDir, fileName), `${content.trim()}\n`, "utf8");
  });

  console.log("Marketing OS V6 Intelligence Loop check");
  console.log(`Status: ${dashboard.report.quality.status}`);
  console.log(`Registros: ${dashboard.recordCount}`);
  console.log(`Score: ${dashboard.intelligenceScore}/100`);
  console.log(`Experimentos: ${dashboard.experiments.length}`);
  console.log(`Proximas acoes: ${dashboard.report.recommendations.length}`);
  console.log(`Calendario adaptativo: ${dashboard.roadmap.adaptiveCalendar.length} dias`);
  console.log(`Reports: ${Object.keys(files).length}`);
  console.log(generateLearningLoopReport(report.records).summary);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runMarketingIntelligenceV6Check(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
