import { existsSync } from "node:fs";
import path from "node:path";
import { buildMarketingOpsState } from "../lib/marketing-ops";
import { runMarketingDogfoodingScenario } from "../lib/marketing-dogfooding";
import { runMarketingQualityAudit } from "../lib/marketing-quality";
import { buildPilotWeekScenario } from "../lib/marketing-scenarios";
import { generateMonthlyEditorialPlan, runMonthlySafetyGate } from "../lib/monthly-editorial";
import { buildStoryOpsSequence } from "../lib/storyops";
import { buildContentStudioCheckReport, generateContentStudioPackage, generateRecordingSession, getContentLibraryInventory } from "../lib/content-studio";
import { buildIntelligenceDashboard, parseManualMetrics, sampleMetricsTsv } from "../lib/marketing-intelligence";
import { parseReportImport, sampleGenericTsv } from "../lib/report-imports";
import { buildDefaultWeeklyReview } from "../lib/weekly-review";
import { auditWorkspace, buildDefaultMarketingWorkspace, generateWeeklyRunbook } from "../lib/marketing-workspace";
import { buildCommandCenterDashboard, createFlowRun, getGuidedFlowCatalog, validateGuidedFlowCatalog } from "../lib/guided-flows";
import { buildDefaultReleaseReadinessReport } from "../lib/release-readiness";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredFiles = [
  ["app/operations/page.tsx", "rota /operations"],
  ["app/exports/page.tsx", "rota /exports"],
  ["app/safety/page.tsx", "rota /safety"],
  ["app/qa/page.tsx", "rota /qa"],
  ["app/studio/page.tsx", "rota /studio"],
  ["app/library/page.tsx", "rota /library"],
  ["app/recording/page.tsx", "rota /recording"],
  ["app/review/page.tsx", "rota /review"],
  ["app/metrics/page.tsx", "rota /metrics"],
  ["app/experiments/page.tsx", "rota /experiments"],
  ["app/strategy/page.tsx", "rota /strategy"],
  ["app/insights/page.tsx", "rota /insights"],
  ["app/weekly-review/page.tsx", "rota /weekly-review"],
  ["app/imports/page.tsx", "rota /imports"],
  ["app/performance/page.tsx", "rota /performance"],
  ["app/workspace/page.tsx", "rota /workspace"],
  ["app/history/page.tsx", "rota /history"],
  ["app/runbook/page.tsx", "rota /runbook"],
  ["app/settings/page.tsx", "rota /settings"],
  ["app/audit-log/page.tsx", "rota /audit-log"],
  ["app/command-center/page.tsx", "rota /command-center"],
  ["app/flows/page.tsx", "rota /flows"],
  ["app/flows/[id]/page.tsx", "rota /flows/[id]"],
  ["app/release/page.tsx", "rota /release"],
  ["app/onboarding/page.tsx", "rota /onboarding"],
  ["app/storyops/page.tsx", "rota /storyops"],
  ["app/campaigns/page.tsx", "rota /campaigns"],
  ["lib/storyops/index.ts", "StoryOps"],
  ["lib/monthly-editorial/index.ts", "motor mensal"],
  ["lib/marketing-ops/index.ts", "Marketing Ops V3"],
  ["lib/marketing-scenarios/index.ts", "Semana piloto V4"],
  ["lib/marketing-quality/index.ts", "QA V4"],
  ["lib/marketing-dogfooding/index.ts", "Dogfooding V4"],
  ["lib/content-studio/index.ts", "Content Studio V5"],
  ["lib/marketing-intelligence/index.ts", "Intelligence Loop V6"],
  ["lib/report-imports/index.ts", "Report Imports V7"],
  ["lib/weekly-review/index.ts", "Weekly Review V7"],
  ["lib/marketing-workspace/index.ts", "Marketing Workspace V8"],
  ["lib/guided-flows/index.ts", "Guided Flows V9"],
  ["lib/release-readiness/index.ts", "Release Readiness V9"]
];

for (const [file, label] of requiredFiles) {
  assert(existsSync(path.join(process.cwd(), file)), `Arquivo obrigatorio ausente: ${label} (${file})`);
}

const story = buildStoryOpsSequence({
  date: "2026-05-24",
  theme: "expectativa realista em cirurgia plastica",
  editorialLine: "expectativa_realista"
});
assert(story.items.length === 6, "StoryOps deve gerar exatamente 6 stories.");
assert(story.exportText.includes("Story 6:"), "StoryOps deve exportar ate Story 6.");

const monthly = generateMonthlyEditorialPlan({ startDate: "2026-05-24", durationDays: 30 });
assert(monthly.days.length === 30, "Motor mensal deve gerar 30 dias.");
assert(monthly.days.every((day) => day.content.storySequence.items.length === 6), "Todo dia mensal deve ter StoryOps integrado.");

const ops = buildMarketingOpsState({ campaignInput: { startDate: "2026-05-24", durationDays: 30 } });
assert(ops.dashboard.days.length === 30, "Marketing Ops deve carregar 30 dias.");
assert(ops.dashboard.today.quickExport.includes("# Pacote do dia"), "Marketing Ops deve gerar pacote do dia.");
assert(ops.dashboard.week.exportText.includes("# Semana"), "Marketing Ops deve gerar pacote semanal.");
assert(ops.dashboard.exports.some((pkg) => pkg.format === "google_sheets"), "Export Center deve gerar Google Sheets TSV.");
assert(ops.dashboard.exports.some((pkg) => pkg.format === "google_agenda"), "Export Center deve gerar Google Agenda.");
assert(ops.dashboard.exports.some((pkg) => pkg.format === "etus_manual"), "Export Center deve gerar Etus manual.");
assert(ops.dashboard.tasks.tasks.length > 0, "Marketing Ops deve gerar tarefas.");
assert(ops.dashboard.media.gaps.length > 0, "MediaOps deve explicar lacunas.");

