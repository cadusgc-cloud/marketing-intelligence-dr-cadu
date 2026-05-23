import type {
  DailyExecutionPlan,
  ExecutionDashboard,
  ExportPackage,
  ManualPublishingChecklist,
  MarketingOpsState,
  WeeklyExecutionPlan
} from "@/lib/marketing-ops/types";
import { MANUAL_PUBLISHING_CHECKLIST_ITEMS } from "@/lib/marketing-ops/constants";
import { exportSafetyReport } from "@/lib/marketing-ops/safety";

export function buildManualPublishingChecklist(): ManualPublishingChecklist {
  const items = MANUAL_PUBLISHING_CHECKLIST_ITEMS.map((label, index) => ({
    id: `manual-check-${index + 1}`,
    label,
    checkedByDefault: false,
    blocking: index < 6
  }));
  return {
    items,
    exportText: ["# Checklist manual antes de publicar", "", ...items.map((item) => `- [ ] ${item.label}`)].join("\n")
  };
}

export function buildExportPackages(dashboard: Omit<ExecutionDashboard, "exports">): ExportPackage[] {
  const today = dashboard.today;
  const week = dashboard.week;
  const month = dashboard.month;

  return [
    pkg("day", "Pacote do dia", "pacote_dia", "Stories, reel/post, midia e safety do dia.", today.quickExport, true),
    pkg("week", "Pacote da semana", "pacote_semana", "Resumo semanal de temas, tarefas e checklist.", week.exportText, true),
    pkg("month", "Pacote do mes", "pacote_mes", "Resumo da campanha ativa e progresso mensal.", exportMonthPackage(dashboard), true),
    pkg("stories", "Stories do dia", "stories", "Sequencia StoryOps pronta para copiar.", today.storyExport, true),
    pkg("reels", "Roteiros de reels", "reels", "Todos os roteiros de reels do mes.", exportReels(dashboard.days), true),
    pkg("carousels", "Carrosseis", "carrosseis", "Posts e carrosseis planejados.", exportPosts(dashboard.days), true),
    pkg("captions", "Legendas", "legendas", "Legendas curtas dos posts/carrosseis.", exportCaptions(dashboard.days), true),
    pkg("editor", "Briefing para editor de video", "briefing_editor", "Lista de reels e orientacoes de edicao.", exportEditorBriefing(dashboard.days), true),
    pkg("media", "Checklist de midia", "media_checklist", "MediaOps V3 com lacunas e bloqueios.", exportMediaChecklist(dashboard), true),
    pkg("sheets", "Google Sheets TSV", "google_sheets", "Tabela tabulada para planejamento manual.", exportGoogleSheets(dashboard.days), true),
    pkg("agenda", "Google Agenda", "google_agenda", "Blocos de agenda para colar manualmente.", exportGoogleAgenda(dashboard.days), true),
    pkg("etus", "Etus / Gerenciador manual", "etus_manual", "Tabela manual compativel com planejamento no Etus.", exportEtusManual(dashboard.days), true),
    pkg("backup", "Backup JSON local", "backup_json", "Exportacao tecnica para backup local do plano.", JSON.stringify({ month, days: dashboard.days.map((day) => ({ date: day.date, theme: day.theme, risk: day.risk, readiness: day.readiness.score })) }, null, 2), false),
    pkg("safety", "Relatorio de seguranca", "relatorio_seguranca", "Resumo de riscos, bloqueios e revisoes.", exportSafetyReport(dashboard.safety), true)
  ];
}

export function exportMarketingOpsState(state: MarketingOpsState): string {
  return JSON.stringify(
    {
      id: state.id,
      generatedAt: state.generatedAt,
      campaign: state.dashboard.month,
      readiness: state.dashboard.readiness,
      taskCount: state.dashboard.tasks.tasks.length
    },
    null,
    2
  );
}

export function exportEtusManual(days: DailyExecutionPlan[]): string {
  const header = "Data\tCanal\tFormato\tTitulo interno\tTexto/legenda\tMidia necessaria\tObservacoes\tStatus\tRisco";
  const rows = days.flatMap((day) => {
    const rowsForDay = [
      [day.date, "Instagram", "Stories", `Stories - ${day.theme}`, safeCell(day.storyExport), day.mediaNeeds.map((need) => need.label).join(" + "), "Publicar manualmente apos revisao", day.readiness.status, day.risk]
    ];
    if (day.reelExport) rowsForDay.push([day.date, "Instagram/TikTok/Shorts", "Reel", `Reel - ${day.theme}`, safeCell(day.reelExport), "video curto + capa simples", "Agendar manualmente se aprovado", day.readiness.status, day.risk]);
    if (day.postExport) rowsForDay.push([day.date, "Instagram/Facebook", "Post/Carrossel", `Post - ${day.theme}`, safeCell(day.postExport), "imagem neutra ou carrossel", "Usar somente midia revisada", day.readiness.status, day.risk]);
    return rowsForDay.map((row) => row.join("\t"));
  });
  return [header, ...rows].join("\n");
}

