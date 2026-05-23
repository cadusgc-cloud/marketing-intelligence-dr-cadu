import {
  buildStoryOpsSequence,
  storyOpsSafetyStatusLabel,
  type StoryRiskLevel,
  type StorySequence
} from "@/lib/storyops";
import { buildCampaignExportBundle, exportDayText, exportWeekText } from "@/lib/monthly-editorial/export";
import { EDITORIAL_PILLARS, getDefaultPriorityPillars, getEditorialPillarById } from "@/lib/monthly-editorial/pillars";
import { buildDailyMediaChecklistItems, buildDailyMediaSuggestions, buildMediaChecklist, evaluateMediaText } from "@/lib/monthly-editorial/media";
import { buildCarouselPlan, buildPostPlan } from "@/lib/monthly-editorial/posts";
import { buildReelPlan } from "@/lib/monthly-editorial/reels";
import { findThemesForPillar, MONTHLY_EDITORIAL_THEMES } from "@/lib/monthly-editorial/themes";
import {
  buildSafetyGateFromIssues,
  createGovernanceIssue,
  mergeSafetyGates,
  runMonthlySafetyGate
} from "@/lib/monthly-editorial/safety";
import type {
  CampaignInput,
  CampaignIntensity,
  CampaignPlan,
  CampaignSummary,
  ContentChannel,
  EditorialDay,
  EditorialPillar,
  EditorialPillarId,
  EditorialStatus,
  EditorialWeek,
  CarouselPlan,
  PostPlan,
  SafetyGateResult,
  SafetyIssue,
  SafetyIssueSeverity
} from "@/lib/monthly-editorial/types";

const defaultStartDate = "2026-05-24";
const createdAt = new Date("2026-05-23T12:00:00.000Z");

export const DEFAULT_CAMPAIGN_INPUT: Required<Omit<CampaignInput, "durationDays">> & { durationDays: number } = {
  name: "Cirurgia plastica sem promessa",
  startDate: defaultStartDate,
  durationDays: 30,
  objective: "Fortalecer autoridade, naturalidade e expectativa realista",
  targetAudience: "Pacientes que estao pensando em cirurgia plastica e precisam de informacao clara antes de decidir",
  tone: "humano, cientifico simples, anti-marketing elegante",
  intensity: "padrao",
  priorityPillars: getDefaultPriorityPillars(),
  activeChannels: [
    "instagram_stories",
    "instagram_reels",
    "instagram_feed",
    "instagram_carrossel",
    "tiktok",
    "youtube_shorts",
    "youtube_video",
    "facebook",
    "google_business_profile"
  ],
  neutralNotes: "Usar apenas contexto neutro, sem local, paciente, agenda ou bastidor especifico.",
  editorialRestrictions: [
    "sem promessa de resultado",
    "sem conduta individual",
    "sem exposicao de paciente",
    "sem publicacao automatica",
    "sem API externa"
  ]
};

