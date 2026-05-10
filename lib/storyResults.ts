import type { ContentFunnelStage } from "@/lib/contentStudio";
import type { PatientPrivacyRisk, StorySlotType } from "@/lib/mediaLibrary";
import {
  buildStoryDayExecutionBoard,
  type StoryDayExecutionBoard,
  type StoryExecutionItem
} from "@/lib/storyExecutionBoard";

export type StoryResultStatus =
  | "not_published"
  | "published"
  | "results_pending"
  | "results_recorded"
  | "needs_analysis"
  | "high_performance"
  | "low_performance";

export type StoryResultSignal =
  | "strong_engagement"
  | "low_engagement"
  | "generated_replies"
  | "generated_whatsapp"
  | "good_cta"
  | "weak_cta"
  | "ethical_attention"
  | "reuse_candidate"
  | "avoid_repeating"
  | "needs_more_data";

export type StoryResultMetricField =
  | "views"
  | "replies"
  | "stickerInteractions"
  | "linkClicks"
  | "profileVisits"
  | "whatsappConversations"
  | "saves"
  | "shares";

export type StoryResultItem = {
  id: string;
  executionItemId: string;
  dayLabel: string;
  order: number;
  slotType: StorySlotType;
  suggestedFilename: string;
  publishedUrl: string;
  publishedAt: string;
  views: number | null;
  replies: number | null;
  stickerInteractions: number | null;
  linkClicks: number | null;
  profileVisits: number | null;
  whatsappConversations: number | null;
  saves: number | null;
  shares: number | null;
  notes: string;
  resultStatus: StoryResultStatus;
  signals: StoryResultSignal[];
  learning: string;
  shouldReuse: boolean;
  shouldAvoid: boolean;
  createdAt: Date;
  updatedAt: Date;
  slotTypeLabel: string;
  suggestedText: string;
  cta: string;
  funnelStage: ContentFunnelStage;
  pillar: string;
  privacyRisk: PatientPrivacyRisk;
  ethicalWarnings: string[];
};

