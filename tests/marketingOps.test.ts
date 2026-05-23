import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  aggregateReadiness,
  applyTaskStatusOverrides,
  buildContentBacklog,
  buildDailyExecutionPlan,
  buildEditorialRiskSummary,
  buildExecutionDashboard,
  buildMarketingOpsState,
  buildProductionQueue,
  buildRepurposingPlan,
  buildTasksForEditorialDay,
  buildWeeklyExecutionPlans,
  calculatePublishingReadiness,
  detectBlockedMediaTerms,
  detectMediaOpsGaps,
  exportEtusManual,
  exportMarketingOpsState,
  exportSafetyReport,
  getDefaultOpsLocalState,
  getMediaOpsCategories,
  readinessStatusLabel
} from "@/lib/marketing-ops";
import { generateMonthlyEditorialPlan, runMonthlySafetyGate, type EditorialDay } from "@/lib/monthly-editorial";

function defaultState() {
  return buildMarketingOpsState({ campaignInput: { startDate: "2026-05-24", durationDays: 30 } });
}

function defaultDay(): EditorialDay {
  return defaultState().campaignPlan.days[0];
}

describe("Marketing OS v3 - Central Operacional de Execucao Editorial", () => {
  it("gera dashboard operacional", () => {
    const state = defaultState();

    expect(state.dashboard.today).toBeTruthy();
    expect(state.dashboard.week).toBeTruthy();
    expect(state.dashboard.month).toBeTruthy();
    expect(state.dashboard.operations.map((operation) => operation.scope)).toEqual(["hoje", "semana", "mes"]);
  });

  it("gera plano do dia", () => {
    const daily = buildDailyExecutionPlan(defaultDay());

    expect(daily.quickExport).toContain("# Pacote do dia");
    expect(daily.storyExport).toContain("Story 6:");
    expect(daily.tasks.length).toBeGreaterThan(0);
  });

  it("gera plano da semana", () => {
    const state = defaultState();

    expect(state.dashboard.week.days.length).toBeGreaterThan(0);
    expect(state.dashboard.week.exportText).toContain("# Semana");
    expect(state.dashboard.week.checklist.length).toBeGreaterThanOrEqual(4);
  });

  it("gera plano do mes", () => {
    const state = defaultState();

    expect(state.dashboard.days).toHaveLength(30);
    expect(state.dashboard.month.durationDays).toBe(30);
    expect(state.dashboard.readiness.month.score).toBeGreaterThanOrEqual(0);
  });

  it("integra campanha mensal existente", () => {
    const campaign = generateMonthlyEditorialPlan({ durationDays: 12 });
    const dashboard = buildExecutionDashboard(campaign);

    expect(dashboard.days).toHaveLength(12);
    expect(dashboard.month.name).toBe(campaign.name);
  });

  it("integra StoryOps quando disponivel", () => {
    const state = defaultState();

    expect(state.dashboard.days.every((day) => day.storyExport.includes("Story 6:"))).toBe(true);
    expect(state.dashboard.healthChecks.find((check) => check.id === "storyops")?.status).toBe("ok");
  });

  it("gera tarefas editoriais", () => {
    const tasks = buildTasksForEditorialDay(defaultDay());

    expect(tasks.some((task) => task.area === "stories")).toBe(true);
    expect(tasks.some((task) => task.area === "publishing")).toBe(true);
  });

  it("nao gera tarefa de publicacao para conteudo bloqueado", () => {
    const blockedDay: EditorialDay = { ...defaultDay(), safetyGate: runMonthlySafetyGate("resultado garantido paciente de hoje") };
    const tasks = buildTasksForEditorialDay(blockedDay);

    expect(tasks.some((task) => task.area === "publishing")).toBe(false);
    expect(tasks.some((task) => task.status === "bloqueado")).toBe(true);
  });

  it("gera tarefa de revisao para conteudo com risco", () => {
    const reviewDay: EditorialDay = { ...defaultDay(), safetyGate: runMonthlySafetyGate("agende agora") };
    const tasks = buildTasksForEditorialDay(reviewDay);

    expect(tasks.some((task) => task.area === "safety")).toBe(true);
  });

  it("gera tarefa de midia quando falta midia", () => {
    const dayWithoutMedia: EditorialDay = { ...defaultDay(), mediaSuggestions: [] };
    const tasks = buildTasksForEditorialDay(dayWithoutMedia);

    expect(tasks.some((task) => task.area === "media")).toBe(true);
  });

  it("fila de producao separa tarefas bloqueadas e de publicacao", () => {
    const daily = buildDailyExecutionPlan(defaultDay());
    const queue = buildProductionQueue([daily]);

    expect(queue.tasks.length).toBe(daily.tasks.length);
    expect(queue.publicationTasks.every((task) => task.area === "publishing")).toBe(true);
  });

  it("aplica status local de tarefas", () => {
    const tasks = buildTasksForEditorialDay(defaultDay());
    const updated = applyTaskStatusOverrides(tasks, { [tasks[0].id]: "pronto" });

    expect(updated[0].status).toBe("pronto");
  });

  it("backlog contem itens", () => {
    const backlog = buildContentBacklog();

    expect(backlog.length).toBeGreaterThanOrEqual(15);
    expect(backlog.every((item) => item.theme && item.pillar)).toBe(true);
  });

  it("backlog transforma tema em multiplos formatos", () => {
    const item = buildContentBacklog()[0];
    const plan = buildRepurposingPlan(item);

    expect(plan.storySequence).toContain("Story 1:");
    expect(plan.reelScript).toContain("Roteiro");
    expect(plan.carousel).toContain("Carrossel");
    expect(plan.shortCaption).toContain("Conteudo educativo");
  });

  it("repurposing gera briefing e fala espontanea", () => {
    const plan = buildRepurposingPlan(buildContentBacklog()[1]);

    expect(plan.editorBriefing).toContain("Briefing do editor");
    expect(plan.spontaneousSpeech).toContain("Uma forma simples");
    expect(plan.onScreenText).toContain("sem promessa");
  });

  it("repurposing gera versoes para agenda e sheets", () => {
    const plan = buildRepurposingPlan(buildContentBacklog()[2]);

    expect(plan.googleAgenda).toContain("Titulo:");
    expect(plan.googleSheets.split("\n")[0]).toContain("Data\tPilar\tTema");
  });

  it("MediaOps detecta lacunas", () => {
    const days = defaultState().dashboard.days;

    expect(detectMediaOpsGaps(days).length).toBeGreaterThan(0);
  });

  it("MediaOps lista categorias naturais", () => {
    expect(getMediaOpsCategories()).toEqual(expect.arrayContaining(["selfie neutra", "video curto falando para camera", "fundo simples"]));
  });

  it("MediaOps bloqueia paciente, prontuario e localizacao", () => {
    const detected = detectBlockedMediaTerms("paciente visivel com prontuario e localizacao revelada");

    expect(detected).toEqual(expect.arrayContaining(["paciente visivel", "prontuario", "localizacao revelada"]));
  });

  it("Safety Center consolida riscos", () => {
    const state = defaultState();
    const summary = buildEditorialRiskSummary(state.dashboard.days);

    expect(summary.safeContent + summary.needsReview + summary.blockedContent).toBe(state.dashboard.days.length);
  });

  it("Safety Center exporta relatorio", () => {
    const report = exportSafetyReport(defaultState().dashboard.safety);

    expect(report).toContain("# Relatorio de seguranca editorial");
    expect(report).toContain("Classificacao geral:");
  });

  it("Export Center gera pacote diario", () => {
    const dayPackage = defaultState().dashboard.exports.find((pkg) => pkg.format === "pacote_dia");

    expect(dayPackage?.text).toContain("# Pacote do dia");
  });

  it("Export Center gera pacote semanal", () => {
    const weekPackage = defaultState().dashboard.exports.find((pkg) => pkg.format === "pacote_semana");

    expect(weekPackage?.text).toContain("# Semana");
  });

  it("Export Center gera pacote mensal", () => {
    const monthPackage = defaultState().dashboard.exports.find((pkg) => pkg.format === "pacote_mes");

    expect(monthPackage?.text).toContain("# Cirurgia plastica sem promessa");
  });

  it("exporta Google Sheets TSV", () => {
    const sheet = defaultState().dashboard.exports.find((pkg) => pkg.format === "google_sheets")?.text ?? "";

    expect(sheet.split("\n")[0]).toBe("Data\tDia\tPilar\tTema\tStories\tReel\tPost\tMidia\tStatus\tRisco\tReadiness");
  });

  it("exporta Google Agenda", () => {
    const agenda = defaultState().dashboard.exports.find((pkg) => pkg.format === "google_agenda")?.text ?? "";

    expect(agenda).toContain("Titulo:");
    expect(agenda).toContain("Conteudo Dr. Cadu -");
  });

  it("exporta formato Etus manual", () => {
    const text = exportEtusManual(defaultState().dashboard.days.slice(0, 2));

    expect(text.split("\n")[0]).toBe("Data\tCanal\tFormato\tTitulo interno\tTexto/legenda\tMidia necessaria\tObservacoes\tStatus\tRisco");
    expect(text).toContain("Publicar manualmente apos revisao");
  });

  it("exporta briefing para editor", () => {
    const briefing = defaultState().dashboard.exports.find((pkg) => pkg.format === "briefing_editor")?.text ?? "";

    expect(briefing).toContain("# Briefing para editor");
    expect(briefing).toContain("sem paciente");
  });

  it("exporta checklist de midia", () => {
    const checklist = defaultState().dashboard.exports.find((pkg) => pkg.format === "media_checklist")?.text ?? "";

    expect(checklist).toContain("# MediaOps V3");
    expect(checklist).toContain("## Lacunas");
  });

  it("exporta backup JSON apenas tecnico", () => {
    const backup = defaultState().dashboard.exports.find((pkg) => pkg.format === "backup_json");

    expect(backup?.userFacing).toBe(false);
    expect(() => JSON.parse(backup?.text ?? "")).not.toThrow();
  });

  it("score de readiness fica entre 0 e 100", () => {
    const scores = defaultState().dashboard.days.map((day) => day.readiness.score);

    expect(scores.every((score) => score >= 0 && score <= 100)).toBe(true);
  });

  it("conteudo seguro aumenta readiness", () => {
    const readiness = calculatePublishingReadiness({ hasContent: true, hasMedia: true, hasExport: true, safety: "seguro", hasTasks: true });

    expect(readiness.score).toBe(100);
    expect(readiness.status).toBe("pronto");
  });

  it("conteudo bloqueado reduz readiness", () => {
    const readiness = calculatePublishingReadiness({ hasContent: true, hasMedia: true, hasExport: true, safety: "bloquear", hasTasks: true });

    expect(readiness.score).toBeLessThanOrEqual(25);
    expect(readiness.status).toBe("bloqueado");
  });

  it("readiness agregado consolida dias", () => {
    const days = defaultState().dashboard.days.slice(0, 7);
    const readiness = aggregateReadiness(days);

    expect(readiness.score).toBeGreaterThanOrEqual(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
  });

  it("finais de semana tem tom mais leve sem tempo real", () => {
    const state = defaultState();
    const sunday = state.dashboard.days[0];
    const text = `${sunday.sourceDay.tone} ${sunday.sourceDay.notes} ${sunday.quickExport}`.toLowerCase();

    expect(sunday.weekday).toBe("Domingo");
    expect(text).toContain("leve");
    expect(text).not.toMatch(/no hospital agora|aqui na clinica agora|paciente de hoje|cirurgia de hoje/);
  });

  it("nao inventa paciente", () => {
    const text = defaultState().dashboard.days.map((day) => day.quickExport).join(" ").toLowerCase();

    expect(text).not.toContain("paciente de hoje");
  });

  it("nao inventa cirurgia do dia", () => {
    const text = defaultState().dashboard.days.map((day) => day.quickExport).join(" ").toLowerCase();

    expect(text).not.toContain("cirurgia de hoje");
  });

  it("nao inventa localizacao em tempo real", () => {
    const text = defaultState().dashboard.days.map((day) => day.quickExport).join(" ").toLowerCase();

    expect(text).not.toMatch(/no hospital agora|aqui na clinica agora/);
  });

  it("nao usa antes/depois no conteudo operacional padrao", () => {
    const text = defaultState().dashboard.today.quickExport.toLowerCase();

    expect(text).not.toContain("antes/depois");
    expect(text).not.toContain("antes e depois");
  });

  it("nao usa promessa de resultado no conteudo operacional padrao", () => {
    const text = defaultState().dashboard.today.quickExport.toLowerCase();

    expect(text).not.toContain("resultado garantido");
    expect(text).not.toContain("corpo perfeito");
  });

  it("nao usa CTA agressivo no conteudo operacional padrao", () => {
    const text = defaultState().dashboard.today.quickExport.toLowerCase();

    expect(text).not.toContain("agende agora");
    expect(text).not.toContain("ultimas vagas");
  });

  it("nao prescreve", () => {
    const text = defaultState().dashboard.today.quickExport.toLowerCase();

    expect(text).not.toContain("prescreve");
    expect(text).not.toContain("tratamento ideal para voce");
  });

  it("nao diagnostica", () => {
    const text = defaultState().dashboard.today.quickExport.toLowerCase();

    expect(text).not.toContain("diagnostico");
  });

  it("motor e deterministico", () => {
    const first = buildMarketingOpsState({ campaignInput: { startDate: "2026-06-01", durationDays: 10 } });
    const second = buildMarketingOpsState({ campaignInput: { startDate: "2026-06-01", durationDays: 10 } });

    expect(JSON.stringify(first.dashboard)).toBe(JSON.stringify(second.dashboard));
  });

  it("exportacoes de usuario nao mostram JSON bruto", () => {
    const userPackages = defaultState().dashboard.exports.filter((pkg) => pkg.userFacing);

    expect(userPackages.every((pkg) => !pkg.text.trim().startsWith("{") && !pkg.text.trim().startsWith("["))).toBe(true);
  });

  it("estado local inicial nao quebra", () => {
    const localState = getDefaultOpsLocalState();

    expect(localState.selectedScope).toBe("hoje");
    expect(localState.taskStatuses).toEqual({});
  });

  it("tarefas tem status valido", () => {
    const tasks = defaultState().dashboard.tasks.tasks;

    expect(tasks.every((task) => TASK_STATUSES.includes(task.status))).toBe(true);
  });

  it("tarefas tem prioridade valida", () => {
    const tasks = defaultState().dashboard.tasks.tasks;

    expect(tasks.every((task) => TASK_PRIORITIES.includes(task.priority))).toBe(true);
  });

  it("plano semanal agrupa corretamente", () => {
    const days = defaultState().dashboard.days;
    const weeks = buildWeeklyExecutionPlans(days);

    expect(weeks[0].weekNumber).toBe(1);
    expect(weeks[0].days).toHaveLength(7);
  });

  it("plano mensal consolida riscos", () => {
    const state = buildMarketingOpsState({ campaignInput: { startDate: "2025-12-01", durationDays: 7 } });

    expect(state.campaignPlan.safetyGate.issues.some((issue) => issue.id === "dezembro-2025-anomalia")).toBe(true);
  });

  it("checklist de midia e gerado", () => {
    const state = defaultState();

    expect(state.campaignPlan.mediaChecklist.monthlyItems.length).toBeGreaterThan(0);
    expect(state.dashboard.media.assetNeeds.length).toBeGreaterThan(0);
  });

  it("lacunas de midia sao explicadas", () => {
    const gaps = defaultState().dashboard.media.gaps;

    expect(gaps.every((gap) => gap.length > 5)).toBe(true);
  });

  it("pilares editoriais sao distribuidos", () => {
    const pillars = new Set(defaultState().dashboard.days.map((day) => day.pillar));

    expect(pillars.size).toBeGreaterThan(4);
  });

  it("datas invalidas tem fallback seguro", () => {
    const state = buildMarketingOpsState({ campaignInput: { startDate: "data-invalida", durationDays: 3 } });

    expect(state.campaignPlan.startDate).toBe("2026-05-24");
    expect(state.dashboard.days[0].date).toBe("2026-05-24");
  });

  it("duracao invalida e normalizada", () => {
    const state = buildMarketingOpsState({ campaignInput: { durationDays: -10 } });

    expect(state.campaignPlan.days).toHaveLength(1);
  });

  it("conteudo vazio nao quebra safety gate", () => {
    const gate = runMonthlySafetyGate("");

    expect(gate.classification).toBe("seguro");
    expect(gate.score).toBe(100);
  });

  it("labels de readiness sao estaveis", () => {
    expect(readinessStatusLabel("precisa_midia")).toBe("Precisa midia");
  });

  it("exporta resumo tecnico do estado", () => {
    const exported = exportMarketingOpsState(defaultState());
    const parsed = JSON.parse(exported) as { taskCount: number };

    expect(parsed.taskCount).toBeGreaterThan(0);
  });

  it("rotas principais da V3 existem", () => {
    expect(existsSync(path.join(process.cwd(), "app", "operations", "page.tsx"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "app", "exports", "page.tsx"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "app", "safety", "page.tsx"))).toBe(true);
  });

  it("rotas StoryOps e Campaigns continuam existindo", () => {
    expect(existsSync(path.join(process.cwd(), "app", "storyops", "page.tsx"))).toBe(true);
    expect(existsSync(path.join(process.cwd(), "app", "campaigns", "page.tsx"))).toBe(true);
  });

  it("dominio V3 principal existe", () => {
    expect(existsSync(path.join(process.cwd(), "lib", "marketing-ops", "index.ts"))).toBe(true);
  });

  it("smoke script V3 existe", () => {
    expect(existsSync(path.join(process.cwd(), "scripts", "smoke-marketing-os.mjs"))).toBe(true);
  });

  it("documentacao V3 existe", () => {
    expect(existsSync(path.join(process.cwd(), "docs", "MARKETING_OS_V3_EXECUTION_SUITE.md"))).toBe(true);
  });
});