export function generateMonthlyEditorialPlan(input: CampaignInput = {}): CampaignPlan {
  const normalizedInput = normalizeCampaignInput(input);
  const startDate = parseDateAsLocal(normalizedInput.startDate) ?? parseDateAsLocal(defaultStartDate)!;
  const days: EditorialDay[] = [];
  const pillars = resolvePriorityPillars(normalizedInput.priorityPillars);

  for (let index = 0; index < normalizedInput.durationDays; index += 1) {
    const date = addDays(startDate, index);
    const dateString = formatDate(date);
    const dayNumber = index + 1;
    const weekNumber = Math.floor(index / 7) + 1;
    const weekday = weekdayName(date);
    const weekend = isWeekend(date);
    const pillar = pickPillar(pillars, index, weekend);
    const theme = pickTheme(pillar, index, weekend);
    const tone = weekend ? "leve, humano e nao localizado" : `${normalizedInput.tone}; ${pillar.recommendedTone}`;
    const dailyObjective = buildDailyObjective(theme, pillar, weekend);
    const storySequence = buildStoryOpsSequence({
      date: dateString,
      theme,
      editorialLine: pillar.storyEditorialLine,
      neutralContext: normalizedInput.neutralNotes
    });
    const reelPlan = shouldCreateReel(date, normalizedInput.intensity, normalizedInput.activeChannels)
      ? buildReelPlan(dateString, dayNumber, theme, pillar)
      : undefined;
    const contentPlan: { postPlan?: PostPlan; carouselPlan?: CarouselPlan } = shouldCreatePostOrCarousel(date, normalizedInput.intensity, normalizedInput.activeChannels)
      ? buildPostOrCarousel(dateString, dayNumber, theme, pillar)
      : {};
    const mediaSuggestions = buildDailyMediaSuggestions(dayNumber, weekend);
    const mediaChecklistItems = buildDailyMediaChecklistItems(mediaSuggestions);
    const safetyGate = buildDaySafetyGate({
      theme,
      dailyObjective,
      storySequence,
      reelText: reelPlan?.exportText,
      postText: contentPlan.postPlan?.exportText ?? contentPlan.carouselPlan?.exportText,
      mediaText: mediaSuggestions.map((media) => `${media.label} ${media.description}`).join(" ")
    });
    const editorialStatus = getEditorialStatus(safetyGate);
    const dayDraft: Omit<EditorialDay, "exportText"> = {
      id: `day-${dateString}`,
      date: dateString,
      weekday,
      dayNumber,
      weekNumber,
      pillar,
      theme,
      dailyObjective,
      tone,
      content: {
        storySequence,
        reelPlan,
        postPlan: contentPlan.postPlan,
        carouselPlan: contentPlan.carouselPlan
      },
      mediaSuggestions,
      mediaChecklistItems,
      safetyGate,
      editorialStatus,
      notes: weekend
        ? "Fim de semana: manter presenca leve, sem fingir rotina em tempo real."
        : "Conteudo interno para revisao humana e publicacao manual."
    };
    const day = {
      ...dayDraft,
      exportText: exportDayText(dayDraft as EditorialDay)
    };
    days.push(day);
  }

  const mediaChecklist = buildMediaChecklist(days);
  const weeks = buildWeeks(days);
  const summary = summarizeCampaign(days, mediaChecklist.gaps.length);
  const endDate = days.at(-1)?.date ?? normalizedInput.startDate;
  const planSafetyGate = buildCampaignSafetyGate(days, normalizedInput.startDate, endDate);
  const planCore: Omit<CampaignPlan, "exports"> = {
    id: `campaign-${slugify(normalizedInput.name)}-${normalizedInput.startDate}`,
    name: normalizedInput.name,
    startDate: normalizedInput.startDate,
    endDate,
    durationDays: normalizedInput.durationDays,
    objective: normalizedInput.objective,
    targetAudience: normalizedInput.targetAudience,
    tone: normalizedInput.tone,
    intensity: normalizedInput.intensity,
    activeChannels: normalizedInput.activeChannels,
    priorityPillars: normalizedInput.priorityPillars,
    neutralNotes: normalizedInput.neutralNotes,
    editorialRestrictions: normalizedInput.editorialRestrictions,
    weeks,
    days,
    summary,
    mediaChecklist,
    safetyGate: planSafetyGate,
    createdAt
  };

  return {
    ...planCore,
    exports: buildCampaignExportBundle(planCore)
  };
}

