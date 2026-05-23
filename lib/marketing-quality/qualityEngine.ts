import type { CarouselPlan, PostPlan, ReelPlan } from "@/lib/monthly-editorial";
import { buildPilotWeekScenario } from "@/lib/marketing-scenarios";
import { validateExportBundle } from "@/lib/marketing-quality/exportRules";
import { detectMedicalSafetyIssues } from "@/lib/marketing-quality/medicalSafetyRules";
import { validateStorySequence } from "@/lib/marketing-quality/storyRules";
import type { MarketingQualityInput, MarketingQualityReport, QualityCheckResult, QualityIssue } from "@/lib/marketing-quality/types";

export function runMarketingQualityAudit(input: MarketingQualityInput = {}): MarketingQualityReport {
  const scenario = input.scenario ?? buildPilotWeekScenario();
  const checks: QualityCheckResult[] = [];

  for (const day of scenario.days) {
    checks.push(...validateStorySequence(day.editorialDay.content.storySequence, `dia-${day.editorialDay.date}`));
    if (day.editorialDay.content.reelPlan) checks.push(...validateReel(day.editorialDay.content.reelPlan, day.editorialDay.date));
    if (day.editorialDay.content.carouselPlan) checks.push(...validateCarousel(day.editorialDay.content.carouselPlan, day.editorialDay.date));
    if (day.editorialDay.content.postPlan) checks.push(...validatePost(day.editorialDay.content.postPlan, day.editorialDay.date));
    checks.push(validateDailyReadiness(day, day.editorialDay.date));
    checks.push(validateDailySafetyGate(day));
    checks.push(validateDailyExport(day.exportText, day.editorialDay.date));
  }

  checks.push(...validateExportBundle(scenario.exports));
  checks.push(validateScenarioSummary(scenario));

  if (input.injectedText) {
    const injectedIssues = detectMedicalSafetyIssues(input.injectedText, "conteudo-injetado");
    checks.push({
      id: "injected-content-safety",
      label: "Conteudo injetado passa pelo safety gate",
      area: "safety",
      passed: injectedIssues.every((issue) => issue.severity !== "blocking"),
      severity: injectedIssues.some((issue) => issue.severity === "blocking") ? "blocking" : injectedIssues.length ? "warning" : "info",
      issues: injectedIssues
    });
  }

  const issues = checks.flatMap((check) => check.issues);
  const blockingChecks = checks.filter((check) => !check.passed && check.severity === "blocking").length;
  const warningChecks = checks.filter((check) => check.severity === "warning" || check.issues.some((issue) => issue.severity === "warning")).length;
  const passedChecks = checks.filter((check) => check.passed).length;
  const score = Math.max(0, Math.min(100, Math.round((passedChecks / checks.length) * 100) - blockingChecks * 4));
  const status: MarketingQualityReport["status"] = blockingChecks > 0 ? "bloqueado" : "aprovado";

  return {
    id: `quality-${scenario.id}`,
    scenarioId: scenario.id,
    totalChecks: checks.length,
    passedChecks,
    warningChecks,
    blockingChecks,
    score,
    status,
    issues,
    checks,
    exportValidation: {
      googleSheets: checkPassed(checks, "export-sheets"),
      googleAgenda: checkPassed(checks, "export-agenda"),
      etusManual: checkPassed(checks, "export-etus"),
      dailyPackages: checkPassed(checks, "export-daily"),
      weeklyPackage: checkPassed(checks, "export-weekly"),
      backupJson: checkPassed(checks, "export-backup-json"),
      userExportsWithoutRawJson: checkPassed(checks, "export-no-raw-json")
    }
  };
}

