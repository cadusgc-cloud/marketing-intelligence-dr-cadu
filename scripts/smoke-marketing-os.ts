import { existsSync } from "node:fs";
import path from "node:path";
import { buildMarketingOpsState } from "../lib/marketing-ops";
import { runMarketingDogfoodingScenario } from "../lib/marketing-dogfooding";
import { runMarketingQualityAudit } from "../lib/marketing-quality";
import { buildPilotWeekScenario } from "../lib/marketing-scenarios";
import { generateMonthlyEditorialPlan, runMonthlySafetyGate } from "../lib/monthly-editorial";
import { buildStoryOpsSequence } from "../lib/storyops";
import { buildContentStudioCheckReport, generateContentStudioPackage, generateRecordingSession, getContentLibraryInventory } from "../lib/content-studio";

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
  ["app/storyops/page.tsx", "rota /storyops"],
  ["app/campaigns/page.tsx", "rota /campaigns"],
  ["lib/storyops/index.ts", "StoryOps"],
  ["lib/monthly-editorial/index.ts", "motor mensal"],
  ["lib/marketing-ops/index.ts", "Marketing Ops V3"],
  ["lib/marketing-scenarios/index.ts", "Semana piloto V4"],
  ["lib/marketing-quality/index.ts", "QA V4"],
  ["lib/marketing-dogfooding/index.ts", "Dogfooding V4"],
  ["lib/content-studio/index.ts", "Content Studio V5"]
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

console.log("Smoke Marketing OS V5: OK");
