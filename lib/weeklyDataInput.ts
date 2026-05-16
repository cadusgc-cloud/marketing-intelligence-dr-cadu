import type { DecisionSignalInput } from "@/lib/decisionSignals";

export type WeeklyMarketingData = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  metaSpend: number;
  metaWhatsappConversations: number;
  metaCostPerWhatsapp: number | null;
  metaProfileVisits: number;
  metaCostPerProfileVisit: number | null;
  googleSpend: number;
  googleClicks: number;
  googleConversions: number;
  googleCostPerClick: number | null;
  googleConversionRate: number | null;
  instagramStories: number;
  instagramReels: number;
  instagramPosts: number;
  instagramProfileVisits: number;
  whatsappTotal: number;
  qualifiedConversations: number;
  consultationsScheduled: number | null;
  consultationsAttended: number | null;
  surgeriesClosed: number | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WeeklyMarketingDataValidation = {
  valid: boolean;
  missingFields: string[];
  warnings: string[];
};

export type WeeklySaveReadinessStatus = "ready" | "needs-review" | "blocked";

export type WeeklySaveReadinessItemStatus = "ok" | "missing" | "review";

export type WeeklySaveReadinessItem = {
  id: string;
  label: string;
  status: WeeklySaveReadinessItemStatus;
  detail: string;
};

export type WeeklySaveReadinessReport = {
  status: WeeklySaveReadinessStatus;
  summary: string;
  canSave: boolean;
  items: WeeklySaveReadinessItem[];
  blockers: string[];
  reviewNotes: string[];
};

export type WeeklyCalculatedMetrics = {
  metaCostPerWhatsapp: number | null;
  metaCostPerProfileVisit: number | null;
  googleCostPerClick: number | null;
  googleConversionRate: number | null;
  consultationShowRate: number | null;
  surgeryCloseRate: number | null;
};

const baseDate = new Date("2026-05-09T12:00:00.000Z");

const saveReadinessMoneyFields = ["metaSpend", "googleSpend"] as const;
const saveReadinessCountFields = [
  "metaWhatsappConversations",
  "metaProfileVisits",
  "googleClicks",
  "googleConversions",
  "instagramStories",
  "instagramReels",
  "instagramPosts",
  "instagramProfileVisits",
  "whatsappTotal",
  "qualifiedConversations"
] as const;
const saveReadinessNullableCountFields = ["consultationsScheduled", "consultationsAttended", "surgeriesClosed"] as const;

const saveReadinessFieldLabels: Record<
  (typeof saveReadinessMoneyFields)[number] | (typeof saveReadinessCountFields)[number] | (typeof saveReadinessNullableCountFields)[number],
  string
> = {
  metaSpend: "investimento Meta Ads",
  metaWhatsappConversations: "conversas Meta no WhatsApp",
  metaProfileVisits: "visitas ao perfil Meta",
  googleSpend: "investimento Google Ads",
  googleClicks: "cliques Google Ads",
  googleConversions: "conversoes Google Ads",
  instagramStories: "Stories na semana",
  instagramReels: "Reels/Shorts na semana",
  instagramPosts: "posts na semana",
  instagramProfileVisits: "visitas ao perfil Instagram",
  whatsappTotal: "WhatsApps totais",
  qualifiedConversations: "conversas qualificadas",
  consultationsScheduled: "consultas marcadas",
  consultationsAttended: "consultas comparecidas",
  surgeriesClosed: "cirurgias fechadas"
};

