"use server";

import { redirect } from "next/navigation";
import { saveAnalyzedReport } from "@/lib/reports";

export async function importReport(formData: FormData) {
  const rawText = String(formData.get("rawText") ?? "").trim();
  if (rawText.length < 20) {
    throw new Error("Cole um relatório com texto suficiente para análise.");
  }
  const report = await saveAnalyzedReport(rawText);
  redirect(`/reports/${report.id}`);
}
