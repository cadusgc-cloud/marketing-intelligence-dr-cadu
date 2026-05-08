export const DECEMBER_2025_OPERATIONAL_ANOMALY_REASON = "Período excluído da análise normal por hackeamento da conta.";

export type NormalAnalysisPeriod = {
  periodStart?: Date | null;
  periodEnd?: Date | null;
  isOperationalAnomaly?: boolean | null;
};

export function parseBrazilianDate(value?: string | null, fallbackYear?: number): Date | null {
  if (!value) return null;
  const match = value.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const yearRaw = match[3] ? Number(match[3]) : fallbackYear;
  if (!yearRaw) return null;
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function extractPeriod(text: string): { periodStart: Date | null; periodEnd: Date | null } {
  const periodMatch = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*(?:a|até|-|–|—)\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (!periodMatch) return { periodStart: null, periodEnd: null };
  const end = parseBrazilianDate(periodMatch[2]);
  const fallbackYear = end?.getUTCFullYear();
  const start = parseBrazilianDate(periodMatch[1], fallbackYear);
  return { periodStart: start, periodEnd: end };
}

export function isInsideDecember2025(start?: Date | null, end?: Date | null): boolean {
  if (!start && !end) return false;
  const decemberStart = Date.UTC(2025, 11, 1);
  const decemberEnd = Date.UTC(2025, 11, 31, 23, 59, 59);
  const startTime = start?.getTime() ?? end?.getTime() ?? 0;
  const endTime = end?.getTime() ?? start?.getTime() ?? 0;
  return startTime <= decemberEnd && endTime >= decemberStart;
}

export function isExcludedFromNormalAnalysis(period: NormalAnalysisPeriod): boolean {
  return Boolean(period.isOperationalAnomaly || isInsideDecember2025(period.periodStart, period.periodEnd));
}

export function operationalAnomalyReasonForPeriod(start?: Date | null, end?: Date | null, fallbackReason?: string | null): string | null {
  if (isInsideDecember2025(start, end)) return DECEMBER_2025_OPERATIONAL_ANOMALY_REASON;
  return fallbackReason ?? null;
}

export function dateLabel(start?: Date | null, end?: Date | null): string {
  const formatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
  if (!start && !end) return "Período não identificado";
  if (start && end) return `${formatter.format(start)} a ${formatter.format(end)}`;
  return formatter.format(start ?? end ?? new Date());
}

export function daysBetween(start?: Date | null, end?: Date | null): number | null {
  if (!start || !end) return null;
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.round(diff / 86400000) + 1);
}
