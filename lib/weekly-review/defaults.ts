import { parseReportImport, sampleGenericTsv } from "@/lib/report-imports";
import type { ContentMatchInput, WeeklyReviewInput } from "@/lib/weekly-review/types";
import { buildWeekPeriod } from "@/lib/weekly-review/week";

export const defaultWeeklyReviewPeriod = buildWeekPeriod("2026-05-24");
export const previousWeeklyReviewPeriod = buildWeekPeriod("2026-05-17");

export function buildDefaultWeeklyReviewInput(): WeeklyReviewInput {
  const importResult = parseReportImport({
    source: "generic",
    text: sampleGenericTsv,
    periodStart: previousWeeklyReviewPeriod.startDate,
    periodEnd: defaultWeeklyReviewPeriod.endDate
  });
  const currentRecords = importResult.normalizedRows.filter((row) => row.date && row.date >= defaultWeeklyReviewPeriod.startDate && row.date <= defaultWeeklyReviewPeriod.endDate);
  const previousRecords = importResult.normalizedRows.filter((row) => row.date && row.date >= previousWeeklyReviewPeriod.startDate && row.date <= previousWeeklyReviewPeriod.endDate);
  return {
    period: defaultWeeklyReviewPeriod,
    records: currentRecords,
    previousRecords,
    objective: "Fechar a semana com leitura conservadora e planejar a proxima semana."
  };
}

export function buildDefaultContentItems(): ContentMatchInput[] {
  return [
    { id: "studio-pressa", date: "2026-05-24", format: "reel", title: "cirurgia plastica nao combina com pressa", theme: "cirurgia plastica nao combina com pressa", pillar: "expectativa_realista" },
    { id: "studio-naturalidade", date: "2026-05-25", format: "carrossel", title: "naturalidade tambem e planejamento", theme: "naturalidade tambem e planejamento", pillar: "estetica_natural" },
    { id: "studio-consulta", date: "2026-05-26", format: "post", title: "consulta nao e venda", theme: "consulta nao e venda", pillar: "consulta_nao_e_venda" }
  ];
}
