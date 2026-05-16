import { parseWeeklyAssistedImport, type WeeklyAssistedImportResult } from "@/lib/weeklyAssistedImport";

export type WeeklyCsvDelimiter = "comma" | "semicolon" | "tab" | "unknown";

export type WeeklyCsvImportResult = {
  delimiter: WeeklyCsvDelimiter;
  rowCount: number;
  columnCount: number;
  normalizedText: string;
  warnings: string[];
  sensitiveWarnings: string[];
  ignoredRows: string[];
  assistedResult: WeeklyAssistedImportResult;
};

type DelimiterCandidate = {
  type: Exclude<WeeklyCsvDelimiter, "unknown">;
  value: "," | ";" | "\t";
};

const delimiterCandidates: DelimiterCandidate[] = [
  { type: "tab", value: "\t" },
  { type: "semicolon", value: ";" },
  { type: "comma", value: "," }
];

const sensitivePatterns = [
  /paciente/i,
  /prontu[aá]rio/i,
  /cpf/i,
  /rg\b/i,
  /telefone/i,
  /whatsapp real/i,
  /dm individual/i,
  /nome completo/i,
  /conversa individual/i
];

export function parseWeeklyCsvImport(rawText: string): WeeklyCsvImportResult {
  const warnings: string[] = [];
  const ignoredRows: string[] = [];
  const sensitiveWarnings = detectSensitiveRows(rawText);
  const trimmedText = rawText.replace(/^\uFEFF/, "").trim();

  if (!trimmedText) {
    const assistedResult = parseWeeklyAssistedImport("");
    return {
      delimiter: "unknown",
      rowCount: 0,
      columnCount: 0,
      normalizedText: "",
      warnings: ["Cole um CSV/TSV ou carregue um arquivo antes de gerar a previa."],
      sensitiveWarnings,
      ignoredRows,
      assistedResult
    };
  }

  const delimiter = detectDelimiter(trimmedText);
  if (!delimiter) {
    warnings.push("Nenhum delimitador CSV/TSV foi identificado. Use virgula, ponto e virgula ou tabulacao.");
    const assistedResult = parseWeeklyAssistedImport(trimmedText);
    return {
      delimiter: "unknown",
      rowCount: trimmedText.split(/\r?\n/).filter(Boolean).length,
      columnCount: 1,
      normalizedText: trimmedText,
      warnings: unique([...warnings, ...assistedResult.warnings]),
      sensitiveWarnings: unique([...sensitiveWarnings, ...assistedResult.sensitiveWarnings]),
      ignoredRows,
      assistedResult
    };
  }

  const rows = parseDelimitedRows(trimmedText, delimiter.value)
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
  const normalizedText = convertRowsToFieldValueText(rows, warnings, ignoredRows);
  const assistedResult = parseWeeklyAssistedImport(normalizedText);

  if (!normalizedText) {
    warnings.push("A tabela nao tem campos e valores suficientes para montar uma importacao.");
  }

  return {
    delimiter: delimiter.type,
    rowCount: rows.length,
    columnCount: Math.max(0, ...rows.map((row) => row.length)),
    normalizedText,
    warnings: unique([...warnings, ...assistedResult.warnings]),
    sensitiveWarnings: unique([...sensitiveWarnings, ...assistedResult.sensitiveWarnings]),
    ignoredRows,
    assistedResult
  };
}

function detectDelimiter(text: string): DelimiterCandidate | null {
  const sampleLines = text.split(/\r?\n/).filter(Boolean).slice(0, 5);
  const scored = delimiterCandidates
    .map((candidate) => {
      const columnCounts = sampleLines.map((line) => parseDelimitedLine(line, candidate.value).length);
      const usefulRows = columnCounts.filter((count) => count > 1).length;
      const totalColumns = columnCounts.reduce((sum, count) => sum + count, 0);
      return { candidate, usefulRows, totalColumns };
    })
    .sort((a, b) => b.usefulRows - a.usefulRows || b.totalColumns - a.totalColumns);

  return scored[0]?.usefulRows ? scored[0].candidate : null;
}

function parseDelimitedRows(text: string, delimiter: "," | ";" | "\t"): string[][] {
  return text.split(/\r?\n/).map((line) => parseDelimitedLine(line, delimiter));
}

function parseDelimitedLine(line: string, delimiter: "," | ";" | "\t"): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === "\"" && quoted && nextChar === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function convertRowsToFieldValueText(rows: string[][], warnings: string[], ignoredRows: string[]): string {
  if (rows.length === 0) return "";

  if (isFieldValueTable(rows)) {
    const dataRows = isFieldValueHeader(rows[0]) ? rows.slice(1) : rows;
    return dataRows
      .map((row) => row.slice(0, 2))
      .filter(([field, value]) => field && value !== undefined)
      .map(([field, value]) => `${field}: ${value}`)
      .join("\n");
  }

  const [headers, ...dataRows] = rows;
  const usableRows = dataRows.filter((row) => row.some(Boolean));
  if (!headers || usableRows.length === 0) {
    ignoredRows.push(...rows.map((row) => row.join(" | ")));
    return "";
  }

  if (usableRows.length > 1) {
    warnings.push("A tabela tem mais de uma linha de dados. Foi usada a ultima linha nao vazia como semana atual.");
  }

  const selectedRow = usableRows[usableRows.length - 1];
  return headers
    .map((header, index) => [header, selectedRow[index]] as const)
    .filter(([header, value]) => header && value !== undefined && value !== "")
    .map(([header, value]) => `${header}: ${value}`)
    .join("\n");
}

function isFieldValueTable(rows: string[][]): boolean {
  if (isFieldValueHeader(rows[0])) return true;
  if (isLikelyWideHeader(rows[0])) return false;
  return rows.every((row) => row.length <= 2) && rows.some((row) => row.length === 2);
}

function isFieldValueHeader(row: string[] | undefined): boolean {
  if (!row || row.length < 2) return false;
  const first = normalize(row[0]);
  const second = normalize(row[1]);
  return ["campo", "metrica", "indicador"].includes(first) && ["valor", "value"].includes(second);
}

function isLikelyWideHeader(row: string[] | undefined): boolean {
  if (!row || row.length < 2) return false;
  const knownHeaders = row.filter(isKnownImportHeader).length;
  return knownHeaders >= Math.min(2, row.length);
}

function isKnownImportHeader(header: string): boolean {
  if (!header.trim()) return false;
  return (
    parseWeeklyAssistedImport(`${header}: 1`).recognizedFields.length > 0 ||
    parseWeeklyAssistedImport(`${header}: 11/05/2026`).recognizedFields.length > 0 ||
    parseWeeklyAssistedImport(`${header}: texto`).recognizedFields.length > 0
  );
}

function detectSensitiveRows(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && sensitivePatterns.some((pattern) => pattern.test(line)))
    .map((line) => `Linha exige revisao humana por possivel dado sensivel: ${line}`);
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
