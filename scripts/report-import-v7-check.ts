import { pathToFileURL } from "node:url";
import {
  getSampleReportImportText,
  parseReportImport,
  sampleGenericTsv,
  sampleV7ReportRows,
  type ReportSource
} from "../lib/report-imports";

function fail(message: string): never {
  throw new Error(message);
}

export function runReportImportV7Check(args: string[] = []): number {
  const sources: ReportSource[] = ["reportei", "instagram", "meta_ads", "generic"];
  const results = sources.map((source) => parseReportImport({
    source,
    text: getSampleReportImportText(source),
    periodStart: "2026-05-24",
    periodEnd: "2026-05-30"
  }));

  if (sampleV7ReportRows.length < 80) fail("Dataset V7 deve ter pelo menos 80 registros.");
  results.forEach((result) => {
    if (!result.headers.length) fail(`Import ${result.source} sem cabecalho.`);
    if (!result.normalizedRows.length) fail(`Import ${result.source} sem linhas normalizadas.`);
    if (result.quality.status === "bloquear") fail(`Import ${result.source} bloqueado indevidamente.`);
    if (!result.exports.normalizedTsv.startsWith("Data\tCanal")) fail(`Export normalizado falhou para ${result.source}.`);
    JSON.parse(result.exports.technicalJson);
  });

  const injected = parseReportImport({
    source: "generic",
    text: `${sampleGenericTsv}\n2026-05-24\tinstagram\treel\ttema\tseguranca\tlinha com paciente e token=abc\t100\t100\t1\t1\t1\t1\t0\t0\t0\t0\t1\tbaixo\trevisar`,
    periodStart: "2026-05-24",
    periodEnd: "2026-05-30"
  });
  if (!injected.blocked) fail("Import com dado sensivel injetado deveria bloquear.");
  if (args.includes("--qa") && injected.sensitiveIssues.length < 2) fail("QA deveria detectar multiplos riscos sensiveis.");

  console.log("Marketing OS V7 report import check");
  console.log("Status: aprovado");
  console.log(`Fontes: ${results.map((item) => item.source).join(", ")}`);
  console.log(`Dataset: ${sampleV7ReportRows.length} registros ficticios`);
  console.log(`Qualidade media: ${Math.round(results.reduce((sum, item) => sum + item.quality.overallQualityScore, 0) / results.length)}/100`);
  console.log("Sensibilidade injetada: bloqueada");
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runReportImportV7Check(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
