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

const baseDate = new Date("2026-05-09T12:00:00.000Z");

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
  instagramStories: 3,
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

export function validateWeeklyMarketingData(data: WeeklyMarketingData): WeeklyMarketingDataValidation {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  for (const field of ["id", "weekLabel", "startDate", "endDate"] as const) {
    if (!data[field]) missingFields.push(field);
  }

  if (data.consultationsScheduled === null) missingFields.push("consultationsScheduled");
  if (data.consultationsAttended === null) missingFields.push("consultationsAttended");
  if (data.surgeriesClosed === null) missingFields.push("surgeriesClosed");
  if (data.googleConversions === 0) warnings.push("Google Ads está com conversões zeradas e deve permanecer em diagnóstico.");
  if (data.instagramStories < 6) warnings.push("Stories abaixo do mínimo operacional de 6 por dia.");
  if (data.instagramReels < 3) warnings.push("Reels/Shorts abaixo do mínimo semanal de 3.");
  if (data.consultationsScheduled === null) warnings.push("Funil incompleto: faltam dados de consultas marcadas.");

  return {
    valid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

export function summarizeWeeklyMarketingData(data: WeeklyMarketingData): string {
  const metaCpw = data.metaCostPerWhatsapp ?? calculateMetaCostPerWhatsapp(data.metaSpend, data.metaWhatsappConversations);
  const googleRate = data.googleConversionRate ?? calculateGoogleConversionRate(data.googleConversions, data.googleClicks);
  const showRate = calculateConsultationShowRate(data.consultationsAttended, data.consultationsScheduled);

  return `${data.weekLabel}: Meta Ads gerou ${data.metaWhatsappConversations} conversas no WhatsApp com custo aproximado de ${formatCurrency(metaCpw)}. Google Ads registrou ${data.googleConversions} conversões (${formatPercent(googleRate)}). Stories ficaram em ${data.instagramStories}/dia e o funil comercial ${showRate === null ? "ainda precisa de dados de consultas" : `teve comparecimento de ${formatPercent(showRate)}`}.`;
}

export function convertWeeklyDataToDecisionInputs(data: WeeklyMarketingData): DecisionSignalInput[] {
  return [
    decisionInput(data, "meta-bofu-cost", "meta", "meta_bofu_whatsapp_cost", data.metaCostPerWhatsapp ?? calculateMetaCostPerWhatsapp(data.metaSpend, data.metaWhatsappConversations), "BRL", "Custo por conversa no WhatsApp BOFU calculado a partir dos dados semanais."),
    decisionInput(data, "meta-tofu-profile-visit", "meta", "meta_tofu_profile_visit_cost", data.metaCostPerProfileVisit ?? calculateMetaCostPerProfileVisit(data.metaSpend, data.metaProfileVisits), "BRL", "Custo por visita ao perfil no topo do funil."),
    decisionInput(data, "google-zero-conversions", "google", "google_conversions", data.googleConversions, "conversions", "Conversões do Google Ads na semana."),
    decisionInput(data, "google-cpc", "google", "google_cpc_without_tracked_conversion", data.googleCostPerClick ?? calculateGoogleCostPerClick(data.googleSpend, data.googleClicks), "BRL", "CPC do Google Ads sem conversão rastreada de forma confiável."),
    decisionInput(data, "instagram-stories", "instagram", "instagram_daily_stories", data.instagramStories, "stories", "Volume diário de Stories informado."),
    decisionInput(data, "content-reels-shorts", "content", "weekly_reels_shorts_count", data.instagramReels, "items", "Quantidade semanal de Reels/Shorts."),
    decisionInput(data, "funnel-scheduled-consults", "funnel", "scheduled_consults", data.consultationsScheduled, "count", "Consultas marcadas vindas do funil comercial."),
    decisionInput(data, "funnel-whatsapp-consult-rate", "funnel", "whatsapp_to_consult_rate", data.consultationsScheduled === null ? null : calculateConsultRate(data.consultationsScheduled, data.whatsappTotal), "rate", "Taxa de WhatsApp para consulta marcada."),
    decisionInput(data, "budget-meta-vs-google", "budget", "new_budget_to_google_when_meta_better", isMetaPerformingBetterThanGoogle(data) ? 0 : 1, "flag", "Comparação operacional entre Meta Ads e Google Ads.")
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