export function normalizeCampaignInput(input: CampaignInput): Required<Omit<CampaignInput, "durationDays">> & { durationDays: number } {
  const startDate = isDateString(input.startDate) ? input.startDate : DEFAULT_CAMPAIGN_INPUT.startDate;
  const durationDays = clampDuration(input.durationDays ?? DEFAULT_CAMPAIGN_INPUT.durationDays);
  const intensity = isCampaignIntensity(input.intensity) ? input.intensity : DEFAULT_CAMPAIGN_INPUT.intensity;
  const priorityPillars = (input.priorityPillars?.length ? input.priorityPillars : DEFAULT_CAMPAIGN_INPUT.priorityPillars).filter((id) =>
    Boolean(getEditorialPillarById(id))
  );

  return {
    name: input.name?.trim() || DEFAULT_CAMPAIGN_INPUT.name,
    startDate,
    durationDays,
    objective: String(input.objective || DEFAULT_CAMPAIGN_INPUT.objective),
    targetAudience: input.targetAudience?.trim() || DEFAULT_CAMPAIGN_INPUT.targetAudience,
    tone: input.tone?.trim() || DEFAULT_CAMPAIGN_INPUT.tone,
    intensity,
    priorityPillars: priorityPillars.length ? priorityPillars : DEFAULT_CAMPAIGN_INPUT.priorityPillars,
    activeChannels: input.activeChannels?.length ? input.activeChannels : DEFAULT_CAMPAIGN_INPUT.activeChannels,
    neutralNotes: input.neutralNotes?.trim() || DEFAULT_CAMPAIGN_INPUT.neutralNotes,
    editorialRestrictions: input.editorialRestrictions?.length ? input.editorialRestrictions : DEFAULT_CAMPAIGN_INPUT.editorialRestrictions
  };
}

export function campaignIntensityLabel(intensity: CampaignIntensity): string {
  return {
    leve: "Leve",
    padrao: "Padrao",
    intensa: "Intensa"
  }[intensity];
}

export function contentChannelLabel(channel: ContentChannel): string {
  return {
    instagram_stories: "Instagram Stories",
    instagram_reels: "Instagram Reels",
    instagram_feed: "Instagram Feed",
    instagram_carrossel: "Instagram Carrossel",
    tiktok: "TikTok",
    youtube_shorts: "YouTube Shorts",
    youtube_video: "YouTube video longo",
    facebook: "Facebook",
    google_business_profile: "Google Perfil da Empresa"
  }[channel];
}

function buildPostOrCarousel(date: string, dayNumber: number, theme: string, pillar: EditorialPillar) {
  if (dayNumber % 2 === 0) {
    return { carouselPlan: buildCarouselPlan(date, dayNumber, theme, pillar) };
  }
  return { postPlan: buildPostPlan(date, dayNumber, theme, pillar) };
}

