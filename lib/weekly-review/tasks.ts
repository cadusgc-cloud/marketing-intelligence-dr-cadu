import type { NextWeekPlan, WeeklyRecommendation, WeeklyTask } from "@/lib/weekly-review/types";

export function buildWeeklyTasks(recommendations: WeeklyRecommendation[], nextWeekPlan: NextWeekPlan): WeeklyTask[] {
  const recommendationTasks = recommendations.map((recommendation, index) => ({
    id: `weekly-action-${index + 1}`,
    title: recommendation.action,
    priority: recommendation.priority,
    status: recommendation.type === "revisar" ? "revisar" : "pendente",
    route: recommendation.type === "gravar" ? "/recording" : recommendation.type === "pausar" ? "/review" : "/studio",
    exportText: recommendation.exportText
  } satisfies WeeklyTask));

  const dayTasks = nextWeekPlan.days.map((day, index) => ({
    id: `next-week-day-${index + 1}`,
    title: `Preparar ${day.format} - ${day.theme}`,
    priority: index < 3 ? "alta" : "media",
    status: day.safety === "revisar" ? "revisar" : "pendente",
    route: day.format === "reel" ? "/recording" : "/studio",
    exportText: day.exportText
  } satisfies WeeklyTask));

  return [...recommendationTasks, ...dayTasks];
}
