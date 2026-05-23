import type { CampaignExportBundle, CampaignPlan, EditorialDay, EditorialWeek } from "@/lib/monthly-editorial/types";

export function buildCampaignExportBundle(plan: Omit<CampaignPlan, "exports">): CampaignExportBundle {
  return {
    monthly_markdown: exportMonthlyPlanMarkdown(plan),
    week_text: exportWeekText(plan.weeks[0]),
    day_text: exportDayText(plan.days[0]),
    stories: exportStories(plan),
    reels: exportReelsScripts(plan),
    posts: exportPostsAndCarousels(plan),
    media_checklist: exportMediaChecklist(plan),
    video_editor_brief: exportVideoEditorBrief(plan),
    google_sheets_tsv: exportGoogleSheetsTsv(plan),
    google_agenda_text: exportGoogleAgendaText(plan)
  };
}

export function exportMonthlyPlanMarkdown(plan: Omit<CampaignPlan, "exports">): string {
  return [
    `# ${plan.name}`,
    "",
    `Periodo: ${plan.startDate} a ${plan.endDate}`,
    `Objetivo: ${plan.objective}`,
    `Publico: ${plan.targetAudience}`,
    `Tom: ${plan.tone}`,
    `Intensidade: ${plan.intensity}`,
    "",
    "## Resumo",
    `- Dias: ${plan.summary.totalDays}`,
    `- Stories: ${plan.summary.totalStories}`,
    `- Reels: ${plan.summary.totalReels}`,
    `- Posts/carrosseis: ${plan.summary.totalPostsAndCarousels}`,
    `- Alertas de seguranca: ${plan.summary.totalSafetyAlerts}`,
    "",
    "## Semanas",
    ...plan.weeks.flatMap((week) => [
      "",
      `### Semana ${week.weekNumber} - ${week.theme}`,
      `Objetivo: ${week.objective}`,
      ...week.days.map((day) => `- ${day.date} (${day.weekday}) - ${day.pillar.name}: ${day.theme} [${day.editorialStatus}]`)
    ]),
    "",
    "## Guardrail",
    "Plano interno, deterministico, sem API externa, sem publicacao automatica e sem dados de pacientes."
  ].join("\n");
}

export function exportWeekText(week?: EditorialWeek | Omit<EditorialWeek, "exportText">): string {
  if (!week) return "Semana indisponivel.";
  return [
    `Semana ${week.weekNumber}: ${week.startDate} a ${week.endDate}`,
    `Tema da semana: ${week.theme}`,
    `Objetivo: ${week.objective}`,
    "",
    ...week.days.map((day) => `- ${day.weekday} ${day.date}: ${day.theme} | Stories: 6 | Reel: ${day.content.reelPlan ? "sim" : "nao"} | Post: ${day.content.postPlan || day.content.carouselPlan ? "sim" : "nao"} | Risco: ${day.safetyGate.classification}`)
  ].join("\n");
}

export function exportDayText(day?: EditorialDay): string {
  if (!day) return "Dia indisponivel.";
  return [
    `Dia ${day.dayNumber} - ${day.weekday} (${day.date})`,
    `Pilar: ${day.pillar.name}`,
    `Tema: ${day.theme}`,
    `Objetivo: ${day.dailyObjective}`,
    `Tom: ${day.tone}`,
    "",
    "Stories:",
    day.content.storySequence.exportText,
    "",
    day.content.reelPlan ? day.content.reelPlan.exportText : "Reel: nao previsto para este dia.",
    "",
    day.content.carouselPlan ? day.content.carouselPlan.exportText : day.content.postPlan ? day.content.postPlan.exportText : "Post/carrossel: nao previsto para este dia.",
    "",
    "Midias sugeridas:",
    ...day.mediaSuggestions.map((media) => `- ${media.label}: ${media.captureGuidance}`),
    "",
    `Seguranca: ${day.safetyGate.classification} (${day.safetyGate.score}/100)`,
    `Status: ${day.editorialStatus}`
  ].join("\n");
}

