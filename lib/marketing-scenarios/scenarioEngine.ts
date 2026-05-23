import {
  buildCampaignExportBundle,
  buildDailyMediaChecklistItems,
  buildDailyMediaSuggestions,
  buildSafetyGateFromIssues,
  buildCarouselPlan,
  buildPostPlan,
  buildReelPlan,
  buildMediaChecklist,
  createGovernanceIssue,
  evaluateMediaText,
  exportDayText,
  exportWeekText,
  generateMonthlyEditorialPlan,
  getEditorialPillarById,
  mergeSafetyGates,
  runMonthlySafetyGate,
  type CampaignPlan,
  type CampaignSummary,
  type EditorialDay,
  type EditorialStatus,
  type EditorialWeek,
  type SafetyGateResult,
  type SafetyIssue,
  type SafetyIssueSeverity
} from "@/lib/monthly-editorial";
import { buildDailyExecutionPlan } from "@/lib/marketing-ops";
import {
  buildStoryOpsSequence,
  storyOpsSafetyStatusLabel,
  type StoryRiskLevel,
  type StorySequence
} from "@/lib/storyops";
import { PILOT_WEEK_CAMPAIGN_INPUT, PILOT_WEEK_CAMPAIGN_NAME, PILOT_WEEK_DAYS } from "@/lib/marketing-scenarios/pilotWeek";
import { buildPilotWeekExportBundle } from "@/lib/marketing-scenarios/scenarioExports";
import type { PilotDayDefinition, PilotDayScenario, PilotWeekScenario, PilotWeekSummary } from "@/lib/marketing-scenarios/types";

const generatedAt = new Date("2026-05-23T12:00:00.000Z");

export function buildPilotWeekScenario(): PilotWeekScenario {
  const basePlan = generateMonthlyEditorialPlan(PILOT_WEEK_CAMPAIGN_INPUT);
  const editorialDays = PILOT_WEEK_DAYS.map((definition, index) => buildPilotEditorialDay(definition, index));
  const mediaChecklist = buildMediaChecklist(editorialDays);
  const weeks = buildPilotWeeks(editorialDays);
  const summary = summarizeCampaign(editorialDays, mediaChecklist.gaps.length);
  const safetyGate = buildPilotSafetyGate(editorialDays);
  const planCore: Omit<CampaignPlan, "exports"> = {
    ...basePlan,
    id: "campaign-semana-piloto-cirurgia-plastica-sem-promessa-2026-05-24",
    name: PILOT_WEEK_CAMPAIGN_NAME,
    startDate: PILOT_WEEK_DAYS[0].date,
    endDate: PILOT_WEEK_DAYS.at(-1)?.date ?? PILOT_WEEK_DAYS[0].date,
    durationDays: PILOT_WEEK_DAYS.length,
    objective: String(PILOT_WEEK_CAMPAIGN_INPUT.objective),
    targetAudience: PILOT_WEEK_CAMPAIGN_INPUT.targetAudience ?? basePlan.targetAudience,
    tone: PILOT_WEEK_CAMPAIGN_INPUT.tone ?? basePlan.tone,
    intensity: "padrao",
    activeChannels: PILOT_WEEK_CAMPAIGN_INPUT.activeChannels ?? basePlan.activeChannels,
    priorityPillars: PILOT_WEEK_CAMPAIGN_INPUT.priorityPillars ?? basePlan.priorityPillars,
    neutralNotes: PILOT_WEEK_CAMPAIGN_INPUT.neutralNotes ?? basePlan.neutralNotes,
    editorialRestrictions: PILOT_WEEK_CAMPAIGN_INPUT.editorialRestrictions ?? basePlan.editorialRestrictions,
    weeks,
    days: editorialDays,
    summary,
    mediaChecklist,
    safetyGate,
    createdAt: generatedAt
  };
  const campaignPlan: CampaignPlan = {
    ...planCore,
    exports: buildCampaignExportBundle(planCore)
  };
  const executionDays = editorialDays.map(buildDailyExecutionPlan);
  const pilotSummary = buildPilotSummary(campaignPlan, executionDays);

  return {
    id: "pilot-week-2026-05-24-2026-05-30",
    campaignPlan,
    days: executionDays.map((execution, index) => ({
      definition: PILOT_WEEK_DAYS[index],
      editorialDay: editorialDays[index],
      execution,
      readiness: execution.readiness,
      safetyGate: execution.sourceDay.safetyGate,
      tasks: execution.tasks,
      exportText: execution.quickExport
    })),
    summary: pilotSummary,
    safetyGate,
    exports: buildPilotWeekExportBundle(campaignPlan, executionDays, pilotSummary),
    generatedAt
  };
}

