"use server";

import { redirect } from "next/navigation";
import { saveAnalyzedReport } from "@/lib/reports";

export type ImportReportState = {
  error: string | null;
  rawText: string;
};

export async function importReport(_previousState: ImportReportState, formData: FormData): Promise<ImportReportState> {
  const rawText = String(formData.get("rawText") ?? "").trim();
  if (rawText.length < 50) {
    return {
      error: "Cole um relatório de marketing mais completo para análise.",
      rawText
    };
  }

  let report: Awaited<ReturnType<typeof saveAnalyzedReport>>;
  try {
    report = await saveAnalyzedReport(rawText);
  } catch {
    return {
      error: "Não foi possível analisar este relatório. Revise o texto colado e tente novamente.",
      rawText
    };
  }

  redirect(`/reports/${report.id}`);
}
