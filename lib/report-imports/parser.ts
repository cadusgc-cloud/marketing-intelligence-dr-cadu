import type { RawReportRow } from "@/lib/report-imports/types";

export function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
  const candidates = ["\t", ";", ","];
  return candidates
    .map((delimiter) => ({ delimiter, count: splitDelimitedLine(firstLine, delimiter).length }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? "\t";
}

export function parseDelimitedText(text: string, delimiter = detectDelimiter(text)): { headers: string[]; rows: RawReportRow[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return { headers: [], rows: [] };

  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => header.trim());
  const rows = lines.slice(1).map((line, index) => {
    const values = splitDelimitedLine(line, delimiter);
    return {
      rowNumber: index + 2,
      values: headers.reduce<Record<string, string>>((acc, header, columnIndex) => {
        acc[header] = (values[columnIndex] ?? "").trim();
        return acc;
      }, {})
    };
  });

  return { headers, rows };
}

export function splitDelimitedLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}
