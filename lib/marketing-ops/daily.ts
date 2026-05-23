import type { DailyExecutionPlan } from "@/lib/marketing-ops/types";
import { buildTasksForEditorialDay } from "@/lib/marketing-ops/tasks";
import { calculatePublishingReadiness } from "@/lib/marketing-ops/scoring";
import type { EditorialDay } from "@/lib/monthly-editorial";

export function buildDailyExecutionPlan(day: EditorialDay): DailyExecutionPlan {
  const tasks = buildTasksForEditorialDay(day);
  const risk = day.safetyGate.classification;
  const storyExport = day.content.storySequence.exportText;
  const reelExport = day.content.reelPlan?.exportText;
  const postExport = day.content.carouselPlan?.exportText ?? day.content.postPlan?.exportText;
  const readiness = calculatePublishingReadiness({
    hasContent: Boolean(day.theme && storyExport),
    hasMedia: day.mediaSuggestions.length > 0 && !day.mediaSuggestions.some((media) => media.risk === "bloquear"),
    hasExport: Boolean(day.exportText),
    safety: risk,
    hasTasks: tasks.length > 0
  });

  return {
    date: day.date,
    dayNumber: day.dayNumber,
    weekday: day.weekday,
    theme: day.theme,
    pillar: day.pillar.name,
    sourceDay: day,
    storyExport,
    reelExport,
    postExport,
    mediaNeeds: day.mediaSuggestions.map((media) => ({
      id: `${day.id}-${media.category}`,
      category: media.category,
      label: media.label,
      reason: media.description,
      priority: media.risk === "seguro" ? "media" : "alta",
      blocked: media.risk === "bloquear"
    })),
    tasks,
    readiness,
    risk,
    quickExport: buildDailyQuickExport(day, storyExport, reelExport, postExport)
  };
}

function buildDailyQuickExport(day: EditorialDay, storyExport: string, reelExport?: string, postExport?: string): string {
  return [
    `# Pacote do dia - ${day.date}`,
    "",
    `Tema: ${day.theme}`,
    `Pilar: ${day.pillar.name}`,
    `Risco: ${day.safetyGate.classification}`,
    "",
    "## Stories",
    storyExport,
    "",
    "## Reel",
    reelExport ?? "Sem reel previsto para este dia.",
    "",
    "## Post/carrossel",
    postExport ?? "Sem post/carrossel previsto para este dia.",
    "",
    "## Midia",
    ...day.mediaSuggestions.map((media) => `- ${media.label}: ${media.captureGuidance}`),
    "",
    "Publicacao sempre manual, fora do sistema, apos revisao humana."
  ].join("\n");
}
