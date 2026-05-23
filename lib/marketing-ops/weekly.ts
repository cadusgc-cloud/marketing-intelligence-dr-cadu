import type { DailyExecutionPlan, WeeklyExecutionPlan } from "@/lib/marketing-ops/types";
import { aggregateReadiness } from "@/lib/marketing-ops/scoring";

export function buildWeeklyExecutionPlans(days: DailyExecutionPlan[]): WeeklyExecutionPlan[] {
  const weekNumbers = Array.from(new Set(days.map((day) => day.sourceDay.weekNumber)));
  return weekNumbers.map((weekNumber) => {
    const weekDays = days.filter((day) => day.sourceDay.weekNumber === weekNumber);
    const pendingTasks = weekDays.flatMap((day) => day.tasks).filter((task) => task.status === "pendente" || task.status === "em_andamento");
    const readyTasks = weekDays.flatMap((day) => day.tasks).filter((task) => task.status === "pronto" || task.status === "publicado_manual");
    const reelsToRecord = pendingTasks.filter((task) => task.area === "reels");
    const postsToPrepare = pendingTasks.filter((task) => task.area === "post" || task.area === "carrossel");
    const storiesToPublishManually = pendingTasks.filter((task) => task.area === "stories" || task.area === "publishing");
    const mediaGaps = Array.from(new Set(weekDays.flatMap((day) => day.mediaNeeds.map((need) => need.label))));
    const readiness = aggregateReadiness(weekDays);
    const week: Omit<WeeklyExecutionPlan, "exportText"> = {
      weekNumber,
      startDate: weekDays[0]?.date ?? "",
      endDate: weekDays.at(-1)?.date ?? "",
      themes: weekDays.map((day) => day.theme),
      days: weekDays,
      pendingTasks,
      readyTasks,
      mediaGaps,
      reelsToRecord,
      postsToPrepare,
      storiesToPublishManually,
      checklist: buildWeeklyChecklist(weekDays),
      readiness
    };

    return {
      ...week,
      exportText: exportWeeklyExecutionPlan(week)
    };
  });
}

export function exportWeeklyExecutionPlan(week: Omit<WeeklyExecutionPlan, "exportText">): string {
  return [
    `# Semana ${week.weekNumber} - ${week.startDate} a ${week.endDate}`,
    "",
    `Readiness: ${week.readiness.score}/100 (${week.readiness.status})`,
    "",
    "## Temas",
    ...week.themes.map((theme) => `- ${theme}`),
    "",
    "## Tarefas pendentes",
    ...(week.pendingTasks.length ? week.pendingTasks.map((task) => `- ${task.date}: ${task.title} [${task.priority}]`) : ["- nenhuma tarefa pendente"]),
    "",
    "## Checklist",
    ...week.checklist.map((item) => `- ${item}`)
  ].join("\n");
}

function buildWeeklyChecklist(days: DailyExecutionPlan[]): string[] {
  return [
    `Revisar ${days.length} dias de stories`,
    `Gravar ${days.filter((day) => day.reelExport).length} reels previstos`,
    `Preparar ${days.filter((day) => day.postExport).length} posts/carrosseis`,
    "Separar midias naturais sem local ou dados sensiveis",
    "Conferir safety gate antes de publicar manualmente"
  ];
}
