import { buildStoryOpsSequence } from "@/lib/storyops";
import type { NextWeekDayPlan, NextWeekPlan, WeekPeriod, WeeklyRecommendation } from "@/lib/weekly-review/types";
import { addDays, buildNextWeekPeriod, weekdayLabel } from "@/lib/weekly-review/week";

const fallbackThemes = [
  ["cirurgia plastica nao combina com pressa", "expectativa_realista", "reel"],
  ["naturalidade tambem e planejamento", "estetica_natural", "carrossel"],
  ["consulta nao e venda", "consulta_nao_e_venda", "post"],
  ["cicatrizacao exige paciencia", "cicatrizacao", "story"],
  ["o que o marketing nao mostra", "seguranca", "reel"],
  ["estetica natural e identidade", "estetica_natural", "carrossel"],
  ["organizacao da semana sem improviso", "bastidor_neutro", "story"]
] as const;

export function generateNextWeekPlan(currentPeriod: WeekPeriod, recommendations: WeeklyRecommendation[]): NextWeekPlan {
  const period = buildNextWeekPeriod(currentPeriod);
  const days: NextWeekDayPlan[] = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(period.startDate, index);
    const recommendation = recommendations[index % Math.max(recommendations.length, 1)];
    const fallback = fallbackThemes[index % fallbackThemes.length];
    const theme = recommendation?.relatedTheme?.replace(/_/g, " ") || fallback[0];
    const pillar = recommendation?.relatedTheme || fallback[1];
    const format = index % 3 === 0 ? "reel" : index % 3 === 1 ? "carrossel" : fallback[2];
    const storySequence = buildStoryOpsSequence({
      date,
      theme,
      editorialLine: index === 0 || index === 6 ? "reflexao_fim_de_dia" : "educacao_medica_simples"
    });
    const stories = storySequence.items.map((item) => item.textOnScreen);
    const mediaNeeded = index % 2 === 0
      ? ["video curto falando para camera", "fundo simples sem localizacao"]
      : ["foto neutra de estudo", "imagem simples para story"];
    return {
      date,
      weekday: weekdayLabel(date),
      theme,
      pillar,
      format,
      stories,
      mediaNeeded,
      rationale: recommendation?.rationale ?? "Plano gerado a partir de biblioteca segura quando os dados forem insuficientes.",
      safety: storySequence.safetyStatus === "block" ? "revisar" : storySequence.safetyStatus === "review" ? "atencao" : "seguro",
      readiness: storySequence.safetyStatus === "low" ? 88 : 72,
      exportText: [
        `Data: ${date}`,
        `Tema: ${theme}`,
        `Formato: ${format}`,
        `Midia: ${mediaNeeded.join(", ")}`,
        "Stories:",
        ...stories.map((story, storyIndex) => `- Story ${storyIndex + 1}: ${story}`)
      ].join("\n")
    };
  });
  return {
    period,
    days,
    googleAgenda: exportNextWeekGoogleAgenda(days),
    tsv: exportNextWeekTsv(days)
  };
}

function exportNextWeekGoogleAgenda(days: NextWeekDayPlan[]): string {
  return days.map((day) => [
    `Titulo: Conteudo Dr. Cadu - ${day.theme}`,
    "Descricao:",
    `- Data: ${day.date}`,
    `- Pilar: ${day.pillar}`,
    `- Formato: ${day.format}`,
    `- Midia: ${day.mediaNeeded.join(", ")}`,
    `- Safety: ${day.safety}`,
    `- Justificativa: ${day.rationale}`
  ].join("\n")).join("\n\n");
}

function exportNextWeekTsv(days: NextWeekDayPlan[]): string {
  return [
    "Data\tDia\tTema\tPilar\tFormato\tMidia\tReadiness\tSafety\tJustificativa",
    ...days.map((day) => [day.date, day.weekday, day.theme, day.pillar, day.format, day.mediaNeeded.join(", "), day.readiness, day.safety, day.rationale].join("\t"))
  ].join("\n");
}