export function buildQualityReportMarkdown(report: MarketingQualityReport): string {
  const blocking = report.issues.filter((issue) => issue.severity === "blocking");
  const warnings = report.issues.filter((issue) => issue.severity === "warning");
  return [
    "# QA automatico - Marketing OS v4",
    "",
    `Status: ${report.status}`,
    `Score: ${report.score}/100`,
    `Regras executadas: ${report.totalChecks}`,
    `Regras aprovadas: ${report.passedChecks}`,
    `Avisos: ${warnings.length}`,
    `Falhas bloqueantes: ${blocking.length}`,
    "",
    "## Falhas bloqueantes",
    ...(blocking.length ? blocking.map((issue) => `- ${issue.source}: ${issue.message}`) : ["- nenhuma falha bloqueante"]),
    "",
    "## Avisos",
    ...(warnings.length ? warnings.slice(0, 20).map((issue) => `- ${issue.source}: ${issue.message}`) : ["- nenhum aviso relevante"]),
    "",
    "## Exportacoes",
    `- Google Sheets: ${report.exportValidation.googleSheets ? "ok" : "falha"}`,
    `- Google Agenda: ${report.exportValidation.googleAgenda ? "ok" : "falha"}`,
    `- Etus/manual: ${report.exportValidation.etusManual ? "ok" : "falha"}`,
    `- Backup JSON tecnico: ${report.exportValidation.backupJson ? "ok" : "falha"}`,
    `- Exports comuns sem JSON bruto: ${report.exportValidation.userExportsWithoutRawJson ? "ok" : "falha"}`
  ].join("\n");
}

function validateReel(reel: ReelPlan, date: string): QualityCheckResult[] {
  const issues = detectMedicalSafetyIssues(reel.exportText, `reel-${date}`);
  const missing: QualityIssue[] = [];
  if (!reel.openingHook.trim()) missing.push(issue("reel-hook", "reels", date, "Reel sem gancho.", "Adicionar gancho curto e seguro."));
  if (reel.shortScript.length < 3) missing.push(issue("reel-script", "reels", date, "Reel sem roteiro curto suficiente.", "Criar roteiro com 3 a 4 blocos."));
  if (!reel.suggestedSpokenText.trim()) missing.push(issue("reel-spoken", "reels", date, "Reel sem texto falado.", "Adicionar fala sugerida."));
  if (!reel.onScreenText.length) missing.push(issue("reel-screen", "reels", date, "Reel sem texto na tela.", "Adicionar texto curto na tela."));
  return [
    check(`reel-structure-${date}`, `Reel ${date}: estrutura`, "reels", missing.length === 0, missing),
    check(`reel-safety-${date}`, `Reel ${date}: safety`, "reels", issues.every((item) => item.severity !== "blocking"), issues)
  ];
}

function validateCarousel(carousel: CarouselPlan, date: string): QualityCheckResult[] {
  const issues = detectMedicalSafetyIssues(carousel.exportText, `carousel-${date}`);
  const structure: QualityIssue[] = [];
  if (carousel.cards.length < 5 || carousel.cards.length > 7) structure.push(issue("carousel-cards", "posts", date, "Carrossel fora de 5 a 7 cards.", "Ajustar para 5 a 7 cards curtos."));
  if (carousel.cards.some((card) => card.length > 110)) structure.push(issue("carousel-short", "posts", date, "Card longo demais.", "Reduzir texto de card."));
  return [
    check(`carousel-structure-${date}`, `Carrossel ${date}: cards curtos`, "posts", structure.length === 0, structure),
    check(`carousel-safety-${date}`, `Carrossel ${date}: safety`, "posts", issues.every((item) => item.severity !== "blocking"), issues)
  ];
}

function validatePost(post: PostPlan, date: string): QualityCheckResult[] {
  const issues = detectMedicalSafetyIssues(post.exportText, `post-${date}`);
  const structure: QualityIssue[] = [];
  if (!post.title.trim()) structure.push(issue("post-title", "posts", date, "Post sem titulo.", "Adicionar titulo interno."));
  if (!post.shortCaption.trim()) structure.push(issue("post-caption", "posts", date, "Post sem legenda.", "Adicionar legenda curta."));
  return [
    check(`post-structure-${date}`, `Post ${date}: estrutura`, "posts", structure.length === 0, structure),
    check(`post-safety-${date}`, `Post ${date}: safety`, "posts", issues.every((item) => item.severity !== "blocking"), issues)
  ];
}