export function buildPilotEditorialDay(definition: PilotDayDefinition, index: number): EditorialDay {
  const dayNumber = index + 1;
  const weekNumber = 1;
  const weekend = definition.weekday === "Domingo" || definition.weekday === "Sabado";
  const pillar = getEditorialPillarById(definition.pillarId);

  if (!pillar) {
    throw new Error(`Pilar editorial ausente na semana piloto: ${definition.pillarId}`);
  }

  const storySequence = buildStoryOpsSequence({
    date: definition.date,
    theme: definition.theme,
    editorialLine: definition.editorialLine,
    neutralContext: PILOT_WEEK_CAMPAIGN_INPUT.neutralNotes
  });
  const reelPlan = definition.hasReel ? buildReelPlan(definition.date, dayNumber, definition.theme, pillar) : undefined;
  const postOrCarousel = definition.hasPostOrCarousel
    ? dayNumber % 2 === 0
      ? { carouselPlan: buildCarouselPlan(definition.date, dayNumber, definition.theme, pillar) }
      : { postPlan: buildPostPlan(definition.date, dayNumber, definition.theme, pillar) }
    : {};
  const mediaSuggestions = buildDailyMediaSuggestions(dayNumber, weekend);
  const mediaChecklistItems = buildDailyMediaChecklistItems(mediaSuggestions);
  const safetyGate = buildPilotDaySafetyGate({
    definition,
    storySequence,
    reelText: reelPlan?.exportText,
    postText: postOrCarousel.postPlan?.exportText ?? postOrCarousel.carouselPlan?.exportText,
    mediaText: mediaSuggestions.map((media) => `${media.label} ${media.description}`).join(" ")
  });
  const editorialStatus = getEditorialStatus(safetyGate);
  const draft: Omit<EditorialDay, "exportText"> = {
    id: `pilot-day-${definition.date}`,
    date: definition.date,
    weekday: definition.weekday,
    dayNumber,
    weekNumber,
    pillar,
    theme: definition.theme,
    dailyObjective: definition.objective,
    tone: definition.tone,
    content: {
      storySequence,
      reelPlan,
      postPlan: postOrCarousel.postPlan,
      carouselPlan: postOrCarousel.carouselPlan
    },
    mediaSuggestions,
    mediaChecklistItems,
    safetyGate,
    editorialStatus,
    notes: definition.note
  };

  return {
    ...draft,
    exportText: exportDayText(draft as EditorialDay)
  };
}

export function buildPilotSummary(plan: CampaignPlan, executionDays = plan.days.map(buildDailyExecutionPlan)): PilotWeekSummary {
  const averageReadiness = Math.round(executionDays.reduce((total, day) => total + day.readiness.score, 0) / executionDays.length);
  const totalBlockedItems = executionDays.filter((day) => day.risk === "bloquear").length;
  const status: PilotWeekSummary["status"] = totalBlockedItems > 0 ? "bloqueado" : averageReadiness < 60 ? "revisar" : "aprovado";

  return {
    campaignName: plan.name,
    period: `${plan.startDate} a ${plan.endDate}`,
    totalDays: executionDays.length,
    totalStories: executionDays.reduce((total, day) => total + day.sourceDay.content.storySequence.items.length, 0),
    totalReels: executionDays.filter((day) => day.reelExport).length,
    totalPostsAndCarousels: executionDays.filter((day) => day.postExport).length,
    totalTasks: executionDays.reduce((total, day) => total + day.tasks.length, 0),
    totalSafetyAlerts: executionDays.reduce((total, day) => total + day.sourceDay.safetyGate.issues.length, 0),
    totalBlockedItems,
    averageReadiness,
    status
  };
}

