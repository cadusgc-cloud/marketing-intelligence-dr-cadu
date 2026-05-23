import type { NormalizedReportRow } from "@/lib/report-imports/types";
import type { ContentMatchInput, ContentMatchResult } from "@/lib/weekly-review/types";

export function matchMetricsToContent(records: NormalizedReportRow[], contentItems: ContentMatchInput[] = []): ContentMatchResult {
  const strongMatches: ContentMatchResult["strongMatches"] = [];
  const probableMatches: ContentMatchResult["probableMatches"] = [];
  const unmatched: NormalizedReportRow[] = [];
  const conflicts: string[] = [];
  const duplicateKeys = new Map<string, number>();

  records.forEach((record) => {
    const key = `${record.date}|${record.format}|${record.title.toLowerCase()}`;
    duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
    const candidates = contentItems.map((content) => ({ content, confidence: calculateMatchConfidence(record, content) })).sort((a, b) => b.confidence - a.confidence);
    const best = candidates[0];
    if (!best || best.confidence < 45) {
      unmatched.push(record);
      return;
    }
    if (best.confidence >= 80) strongMatches.push({ record, content: best.content, confidence: best.confidence });
    else probableMatches.push({ record, content: best.content, confidence: best.confidence });
    if (candidates[1] && best.confidence - candidates[1].confidence < 8) {
      conflicts.push(`linha ${record.rowNumber}: mais de um conteudo possivel para ${record.title}`);
    }
  });

  const duplicates = [...duplicateKeys.entries()].filter(([, count]) => count > 1).map(([key]) => key);
  return { strongMatches, probableMatches, unmatched, conflicts, duplicates };
}

function calculateMatchConfidence(record: NormalizedReportRow, content: ContentMatchInput): number {
  let score = 0;
  if (record.date && content.date && record.date === content.date) score += 25;
  if (content.format && record.format === content.format) score += 20;
  if (content.pillar && record.pillar === content.pillar) score += 15;
  if (content.theme && normalize(record.theme).includes(normalize(content.theme))) score += 20;
  if (content.title && normalize(record.title).includes(normalize(content.title))) score += 25;
  return Math.min(100, score);
}

function normalize(value = ""): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