const safety = runMonthlySafetyGate("resultado garantido antes/depois paciente de hoje");
assert(safety.blocks, "Safety gate deve bloquear termos graves.");
assert(safety.detectedTerms.includes("resultado garantido"), "Safety gate deve detectar promessa de resultado.");
assert(safety.detectedTerms.includes("antes/depois"), "Safety gate deve detectar antes/depois.");

const pilot = buildPilotWeekScenario();
assert(pilot.days.length === 7, "V4 deve gerar semana piloto com 7 dias.");
assert(pilot.summary.totalStories === 42, "V4 deve gerar 42 stories na semana piloto.");
assert(pilot.exports.googleSheetsTsv.startsWith("Data\tDia"), "V4 deve exportar Google Sheets TSV.");
const quality = runMarketingQualityAudit({ scenario: pilot });
assert(quality.status === "aprovado", "QA V4 deve aprovar o cenario padrao.");
const dogfood = runMarketingDogfoodingScenario();
assert(dogfood.finalStatus === "aprovado", "Dogfooding V4 deve aprovar o cenario padrao.");

const inventory = getContentLibraryInventory();
assert(inventory.themes.length >= 60, "Biblioteca V5 deve ter pelo menos 60 temas.");
assert(inventory.hooks.length >= 80, "Biblioteca V5 deve ter pelo menos 80 hooks.");
const studio = generateContentStudioPackage();
assert(studio.storySequence.items.length === 6, "Content Studio deve gerar 6 stories.");
assert(studio.reel.exportText.includes("# Reel"), "Content Studio deve gerar reel.");
assert(studio.carousel.cards.length >= 5, "Content Studio deve gerar carrossel.");
assert(studio.exports.fullPackage.includes("Publicacao sempre manual"), "Content Studio deve reforcar publicacao manual.");
const recording = generateRecordingSession();
assert(recording.topics.length >= 8 && recording.topics.length <= 10, "Recording planner deve gerar 8 a 10 videos.");
const studioCheck = buildContentStudioCheckReport();
assert(studioCheck.status === "aprovado", "Studio check V5 deve aprovar cenario padrao.");

const metricImport = parseManualMetrics(sampleMetricsTsv);
assert(metricImport.ok, "Importador de metricas V6 deve aceitar TSV manual de exemplo.");
const intelligence = buildIntelligenceDashboard();
assert(intelligence.recordCount >= 45, "V6 deve ter dataset ficticio com pelo menos 45 registros.");
assert(intelligence.report.recommendations.length >= 10, "V6 deve gerar proximas melhores acoes.");
assert(intelligence.experiments.length >= 7, "V6 deve gerar experimentos editoriais.");
assert(intelligence.roadmap.adaptiveCalendar.length === 7, "V6 deve gerar calendario adaptativo de 7 dias.");
assert(intelligence.exports.etusManual.startsWith("Data\tCanal"), "V6 deve exportar Etus/manual TSV.");

const reportImport = parseReportImport({ source: "generic", text: sampleGenericTsv, periodStart: "2026-05-17", periodEnd: "2026-05-30" });
assert(!reportImport.blocked, "V7 importacao generica padrao nao deve bloquear.");
assert(reportImport.normalizedRows.length >= 80, "V7 deve ter dataset ficticio com pelo menos 80 registros.");
const weeklyReview = buildDefaultWeeklyReview();
assert(weeklyReview.currentRecords.length >= 35, "V7 deve consolidar semana atual.");
assert(weeklyReview.previousRecords.length >= 35, "V7 deve comparar com semana anterior.");
assert(weeklyReview.nextWeekPlan.days.length === 7, "V7 deve gerar plano de 7 dias.");
assert(weeklyReview.exports.etusManual.startsWith("Data\tCanal\tFormato"), "V7 deve exportar Etus/manual.");

const workspace = buildDefaultMarketingWorkspace();
const workspaceAudit = auditWorkspace(workspace);
const runbook = generateWeeklyRunbook({ workspace });
assert(workspace.snapshots.length >= 2, "V8 deve criar snapshots default.");
assert(workspace.history.length >= 5, "V8 deve criar historico operacional.");
assert(workspaceAudit.status !== "bloquear", "V8 workspace default nao deve bloquear.");
assert(runbook.days.length === 7, "V8 deve gerar runbook semanal.");

const flows = getGuidedFlowCatalog();
const flowValidation = validateGuidedFlowCatalog(flows);
const flowRun = createFlowRun("fechamento-semanal-completo", { completedStepIds: ["abrir-imports", "colar-relatorio"] });
const commandCenter = buildCommandCenterDashboard();
const release = buildDefaultReleaseReadinessReport();
assert(flows.length >= 15, "V9 deve ter pelo menos 15 fluxos guiados.");
assert(flowValidation.ok, "V9 deve validar catalogo de fluxos sem bloqueios.");
assert(flowRun.progressPercent > 0 && flowRun.progressPercent < 100, "V9 flow runner deve calcular progresso parcial.");
assert(commandCenter.nextAction.recommendedRoute.length > 0, "V9 Command Center deve gerar proxima acao.");
assert(release.status === "aprovado", "V9 release readiness default deve aprovar.");
assert(release.prDraft.markdown.includes("Sem API externa"), "V9 PR draft deve registrar ausencia de API externa.");

console.log("Smoke Marketing OS V9: OK");