export type StoryDayResultSummary = {
  id: string;
  dayLabel: string;
  date: string;
  totalStories: number;
  publishedStories: number;
  resultsRecorded: number;
  totalViews: number;
  totalReplies: number;
  totalStickerInteractions: number;
  totalLinkClicks: number;
  totalProfileVisits: number;
  totalWhatsappConversations: number;
  bestStoryId: string;
  weakestStoryId: string;
  mainLearning: string;
  nextRecommendation: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StoryWeekResultSummary = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  daySummaries: StoryDayResultSummary[];
  totalStories: number;
  totalPublished: number;
  totalResultsRecorded: number;
  totalViews: number;
  totalReplies: number;
  totalLinkClicks: number;
  totalProfileVisits: number;
  totalWhatsappConversations: number;
  bestDay: string;
  weakestDay: string;
  bestStoryId: string;
  reuseCandidates: StoryResultItem[];
  avoidRepeatingItems: StoryResultItem[];
  missingResults: StoryResultItem[];
  mainLearnings: string[];
  nextWeekRecommendations: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type StoryResultInputDraft = {
  id: string;
  storyResultId: string;
  field: StoryResultMetricField | "publishedUrl" | "notes";
  value: string | number | null;
  validationStatus: "valid" | "warning" | "invalid";
  warning: string;
  createdAt: Date;
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");
const dayOrder = ["Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado", "Domingo"];

export function buildStoryResultItemsFromExecutionBoard(board: StoryDayExecutionBoard = buildStoryDayExecutionBoard()): StoryResultItem[] {
  return board.items.map((item) => buildStoryResultItem(item));
}

export function buildStoryResultItem(executionItem: StoryExecutionItem, overrides: Partial<Pick<StoryResultItem, StoryResultMetricField | "publishedUrl" | "notes">> = {}): StoryResultItem {
  const initialStatus = executionItem.executionStatus === "blocked" || executionItem.executionStatus === "skipped" || executionItem.executionStatus === "needs_review"
    ? "not_published"
    : "results_pending";

  const item: StoryResultItem = {
    id: `story-result-${executionItem.id}`,
    executionItemId: executionItem.id,
    dayLabel: executionItem.dayLabel,
    order: executionItem.order,
    slotType: executionItem.slotType,
    suggestedFilename: executionItem.suggestedFilename,
    publishedUrl: "",
    publishedAt: initialStatus === "not_published" ? "" : "publicacao manual simulada",
    views: null,
    replies: null,
    stickerInteractions: null,
    linkClicks: null,
    profileVisits: null,
    whatsappConversations: null,
    saves: null,
    shares: null,
    notes: "",
    resultStatus: initialStatus,
    signals: [],
    learning: "",
    shouldReuse: false,
    shouldAvoid: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    slotTypeLabel: executionItem.slotType,
    suggestedText: executionItem.suggestedText,
    cta: executionItem.cta,
    funnelStage: executionItem.funnelStage,
    pillar: executionItem.pillar,
    privacyRisk: executionItem.privacyRisk,
    ethicalWarnings: executionItem.ethicalWarnings
  };

  return recalculateStoryResultItem({ ...item, ...overrides });
}

export function updateStoryResultMetric(items: StoryResultItem[], itemId: string, field: StoryResultMetricField, value: number | null): StoryResultItem[] {
  return items.map((item) => (item.id === itemId ? recalculateStoryResultItem({ ...item, [field]: normalizeMetricValue(value), updatedAt: new Date(baseDate.getTime() + 1000) }) : item));
}

export function updateStoryResultNotes(items: StoryResultItem[], itemId: string, notes: string): StoryResultItem[] {
  return items.map((item) => (item.id === itemId ? recalculateStoryResultItem({ ...item, notes, updatedAt: new Date(baseDate.getTime() + 1000) }) : item));
}

export function updateStoryResultPublishedUrl(items: StoryResultItem[], itemId: string, publishedUrl: string): StoryResultItem[] {
  return items.map((item) =>
    item.id === itemId
      ? recalculateStoryResultItem({
          ...item,
          publishedUrl,
          publishedAt: publishedUrl ? item.publishedAt || "publicacao manual simulada" : item.publishedAt,
          updatedAt: new Date(baseDate.getTime() + 1000)
        })
      : item
  );
}

export function calculateStoryEngagementScore(item: StoryResultItem): number {
  if (!hasAnyMetric(item)) return 0;

  const weightedInteractions =
    metric(item.replies) * 3 +
    metric(item.stickerInteractions) +
    metric(item.linkClicks) * 4 +
    metric(item.profileVisits) +
    metric(item.whatsappConversations) * 8 +
    metric(item.saves) * 2 +
    metric(item.shares) * 2;

  const views = metric(item.views);
  if (views <= 0) return weightedInteractions > 0 ? round(weightedInteractions * 10) : 0;
  return round((weightedInteractions / views) * 100);
}

export function detectStoryResultSignals(item: StoryResultItem): StoryResultSignal[] {
  const signals: StoryResultSignal[] = [];
  const score = calculateStoryEngagementScore(item);

  if (item.ethicalWarnings.length > 0 || item.privacyRisk !== "low" || hasSensitiveFilename(item.suggestedFilename)) signals.push("ethical_attention");
  if (!hasAnyMetric(item)) signals.push("needs_more_data");
  if (metric(item.replies) > 0) signals.push("generated_replies");
  if (metric(item.whatsappConversations) > 0) signals.push("generated_whatsapp");
  if (metric(item.linkClicks) > 0 || metric(item.whatsappConversations) > 0) signals.push("good_cta");
  if (hasAnyMetric(item) && isCtaStory(item) && metric(item.linkClicks) === 0 && metric(item.whatsappConversations) === 0) signals.push("weak_cta");
  if (score >= 8 || metric(item.replies) >= 4 || metric(item.whatsappConversations) > 0) signals.push("strong_engagement");
  if (hasAnyMetric(item) && score < 1 && metric(item.replies) === 0 && metric(item.linkClicks) === 0 && metric(item.whatsappConversations) === 0) signals.push("low_engagement");
  if (signals.includes("strong_engagement") || signals.includes("generated_whatsapp") || signals.includes("generated_replies")) signals.push("reuse_candidate");
  if (signals.includes("low_engagement") && !signals.includes("generated_replies") && !signals.includes("generated_whatsapp")) signals.push("avoid_repeating");

  return unique(signals);
}

export function summarizeStoryDayResults(items: StoryResultItem[], dayLabel = items[0]?.dayLabel ?? "Dia", date = ""): StoryDayResultSummary {
  const dayItems = items.filter((item) => item.dayLabel === dayLabel);
  const bestStory = getBestPerformingStory(dayItems);
  const weakestStory = getWeakestPerformingStory(dayItems);
  const missing = getStoriesMissingResults(dayItems);

  return {
    id: `story-day-results-${slug(dayLabel)}`,
    dayLabel,
    date,
    totalStories: dayItems.length,
    publishedStories: dayItems.filter((item) => item.resultStatus !== "not_published").length,
    resultsRecorded: dayItems.filter((item) => hasAnyMetric(item)).length,
    totalViews: sumMetric(dayItems, "views"),
    totalReplies: sumMetric(dayItems, "replies"),
    totalStickerInteractions: sumMetric(dayItems, "stickerInteractions"),
    totalLinkClicks: sumMetric(dayItems, "linkClicks"),
    totalProfileVisits: sumMetric(dayItems, "profileVisits"),
    totalWhatsappConversations: sumMetric(dayItems, "whatsappConversations"),
    bestStoryId: bestStory?.id ?? "",
    weakestStoryId: weakestStory?.id ?? "",
    mainLearning: bestStory ? generateStoryResultLearning(bestStory) : "Registrar metricas para gerar aprendizado do dia.",
    nextRecommendation: missing.length > 0 ? "Completar metricas dos stories publicados antes de fechar o aprendizado do dia." : "Usar os melhores sinais para ajustar a proxima sequencia.",
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function summarizeStoryWeekResults(items: StoryResultItem[], weekLabel = "Semana simulada de stories", startDate = "2026-05-11", endDate = "2026-05-17"): StoryWeekResultSummary {
  const labels = dayOrder.filter((day) => items.some((item) => item.dayLabel === day));
  const daySummaries = labels.map((day) => summarizeStoryDayResults(items, day));
  const bestStory = getBestPerformingStory(items);
  const weakestStory = getWeakestPerformingStory(items);
  const reuseCandidates = getReuseCandidates(items);
  const avoidRepeatingItems = getAvoidRepeatingItems(items);
  const missingResults = getStoriesMissingResults(items);
  const bestDay = [...daySummaries].sort((a, b) => b.totalWhatsappConversations - a.totalWhatsappConversations || b.totalReplies - a.totalReplies || b.totalViews - a.totalViews)[0];
  const weakestDay = [...daySummaries].filter((day) => day.resultsRecorded > 0).sort((a, b) => a.totalWhatsappConversations - b.totalWhatsappConversations || a.totalReplies - b.totalReplies || a.totalViews - b.totalViews)[0];

  return {
    id: `story-week-results-${startDate}`,
    weekLabel,
    startDate,
    endDate,
    daySummaries,
    totalStories: items.length,
    totalPublished: items.filter((item) => item.resultStatus !== "not_published").length,
    totalResultsRecorded: items.filter((item) => hasAnyMetric(item)).length,
    totalViews: sumMetric(items, "views"),
    totalReplies: sumMetric(items, "replies"),
    totalLinkClicks: sumMetric(items, "linkClicks"),
    totalProfileVisits: sumMetric(items, "profileVisits"),
    totalWhatsappConversations: sumMetric(items, "whatsappConversations"),
    bestDay: bestDay?.dayLabel ?? "",
    weakestDay: weakestDay?.dayLabel ?? "",
    bestStoryId: bestStory?.id ?? "",
    reuseCandidates,
    avoidRepeatingItems,
    missingResults,
    mainLearnings: buildMainLearnings(items, reuseCandidates, avoidRepeatingItems, missingResults),
    nextWeekRecommendations: getNextWeekRecommendationsFromResults(items),
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function getBestPerformingStory(items: StoryResultItem[]): StoryResultItem | null {
  const recorded = items.filter(hasAnyMetric);
  return recorded.sort((a, b) => calculateStoryEngagementScore(b) - calculateStoryEngagementScore(a) || metric(b.whatsappConversations) - metric(a.whatsappConversations))[0] ?? null;
}

export function getWeakestPerformingStory(items: StoryResultItem[]): StoryResultItem | null {
  const recorded = items.filter(hasAnyMetric);
  return recorded.sort((a, b) => calculateStoryEngagementScore(a) - calculateStoryEngagementScore(b) || metric(a.views) - metric(b.views))[0] ?? null;
}

export function getReuseCandidates(items: StoryResultItem[]): StoryResultItem[] {
  return items.filter((item) => item.shouldReuse);
}

export function getAvoidRepeatingItems(items: StoryResultItem[]): StoryResultItem[] {
  return items.filter((item) => item.shouldAvoid);
}

export function getStoriesMissingResults(items: StoryResultItem[]): StoryResultItem[] {
  return items.filter((item) => item.resultStatus === "results_pending" || item.signals.includes("needs_more_data"));
}

export function getStoryResultWarnings(items: StoryResultItem[]): string[] {
  const warnings = [
    "Resultados manuais e simulados: nenhum dado e buscado automaticamente do Instagram, Meta ou qualquer plataforma.",
    "Nada e salvo em banco ou persistido no navegador nesta fase."
  ];
  const missing = getStoriesMissingResults(items).length;
  const ethical = items.filter((item) => item.signals.includes("ethical_attention")).length;
  if (missing > 0) warnings.push(`${missing} story/stories ainda precisam de metricas para fechar o aprendizado.`);
  if (ethical > 0) warnings.push(`${ethical} story/stories mantem alerta etico ou de privacidade.`);
  return unique(warnings);
}

export function getNextWeekRecommendationsFromResults(items: StoryResultItem[]): string[] {
  const recommendations: string[] = [];
  if (items.some((item) => item.signals.includes("generated_whatsapp"))) recommendations.push("Repetir temas, CTAs e formatos que geraram conversas no WhatsApp.");
  if (items.some((item) => item.signals.includes("generated_replies"))) recommendations.push("Reforcar perguntas e stickers nos temas que geraram respostas.");
  if (items.some((item) => item.signals.includes("weak_cta"))) recommendations.push("Revisar CTAs fracos antes de montar a proxima semana.");
  if (getStoriesMissingResults(items).length > 0) recommendations.push("Completar metricas ausentes antes da revisao semanal.");
  if (getReuseCandidates(items).length > 0) recommendations.push("Separar stories candidatos a reutilizacao em Reels, Shorts ou nova sequencia de Stories.");
  recommendations.push("Alimentar /data com o consolidado manual da semana.");
  return unique(recommendations);
}

export function validateStoryResultItem(item: StoryResultItem): string[] {
  const warnings: string[] = [];
  const metricFields: StoryResultMetricField[] = ["views", "replies", "stickerInteractions", "linkClicks", "profileVisits", "whatsappConversations", "saves", "shares"];
  metricFields.forEach((field) => {
    const value = item[field];
    if (value !== null && value < 0) warnings.push(`${field} nao pode ter metrica negativa.`);
  });
  if (item.views !== null && item.views === 0 && (metric(item.replies) > 0 || metric(item.linkClicks) > 0 || metric(item.whatsappConversations) > 0)) {
    warnings.push("Ha interacao registrada com visualizacoes zeradas; revisar digitacao.");
  }
  if (item.signals.includes("ethical_attention")) warnings.push("Story mantem atencao etica por privacidade, paciente, resultado, depoimento ou antes/depois.");
  return unique(warnings);
}

export function filterStoryResultsByStatus(items: StoryResultItem[], status: StoryResultStatus): StoryResultItem[] {
  return items.filter((item) => item.resultStatus === status);
}

export function filterStoryResultsBySignal(items: StoryResultItem[], signal: StoryResultSignal): StoryResultItem[] {
  return items.filter((item) => item.signals.includes(signal));
}

export function filterStoryResultsByDay(items: StoryResultItem[], dayLabel: string): StoryResultItem[] {
  return items.filter((item) => item.dayLabel === dayLabel);
}

export function generateStoryResultLearning(item: StoryResultItem): string {
  if (item.signals.includes("generated_whatsapp")) return "Este story gerou conversa no WhatsApp e deve ser estudado para reutilizacao.";
  if (item.signals.includes("generated_replies")) return "Este story gerou respostas e indica bom potencial de conversa.";
  if (item.signals.includes("good_cta")) return "CTA funcionou melhor que a media operacional da semana.";
  if (item.signals.includes("low_engagement")) return "Baixo engajamento; revisar gancho, ordem ou CTA antes de repetir.";
  if (item.signals.includes("needs_more_data")) return "Ainda faltam metricas para transformar este story em aprendizado.";
  return "Resultado registrado; comparar com os demais stories do dia antes de repetir.";
}

export function storyResultStatusLabel(status: StoryResultStatus): string {
  return {
    not_published: "Nao publicado",
    published: "Publicado",
    results_pending: "Aguardando resultados",
    results_recorded: "Resultado registrado",
    needs_analysis: "Precisa analise",
    high_performance: "Alta performance",
    low_performance: "Baixa performance"
  }[status];
}

export function storyResultSignalLabel(signal: StoryResultSignal): string {
  return {
    strong_engagement: "Engajamento forte",
    low_engagement: "Baixo engajamento",
    generated_replies: "Gerou respostas",
    generated_whatsapp: "Gerou WhatsApp",
    good_cta: "CTA bom",
    weak_cta: "CTA fraco",
    ethical_attention: "Atencao etica",
    reuse_candidate: "Candidato a reutilizar",
    avoid_repeating: "Evitar repetir",
    needs_more_data: "Faltam dados"
  }[signal];
}

function recalculateStoryResultItem(item: StoryResultItem): StoryResultItem {
  const signals = detectStoryResultSignals(item);
  const resultStatus = determineResultStatus(item, signals);
  return {
    ...item,
    resultStatus,
    signals,
    learning: generateStoryResultLearning({ ...item, signals, resultStatus }),
    shouldReuse: signals.includes("reuse_candidate"),
    shouldAvoid: signals.includes("avoid_repeating")
  };
}

function determineResultStatus(item: StoryResultItem, signals: StoryResultSignal[]): StoryResultStatus {
  if (item.resultStatus === "not_published" && !item.publishedUrl && !item.publishedAt && !hasAnyMetric(item)) return "not_published";
  if (validateMetricsOnly(item).length > 0) return "needs_analysis";
  if (!hasAnyMetric(item)) return "results_pending";
  if (signals.includes("strong_engagement") || signals.includes("generated_whatsapp")) return "high_performance";
  if (signals.includes("low_engagement")) return "low_performance";
  return "results_recorded";
}

function validateMetricsOnly(item: StoryResultItem): string[] {
  return (["views", "replies", "stickerInteractions", "linkClicks", "profileVisits", "whatsappConversations", "saves", "shares"] as StoryResultMetricField[]).filter((field) => {
    const value = item[field];
    return value !== null && value < 0;
  });
}

function buildMainLearnings(items: StoryResultItem[], reuseCandidates: StoryResultItem[], avoidRepeatingItems: StoryResultItem[], missingResults: StoryResultItem[]): string[] {
  const learnings: string[] = [];
  if (reuseCandidates.length > 0) learnings.push(`${reuseCandidates.length} story/stories mostraram potencial de reutilizacao.`);
  if (avoidRepeatingItems.length > 0) learnings.push(`${avoidRepeatingItems.length} story/stories devem ser revisados antes de repetir.`);
  if (items.some((item) => item.signals.includes("generated_whatsapp"))) learnings.push("WhatsApp apareceu como sinal mais forte de intencao.");
  if (missingResults.length > 0) learnings.push("Ainda ha lacunas de dados; fechar metricas antes da auditoria semanal.");
  if (learnings.length === 0) learnings.push("Registrar resultados para gerar aprendizados da semana.");
  return unique(learnings);
}

function normalizeMetricValue(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  return value;
}

function hasAnyMetric(item: StoryResultItem): boolean {
  return ["views", "replies", "stickerInteractions", "linkClicks", "profileVisits", "whatsappConversations", "saves", "shares"].some((field) => item[field as StoryResultMetricField] !== null);
}

function sumMetric(items: StoryResultItem[], field: StoryResultMetricField): number {
  return items.reduce((total, item) => total + metric(item[field]), 0);
}

function metric(value: number | null): number {
  return value ?? 0;
}

function isCtaStory(item: StoryResultItem): boolean {
  return item.slotType === "cta_leve" || item.slotType === "cta_direto" || item.cta.length > 0;
}

function hasSensitiveFilename(filename: string): boolean {
  return /paciente|resultado|depoimento|antes-depois/i.test(filename);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