function exportMonthPackage(dashboard: Omit<ExecutionDashboard, "exports">): string {
  return [
    `# ${dashboard.month.name}`,
    "",
    `Periodo: ${dashboard.month.startDate} a ${dashboard.month.endDate}`,
    `Objetivo: ${dashboard.month.objective}`,
    `Readiness do mes: ${dashboard.readiness.month.score}/100 (${dashboard.readiness.month.status})`,
    `Tarefas: ${dashboard.tasks.tasks.length}`,
    `Bloqueios: ${dashboard.tasks.blockedTasks.length}`,
    "",
    "## Gargalos",
    ...dashboard.readiness.bottlenecks.map((item) => `- ${item}`)
  ].join("\n");
}

function exportReels(days: DailyExecutionPlan[]): string {
  const reels = days.filter((day) => day.reelExport).map((day) => `# ${day.date} - ${day.theme}\n${day.reelExport}`);
  return reels.length ? reels.join("\n\n---\n\n") : "Nenhum reel previsto.";
}

function exportPosts(days: DailyExecutionPlan[]): string {
  const posts = days.filter((day) => day.postExport).map((day) => `# ${day.date} - ${day.theme}\n${day.postExport}`);
  return posts.length ? posts.join("\n\n---\n\n") : "Nenhum post/carrossel previsto.";
}

function exportCaptions(days: DailyExecutionPlan[]): string {
  return days
    .filter((day) => day.postExport)
    .map((day) => `# ${day.date} - ${day.theme}\nLegenda: revisar o bloco de post/carrossel do pacote do dia.`)
    .join("\n\n");
}

function exportEditorBriefing(days: DailyExecutionPlan[]): string {
  return [
    "# Briefing para editor",
    "",
    "Padrao: cortes simples, texto legivel, sem paciente, sem local identificavel e sem promessa.",
    "",
    ...days.filter((day) => day.reelExport).map((day) => `- ${day.date}: ${day.theme} | ${day.sourceDay.content.reelPlan?.sceneSuggestion ?? "video curto falando"}`)
  ].join("\n");
}

function exportMediaChecklist(dashboard: Omit<ExecutionDashboard, "exports">): string {
  return [
    "# MediaOps V3",
    "",
    "## Lacunas",
    ...dashboard.media.gaps.map((gap) => `- ${gap}`),
    "",
    "## Bloqueios",
    ...dashboard.media.blockedTerms.map((term) => `- ${term}`),
    "",
    "## Tarefas de captura",
    ...dashboard.media.captureTasks.map((task) => `- ${task.date}: ${task.title}`)
  ].join("\n");
}

function exportGoogleSheets(days: DailyExecutionPlan[]): string {
  const header = "Data\tDia\tPilar\tTema\tStories\tReel\tPost\tMidia\tStatus\tRisco\tReadiness";
  const rows = days.map((day) =>
    [
      day.date,
      day.weekday,
      day.pillar,
      day.theme,
      "sim",
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

function exportGoogleAgenda(days: DailyExecutionPlan[]): string {
  return days
    .map((day) =>
      [
        "Titulo:",
        `Conteudo Dr. Cadu - ${day.theme}`,
        "",
        "Descricao:",
        `- Pilar: ${day.pillar}`,
        "- Stories: copiar pacote StoryOps",
        `- Reel: ${day.reelExport ? "sim" : "nao"}`,
        `- Post: ${day.postExport ? "sim" : "nao"}`,
        `- Midia: ${day.mediaNeeds.map((need) => need.label).join(" + ")}`,
        `- Seguranca: ${day.risk}`,
        `- Status: ${day.readiness.status}`
      ].join("\n")
    )
    .join("\n\n---\n\n");
}

function pkg(id: string, title: string, format: ExportPackage["format"], description: string, text: string, userFacing: boolean): ExportPackage {
  return { id, title, format, description, text, userFacing };
}

function safeCell(value: string): string {
  return value.replace(/\s+/g, " ").slice(0, 600);
}
