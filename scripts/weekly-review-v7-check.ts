import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseReportImport, sampleGenericTsv } from "../lib/report-imports";
import { buildDefaultWeeklyReview, buildV7ReportFiles } from "../lib/weekly-review";

function fail(message: string): never {
  throw new Error(message);
}

export function runWeeklyReviewV7Check(args: string[] = []): number {
  const importResult = parseReportImport({
    source: "generic",
    text: sampleGenericTsv,
    periodStart: "2026-05-17",
    periodEnd: "2026-05-30"
  });
  if (importResult.blocked) fail("Import padrao V7 nao deveria bloquear.");
  if (importResult.normalizedRows.length < 80) fail("Dataset V7 deve carregar pelo menos 80 registros.");

  const report = buildDefaultWeeklyReview();
  if (report.currentRecords.length < 35) fail("Fechamento semanal deve ter registros suficientes na semana atual.");
  if (report.previousRecords.length < 35) fail("Fechamento semanal deve comparar com semana anterior.");
  if (report.nextWeekPlan.days.length !== 7) fail("Plano da proxima semana deve ter 7 dias.");
  if (!report.exports.googleSheetsTsv.startsWith("Data\tCanal")) fail("Export TSV semanal deve ter cabecalho.");
  if (!report.exports.googleAgenda.includes("Titulo: Conteudo Dr. Cadu")) fail("Agenda semanal deve ter titulo copiavel.");
  if (!report.exports.etusManual.startsWith("Data\tCanal\tFormato")) fail("Etus/manual deve ser TSV.");
  if (report.recommendations.length < 4) fail("Fechamento deve gerar recomendacoes.");
  if (report.paidInsights.length < 1) fail("Ads manual deve gerar leitura segura.");
  JSON.parse(report.exports.technicalJson);
  if (args.includes("--qa") && report.quality.status === "insuficiente") fail("QA semanal ficou insuficiente.");

  const reportsDir = path.join(process.cwd(), "reports", "marketing-os-v7");
  mkdirSync(reportsDir, { recursive: true });
  const files = buildV7ReportFiles(report);
  Object.entries(files).forEach(([fileName, content]) => {
    writeFileSync(path.join(reportsDir, fileName), `${content.trim()}\n`, "utf8");
  });

  console.log("Marketing OS V7 weekly review check");
  console.log(`Status: ${report.quality.status}`);
  console.log(`Periodo: ${report.period.label}`);
  console.log(`Registros atuais: ${report.currentRecords.length}`);
  console.log(`Registros anteriores: ${report.previousRecords.length}`);
  console.log(`Confianca: ${report.quality.confidence}`);
  console.log(`Proxima semana: ${report.nextWeekPlan.days.length} dias`);
  console.log(`Reports: ${Object.keys(files).length}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runWeeklyReviewV7Check(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