function validateDailyReadiness(day: { readiness: { score: number; status: string }; editorialDay: { safetyGate: { blocks: boolean } }; exportText: string }, index = ""): QualityCheckResult {
  const issues: QualityIssue[] = [];
  if (day.readiness.score < 0 || day.readiness.score > 100) {
    issues.push(issue("readiness-range", "pr_readiness", index, "Readiness fora de 0 a 100.", "Recalcular readiness."));
  }
  if (day.editorialDay.safetyGate.blocks && day.readiness.status !== "bloqueado") {
    issues.push(issue("blocked-ready", "pr_readiness", index, "Conteudo bloqueado nao pode estar pronto.", "Forcar status bloqueado."));
  }
  return check(`readiness-${index || day.exportText.slice(0, 12)}`, "Readiness diario valido", "pr_readiness", issues.length === 0, issues);
}

function validateDailySafetyGate(day: { safetyGate: { score: number; classification: string; issues: unknown[] }; editorialDay: { date: string } }): QualityCheckResult {
  const issues: QualityIssue[] = [];
  if (day.safetyGate.score < 0 || day.safetyGate.score > 100) issues.push(issue("safety-score", "safety", day.editorialDay.date, "Safety score invalido.", "Recalcular safety gate."));
  if (!day.safetyGate.classification) issues.push(issue("safety-classification", "safety", day.editorialDay.date, "Safety gate sem classificacao.", "Gerar safety gate."));
  return check(`safety-${day.editorialDay.date}`, `Safety gate ${day.editorialDay.date}`, "safety", issues.length === 0, issues);
}

function validateDailyExport(text: string, date: string): QualityCheckResult {
  const issues: QualityIssue[] = [];
  if (!text.includes("Story 6:")) issues.push(issue("daily-story-export", "exports", date, "Export do dia nao contem Story 6.", "Regerar pacote diario."));
  if (!text.includes("Publicacao sempre manual")) issues.push(issue("daily-manual", "exports", date, "Export do dia nao reforca publicacao manual.", "Adicionar guardrail manual."));
  return check(`daily-export-${date}`, `Export diario ${date}`, "exports", issues.length === 0, issues);
}

function validateScenarioSummary(scenario: { summary: { totalDays: number; totalStories: number; totalBlockedItems: number } }): QualityCheckResult {
  const issues: QualityIssue[] = [];
  if (scenario.summary.totalDays !== 7) issues.push(issue("summary-days", "pr_readiness", "summary", "Semana piloto nao tem 7 dias.", "Corrigir definicao da semana piloto."));
  if (scenario.summary.totalStories !== 42) issues.push(issue("summary-stories", "pr_readiness", "summary", "Semana piloto nao tem 42 stories.", "Regerar StoryOps para todos os dias."));
  if (scenario.summary.totalBlockedItems > 0) issues.push(issue("summary-blocked", "pr_readiness", "summary", "Semana piloto contem bloqueios.", "Revisar safety antes de PR."));
  return check("scenario-summary", "Resumo consolidado da semana piloto", "pr_readiness", issues.length === 0, issues);
}

function check(id: string, label: string, area: QualityCheckResult["area"], passed: boolean, issues: QualityIssue[]): QualityCheckResult {
  return {
    id,
    label,
    area,
    passed,
    severity: issues.some((item) => item.severity === "blocking") ? "blocking" : issues.length ? "warning" : "info",
    issues
  };
}

function issue(id: string, area: QualityIssue["area"], source: string, message: string, suggestion: string): QualityIssue {
  return { id: `${source}-${id}`, area, severity: "blocking", message, source, suggestion };
}

function checkPassed(checks: QualityCheckResult[], id: string): boolean {
  return checks.find((checkItem) => checkItem.id === id)?.passed ?? false;
}
