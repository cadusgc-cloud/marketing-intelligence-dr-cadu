import type { WeekPeriod } from "@/lib/weekly-review/types";

const weekdays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export function buildWeekPeriod(startDate: string, days = 7): WeekPeriod {
  const start = parseIsoDate(startDate);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + days - 1);
  return {
    startDate: formatIsoDate(start),
    endDate: formatIsoDate(end),
    label: `${formatIsoDate(start)} a ${formatIsoDate(end)}`
  };
}

export function buildNextWeekPeriod(period: WeekPeriod): WeekPeriod {
  const next = parseIsoDate(period.endDate);
  next.setUTCDate(next.getUTCDate() + 1);
  return buildWeekPeriod(formatIsoDate(next));
}

export function isDateInPeriod(date: string | undefined, period: WeekPeriod): boolean {
  return Boolean(date && date >= period.startDate && date <= period.endDate);
}

export function weekdayLabel(date: string): string {
  return weekdays[parseIsoDate(date).getUTCDay()];
}

export function addDays(date: string, days: number): string {
  const parsed = parseIsoDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatIsoDate(parsed);
}

function parseIsoDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
