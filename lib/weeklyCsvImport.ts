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

export type WeeklyCsvColumnMappingPresetId = "auto" | "weekly-sheet" | "paid-media" | "organic-content" | "commercial-funnel";

export type WeeklyCsvColumnMappingPreset = {
  id: WeeklyCsvColumnMappingPresetId;
  label: string;
  description: string;
};

export type WeeklyCsvReadinessStatus = "ready" | "needs-review" | "blocked";
export type WeeklyCsvReadinessItemStatus = "ok" | "missing" | "review";

export type WeeklyCsvReadinessItem = {
  id: string;
  label: string;
  status: WeeklyCsvReadinessItemStatus;
  detail: string;
};

export type WeeklyCsvReadinessReport = {
  status: WeeklyCsvReadinessStatus;
  summary: string;
  canSendToAssistedImport: boolean;
  items: WeeklyCsvReadinessItem[];
  blockers: string[];
  reviewNotes: string[];
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
  readinessReport: WeeklyCsvReadinessReport;
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

const csvColumnMappingPresetDefinitions: Array<WeeklyCsvColumnMappingPreset & { fields: Array<{ key: WeeklyCsvColumnMappingKey; aliases: string[] }> }> = [
  {
    id: "auto",
    label: "Detectar automaticamente",
    description: "Usa os cabecalhos reconhecidos pelo sistema e deixa o restante para revisao manual.",
    fields: []
  },
  {
    id: "weekly-sheet",
    label: "Planilha semanal consolidada",
    description: "Perfil amplo para a planilha operacional da semana com midia, Instagram e funil.",
    fields: [
      presetField("weekLabel", ["semana", "rotulo", "nome da semana"]),
      presetField("period", ["periodo", "intervalo", "datas"]),
      presetField("metaSpend", ["meta r", "meta rs", "investimento meta", "gasto meta"]),
      presetField("metaWhatsappConversations", ["wa ads", "whatsapp ads", "conversas meta", "leads meta"]),
      presetField("googleSpend", ["google r", "google rs", "investimento google", "gasto google"]),
      presetField("googleClicks", ["cliques google", "clicks google"]),
      presetField("googleConversions", ["conversoes google", "conv google"]),
      presetField("instagramStories", ["stories ig", "stories"]),
      presetField("instagramReels", ["reels ig", "reels", "shorts"]),
      presetField("instagramPosts", ["posts ig", "posts", "publicacoes"]),
      presetField("instagramProfileVisits", ["visitas ig", "visitas instagram", "perfil instagram"]),
      presetField("whatsappTotal", ["whatsapp total", "total whatsapp", "conversas totais"]),
      presetField("qualifiedConversations", ["qualificados", "conversas qualificadas"]),
      presetField("consultationsScheduled", ["consultas marcadas", "agendamentos"]),
      presetField("consultationsAttended", ["consultas comparecidas", "comparecimentos"]),
      presetField("surgeriesClosed", ["cirurgias fechadas", "fechamentos"]),
      presetField("notes", ["observacoes", "notas"])
    ]
  },
  {
    id: "paid-media",
    label: "Midia paga",
    description: "Foca em Meta Ads e Google Ads, mantendo colunas organicas e comerciais como revisao manual.",
    fields: [
      presetField("period", ["periodo", "intervalo"]),
      presetField("weekLabel", ["semana", "rotulo"]),
      presetField("metaSpend", ["meta r", "meta rs", "amount spent meta", "gasto meta", "investimento meta"]),
      presetField("metaWhatsappConversations", ["wa ads", "whatsapp ads", "conversas meta", "leads meta"]),
      presetField("metaProfileVisits", ["visitas meta", "perfil meta"]),
      presetField("googleSpend", ["google r", "google rs", "cost google", "gasto google", "investimento google"]),
      presetField("googleClicks", ["cliques google", "clicks google"]),
      presetField("googleConversions", ["conversoes google", "google conversions", "conv google"])
    ]
  },
  {
    id: "organic-content",
    label: "Instagram organico",
    description: "Foca em Stories, Reels, posts e visitas ao perfil.",
    fields: [
      presetField("period", ["periodo", "intervalo"]),
      presetField("weekLabel", ["semana", "rotulo"]),
      presetField("instagramStories", ["stories", "stories ig", "instagram stories"]),
      presetField("instagramReels", ["reels", "reels ig", "shorts"]),
      presetField("instagramPosts", ["posts", "posts ig", "publicacoes"]),
      presetField("instagramProfileVisits", ["visitas perfil", "visitas ig", "perfil instagram", "profile visits"])
    ]
  },
  {
    id: "commercial-funnel",
    label: "Funil comercial",
    description: "Foca em WhatsApp, qualificacao, consultas e fechamentos.",
    fields: [
      presetField("period", ["periodo", "intervalo"]),
      presetField("weekLabel", ["semana", "rotulo"]),
      presetField("whatsappTotal", ["whatsapp total", "total whatsapp", "conversas totais", "whatsapps"]),
      presetField("qualifiedConversations", ["qualificados", "conversas qualificadas", "leads qualificados"]),
      presetField("consultationsScheduled", ["consultas marcadas", "consultas agendadas", "agendamentos"]),
      presetField("consultationsAttended", ["consultas comparecidas", "comparecimentos"]),
      presetField("surgeriesClosed", ["cirurgias fechadas", "fechamentos"])
    ]
  }
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

export function getWeeklyCsvColumnMappingPresets(): WeeklyCsvColumnMappingPreset[] {
  return csvColumnMappingPresetDefinitions.map(({ id, label, description }) => ({ id, label, description }));
}

export function applyWeeklyCsvColumnMappingPreset(headers: string[], presetId: WeeklyCsvColumnMappingPresetId): WeeklyCsvColumnMapping {
  if (presetId === "auto") return suggestWeeklyCsvColumnMappings(headers);

  const preset = csvColumnMappingPresetDefinitions.find((item) => item.id === presetId);
  if (!preset) return suggestWeeklyCsvColumnMappings(headers);

  return headers.reduce<WeeklyCsvColumnMapping>((mappings, header, index) => {
    const presetMapping = findPresetMapping(header, preset.fields);
    mappings[index] = presetMapping ?? suggestWeeklyCsvColumnMapping(header);
    return mappings;
  }, {});
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
    const finalWarnings = ["Cole um CSV/TSV ou carregue um arquivo antes de gerar a previa."];
    return {
      delimiter: "unknown",
      rowCount: 0,
      columnCount: 0,
      headers: [],
      selectedRow: [],
      suggestedMappings: {},
      isFieldValueTable: false,
      normalizedText: "",
      warnings: finalWarnings,
      sensitiveWarnings,
      ignoredRows,
      assistedResult,
      readinessReport: buildWeeklyCsvReadinessReport("", assistedResult, finalWarnings, sensitiveWarnings)
    };
  }

  const delimiter = detectDelimiter(trimmedText);
  if (!delimiter) {
    warnings.push("Nenhum delimitador CSV/TSV foi identificado. Use virgula, ponto e virgula ou tabulacao.");
    const assistedResult = parseWeeklyAssistedImport(trimmedText);
    const finalWarnings = unique([...warnings, ...assistedResult.warnings]);
    const finalSensitiveWarnings = unique([...sensitiveWarnings, ...assistedResult.sensitiveWarnings]);
    return {
      delimiter: "unknown",
      rowCount: trimmedText.split(/\r?\n/).filter(Boolean).length,
      columnCount: 1,
      headers: [],
      selectedRow: [],
      suggestedMappings: {},
      isFieldValueTable: false,
      normalizedText: trimmedText,
      warnings: finalWarnings,
      sensitiveWarnings: finalSensitiveWarnings,
      ignoredRows,
      assistedResult,
      readinessReport: buildWeeklyCsvReadinessReport(trimmedText, assistedResult, finalWarnings, finalSensitiveWarnings)
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
  const finalWarnings = unique([...warnings, ...assistedResult.warnings]);
  const finalSensitiveWarnings = unique([...sensitiveWarnings, ...assistedResult.sensitiveWarnings]);

  return {
    delimiter: delimiter.type,
    rowCount: rows.length,
    columnCount: Math.max(0, ...rows.map((row) => row.length)),
    headers: tableInfo?.headers ?? [],
    selectedRow: tableInfo?.selectedRow ?? [],
    suggestedMappings,
    isFieldValueTable: fieldValueTable,
    normalizedText,
    warnings: finalWarnings,
    sensitiveWarnings: finalSensitiveWarnings,
    ignoredRows,
    assistedResult,
    readinessReport: buildWeeklyCsvReadinessReport(normalizedText, assistedResult, finalWarnings, finalSensitiveWarnings)
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

function buildWeeklyCsvReadinessReport(
  normalizedText: string,
  assistedResult: WeeklyAssistedImportResult,
  warnings: string[],
  sensitiveWarnings: string[]
): WeeklyCsvReadinessReport {
  const fields = assistedResult.fields;
  const blockers: string[] = [];
  const reviewNotes: string[] = [];
  const items: WeeklyCsvReadinessItem[] = [];

  if (!normalizedText.trim()) blockers.push("Nenhum texto importavel foi gerado.");
  if (sensitiveWarnings.length > 0) blockers.push("Ha possiveis dados sensiveis na importacao.");
  if (assistedResult.recognizedFields.length === 0) blockers.push("Nenhum campo conhecido foi reconhecido.");

  items.push(
    readinessItem(
      "recognized-fields",
      "Campos reconhecidos",
      assistedResult.recognizedFields.length > 0 ? "ok" : "missing",
      assistedResult.recognizedFields.length > 0
        ? `${assistedResult.recognizedFields.length} campo(s) reconhecido(s).`
        : "Gere uma previa com campos conhecidos antes de enviar."
    )
  );

  const hasPeriod = Boolean(fields.startDate && fields.endDate);
  items.push(
    readinessItem(
      "period",
      "Periodo da semana",
      hasPeriod ? "ok" : "missing",
      hasPeriod ? `${fields.startDate} a ${fields.endDate}.` : "Informe periodo, inicio/fim ou revise o mapeamento de datas."
    )
  );

  const hasWeekLabel = Boolean(fields.weekLabel);
  items.push(
    readinessItem(
      "week-label",
      "Rotulo da semana",
      hasWeekLabel ? "ok" : "missing",
      hasWeekLabel ? String(fields.weekLabel) : "Inclua um rotulo para facilitar historico e revisao."
    )
  );

  const acquisitionFields: WeeklyCsvImportField[] = [
    "metaSpend",
    "metaWhatsappConversations",
    "metaProfileVisits",
    "googleSpend",
    "googleClicks",
    "googleConversions",
    "instagramStories",
    "instagramReels",
    "instagramPosts",
    "instagramProfileVisits"
  ];
  const acquisitionCount = countPresentFields(fields, acquisitionFields);
  items.push(
    readinessItem(
      "acquisition",
      "Midia e conteudo",
      acquisitionCount > 0 ? "ok" : "review",
      acquisitionCount > 0 ? `${acquisitionCount} campo(s) de aquisicao/conteudo detectado(s).` : "Nenhum campo de midia ou conteudo foi detectado."
    )
  );

  const funnelFields: WeeklyCsvImportField[] = [
    "whatsappTotal",
    "qualifiedConversations",
    "consultationsScheduled",
    "consultationsAttended",
    "surgeriesClosed"
  ];
  const funnelCount = countPresentFields(fields, funnelFields);
  items.push(
    readinessItem(
      "funnel",
      "Funil comercial",
      funnelCount > 0 ? "ok" : "review",
      funnelCount > 0 ? `${funnelCount} campo(s) do funil detectado(s).` : "Nenhum campo de funil foi detectado."
    )
  );

  if (warnings.length > 0) {
    reviewNotes.push("Ha avisos operacionais na previa CSV.");
    items.push(readinessItem("warnings", "Avisos da importacao", "review", `${warnings.length} aviso(s) precisam de leitura.`));
  }

  if (!hasPeriod) reviewNotes.push("Periodo ausente ou incompleto.");
  if (!hasWeekLabel) reviewNotes.push("Rotulo da semana ausente.");
  if (acquisitionCount === 0 && funnelCount === 0) reviewNotes.push("Poucas metricas operacionais foram reconhecidas.");

  const status: WeeklyCsvReadinessStatus =
    blockers.length > 0 ? "blocked" : reviewNotes.length > 0 ? "needs-review" : "ready";

  return {
    status,
    summary: getReadinessSummary(status),
    canSendToAssistedImport: blockers.length === 0,
    items,
    blockers,
    reviewNotes
  };
}

function countPresentFields(fields: Partial<WeeklyMarketingWeekInput>, keys: WeeklyCsvImportField[]): number {
  return keys.filter((key) => {
    const value = fields[key];
    return value !== undefined && value !== null && value !== "";
  }).length;
}

function readinessItem(
  id: string,
  label: string,
  status: WeeklyCsvReadinessItemStatus,
  detail: string
): WeeklyCsvReadinessItem {
  return { id, label, status, detail };
}

function getReadinessSummary(status: WeeklyCsvReadinessStatus): string {
  if (status === "ready") return "Previa pronta para enviar a importacao assistida.";
  if (status === "blocked") return "Corrija os bloqueios antes de enviar para a importacao assistida.";
  return "Previa utilizavel, mas exige revisao antes de enviar.";
}

function findPresetMapping(
  header: string,
  fields: Array<{ key: WeeklyCsvColumnMappingKey; aliases: string[] }>
): WeeklyCsvColumnMappingKey | null {
  const normalizedHeader = normalize(header);
  if (!normalizedHeader) return null;

  const match = fields.find((field) =>
    field.aliases.some((alias) => normalizedHeader === normalize(alias) || normalizedHeader.includes(normalize(alias)))
  );

  return match?.key ?? null;
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

function presetField(key: WeeklyCsvColumnMappingKey, aliases: string[]): { key: WeeklyCsvColumnMappingKey; aliases: string[] } {
  return { key, aliases };
}
