import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildContentStudioCheckReport,
  buildV5Reports,
  evaluateMarketingContentQuality,
  generateContentStudioPackage,
  generateRecordingSession,
  getContentLibraryInventory
} from "../lib/content-studio";

export function runContentStudioV5Check(args: string[] = []): number {
  const injectBlocked = args.includes("--inject-blocked");
  const report = buildContentStudioCheckReport(injectBlocked);
  const inventory = getContentLibraryInventory();
  const packageItem = generateContentStudioPackage();
  const recording = generateRecordingSession();
  const injectedQuality = injectBlocked ? evaluateMarketingContentQuality("resultado garantido antes/depois paciente de hoje") : null;

  if (injectedQuality?.blocked) {
    report.blockingFailures.push("Quality bloqueou conteudo injetado de teste.");
  }

  const hardFailures: string[] = [];
  if (inventory.pillars.length < 12) hardFailures.push("Biblioteca com menos de 12 pilares.");
  if (inventory.themes.length < 60) hardFailures.push("Biblioteca com menos de 60 temas.");
  if (inventory.hooks.length < 80) hardFailures.push("Biblioteca com menos de 80 hooks.");
  if (inventory.storyPhrases.length < 80) hardFailures.push("Biblioteca com menos de 80 frases de stories.");
  if (inventory.reelHooks.length < 40) hardFailures.push("Biblioteca com menos de 40 ganchos de reels.");
  if (inventory.carouselTemplates.length < 20) hardFailures.push("Biblioteca com menos de 20 templates.");
  if (inventory.captions.length < 40) hardFailures.push("Biblioteca com menos de 40 legendas.");
  if (packageItem.storySequence.items.length !== 6) hardFailures.push("Pacote padrao nao tem 6 stories.");
  if (recording.topics.length < 8 || recording.topics.length > 10) hardFailures.push("Gravacao nao tem 8 a 10 videos.");
  if (!packageItem.exports.fullPackage.trim()) hardFailures.push("Export completo vazio.");
  if (!packageItem.exports.technicalJson.trim()) hardFailures.push("Backup JSON tecnico vazio.");
  JSON.parse(packageItem.exports.technicalJson);

  const reports = buildV5Reports();
  const reportDir = path.join(process.cwd(), "reports", "marketing-os-v5");
  mkdirSync(reportDir, { recursive: true });
  for (const [fileName, contents] of Object.entries(reports)) {
    writeFileSync(path.join(reportDir, fileName), contents, "utf8");
  }

  const allFailures = [...report.blockingFailures, ...hardFailures];
  console.log("Marketing OS V5 Content Studio check");
  console.log(`Status: ${allFailures.length ? "bloqueado" : "aprovado"}`);
  console.log(`Pacotes: ${report.generatedPackages}`);
  console.log(`Variacoes: ${report.generatedVariants}`);
  console.log(`Gravacao: ${report.recordingTopics} videos`);
  console.log(`Review queue: ${report.reviewItems}`);
  console.log(`Production queue: ${report.productionItems}`);
  console.log(`Readiness medio: ${report.averageReadiness}/100`);
  console.log(`Reports: ${Object.keys(reports).length}`);

  if (allFailures.length) {
    console.log("Falhas bloqueantes:");
    for (const failure of allFailures) console.log(`- ${failure}`);
    return 1;
  }

  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runContentStudioV5Check(process.argv.slice(2)));
}
