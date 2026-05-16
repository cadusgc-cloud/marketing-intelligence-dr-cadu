import { parseWeeklyAssistedImport, type WeeklyAssistedImportResult } from "@/lib/weeklyAssistedImport";
import type { WeeklyMarketingWeekInput } from "@/lib/weeklyMarketingWeeks";

export type WeeklyCsvDelimiter = "comma" | "semicolon" | "tab" | "unknown";
export type WeeklyCsvImportField = keyof WeeklyMarketingWeekInput;
export type WeeklyCsvColumnMappingKey = "ignore" | "period" | WeeklyCsvImportField;
export type WeeklyCsvColumnMapping = Record<number, WeeklyCsvColumnMappingKey>;

export type WeeklyCsvColumnMappingOption = {
  key: WeeklyCsvColumnMappingKey;
  label: string;
  description: string;
};

export type WeeklyCsvImportResult = {
  delimiter: WeeklyCsvDelimiter;
  rowCount: number;
  columnCount: number;
  headers: string[];
  selectedRow: string[];
  suggestedMappings: WeeklyCsvColumnMapping;
  isFieldValueTable: boolean;
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

const csvColumnMappingOptions: WeeklyCsvColumnMappingOption[] = [
  option("ignore", "Ignorar coluna", "Nao usar esta coluna na importacao."),
  option("period", "Periodo", "Intervalo da semana em uma unica coluna."),
  option("weekLabel", "Rotulo da semana", "Nome interno da semana."),
  option("startDate", "Inicio", "Data inicial da semana."),
  option("endDate", "Fim", "Data final da semana."),
  option("metaSpend", "Investimento Meta Ads", "Valor investido em Meta Ads."),
  option("metaWhatsappConversations", "Conversas Meta/WhatsApp", "Conversas vindas de Meta Ads."),
  option("metaProfileVisits", "Visitas ao perfil via Meta", "Visitas ao perfil atribuidas a Meta Ads."),
  option("googleSpend", "Investimento Google Ads", "Valor investido em Google Ads."),
  option("googleClicks", "Cliques Google Ads", "Cliques vindos do Google Ads."),
  option("googleConversions", "Conversoes Google Ads", "Conversoes registradas no Google Ads."),
  option("instagramStories", "Stories publicados", "Quantidade de Stories na semana."),
  option("instagramReels", "Reels/Shorts publicados", "Quantidade de Reels ou Shorts na semana."),
  option("instagramPosts", "Posts publicados", "Quantidade de posts na semana."),
  option("instagramProfileVisits", "Visitas ao perfil Instagram", "Visitas organicas ao perfil."),
  option("whatsappTotal", "WhatsApps totais", "Total agregado de conversas no WhatsApp."),
  option("qualifiedConversations", "Conversas qualificadas", "Conversas qualificadas no funil."),
  option("consultationsScheduled", "Consultas marcadas", "Consultas marcadas pela equipe."),
  option("consultationsAttended", "Consultas comparecidas", "Consultas efetivamente comparecidas."),
  option("surgeriesClosed", "Cirurgias fechadas", "Fechamentos agregados da semana."),
  option("notes", "Observacoes", "Notas internas agregadas da semana.")
];

const manualMappingAliases: Array<{ key: WeeklyCsvColumnMappingKey; aliases: string[] }> = [
  { key: "period", aliases: ["periodo", "periodo coletado", "intervalo", "intervalo da semana", "datas da semana", "data da semana"] },
  { key: "weekLabel", aliases: ["semana", "nome semana", "nome da semana", "rotulo", "label", "week"] },
  { key: "startDate", aliases: ["inicio", "data inicio", "data inicial", "start", "start date"] },
  { key: "endDate", aliases: ["fim", "data fim", "data final", "end", "end date"] },
  { key: "metaSpend", aliases: ["meta r", "meta rs", "meta custo", "custo meta", "gasto meta", "investimento meta", "meta ads valor"] },
  { key: "metaWhatsappConversations", aliases: ["wa ads", "whatsapp ads", "leads meta", "conversas meta", "whatsapp meta", "conversas ads"] },
  { key: "metaProfileVisits", aliases: ["visitas meta", "perfil meta", "profile visits meta"] },
  { key: "googleSpend", aliases: ["google r", "google rs", "google custo", "custo google", "gasto google", "investimento google"] },
  { key: "googleClicks", aliases: ["cliques google", "google clicks", "clicks google"] },
  { key: "googleConversions", aliases: ["conversoes google", "conversions google", "google conv", "conv google"] },
  { key: "instagramStories", aliases: ["stories ig", "ig stories", "stories instagram", "stories"] },
  { key: "instagramReels", aliases: ["reels ig", "ig reels", "reels instagram", "shorts"] },
  { key: "instagramPosts", aliases: ["posts ig", "publicacoes ig", "posts instagram", "publicacoes"] },
  { key: "instagramProfileVisits", aliases: ["visitas ig", "perfil ig", "visitas instagram", "profile visits instagram"] },
  { key: "whatsappTotal", aliases: ["whatsapp total", "wa total", "total whatsapp", "total de whatsapp", "conversas totais"] },
  { key: "qualifiedConversations", aliases: ["qualificados", "conversas qualificadas", "leads qualificados"] },
  { key: "consultationsScheduled", aliases: ["consultas marcadas", "consultas agendadas", "agendamentos", "scheduled consultations"] },
  { key: "consultationsAttended", aliases: ["consultas comparecidas", "comparecimentos", "attended consultations"] },
  { key: "surgeriesClosed", aliases: ["cirurgias fechadas", "cirurgias marcadas", "fechamentos", "surgeries closed"] },
  { key: "notes", aliases: ["observacoes", "observacao", "notas", "notes"] }
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
  return parseWeeklyCsvImportWithMapping(rawText);
}

export function buildWeeklyCsvMappedImport(rawText: string, mappings: WeeklyCsvColumnMapping): WeeklyCsvImportResult {
  return parseWeeklyCsvImportWithMapping(rawText, mappings);
}

export function getWeeklyCsvColumnMappingOptions(): WeeklyCsvColumnMappingOption[] {
  return csvColumnMappingOptions;
}

export function suggestWeeklyCsvColumnMapping(header: string): WeeklyCsvColumnMappingKey {
  const normalizedHeader = normalize(header);
  if (!normalizedHeader) return "ignore";

  const manualMatch = manualMappingAliases.find((item) =>
    item.aliases.some((alias) => normalizedHeader === normalize(alias) || normalizedHeader.includes(normalize(alias)))
  );
  if (manualMatch) return manualMatch.key;

  if (normalizedHeader.includes("periodo")) return "period";

  for (const sampleValue of ["1", "R$ 1,00", "11/05/2026", "texto"]) {
    const parsed = parseWeeklyAssistedImport(`${header}: ${sampleValue}`);
    const recognized = parsed.recognizedFields[0]?.key;
    if (recognized) return recognized;
  }

  return "ignore";
}

function parseWeeklyCsvImportWithMapping(rawText: string, overrideMappings?: WeeklyCsvColumnMapping): WeeklyCsvImportResult {
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
      headers: [],
      selectedRow: [],
      suggestedMappings: {},
      isFieldValueTable: false,
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
      headers: [],
      selectedRow: [],
      suggestedMappings: {},
      isFieldValueTable: false,
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
  const tableInfo = getWideTableInfo(rows);
  const fieldValueTable = isFieldValueTable(rows);
  const suggestedMappings = fieldValueTable || !tableInfo ? {} : suggestWeeklyCsvColumnMappings(tableInfo.headers);
  const effectiveMappings = fieldValueTable || !tableInfo ? undefined : mergeColumnMappings(tableInfo.headers, suggestedMappings, overrideMappings);
  const normalizedText = convertRowsToFieldValueText(rows, warnings, ignoredRows, effectiveMappings);
  const assistedResult = parseWeeklyAssistedImport(normalizedText);

  if (!normalizedText) {
    warnings.push("A tabela nao tem campos e valores suficientes para montar uma importacao.");
  }

  return {
    delimiter: delimiter.type,
    rowCount: rows.length,
    columnCount: Math.max(0, ...rows.map((row) => row.length)),
    headers: tableInfo?.headers ?? [],
    selectedRow: tableInfo?.selectedRow ?? [],
    suggestedMappings,
    isFieldValueTable: fieldValueTable,
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

function convertRowsToFieldValueText(rows: string[][], warnings: string[], ignoredRows: string[], mappings?: WeeklyCsvColumnMapping): string {
  if (rows.length === 0) return "";

  if (isFieldValueTable(rows)) {
    const dataRows = isFieldValueHeader(rows[0]) ? rows.slice(1) : rows;
    return dataRows
      .map((row) => row.slice(0, 2))
      .filter(([field, value]) => field && value !== undefined)
      .map(([field, value]) => `${field}: ${value}`)
      .join("\n");
  }

  const tableInfo = getWideTableInfo(rows);
  if (!tableInfo) {
    ignoredRows.push(...rows.map((row) => row.join(" | ")));
    return "";
  }

  if (tableInfo.usableDataRowCount > 1) {
    warnings.push("A tabela tem mais de uma linha de dados. Foi usada a ultima linha nao vazia como semana atual.");
  }

  if (mappings) return convertMappedWideRowToFieldValueText(tableInfo.headers, tableInfo.selectedRow, mappings, warnings);

  return tableInfo.headers
    .map((header, index) => [header, tableInfo.selectedRow[index]] as const)
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
  return suggestWeeklyCsvColumnMapping(header) !== "ignore";
}

function getWideTableInfo(
  rows: string[][]
): { headers: string[]; selectedRow: string[]; usableDataRowCount: number } | null {
  const [headers, ...dataRows] = rows;
  const usableRows = dataRows.filter((row) => row.some(Boolean));
  if (!headers || usableRows.length === 0) return null;

  return {
    headers,
    selectedRow: usableRows[usableRows.length - 1],
    usableDataRowCount: usableRows.length
  };
}

function suggestWeeklyCsvColumnMappings(headers: string[]): WeeklyCsvColumnMapping {
  return headers.reduce<WeeklyCsvColumnMapping>((mappings, header, index) => {
    mappings[index] = suggestWeeklyCsvColumnMapping(header);
    return mappings;
  }, {});
}

function mergeColumnMappings(
  headers: string[],
  suggestedMappings: WeeklyCsvColumnMapping,
  overrideMappings?: WeeklyCsvColumnMapping
): WeeklyCsvColumnMapping {
  return headers.reduce<WeeklyCsvColumnMapping>((mappings, _header, index) => {
    mappings[index] = overrideMappings?.[index] ?? suggestedMappings[index] ?? "ignore";
    return mappings;
  }, {});
}

function convertMappedWideRowToFieldValueText(
  headers: string[],
  selectedRow: string[],
  mappings: WeeklyCsvColumnMapping,
  warnings: string[]
): string {
  const mappedColumns = headers
    .map((header, index) => ({ header, value: selectedRow[index], mapping: mappings[index] ?? "ignore" }))
    .filter((item) => item.header && item.value !== undefined && item.value !== "" && item.mapping !== "ignore");

  const duplicatedMappings = getDuplicatedMappings(mappedColumns.map((item) => item.mapping));
  if (duplicatedMappings.length > 0) {
    warnings.push(`Mais de uma coluna aponta para o mesmo campo: ${duplicatedMappings.map(getColumnMappingLabel).join(", ")}.`);
  }

  const ignoredHeaders = headers.filter((header, index) => header && selectedRow[index] !== undefined && selectedRow[index] !== "" && (mappings[index] ?? "ignore") === "ignore");
  if (ignoredHeaders.length > 0) {
    warnings.push(`Colunas sem mapeamento foram ignoradas: ${ignoredHeaders.slice(0, 6).join(", ")}.`);
  }

  if (mappedColumns.length === 0) {
    warnings.push("Nenhuma coluna foi mapeada para campos conhecidos. Ajuste o mapeamento manual antes de enviar para a importacao assistida.");
    return "";
  }

  return mappedColumns
    .map((item) => `${getColumnMappingLabel(item.mapping)}: ${item.value}`)
    .join("\n");
}

function getDuplicatedMappings(mappings: WeeklyCsvColumnMappingKey[]): WeeklyCsvColumnMappingKey[] {
  const counts = new Map<WeeklyCsvColumnMappingKey, number>();
  for (const mapping of mappings) {
    if (mapping === "ignore") continue;
    counts.set(mapping, (counts.get(mapping) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([mapping]) => mapping);
}

function getColumnMappingLabel(key: WeeklyCsvColumnMappingKey): string {
  return csvColumnMappingOptions.find((option) => option.key === key)?.label ?? String(key);
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

function option(key: WeeklyCsvColumnMappingKey, label: string, description: string): WeeklyCsvColumnMappingOption {
  return { key, label, description };
}
