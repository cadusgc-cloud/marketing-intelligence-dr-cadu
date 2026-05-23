import { exportEtusManual, exportSafetyReport } from "@/lib/marketing-ops";
import type { DailyExecutionPlan } from "@/lib/marketing-ops";
import type { CampaignPlan } from "@/lib/monthly-editorial";
import type { PilotWeekExportBundle, PilotWeekSummary } from "@/lib/marketing-scenarios/types";

export function buildPilotWeekExportBundle(plan: CampaignPlan, days: DailyExecutionPlan[], summary: PilotWeekSummary): PilotWeekExportBundle {
  return {
    weeklyMarkdown: exportPilotWeekMarkdown(plan, days, summary),
    weeklyText: exportPilotWeekText(days, summary),
    dailyPackages: exportDailyPackages(days),
    stories: exportPilotStories(days),
    reels: exportPilotReels(days),
    postsAndCarousels: exportPilotPosts(days),
    googleSheetsTsv: exportPilotGoogleSheets(days),
    googleAgendaText: exportPilotGoogleAgenda(days),
    etusManual: exportEtusManual(days),
    videoEditorBrief: exportPilotVideoEditorBrief(days),
    safetyReport: exportSafetyReport({
      totalIssues: days.reduce((total, day) => total + day.sourceDay.safetyGate.issues.length, 0),
      blockedContent: days.filter((day) => day.risk === "bloquear").length,
      needsReview: days.filter((day) => day.risk === "atencao" || day.risk === "revisar_antes_de_postar").length,
      safeContent: days.filter((day) => day.risk === "seguro").length,
      topRisks: [],
      blockedDays: days.filter((day) => day.risk === "bloquear"),
      reviewDays: days.filter((day) => day.risk === "atencao" || day.risk === "revisar_antes_de_postar"),
      safetyGate: plan.safetyGate
    }),
    backupJson: exportPilotBackupJson(plan, days, summary)
  };
}

export function exportPilotWeekMarkdown(plan: CampaignPlan, days: DailyExecutionPlan[], summary: PilotWeekSummary): string {
  return [
    `# ${summary.campaignName}`,
    "",
    `Periodo: ${summary.period}`,
    `Status: ${summary.status}`,
    `Readiness medio: ${summary.averageReadiness}/100`,
    "",
    "## Temas por dia",
    ...days.map((day) => `- ${day.date} (${day.weekday}): ${day.theme} | ${day.pillar} | readiness ${day.readiness.score}/100 | risco ${day.risk}`),
    "",
    "## Entregas",
    `- Stories: ${summary.totalStories}`,
    `- Reels: ${summary.totalReels}`,
    `- Posts/carrosseis: ${summary.totalPostsAndCarousels}`,
    `- Tarefas: ${summary.totalTasks}`,
    `- Alertas de seguranca: ${summary.totalSafetyAlerts}`,
    "",
    "## Guardrails",
    "- uso interno e deterministico",
    "- sem API externa",
    "- sem publicacao automatica",
    "- sem paciente, prontuario, localizacao real ou bastidor especifico inventado",
    "- revisao humana antes de qualquer publicacao manual",
    "",
    `Campanha base: ${plan.name}`
  ].join("\n");
}

export function exportPilotWeekText(days: DailyExecutionPlan[], summary: PilotWeekSummary): string {
  return [
    `Semana piloto: ${summary.period}`,
    `Campanha: ${summary.campaignName}`,
    `Readiness: ${summary.averageReadiness}/100`,
    "",
    ...days.map((day) => `- ${day.weekday} ${day.date}: ${day.theme} | Stories: 6 | Reel: ${day.reelExport ? "sim" : "nao"} | Post: ${day.postExport ? "sim" : "nao"} | Risco: ${day.risk}`)
  ].join("\n");
}

export function exportDailyPackages(days: DailyExecutionPlan[]): string {
  return days.map((day) => day.quickExport).join("\n\n---\n\n");
}

export function exportPilotStories(days: DailyExecutionPlan[]): string {
  return days.map((day) => [`# ${day.date} - ${day.theme}`, day.storyExport].join("\n")).join("\n\n---\n\n");
}

export function exportPilotReels(days: DailyExecutionPlan[]): string {
  const reels = days.filter((day) => day.reelExport).map((day) => `# ${day.date} - ${day.theme}\n${day.reelExport}`);
  return reels.length ? reels.join("\n\n---\n\n") : "Nenhum reel previsto na semana piloto.";
}

export function exportPilotPosts(days: DailyExecutionPlan[]): string {
  const posts = days.filter((day) => day.postExport).map((day) => `# ${day.date} - ${day.theme}\n${day.postExport}`);
  return posts.length ? posts.join("\n\n---\n\n") : "Nenhum post/carrossel previsto na semana piloto.";
}

export function exportPilotGoogleSheets(days: DailyExecutionPlan[]): string {
  const header = "Data\tDia\tPilar\tTema\tStories\tReel\tPost\tMidia\tStatus\tRisco\tReadiness";
  const rows = days.map((day) =>
    [
      day.date,
      day.weekday,
      day.pillar,
      day.theme,
      "6",
      day.reelExport ? "sim" : "nao",
      day.postExport ? "sim" : "nao",
      day.mediaNeeds.map((need) => need.label).join(" + "),
      day.readiness.status,
      day.risk,
      day.readiness.score
    ].join("\t")
  );
  return [header, ...rows].join("\n");
}

export function exportPilotGoogleAgenda(days: DailyExecutionPlan[]): string {
  return days
    .map((day) =>
      [
        "Titulo:",
        `Conteudo Dr. Cadu - ${day.theme}`,
        "",
        "Descricao:",
        `- Pilar: ${day.pillar}`,
        "- Stories: 6 stories internos para copiar manualmente",
        `- Reel: ${day.reelExport ? "sim" : "nao"}`,
        `- Post: ${day.postExport ? "sim" : "nao"}`,
        `- Midia: ${day.mediaNeeds.map((need) => need.label).join(" + ")}`,
        `- Seguranca: ${day.risk}`,
        `- Status: ${day.readiness.status}`
      ].join("\n")
    )
    .join("\n\n---\n\n");
}

export function exportPilotVideoEditorBrief(days: DailyExecutionPlan[]): string {
  const reelDays = days.filter((day) => day.reelExport);
  return [
    "# Briefing para editor - semana piloto",
    "",
    "Padrao: cortes simples, fala natural, legenda clara, fundo neutro, sem paciente, sem local identificavel e sem promessa.",
    "",
    ...reelDays.map((day) => `- ${day.date}: ${day.theme} | ${day.sourceDay.content.reelPlan?.sceneSuggestion ?? "video curto falando"} | risco ${day.risk}`)
  ].join("\n");
}

export function exportPilotBackupJson(plan: CampaignPlan, days: DailyExecutionPlan[], summary: PilotWeekSummary): string {
  return JSON.stringify(
    {
      id: plan.id,
      campaignName: summary.campaignName,
      period: summary.period,
      status: summary.status,
      summary,
      days: days.map((day) => ({
        date: day.date,
        weekday: day.weekday,
        theme: day.theme,
        pillar: day.pillar,
        readiness: day.readiness.score,
        risk: day.risk,
        tasks: day.tasks.length
      }))
    },
    null,
    2
  );
}
