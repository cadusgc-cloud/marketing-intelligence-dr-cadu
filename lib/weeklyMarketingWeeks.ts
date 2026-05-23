import type { WeeklyMarketingWeek } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isInsideDecember2025 } from "@/lib/utils/dates";
import { normalizeWeeklyMarketingData, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

export type WeeklyMarketingWeekInput = Pick<
  WeeklyMarketingData,
  | "weekLabel"
  | "startDate"
  | "endDate"
  | "metaSpend"
  | "metaWhatsappConversations"
  | "metaProfileVisits"
  | "googleSpend"
  | "googleClicks"
  | "googleConversions"
  | "instagramStories"
  | "instagramReels"
  | "instagramPosts"
  | "instagramProfileVisits"
  | "whatsappTotal"
  | "qualifiedConversations"
  | "consultationsScheduled"
  | "consultationsAttended"
  | "surgeriesClosed"
  | "notes"
>;

export type WeeklyMarketingWeekSummary = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  operationalSnapshot: string;
  updatedAt: Date;
};

const moneyFields = ["metaSpend", "googleSpend"] as const;
const countFields = [
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
const nullableCountFields = ["consultationsScheduled", "consultationsAttended", "surgeriesClosed"] as const;

const fieldLabels: Record<keyof WeeklyMarketingWeekInput, string> = {
  weekLabel: "rotulo da semana",
  startDate: "inicio",
  endDate: "fim",
  metaSpend: "investimento Meta Ads",
  metaWhatsappConversations: "conversas no WhatsApp",
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
  surgeriesClosed: "cirurgias fechadas",
  notes: "observacoes"
};

export class WeeklyMarketingWeekValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join(" "));
    this.name = "WeeklyMarketingWeekValidationError";
  }
}

export async function getLatestWeeklyMarketingData(): Promise<WeeklyMarketingData | null> {
  const record = await prisma.weeklyMarketingWeek.findFirst({
    orderBy: [{ endDate: "desc" }, { updatedAt: "desc" }]
  });

  return record ? mapWeeklyMarketingWeekToData(record) : null;
}

export async function getWeeklyMarketingDataById(id: string): Promise<WeeklyMarketingData | null> {
  if (!id.trim()) return null;
  const record = await prisma.weeklyMarketingWeek.findUnique({
    where: { id }
  });

  return record ? mapWeeklyMarketingWeekToData(record) : null;
}

export async function getPreviousWeeklyMarketingData(selectedWeek: WeeklyMarketingData): Promise<WeeklyMarketingData | null> {
  const records = await getPreviousValidWeeklyMarketingData(selectedWeek, 1);
  return records[0] ?? null;
}

export async function getPreviousValidWeeklyMarketingData(selectedWeek: WeeklyMarketingData, limit = 4): Promise<WeeklyMarketingData[]> {
  const referenceDate = selectedWeek.startDate || selectedWeek.endDate;
  if (!isValidIsoDate(referenceDate)) return [];
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 12) : 4;

  const records = await prisma.weeklyMarketingWeek.findMany({
    where: {
      id: { not: selectedWeek.id },
      endDate: { lt: referenceDate }
    },
    orderBy: [{ endDate: "desc" }, { updatedAt: "desc" }],
    take: Math.min(safeLimit * 4, 52)
  });

  return selectPreviousValidWeeklyMarketingWeekRecords(records, selectedWeek, safeLimit).map(mapWeeklyMarketingWeekToData);
}

export async function getWeeklyMarketingWeekSummaries(limit = 12): Promise<WeeklyMarketingWeekSummary[]> {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 52) : 12;
  const records = await prisma.weeklyMarketingWeek.findMany({
    orderBy: [{ endDate: "desc" }, { updatedAt: "desc" }],
    take: safeLimit
  });

  return records.map(mapWeeklyMarketingWeekToSummary);
}

export function selectPreviousWeeklyMarketingWeekRecord(
  records: WeeklyMarketingWeek[],
  selectedWeek: Pick<WeeklyMarketingData, "id" | "startDate" | "endDate">
): WeeklyMarketingWeek | null {
  return selectPreviousValidWeeklyMarketingWeekRecords(records, selectedWeek, 1)[0] ?? null;
}

export function selectPreviousValidWeeklyMarketingWeekRecords(
  records: WeeklyMarketingWeek[],
  selectedWeek: Pick<WeeklyMarketingData, "id" | "startDate" | "endDate">,
  limit = 4
): WeeklyMarketingWeek[] {
  const referenceDate = selectedWeek.startDate || selectedWeek.endDate;
  if (!isValidIsoDate(referenceDate)) return [];
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 12) : 4;

  return records
    .filter((record) => record.id !== selectedWeek.id && record.endDate < referenceDate && !isWeeklyMarketingWeekRecordExcludedFromNormalAnalysis(record))
    .sort((a, b) => b.endDate.localeCompare(a.endDate) || b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, safeLimit);
}

