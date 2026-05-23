import { evaluateTextRules } from "@/lib/marketing-quality/textRules";
import type { QualityIssue } from "@/lib/marketing-quality/types";

export function detectMedicalSafetyIssues(text: string, source = "conteudo"): QualityIssue[] {
  return evaluateTextRules(text, source);
}

export function isBlockingMedicalSafetyText(text: string): boolean {
  return detectMedicalSafetyIssues(text).some((issue) => issue.severity === "blocking");
}