export const WEEKLY_MARKETING_DATA_MOCK: WeeklyMarketingData = {
  id: "week-2026-05-04",
  weekLabel: "Semana 04/05 a 10/05/2026",
  startDate: "2026-05-04",
  endDate: "2026-05-10",
  metaSpend: 780,
  metaWhatsappConversations: 118,
  metaCostPerWhatsapp: 6.61,
  metaProfileVisits: 6100,
  metaCostPerProfileVisit: 0.13,
  googleSpend: 220,
  googleClicks: 48,
  googleConversions: 0,
  googleCostPerClick: 4.58,
  googleConversionRate: 0,
  instagramStories: 24,
  instagramReels: 2,
  instagramPosts: 2,
  instagramProfileVisits: 1290,
  whatsappTotal: 126,
  qualifiedConversations: 42,
  consultationsScheduled: null,
  consultationsAttended: null,
  surgeriesClosed: null,
  notes:
    "Meta Ads segue mais acionável que Google Ads. Google Ads está com conversões zeradas. Stories estão abaixo do ideal e o funil comercial está incompleto por falta de dados de consultas marcadas.",
  createdAt: baseDate,
  updatedAt: baseDate
};

export function createEmptyWeeklyMarketingData(): WeeklyMarketingData {
  return {
    id: "weekly-draft",
    weekLabel: "",
    startDate: "",
    endDate: "",
    metaSpend: 0,
    metaWhatsappConversations: 0,
    metaCostPerWhatsapp: null,
    metaProfileVisits: 0,
    metaCostPerProfileVisit: null,
    googleSpend: 0,
    googleClicks: 0,
    googleConversions: 0,
    googleCostPerClick: null,
    googleConversionRate: null,
    instagramStories: 0,
    instagramReels: 0,
    instagramPosts: 0,
    instagramProfileVisits: 0,
    whatsappTotal: 0,
    qualifiedConversations: 0,
    consultationsScheduled: null,
    consultationsAttended: null,
    surgeriesClosed: null,
    notes: "",
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export function createWeeklyMarketingDataFromEditableFields(fields: Partial<WeeklyMarketingData>): WeeklyMarketingData {
  return normalizeWeeklyMarketingData({
    ...createEmptyWeeklyMarketingData(),
    ...fields,
    updatedAt: baseDate
  });
}

export function normalizeWeeklyMarketingData(data: WeeklyMarketingData): WeeklyMarketingData {
  const metrics = getCalculatedWeeklyMetrics(data);
  return {
    ...data,
    metaCostPerWhatsapp: metrics.metaCostPerWhatsapp,
    metaCostPerProfileVisit: metrics.metaCostPerProfileVisit,
    googleCostPerClick: metrics.googleCostPerClick,
    googleConversionRate: metrics.googleConversionRate
  };
}

export function updateWeeklyMarketingDataField<K extends keyof WeeklyMarketingData>(
  data: WeeklyMarketingData,
  field: K,
  value: WeeklyMarketingData[K]
): WeeklyMarketingData {
  return normalizeWeeklyMarketingData({
    ...data,
    [field]: value
  });
}

export function getCalculatedWeeklyMetrics(data: WeeklyMarketingData): WeeklyCalculatedMetrics {
  return {
    metaCostPerWhatsapp: calculateMetaCostPerWhatsapp(data.metaSpend, data.metaWhatsappConversations),
    metaCostPerProfileVisit: calculateMetaCostPerProfileVisit(data.metaSpend, data.metaProfileVisits),
    googleCostPerClick: calculateGoogleCostPerClick(data.googleSpend, data.googleClicks),
    googleConversionRate: calculateGoogleConversionRate(data.googleConversions, data.googleClicks),
    consultationShowRate: calculateConsultationShowRate(data.consultationsAttended, data.consultationsScheduled),
    surgeryCloseRate: calculateSurgeryCloseRate(data.surgeriesClosed, data.consultationsAttended)
  };
}

export function calculateMetaCostPerWhatsapp(metaSpend: number, metaWhatsappConversations: number): number | null {
  return safeDivide(metaSpend, metaWhatsappConversations);
}

export function calculateMetaCostPerProfileVisit(metaSpend: number, metaProfileVisits: number): number | null {
  return safeDivide(metaSpend, metaProfileVisits);
}

export function calculateGoogleCostPerClick(googleSpend: number, googleClicks: number): number | null {
  return safeDivide(googleSpend, googleClicks);
}

export function calculateGoogleConversionRate(googleConversions: number, googleClicks: number): number | null {
  return safeDivide(googleConversions, googleClicks);
}

export function calculateConsultationShowRate(consultationsAttended: number | null, consultationsScheduled: number | null): number | null {
  if (consultationsAttended === null || consultationsScheduled === null) return null;
  return safeDivide(consultationsAttended, consultationsScheduled);
}

export function calculateSurgeryCloseRate(surgeriesClosed: number | null, consultationsAttended: number | null): number | null {
  if (surgeriesClosed === null || consultationsAttended === null) return null;
  return safeDivide(surgeriesClosed, consultationsAttended);
}

export function calculateDailyStoriesAverage(weeklyStories: number): number | null {
  return safeDivide(weeklyStories, 7);
}

export function validateWeeklyMarketingData(data: WeeklyMarketingData): WeeklyMarketingDataValidation {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  for (const field of ["id", "weekLabel", "startDate", "endDate"] as const) {
    if (!data[field]) missingFields.push(field);
  }

  if (data.consultationsScheduled === null || data.consultationsScheduled === 0) missingFields.push("consultationsScheduled");
  if (data.consultationsAttended === null) missingFields.push("consultationsAttended");
  if (data.surgeriesClosed === null) missingFields.push("surgeriesClosed");
  if (data.googleConversions === 0) warnings.push("Google Ads está com conversões zeradas e deve permanecer em diagnóstico.");
  if (data.instagramStories < 42) warnings.push("Stories abaixo do mínimo operacional de 42 por semana.");
  if (data.instagramReels < 3) warnings.push("Reels/Shorts abaixo do mínimo semanal de 3.");
  if (data.consultationsScheduled === null || data.consultationsScheduled === 0) warnings.push("Funil incompleto: faltam dados de consultas marcadas.");
  if (isMetaPerformingBetterThanGoogle(data)) warnings.push("Meta Ads está mais confiável que Google Ads para leitura operacional nesta semana.");

  return {
    valid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

export function buildWeeklySaveReadinessReport(data: WeeklyMarketingData): WeeklySaveReadinessReport {
  const blockers: string[] = [];
  const reviewNotes: string[] = [];
  const validation = validateWeeklyMarketingData(data);

  const hasWeekLabel = data.weekLabel.trim().length > 0;
  const hasValidStartDate = isValidIsoDate(data.startDate);
  const hasValidEndDate = isValidIsoDate(data.endDate);
  const hasValidPeriod = hasValidStartDate && hasValidEndDate && data.endDate >= data.startDate;

  if (!hasWeekLabel) blockers.push("Informe o rotulo da semana antes de salvar.");
  if (!hasValidStartDate) blockers.push("Informe uma data de inicio valida antes de salvar.");
  if (!hasValidEndDate) blockers.push("Informe uma data de fim valida antes de salvar.");
  if (hasValidStartDate && hasValidEndDate && data.endDate < data.startDate) {
    blockers.push("A data de fim nao pode ser anterior a data de inicio.");
  }

  validateReadinessNumbers(data, blockers);

  const hasPaidMediaData =
    data.metaSpend > 0 ||
    data.metaWhatsappConversations > 0 ||
    data.metaProfileVisits > 0 ||
    data.googleSpend > 0 ||
    data.googleClicks > 0 ||
    data.googleConversions > 0;
  const hasOrganicData = data.instagramStories > 0 || data.instagramReels > 0 || data.instagramPosts > 0 || data.instagramProfileVisits > 0;
  const hasFunnelData = data.consultationsScheduled !== null && data.consultationsAttended !== null && data.surgeriesClosed !== null;
  const hasFunnelVolume = (data.consultationsScheduled ?? 0) > 0;

  if (!hasPaidMediaData) {
    pushUnique(reviewNotes, "Midia paga sem dados agregados; revise se a semana deve ser salva como rascunho operacional.");
  }
  if (!hasOrganicData) {
    pushUnique(reviewNotes, "Instagram organico sem dados agregados; a leitura de conteudo ficara limitada.");
  }
  if (!hasFunnelData || !hasFunnelVolume) {
    pushUnique(reviewNotes, "Funil comercial incompleto; a semana pode ser salva, mas a leitura de conversao ficara limitada.");
  }

  for (const warning of validation.warnings) pushUnique(reviewNotes, warning);

  const normalizedBlockers = unique(blockers);
  const normalizedReviewNotes = unique(reviewNotes);
  const status: WeeklySaveReadinessStatus = normalizedBlockers.length > 0 ? "blocked" : normalizedReviewNotes.length > 0 ? "needs-review" : "ready";

  return {
    status,
    summary: saveReadinessSummary(status),
    canSave: normalizedBlockers.length === 0,
    items: [
      {
        id: "week-identity",
        label: "Identificacao da semana",
        status: hasWeekLabel ? "ok" : "missing",
        detail: hasWeekLabel ? "Rotulo informado para identificar a semana salva." : "Informe um rotulo claro para evitar salvar um rascunho sem identidade."
      },
      {
        id: "week-period",
        label: "Periodo da semana",
        status: hasValidPeriod ? "ok" : "missing",
        detail: hasValidPeriod ? "Datas validas e em ordem cronologica." : "Informe inicio e fim validos; o fim nao pode ser anterior ao inicio."
      },
      {
        id: "paid-media",
        label: "Midia paga agregada",
        status: hasPaidMediaData ? "ok" : "review",
        detail: hasPaidMediaData ? "Ha dados agregados de Meta Ads ou Google Ads para leitura operacional." : "Sem dados de midia paga; salve apenas se isso representar a semana real."
      },
      {
        id: "organic-instagram",
        label: "Instagram organico",
        status: hasOrganicData && data.instagramStories >= 42 && data.instagramReels >= 3 ? "ok" : "review",
        detail: hasOrganicData
          ? "Dados organicos existem; revise avisos de volume quando Stories ou Reels estiverem baixos."
          : "Sem dados organicos; a leitura de conteudo ficara incompleta."
      },
      {
        id: "commercial-funnel",
        label: "Funil comercial",
        status: hasFunnelData && hasFunnelVolume ? "ok" : "review",
        detail: hasFunnelData && hasFunnelVolume ? "Consultas e fechamentos foram informados." : "Dados de consultas ou fechamentos ainda limitam a leitura comercial."
      }
    ],
    blockers: normalizedBlockers,
    reviewNotes: normalizedReviewNotes
  };
}

export function summarizeWeeklyMarketingData(data: WeeklyMarketingData): string {
  const metrics = getCalculatedWeeklyMetrics(data);

  return `${data.weekLabel || "Rascunho da semana"}: Meta Ads gerou ${data.metaWhatsappConversations} conversas no WhatsApp com custo aproximado de ${formatCurrency(metrics.metaCostPerWhatsapp)}. Google Ads registrou ${data.googleConversions} conversões (${formatPercent(metrics.googleConversionRate)}). Stories ficaram em ${data.instagramStories} na semana e o funil comercial ${metrics.consultationShowRate === null ? "ainda precisa de dados de consultas" : `teve comparecimento de ${formatPercent(metrics.consultationShowRate)}`}.`;
}

export function convertWeeklyDataToDecisionInputs(data: WeeklyMarketingData): DecisionSignalInput[] {
  const normalized = normalizeWeeklyMarketingData(data);
  const dailyStoriesAverage = calculateDailyStoriesAverage(normalized.instagramStories);

  return [
    decisionInput(normalized, "meta-bofu-cost", "meta", "meta_bofu_whatsapp_cost", normalized.metaCostPerWhatsapp, "BRL", "Custo por conversa no WhatsApp BOFU calculado a partir dos dados semanais."),
    decisionInput(normalized, "meta-tofu-profile-visit", "meta", "meta_tofu_profile_visit_cost", normalized.metaCostPerProfileVisit, "BRL", "Custo por visita ao perfil no topo do funil."),
    decisionInput(normalized, "google-zero-conversions", "google", "google_conversions", normalized.googleConversions, "conversions", "Conversões do Google Ads na semana."),
    decisionInput(normalized, "google-cpc", "google", "google_cpc_without_tracked_conversion", normalized.googleCostPerClick, "BRL", "CPC do Google Ads sem conversão rastreada de forma confiável."),
    decisionInput(normalized, "instagram-stories", "instagram", "instagram_daily_stories", dailyStoriesAverage, "stories/day", "Média diária de Stories calculada a partir do total semanal."),
    decisionInput(normalized, "content-reels-shorts", "content", "weekly_reels_shorts_count", normalized.instagramReels, "items", "Quantidade semanal de Reels/Shorts."),
    decisionInput(normalized, "funnel-scheduled-consults", "funnel", "scheduled_consults", normalized.consultationsScheduled, "count", "Consultas marcadas vindas do funil comercial."),
    decisionInput(normalized, "funnel-whatsapp-consult-rate", "funnel", "whatsapp_to_consult_rate", normalized.consultationsScheduled === null ? null : calculateConsultRate(normalized.consultationsScheduled, normalized.whatsappTotal), "rate", "Taxa de WhatsApp para consulta marcada."),
    decisionInput(normalized, "budget-meta-vs-google", "budget", "new_budget_to_google_when_meta_better", isMetaPerformingBetterThanGoogle(normalized) ? 0 : 1, "flag", "Comparação operacional entre Meta Ads e Google Ads.")
  ];
}

export function isMetaPerformingBetterThanGoogle(data: WeeklyMarketingData): boolean {
  return data.metaWhatsappConversations > 0 && data.googleConversions === 0;
}

function decisionInput(
  data: WeeklyMarketingData,
  suffix: string,
  channel: DecisionSignalInput["channel"],
  metric: string,
  value: DecisionSignalInput["value"],
  unit: string,
  context: string
): DecisionSignalInput {
  return {
    id: `${data.id}-${suffix}`,
    periodLabel: data.weekLabel,
    channel,
    metric,
    value,
    unit,
    context,
    source: "weekly-data-input",
    createdAt: data.createdAt
  };
}

function calculateConsultRate(consultationsScheduled: number, whatsappTotal: number): number | null {
  return safeDivide(consultationsScheduled, whatsappTotal);
}

function validateReadinessNumbers(data: WeeklyMarketingData, blockers: string[]) {
  for (const field of saveReadinessMoneyFields) {
    validateReadinessNumber(data[field], saveReadinessFieldLabels[field], blockers, false);
  }

  for (const field of saveReadinessCountFields) {
    validateReadinessNumber(data[field], saveReadinessFieldLabels[field], blockers, true);
  }

  for (const field of saveReadinessNullableCountFields) {
    const value = data[field];
    if (value !== null) validateReadinessNumber(value, saveReadinessFieldLabels[field], blockers, true);
  }
}

function validateReadinessNumber(value: number, label: string, blockers: string[], integerOnly: boolean) {
  if (!Number.isFinite(value)) {
    blockers.push(`O campo ${label} precisa ser numerico antes de salvar.`);
    return;
  }

  if (value < 0) blockers.push(`O campo ${label} nao pode ser negativo.`);
  if (integerOnly && !Number.isInteger(value)) blockers.push(`O campo ${label} precisa ser um numero inteiro.`);
}

function saveReadinessSummary(status: WeeklySaveReadinessStatus): string {
  if (status === "ready") return "Semana pronta para salvar.";
  if (status === "blocked") return "Complete os campos essenciais antes de salvar a semana.";
  return "Semana pode ser salva, mas ainda merece revisao operacional.";
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return round(numerator / denominator);
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function formatCurrency(value: number | null): string {
  if (value === null) return "sem dado";
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "sem dado";
  return `${(value * 100).toFixed(1).replace(".", ",")}%`;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
