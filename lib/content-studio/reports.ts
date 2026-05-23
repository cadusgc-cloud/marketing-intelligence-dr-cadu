import { getContentLibraryInventory } from "@/lib/content-studio/library";
import { buildStudioDashboardPackage } from "@/lib/content-studio/queues";
import type { ContentStudioCheckReport } from "@/lib/content-studio/types";

export function buildContentStudioCheckReport(injectBlocked = false): ContentStudioCheckReport {
  const dashboard = buildStudioDashboardPackage();
  const failures: string[] = [];
  const warnings: string[] = [];
  const packages = dashboard.packages;

  if (packages.length < 10) failures.push("Menos de 10 pacotes foram gerados.");
  if (dashboard.recordingSession.topics.length < 8 || dashboard.recordingSession.topics.length > 10) failures.push("Sessao de gravacao fora de 8 a 10 videos.");
  if (!dashboard.recordingSession.editorBatchBriefing.includes("Briefing")) failures.push("Briefing de editor ausente.");
  if (!dashboard.reviewQueue.length) failures.push("Fila de revisao vazia.");
  if (!dashboard.productionQueue.length) failures.push("Fila de producao vazia.");

  for (const pkg of packages) {
    if (!pkg.storySequence.items.length || pkg.storySequence.items.length !== 6) failures.push(`Stories invalidos em ${pkg.theme}.`);
    if (!pkg.reel.exportText.trim()) failures.push(`Reel vazio em ${pkg.theme}.`);
    if (!pkg.carousel.cards.length) failures.push(`Carrossel vazio em ${pkg.theme}.`);
    if (!pkg.exports.fullPackage.trim()) failures.push(`Export vazio em ${pkg.theme}.`);
    if (pkg.quality.blocked) failures.push(`Pacote bloqueado: ${pkg.theme}.`);
    if (pkg.quality.requiresHumanReview) warnings.push(`Revisao humana recomendada: ${pkg.theme}.`);
  }

  if (injectBlocked) failures.push("Conteudo bloqueante injetado: resultado garantido antes/depois paciente de hoje.");

  return {
    status: failures.length ? "bloqueado" : "aprovado",
    generatedPackages: packages.length,
    generatedVariants: packages.reduce((total, pkg) => total + pkg.variants.length, 0),
    recordingTopics: dashboard.recordingSession.topics.length,
    reviewItems: dashboard.reviewQueue.length,
    productionItems: dashboard.productionQueue.length,
    averageReadiness: dashboard.averageReadiness,
    blockingFailures: failures,
    warnings,
    reportsGenerated: [
      "content-studio-summary.md",
      "brand-voice-audit.md",
      "library-inventory.md",
      "recording-session-plan.md",
      "production-queue-snapshot.md",
      "review-queue-snapshot.md",
      "studio-quality-report.md",
      "export-samples.md",
      "pr-readiness-v5.md"
    ]
  };
}

export function buildV5Reports(): Record<string, string> {
  const dashboard = buildStudioDashboardPackage();
  const inventory = getContentLibraryInventory();
  const check = buildContentStudioCheckReport();
  const sample = dashboard.packageItem;

  return {
    "content-studio-summary.md": [
      "# Marketing OS v5 - Content Studio",
      "",
      "O Content Studio transforma temas editoriais em pacotes completos de producao local.",
      "",
      `Pacotes testados: ${dashboard.packages.length}`,
      `Readiness medio: ${dashboard.averageReadiness}/100`,
      "Formatos: stories, reels, carrossel, post estatico, legendas, briefing de editor e checklist de midia.",
      "Sem API externa, sem publicacao automatica e sem dados de pacientes."
    ].join("\n"),
    "brand-voice-audit.md": [
      "# Brand voice audit - Dr. Cadu",
      "",
      "Voz: humana, direta, cientifica simples, anti-marketing elegante e sem promessa.",
      "",
      "Permitido:",
      "- frases curtas",
      "- decisao consciente",
      "- expectativa realista",
      "- educacao simples",
      "",
      "Bloqueado:",
      "- resultado garantido",
      "- antes/depois",
      "- paciente de hoje",
      "- cirurgia de hoje",
      "- agende agora"
    ].join("\n"),
    "library-inventory.md": [
      "# Inventario da Biblioteca Editorial",
      "",
      `Pilares: ${inventory.pillars.length}`,
      `Temas: ${inventory.themes.length}`,
      `Hooks: ${inventory.hooks.length}`,
      `Frases de stories: ${inventory.storyPhrases.length}`,
      `Ganchos de reels: ${inventory.reelHooks.length}`,
      `Templates de carrossel: ${inventory.carouselTemplates.length}`,
      `Legendas: ${inventory.captions.length}`,
      `Frases de risco: ${inventory.forbiddenTerms.length}`
    ].join("\n"),
    "recording-session-plan.md": dashboard.recordingSession.exportText,
    "production-queue-snapshot.md": [
      "# Production queue snapshot",
      "",
      ...dashboard.productionQueue.slice(0, 30).map((task) => `- ${task.status} | ${task.priority} | ${task.format} | ${task.title} | ${task.theme}`)
    ].join("\n"),
    "review-queue-snapshot.md": [
      "# Review queue snapshot",
      "",
      ...dashboard.reviewQueue.map((item) => `- ${item.status} | ${item.theme} | voice ${item.voiceScore}/100 | safety ${item.safetyScore}/100 | readiness ${item.readinessScore}/100`)
    ].join("\n"),
    "studio-quality-report.md": [
      "# Studio quality report",
      "",
      `Status: ${check.status}`,
      `Pacotes: ${check.generatedPackages}`,
      `Variacoes: ${check.generatedVariants}`,
      `Topicos de gravacao: ${check.recordingTopics}`,
      `Readiness medio: ${check.averageReadiness}/100`,
      "",
      "Falhas:",
      ...(check.blockingFailures.length ? check.blockingFailures.map((item) => `- ${item}`) : ["- nenhuma falha bloqueante"]),
      "",
      "Avisos:",
      ...(check.warnings.length ? check.warnings.slice(0, 20).map((item) => `- ${item}`) : ["- nenhum aviso"])
    ].join("\n"),
    "export-samples.md": [
      "# Export samples - Content Studio v5",
      "",
      "## Pacote completo",
      sample.exports.fullPackage.slice(0, 4000),
      "",
      "## Google Sheets TSV",
      sample.exports.googleSheetsTsv,
      "",
      "## Google Agenda",
      sample.exports.googleAgenda,
      "",
      "## Etus/manual",
      sample.exports.etusManual
    ].join("\n"),
    "pr-readiness-v5.md": [
      "# PR readiness - Marketing OS v5",
      "",
      "Branch: codex/marketing-os-v5-content-studio",
      "Commit esperado: feat: adicionar content studio do marketing os v5",
      "",
      "## Escopo",
      "- /studio",
      "- /library",
      "- /recording",
      "- /review",
      "- lib/content-studio",
      "- npm run studio:check",
      "",
      "## Seguranca",
      "- sem API externa",
      "- sem publicacao automatica",
      "- sem paciente",
      "- sem .env",
      "- sem push/merge/tag",
      "",
      "## Push futuro",
      "git push -u origin codex/marketing-os-v5-content-studio"
    ].join("\n")
  };
}