function buildDaySafetyGate({
  theme,
  dailyObjective,
  storySequence,
  reelText,
  postText,
  mediaText
}: {
  theme: string;
  dailyObjective: string;
  storySequence: StorySequence;
  reelText?: string;
  postText?: string;
  mediaText: string;
}): SafetyGateResult {
  return mergeSafetyGates([
    runMonthlySafetyGate([theme, dailyObjective, reelText, postText].filter(Boolean).join(" "), "dia"),
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

function buildCampaignSafetyGate(days: EditorialDay[], startDate: string, endDate: string): SafetyGateResult {
  const merged = mergeSafetyGates(days.map((day) => day.safetyGate));
  const governanceIssues: SafetyIssue[] = [];

  if (rangeTouchesDecember2025(startDate, endDate)) {
    governanceIssues.push(createGovernanceIssue("dezembro-2025-anomalia", "Dezembro/2025 e anomalia operacional e nao deve entrar em benchmarks, projecoes ou recomendacoes normais.", "warning"));
  }

  governanceIssues.push(createGovernanceIssue("publicacao-manual", "Campanha interna: nao publica, nao agenda e nao chama APIs externas.", "info"));

  return mergeSafetyGates([merged, buildSafetyGateFromIssues(governanceIssues)]);
}

function buildWeeks(days: EditorialDay[]): EditorialWeek[] {
  const weeks: EditorialWeek[] = [];
  for (let index = 0; index < days.length; index += 7) {
    const weekDays = days.slice(index, index + 7);
    const weekNumber = Math.floor(index / 7) + 1;
    const week: Omit<EditorialWeek, "exportText"> = {
      id: `week-${weekNumber}`,
      weekNumber,
      startDate: weekDays[0]?.date ?? "",
      endDate: weekDays.at(-1)?.date ?? "",
      theme: weekDays[0]?.theme ?? "semana editorial",
      objective: `Manter presenca diaria e desenvolver ${weekDays[0]?.pillar.name.toLowerCase() ?? "pilar editorial"} com seguranca.`,
      days: weekDays
    };
    weeks.push({
      ...week,
      exportText: exportWeekText(week)
    });
  }
  return weeks;
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

function getEditorialStatus(safetyGate: SafetyGateResult): EditorialStatus {
  if (safetyGate.classification === "bloquear") return "bloqueado";
  if (safetyGate.classification === "revisar_antes_de_postar") return "revisar";
  if (safetyGate.classification === "atencao") return "rascunho";
  return "ideia";
}

function resolvePriorityPillars(priorityPillars: EditorialPillarId[]): EditorialPillar[] {
  const pillars = priorityPillars.map((id) => getEditorialPillarById(id)).filter(Boolean) as EditorialPillar[];
  return pillars.length ? pillars : EDITORIAL_PILLARS.slice(0, 6);
}

function pickPillar(pillars: EditorialPillar[], dayIndex: number, weekend: boolean): EditorialPillar {
  if (weekend) {
    return pillars.find((pillar) => pillar.id === "bastidores_neutros_humanos") ?? pillars[dayIndex % pillars.length];
  }
  return pillars[(dayIndex + Math.floor(dayIndex / 7)) % pillars.length];
}

function pickTheme(pillar: EditorialPillar, dayIndex: number, weekend: boolean): string {
  const themes = findThemesForPillar(pillar.id, weekend);
  const pool = themes.length ? themes : MONTHLY_EDITORIAL_THEMES;
  return pool[(dayIndex + pillar.id.length) % pool.length].label;
}

function buildDailyObjective(theme: string, pillar: EditorialPillar, weekend: boolean): string {
  if (weekend) return `Manter presenca leve sobre ${theme}, sem afirmar agenda real ou bastidor acontecendo agora.`;
  return `Transformar ${theme} em conteudo educativo e seguro dentro do pilar ${pillar.name}.`;
}

function shouldCreateReel(date: Date, intensity: CampaignIntensity, activeChannels: ContentChannel[]): boolean {
  if (!activeChannels.some((channel) => ["instagram_reels", "tiktok", "youtube_shorts"].includes(channel))) return false;
  const day = date.getDay();
  const schedule: Record<CampaignIntensity, number[]> = {
    leve: [1, 4],
    padrao: [1, 3, 5],
    intensa: [1, 2, 4, 5, 6]
  };
  return schedule[intensity].includes(day);
}

function shouldCreatePostOrCarousel(date: Date, intensity: CampaignIntensity, activeChannels: ContentChannel[]): boolean {
  if (!activeChannels.some((channel) => ["instagram_feed", "instagram_carrossel", "facebook", "google_business_profile"].includes(channel))) return false;
  const day = date.getDay();
  const schedule: Record<CampaignIntensity, number[]> = {
    leve: [2, 5],
    padrao: [2, 4, 6],
    intensa: [0, 1, 3, 5]
  };
  return schedule[intensity].includes(day);
}

function rangeTouchesDecember2025(startDate: string, endDate: string): boolean {
  const start = parseDateAsLocal(startDate);
  const end = parseDateAsLocal(endDate);
  if (!start || !end) return false;
  const anomalyStart = new Date(2025, 11, 1);
  const anomalyEnd = new Date(2025, 11, 31);
  return start <= anomalyEnd && end >= anomalyStart;
}

function isCampaignIntensity(value: unknown): value is CampaignIntensity {
  return value === "leve" || value === "padrao" || value === "intensa";
}

function clampDuration(value: number): number {
  if (!Number.isFinite(value)) return 30;
  return Math.max(1, Math.min(60, Math.floor(value)));
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function weekdayName(date: Date): string {
  return ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"][date.getDay()];
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function parseDateAsLocal(value: string): Date | null {
  if (!isDateString(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "campanha";
}