function buildPilotDaySafetyGate({
  definition,
  storySequence,
  reelText,
  postText,
  mediaText
}: {
  definition: PilotDayDefinition;
  storySequence: StorySequence;
  reelText?: string;
  postText?: string;
  mediaText: string;
}): SafetyGateResult {
  return mergeSafetyGates([
    runMonthlySafetyGate([definition.theme, definition.objective, reelText, postText].filter(Boolean).join(" "), "semana-piloto"),
    storySafetyGate(storySequence),
    evaluateMediaText(mediaText)
  ]);
}

function storySafetyGate(sequence: StorySequence): SafetyGateResult {
  const issues: SafetyIssue[] = sequence.safetyChecks
    .filter((check) => check.status !== "low")
    .map((check) => ({
      id: `storyops-${check.id}`,
      category: check.status === "block" ? "termo_proibido" : "governanca",
      term: check.label,
      message: `StoryOps: ${check.message}`,
      severity: storyRiskToSeverity(check.status),
      suggestion: `Revisar StoryOps: ${storyOpsSafetyStatusLabel(check.status)}.`,
      blocks: check.status === "block"
    }));
  return buildSafetyGateFromIssues(issues);
}

function storyRiskToSeverity(status: StoryRiskLevel): SafetyIssueSeverity {
  if (status === "block") return "critical";
  if (status === "review") return "warning";
  if (status === "attention") return "attention";
  return "info";
}

function buildPilotWeeks(days: EditorialDay[]): EditorialWeek[] {
  const weekDraft: Omit<EditorialWeek, "exportText"> = {
    id: "pilot-week-1",
    weekNumber: 1,
    startDate: days[0]?.date ?? "",
    endDate: days.at(-1)?.date ?? "",
    theme: "Cirurgia plastica sem promessa",
    objective: "Provar que o sistema consegue gerar uma semana segura, exportavel e pronta para revisao humana.",
    days
  };
  return [
    {
      ...weekDraft,
      exportText: exportWeekText(weekDraft)
    }
  ];
}

function summarizeCampaign(days: EditorialDay[], mediaGaps: number): CampaignSummary {
  return {
    totalDays: days.length,
    totalStories: days.reduce((total, day) => total + day.content.storySequence.items.length, 0),
    totalReels: days.filter((day) => day.content.reelPlan).length,
    totalPostsAndCarousels: days.filter((day) => day.content.postPlan || day.content.carouselPlan).length,
    totalSafetyAlerts: days.reduce((total, day) => total + day.safetyGate.issues.length, 0),
    blockedItems: days.filter((day) => day.safetyGate.blocks).length,
    mediaSuggestions: days.reduce((total, day) => total + day.mediaSuggestions.length, 0),
    mediaGaps
  };
}

function buildPilotSafetyGate(days: EditorialDay[]): SafetyGateResult {
  return mergeSafetyGates([
    mergeSafetyGates(days.map((day) => day.safetyGate)),
    buildSafetyGateFromIssues([
      createGovernanceIssue("semana-piloto-manual", "Semana piloto interna: sem API externa, sem publicacao automatica e sem dados de pacientes.", "info")
    ])
  ]);
}

function getEditorialStatus(safetyGate: SafetyGateResult): EditorialStatus {
  if (safetyGate.classification === "bloquear") return "bloqueado";
  if (safetyGate.classification === "revisar_antes_de_postar") return "revisar";
  if (safetyGate.classification === "atencao") return "rascunho";
  return "ideia";
}
