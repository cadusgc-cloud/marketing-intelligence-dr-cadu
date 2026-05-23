export * from "@/lib/report-imports/types";
export * from "@/lib/report-imports/sources";
export * from "@/lib/report-imports/parser";
export * from "@/lib/report-imports/mapping";
export * from "@/lib/report-imports/normalization";
export * from "@/lib/report-imports/sensitiveData";
export * from "@/lib/report-imports/validation";
export * from "@/lib/report-imports/quality";
export * from "@/lib/report-imports/examples";
export * from "@/lib/report-imports/exports";

import { buildReportImportExports } from "@/lib/report-imports/exports";
import { detectDelimiter, parseDelimitedText } from "@/lib/report-imports/parser";
import { scoreImportQuality } from "@/lib/report-imports/quality";
import { normalizeReportRows } from "@/lib/report-imports/normalization";
import { detectSensitiveData } from "@/lib/report-imports/sensitiveData";
import { suggestColumnMapping } from "@/lib/report-imports/mapping";
import { validateImportRows } from "@/lib/report-imports/validation";
import type { ReportImportInput, ReportImportResult } from "@/lib/report-imports/types";

export function parseReportImport(input: ReportImportInput): ReportImportResult {
  const delimiter = detectDelimiter(input.text);
  const { headers, rows } = parseDelimitedText(input.text, delimiter);
  const mapping = suggestColumnMapping(headers, input.source, input.manualMapping);
  const normalizedRows = normalizeReportRows(rows, mapping, input.source);
  const rowSensitiveIssues = normalizedRows.flatMap((row) => row.sensitiveIssues);
  const sensitiveIssues = [...detectSensitiveData(rows), ...rowSensitiveIssues];
  const issues = validateImportRows(rows, normalizedRows, mapping, input);
  const quality = scoreImportQuality(normalizedRows, mapping, issues, sensitiveIssues, input.periodStart, input.periodEnd);
  const resultBase = {
    source: input.source,
    delimiter,
    headers,
    rows,
    mapping,
    normalizedRows,
    issues,
    sensitiveIssues,
    quality,
    preview: {
      headers,
      rows: rows.slice(0, 8),
      normalizedSample: normalizedRows.slice(0, 8)
    },
    ok: quality.status === "aprovado",
    blocked: quality.status === "bloquear"
  };
  return {
    ...resultBase,
    exports: buildReportImportExports(resultBase)
  };
}
