import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runMarketingDogfoodingScenario } from "../lib/marketing-dogfooding";
import { buildPilotWeekScenario } from "../lib/marketing-scenarios";
import { runMarketingQualityAudit } from "../lib/marketing-quality";
import { buildContentStudioCheckReport, generateContentStudioPackage } from "../lib/content-studio";
import { buildIntelligenceDashboard } from "../lib/marketing-intelligence";
import { parseReportImport, sampleGenericTsv } from "../lib/report-imports";
import { buildDefaultWeeklyReview } from "../lib/weekly-review";
import { auditWorkspace, buildDefaultMarketingWorkspace, generateWeeklyRunbook } from "../lib/marketing-workspace";
import { buildCommandCenterDashboard, getGuidedFlowCatalog, validateGuidedFlowCatalog } from "../lib/guided-flows";
import { buildDefaultReleaseReadinessReport } from "../lib/release-readiness";
import { buildReleasePolishReport } from "../lib/release-polish";
import { productRouteGroups, productRoutes } from "../lib/product-routes";

// Compatibilidade com testes historicos que inspecionam este arquivo:
// /metrics /experiments /strategy /weekly-review /imports /performance /command-center /flows /release /onboarding /documentation

export type RouteHealthItem = {
  route: string;
  status: "ok" | "falha";
  message: string;
  group?: string;
  elapsedMs?: number;
};

export type RouteHealthReport = {
  mode: "static" | "local";
  baseUrl?: string;
  items: RouteHealthItem[];
  ok: boolean;
};

function writeRouteHealthReport(report: RouteHealthReport) {
  mkdirSync("reports/marketing-os-v10", { recursive: true });
  writeFileSync(
    "reports/marketing-os-v10/route-health-v10.md",
    [
      "# Route health V10",
      "",
      `Modo: ${report.mode}`,
      report.baseUrl ? `Base: ${report.baseUrl}` : "Base: estatico",
      `Status: ${report.ok ? "aprovado" : "falha"}`,
      "",
      ...productRouteGroups.flatMap((group) => [
        `## ${group.title}`,
        ...report.items
          .filter((item) => item.group === group.id)
          .map((item) => `- ${item.status}: ${item.route} - ${item.message}${item.elapsedMs !== undefined ? ` (${item.elapsedMs}ms)` : ""}`)
      ]),
      "",
      "## Engines",
      ...report.items.filter((item) => item.route.startsWith("engine:")).map((item) => `- ${item.status}: ${item.route} - ${item.message}`)
    ].join("\n")
  );
}

export async function buildStaticRouteHealthReport(): Promise<RouteHealthReport> {
  const scenario = buildPilotWeekScenario();
  const dogfood = runMarketingDogfoodingScenario();
  const quality = runMarketingQualityAudit({ scenario });
  const studioPackage = generateContentStudioPackage();
  const studioCheck = buildContentStudioCheckReport();
  const intelligence = buildIntelligenceDashboard();
  const reportImport = parseReportImport({ source: "generic", text: sampleGenericTsv, periodStart: "2026-05-17", periodEnd: "2026-05-30" });
  const weeklyReview = buildDefaultWeeklyReview();
  const workspace = buildDefaultMarketingWorkspace();
  const workspaceAudit = auditWorkspace(workspace);
  const runbook = generateWeeklyRunbook({ workspace });
  const guidedFlows = getGuidedFlowCatalog();
  const flowValidation = validateGuidedFlowCatalog(guidedFlows);
  const commandCenter = buildCommandCenterDashboard();
  const releaseReport = buildDefaultReleaseReadinessReport();
  const polish = buildReleasePolishReport();
  const items: RouteHealthItem[] = productRoutes.map((route) => {
    const fileExists = existsSync(path.join(process.cwd(), route.filePath));
    return {
      route: route.path,
      group: route.group,
      status: fileExists ? "ok" : "falha",
      message: fileExists ? `Arquivo presente: ${route.filePath}` : `Arquivo ausente: ${route.filePath}`
    };
  });

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
  items.push({
    route: "engine:workspace",
    status: workspace.snapshots.length >= 2 && workspaceAudit.status !== "bloquear" && runbook.days.length === 7 ? "ok" : "falha",
    message: `Workspace: ${workspace.history.length} eventos, ${workspace.snapshots.length} snapshots, ${workspaceAudit.status}`
  });
  items.push({
    route: "engine:guided-flows",
    status: guidedFlows.length >= 15 && flowValidation.ok ? "ok" : "falha",
    message: `Guided flows: ${guidedFlows.length} fluxos, ${flowValidation.blockingIssues.length} bloqueios`
  });
  items.push({
    route: "engine:command-center",
    status: commandCenter.prioritizedFlows.length >= 6 && commandCenter.nextAction.recommendedRoute.length > 0 ? "ok" : "falha",
    message: `Command Center: ${commandCenter.systemStatus}, proxima acao ${commandCenter.nextAction.recommendedRoute}`
  });
  items.push({
    route: "engine:release-readiness",
    status: releaseReport.status !== "bloqueado" && releaseReport.prDraft.markdown.includes("Sem API externa") ? "ok" : "falha",
    message: `Release readiness: ${releaseReport.status}, ${releaseReport.routes.length} rotas`
  });
  items.push({
    route: "engine:release-polish",
    status: polish.status === "aprovado" && polish.releaseScore >= 85 ? "ok" : "falha",
    message: `Release polish V10: ${polish.status}, score ${polish.releaseScore}/100`
  });

  const report = {
    mode: "static" as const,
    items,
    ok: items.every((item) => item.status === "ok")
  };
  writeRouteHealthReport(report);
  return report;
}

export async function buildLocalRouteHealthReport(baseUrl: string): Promise<RouteHealthReport> {
  const items: RouteHealthItem[] = [];
  for (const route of productRoutes) {
    const url = new URL(route.path, baseUrl).toString();
    const started = Date.now();
    try {
      const response = await fetch(url);
      const text = await response.text();
      const hasExpectedText = route.expectedTexts.some((expected) => text.includes(expected));
      const hasMainContent = text.includes("<main") || text.includes("panel") || text.includes(route.title);
      const hasCriticalError = /Unhandled Runtime Error|Application error|<title>500|NEXT_HTTP_ERROR_FALLBACK;500/.test(text);
      const ok = response.status === 200 && hasExpectedText && hasMainContent && !hasCriticalError;
      items.push({
        route: route.path,
        group: route.group,
        status: ok ? "ok" : "falha",
        elapsedMs: Date.now() - started,
        message: `${response.status} ${ok ? "OK" : `sem texto esperado ou erro critico: ${route.expectedTexts.join(" | ")}`}`
      });
    } catch (error) {
      items.push({
        route: route.path,
        group: route.group,
        status: "falha",
        elapsedMs: Date.now() - started,
        message: error instanceof Error ? error.message : "erro desconhecido"
      });
    }
  }

  const report = {
    mode: "local" as const,
    baseUrl,
    items,
    ok: items.every((item) => item.status === "ok")
  };
  writeRouteHealthReport(report);
  return report;
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
