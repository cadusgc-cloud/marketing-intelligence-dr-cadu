import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildDogfoodingReportMarkdown, buildPrReadinessMarkdown, runMarketingDogfoodingScenario } from "../lib/marketing-dogfooding";
import { buildQualityReportMarkdown } from "../lib/marketing-quality";

const requiredReports = [
  "reports/marketing-os-v4/pilot-week-summary.md",
  "reports/marketing-os-v4/pilot-week-exports.md",
  "reports/marketing-os-v4/safety-audit.md",
  "reports/marketing-os-v4/qa-report.md",
  "reports/marketing-os-v4/pr-readiness.md",
  "reports/marketing-os-v4/route-health.md"
];

export function runDogfoodCli(args: string[] = []): number {
  const injectBlockedContent = args.includes("--inject-blocked");
  const report = runMarketingDogfoodingScenario({ injectBlockedContent });
  const missingReports = requiredReports.filter((file) => !existsSync(path.join(process.cwd(), file)));
  const dogfoodMarkdown = buildDogfoodingReportMarkdown(report);
  const qualityMarkdown = buildQualityReportMarkdown(report.quality);
  const prMarkdown = buildPrReadinessMarkdown(report);
  const blocking = [
    ...report.failures.map((failure) => `${failure.source}: ${failure.message}`),
    ...missingReports.map((file) => `relatorio ausente: ${file}`)
  ];

  console.log("Marketing OS V4 dogfooding");
  console.log(`Status: ${report.finalStatus}`);
  console.log(`Semana: ${report.scenario.summary.period}`);
  console.log(`Dias: ${report.totalDays}`);
  console.log(`Stories: ${report.totalStories}`);
  console.log(`Readiness: ${report.weeklyReadiness}/100`);
  console.log(`QA: ${report.quality.score}/100 (${report.quality.totalChecks} regras)`);
  console.log(`Reports: ${missingReports.length === 0 ? "OK" : "faltando"}`);
  console.log("");
  console.log(dogfoodMarkdown.split("\n").slice(0, 18).join("\n"));
  console.log("");
  console.log(qualityMarkdown.split("\n").slice(0, 12).join("\n"));
  console.log("");
  console.log(prMarkdown.split("\n").slice(0, 10).join("\n"));

  if (blocking.length > 0) {
    console.error("Falhas bloqueantes:");
    blocking.forEach((item) => console.error(`- ${item}`));
    return 1;
  }

  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runDogfoodCli(process.argv.slice(2)));
}