export function exportStories(plan: Omit<CampaignPlan, "exports">): string {
  return plan.days.map((day) => [`# ${day.date} - ${day.theme}`, day.content.storySequence.exportText].join("\n")).join("\n\n---\n\n");
}

export function exportReelsScripts(plan: Omit<CampaignPlan, "exports">): string {
  const reels = plan.days.flatMap((day) => (day.content.reelPlan ? [day.content.reelPlan.exportText] : []));
  return reels.length ? reels.join("\n\n---\n\n") : "Nenhum reel previsto.";
}

export function exportPostsAndCarousels(plan: Omit<CampaignPlan, "exports">): string {
  const posts = plan.days.flatMap((day) => {
    if (day.content.carouselPlan) return [day.content.carouselPlan.exportText];
    if (day.content.postPlan) return [day.content.postPlan.exportText];
    return [];
  });
  return posts.length ? posts.join("\n\n---\n\n") : "Nenhum post/carrossel previsto.";
}

export function exportMediaChecklist(plan: Omit<CampaignPlan, "exports">): string {
  return [
    "# Checklist MediaOps",
    "",
    "## Itens mensais",
    ...plan.mediaChecklist.monthlyItems.map((item) => `- ${item.label}: ${item.currentCount}/${item.targetCount} (${item.status})`),
    "",
    "## Lacunas",
    ...(plan.mediaChecklist.gaps.length ? plan.mediaChecklist.gaps.map((gap) => `- ${gap}`) : ["- nenhuma lacuna critica no plano atual"]),
    "",
    "## Itens proibidos",
    ...plan.mediaChecklist.prohibitedItems.map((item) => `- ${item}`)
  ].join("\n");
}

export function exportVideoEditorBrief(plan: Omit<CampaignPlan, "exports">): string {
  const reelDays = plan.days.filter((day) => day.content.reelPlan);
  return [
    "# Briefing para editor de video",
    "",
    "Objetivo: transformar roteiros curtos em videos sobrios, educativos e sem promessa.",
    "Padrao visual: cortes simples, legenda clara, fundo neutro, sem paciente, sem local identificavel.",
    "",
    ...reelDays.map((day) => `- ${day.date}: ${day.content.reelPlan?.title} | Cena: ${day.content.reelPlan?.sceneSuggestion} | Risco: ${day.content.reelPlan?.editorialRisk}`)
  ].join("\n");
}

export function exportGoogleSheetsTsv(plan: Omit<CampaignPlan, "exports">): string {
  const header = "Data\tDia da semana\tPilar\tTema\tStories\tReel\tPost\tMidia sugerida\tStatus\tRisco\tObservacoes";
  const rows = plan.days.map((day) =>
    [
      day.date,
      day.weekday,
      day.pillar.name,
      day.theme,
      day.content.storySequence.items.length,
      day.content.reelPlan ? "sim" : "nao",
      day.content.postPlan || day.content.carouselPlan ? "sim" : "nao",
      day.mediaSuggestions.map((media) => media.label).join(" + "),
      day.editorialStatus,
      day.safetyGate.classification,
      day.notes
    ].join("\t")
  );
  return [header, ...rows].join("\n");
}

export function exportGoogleAgendaText(plan: Omit<CampaignPlan, "exports">): string {
  return plan.days
    .map((day) =>
      [
        "Titulo:",
        `Conteudo Dr. Cadu - ${day.theme}`,
        "",
        "Descricao:",
        `- Pilar: ${day.pillar.name}`,
        `- Stories: 6 stories internos, publicacao manual`,
        `- Reel: ${day.content.reelPlan ? day.content.reelPlan.title : "nao previsto"}`,
        `- Post: ${day.content.carouselPlan?.title ?? day.content.postPlan?.title ?? "nao previsto"}`,
        `- Midia: ${day.mediaSuggestions.map((media) => media.label).join(" + ")}`,
        `- Seguranca: ${day.safetyGate.classification}`,
        `- Status: ${day.editorialStatus}`
      ].join("\n")
    )
    .join("\n\n---\n\n");
}