export function isWeeklyMarketingWeekRecordExcludedFromNormalAnalysis(record: Pick<WeeklyMarketingWeek, "startDate" | "endDate">): boolean {
  return isInsideDecember2025(parseIsoDate(record.startDate), parseIsoDate(record.endDate));
}

export async function upsertWeeklyMarketingData(input: WeeklyMarketingWeekInput): Promise<WeeklyMarketingData> {
  const normalized = normalizeWeeklyMarketingWeekInput(input);
  const errors = validateWeeklyMarketingWeekInput(normalized);
  if (errors.length > 0) throw new WeeklyMarketingWeekValidationError(errors);

  const record = await prisma.weeklyMarketingWeek.upsert({
    where: {
      startDate_endDate: {
        startDate: normalized.startDate,
        endDate: normalized.endDate
      }
    },
    update: normalized,
    create: normalized
  });

  return mapWeeklyMarketingWeekToData(record);
}

export function mapWeeklyMarketingWeekToSummary(record: WeeklyMarketingWeek): WeeklyMarketingWeekSummary {
  return {
    id: record.id,
    weekLabel: record.weekLabel,
    startDate: record.startDate,
    endDate: record.endDate,
    operationalSnapshot: summarizeWeeklyMarketingWeekRecord(record),
    updatedAt: record.updatedAt
  };
}

export function mapWeeklyMarketingWeekToData(record: WeeklyMarketingWeek): WeeklyMarketingData {
  return normalizeWeeklyMarketingData({
    id: record.id,
    weekLabel: record.weekLabel,
    startDate: record.startDate,
    endDate: record.endDate,
    metaSpend: record.metaSpend,
    metaWhatsappConversations: record.metaWhatsappConversations,
    metaCostPerWhatsapp: null,
    metaProfileVisits: record.metaProfileVisits,
    metaCostPerProfileVisit: null,
    googleSpend: record.googleSpend,
    googleClicks: record.googleClicks,
    googleConversions: record.googleConversions,
    googleCostPerClick: null,
    googleConversionRate: null,
    instagramStories: record.instagramStories,
    instagramReels: record.instagramReels,
    instagramPosts: record.instagramPosts,
    instagramProfileVisits: record.instagramProfileVisits,
    whatsappTotal: record.whatsappTotal,
    qualifiedConversations: record.qualifiedConversations,
    consultationsScheduled: record.consultationsScheduled,
    consultationsAttended: record.consultationsAttended,
    surgeriesClosed: record.surgeriesClosed,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  });
}

function summarizeWeeklyMarketingWeekRecord(record: WeeklyMarketingWeek): string {
  const funnelStatus =
    record.consultationsScheduled === null || record.consultationsAttended === null || record.surgeriesClosed === null
      ? "funil incompleto"
      : `${record.consultationsScheduled} consultas marcadas`;

  return `${record.metaWhatsappConversations} conversas Meta, ${record.googleConversions} conversoes Google, ${record.instagramStories} Stories, ${funnelStatus}.`;
}

export function normalizeWeeklyMarketingWeekInput(input: WeeklyMarketingWeekInput): WeeklyMarketingWeekInput {
  return {
    ...input,
    weekLabel: input.weekLabel.trim(),
    startDate: input.startDate.trim(),
    endDate: input.endDate.trim(),
    notes: input.notes.trim()
  };
}

export function validateWeeklyMarketingWeekInput(input: WeeklyMarketingWeekInput): string[] {
  const errors: string[] = [];

  if (!input.weekLabel.trim()) errors.push("Informe o rotulo da semana.");
  if (!isValidIsoDate(input.startDate)) errors.push("Informe uma data de inicio valida.");
  if (!isValidIsoDate(input.endDate)) errors.push("Informe uma data de fim valida.");
  if (isValidIsoDate(input.startDate) && isValidIsoDate(input.endDate) && input.endDate < input.startDate) {
    errors.push("A data de fim nao pode ser anterior a data de inicio.");
  }

  for (const field of moneyFields) validateNumber(input[field], field, errors);
  for (const field of countFields) validateCount(input[field], field, errors);
  for (const field of nullableCountFields) {
    const value = input[field];
    if (value !== null) validateCount(value, field, errors);
  }

  return unique(errors);
}

function validateNumber(value: number, field: keyof WeeklyMarketingWeekInput, errors: string[]) {
  if (!Number.isFinite(value)) {
    errors.push(`O campo ${fieldLabels[field]} precisa ser numerico.`);
    return;
  }
  if (value < 0) errors.push(`O campo ${fieldLabels[field]} nao pode ser negativo.`);
}

function validateCount(value: number, field: keyof WeeklyMarketingWeekInput, errors: string[]) {
  validateNumber(value, field, errors);
  if (Number.isFinite(value) && !Number.isInteger(value)) {
    errors.push(`O campo ${fieldLabels[field]} precisa ser um numero inteiro.`);
  }
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function parseIsoDate(value: string): Date | null {
  if (!isValidIsoDate(value)) return null;
  return new Date(`${value}T12:00:00.000Z`);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
