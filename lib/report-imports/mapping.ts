import { getSourcePreset, normalizeHeader } from "@/lib/report-imports/sources";
import type { CanonicalReportField, ReportColumnMapping, ReportSource } from "@/lib/report-imports/types";

export function suggestColumnMapping(
  headers: string[],
  source: ReportSource,
  manualMapping: Partial<Record<string, CanonicalReportField>> = {}
): ReportColumnMapping {
  const preset = getSourcePreset(source);
  const mapped: Record<string, CanonicalReportField> = {};

  headers.forEach((header) => {
    if (manualMapping[header]) {
      mapped[header] = manualMapping[header] ?? "unknown";
      return;
    }

    const normalized = normalizeHeader(header);
    const match = (Object.entries(preset.acceptedHeaders) as Array<[CanonicalReportField, string[]]>).find(([, aliases]) =>
      aliases.some((alias) => normalizeHeader(alias) === normalized)
    );
    mapped[header] = match?.[0] ?? "unknown";
  });

  const mappedFields = new Set(Object.values(mapped));
  const unknownHeaders = headers.filter((header) => mapped[header] === "unknown");
  const missingRequiredFields = preset.requiredFields.filter((field) => !mappedFields.has(field));
  const recognized = headers.length - unknownHeaders.length;
  const requiredPenalty = missingRequiredFields.length * 15;
  const schemaMatchScore = Math.max(0, Math.min(100, Math.round((recognized / Math.max(headers.length, 1)) * 100 - requiredPenalty)));

  return {
    source,
    headers,
    mapped,
    unknownHeaders,
    missingRequiredFields,
    schemaMatchScore
  };
}
