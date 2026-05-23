import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runMarketingDogfoodingScenario } from "../lib/marketing-dogfooding";
import { buildPilotWeekScenario } from "../lib/marketing-scenarios";
import { runMarketingQualityAudit } from "../lib/marketing-quality";
import { buildContentStudioCheckReport, generateContentStudioPackage } from "../lib/content-studio";
import { buildIntelligenceDashboard } from "../lib/marketing-intelligence";
import { parseReportImport, sampleGenericTsv } from "../lib/report-imports";
import { buildDefaultWeeklyReview } from "../lib/weekly-review";

export type RouteHealthItem = {
  route: string;
  status: "ok" | "falha";
  message: string;
};

export type RouteHealthReport = {
  mode: "static" | "local";
  baseUrl?: string;
  items: RouteHealthItem[];
  ok: boolean;
};

const routeFiles = [
  ["/", "app/page.tsx", "Marketing Intelligence OS"],
  ["/storyops", "app/storyops/page.tsx", "StoryOps"],
  ["/campaigns", "app/campaigns/page.tsx", "Campanhas"],
  ["/operations", "app/operations/page.tsx", "Central Operacional"],
  ["/exports", "app/exports/page.tsx", "Export Center"],
  ["/safety", "app/safety/page.tsx", "Safety Center"],
  ["/qa", "app/qa/page.tsx", "QA"],
  ["/insights", "app/insights/page.tsx", "Insights"],
  ["/studio", "app/studio/page.tsx", "Content Studio"],
  ["/library", "app/library/page.tsx", "Biblioteca Editorial"],
  ["/recording", "app/recording/page.tsx", "Planejamento de Gravacao"],
  ["/review", "app/review/page.tsx", "Fila de Revisao"],
  ["/metrics", "app/metrics/page.tsx", "Metricas Manuais"],
  ["/experiments", "app/experiments/page.tsx", "Experimentos Editoriais"],
  ["/strategy", "app/strategy/page.tsx", "Estrategia"],
  ["/weekly-review", "app/weekly-review/page.tsx", "Fechamento Semanal"],
  ["/imports", "app/imports/page.tsx", "Importacoes Manuais"],
  ["/performance", "app/performance/page.tsx", "Performance"]
] as const;

export async function buildStaticRouteHealthReport(): Promise<RouteHealthReport> {
  const scenario = buildPilotWeekScenario();
  const dogfood = runMarketingDogfoodingScenario();
  const quality = runMarketingQualityAudit({ scenario });
  const studioPackage = generateContentStudioPackage();
  const studioCheck = buildContentStudioCheckReport();
  const intelligence = buildIntelligenceDashboard();
  const reportImport = parseReportImport({ source: "generic", text: sampleGenericTsv, periodStart: "2026-05-17", periodEnd: "2026-05-30" });
  const weeklyReview = buildDefaultWeeklyReview();
  const items: RouteHealthItem[] = routeFiles.map(([route, file]) => ({
    route,
    status: existsSync(path.join(process.cwd(), file)) ? "ok" : "falha",
    message: existsSync(path.join(process.cwd(), file)) ? `Arquivo presente: ${file}` : `Arquivo ausente: ${file}`
  }));

  items.push({
    route: "engine:pilot-week",
    status: scenario.days.length === 7 && scenario.summary.totalStories === 42 ? "ok" : "falha",
    message: `Semana piloto: ${scenario.days.length} dias, ${scenario.summary.totalStories} stories`
  });
  items.push({
    route: "engine:dogfood",
    status: dogfood.finalStatus !== "bloqueado" ? "ok" : "falha",
    message: `Dogfooding: ${dogfood.finalStatus}`
  });
  items.push({
    route: "engine:quality",
    status: quality.status !== "bloqueado" ? "ok" : "falha",
    message: `QA: ${quality.score}/100`
  });
  items.push({
    route: "engine:content-studio",
    status: studioPackage.storySequence.items.length === 6 && studioCheck.status === "aprovado" ? "ok" : "falha",
    message: `Studio: ${studioCheck.generatedPackages} pacotes, readiness ${studioCheck.averageReadiness}/100`
  });
  items.push({
    route: "engine:intelligence",
    status: intelligence.recordCount >= 45 && intelligence.roadmap.adaptiveCalendar.length === 7 ? "ok" : "falha",
    message: `Intelligence: ${intelligence.recordCount} registros, score ${intelligence.intelligenceScore}/100`
  });
  items.push({
    route: "engine:report-imports",
    status: !reportImport.blocked && reportImport.normalizedRows.length >= 80 ? "ok" : "falha",
    message: `Report imports: ${reportImport.normalizedRows.length} registros, quality ${reportImport.quality.overallQualityScore}/100`
  });
  items.push({
    route: "engine:weekly-review",
    status: weeklyReview.nextWeekPlan.days.length === 7 && weeklyReview.currentRecords.length >= 35 ? "ok" : "falha",
    message: `Weekly review: ${weeklyReview.currentRecords.length} registros, ${weeklyReview.nextWeekPlan.days.length} dias`
  });

  return {
    mode: "static",
    items,
    ok: items.every((item) => item.status === "ok")
  };
}

export async function buildLocalRouteHealthReport(baseUrl: string): Promise<RouteHealthReport> {
  const items: RouteHealthItem[] = [];
  for (const [route, , expected] of routeFiles) {
    const url = new URL(route, baseUrl).toString();
    try {
      const response = await fetch(url);
      const text = await response.text();
      const ok = response.status === 200 && text.includes(expected);
      items.push({
        route,
        status: ok ? "ok" : "falha",
        message: `${response.status} ${ok ? "OK" : `sem texto esperado: ${expected}`}`
      });
    } catch (error) {
      items.push({
        route,
        status: "falha",
        message: error instanceof Error ? error.message : "erro desconhecido"
      });
    }
  }

  return {
    mode: "local",
    baseUrl,
    items,
    ok: items.every((item) => item.status === "ok")
  };
}

export async function runRouteHealthCli(args: string[] = []): Promise<number> {
  const baseIndex = args.indexOf("--base");
  const baseUrl = baseIndex >= 0 ? args[baseIndex + 1] : undefined;
  const report = baseUrl ? await buildLocalRouteHealthReport(baseUrl) : await buildStaticRouteHealthReport();

  console.log(`Marketing OS route health (${report.mode})`);
  if (report.baseUrl) console.log(`Base: ${report.baseUrl}`);
  report.items.forEach((item) => console.log(`${item.status.toUpperCase()}\t${item.route}\t${item.message}`));
  return report.ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runRouteHealthCli(process.argv.slice(2)).then((code) => process.exit(code));
}
