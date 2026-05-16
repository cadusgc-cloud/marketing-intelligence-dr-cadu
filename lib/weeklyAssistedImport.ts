import { createWeeklyMarketingDataFromEditableFields, normalizeWeeklyMarketingData, type WeeklyMarketingData } from "@/lib/weeklyDataInput";
import type { WeeklyMarketingWeekInput } from "@/lib/weeklyMarketingWeeks";

type ImportableField = keyof WeeklyMarketingWeekInput;

export type WeeklyAssistedImportField = {
  key: ImportableField;
  label: string;
  value: string | number | null;
  rawValue: string;
  sourceLine: string;
};

export type WeeklyAssistedImportResult = {
  fields: Partial<WeeklyMarketingWeekInput>;
  recognizedFields: WeeklyAssistedImportField[];
  warnings: string[];
  ignoredLines: string[];
  sensitiveWarnings: string[];
};

type FieldAlias = {
  key: ImportableField;
  label: string;
  aliases: string[];
  kind: "text" | "date" | "money" | "integer" | "nullableInteger";
};

const fieldAliases: FieldAlias[] = [
  field("weekLabel", "Rotulo da semana", "text", ["rotulo da semana", "label da semana", "semana", "nome da semana"]),
  field("startDate", "Inicio", "date", ["inicio", "data inicio", "data de inicio", "start date", "inicio do periodo"]),
  field("endDate", "Fim", "date", ["fim", "data fim", "data de fim", "end date", "fim do periodo"]),
  field("metaSpend", "Investimento Meta Ads", "money", ["investimento meta", "meta spend", "gasto meta", "valor gasto meta", "meta ads investimento", "investimento meta ads"]),
  field("metaWhatsappConversations", "Conversas Meta/WhatsApp", "integer", ["conversas meta", "conversas iniciadas no whatsapp", "conversas whatsapp meta", "meta whatsapp", "whatsapp meta"]),
  field("metaProfileVisits", "Visitas ao perfil via Meta", "integer", ["visitas ao perfil meta", "visitas perfil meta", "profile visits meta"]),
  field("googleSpend", "Investimento Google Ads", "money", ["investimento google", "google spend", "gasto google", "valor gasto google", "investimento google ads"]),
  field("googleClicks", "Cliques Google Ads", "integer", ["cliques google", "google clicks", "cliques google ads"]),
  field("googleConversions", "Conversoes Google Ads", "integer", ["conversoes google", "conversoes google ads", "google conversions", "conversoes"]),
  field("instagramStories", "Stories publicados", "integer", ["stories", "stories publicados", "instagram stories", "stories na semana"]),
  field("instagramReels", "Reels/Shorts publicados", "integer", ["reels", "shorts", "reels publicados", "reels shorts", "instagram reels"]),
  field("instagramPosts", "Posts publicados", "integer", ["posts", "posts publicados", "publicacoes", "instagram posts"]),
  field("instagramProfileVisits", "Visitas ao perfil Instagram", "integer", ["visitas ao perfil instagram", "visitas perfil instagram", "instagram profile visits"]),
  field("whatsappTotal", "WhatsApps totais", "integer", ["whatsapps totais", "total de conversas", "total whatsapp", "whatsapp total", "conversas recebidas"]),
  field("qualifiedConversations", "Conversas qualificadas", "integer", ["conversas qualificadas", "qualificados", "leads qualificados"]),
  field("consultationsScheduled", "Consultas marcadas", "nullableInteger", ["consultas marcadas", "agendamentos", "consultas agendadas", "scheduled consultations"]),
  field("consultationsAttended", "Consultas comparecidas", "nullableInteger", ["consultas comparecidas", "comparecimentos", "attended consultations"]),
  field("surgeriesClosed", "Cirurgias fechadas", "nullableInteger", ["cirurgias fechadas", "cirurgias marcadas", "fechamentos", "surgeries closed"]),
  field("notes", "Observacoes", "text", ["observacoes", "observacao", "notas", "notes"])
];

const sensitivePatterns = [
  /paciente/i,
  /prontu[aá]rio/i,
  /cpf/i,
  /rg\b/i,
  /telefone/i,
  /whatsapp real/i,
  /dm individual/i,
  /nome completo/i
];

export function parseWeeklyAssistedImport(rawText: string): WeeklyAssistedImportResult {
  const fields: Partial<WeeklyMarketingWeekInput> = {};
  const recognizedFields: WeeklyAssistedImportField[] = [];
  const warnings: string[] = [];
  const ignoredLines: string[] = [];
  const sensitiveWarnings: string[] = [];
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (!rawText.trim()) {
    return {
      fields,
      recognizedFields,
      warnings: ["Cole dados agregados antes de gerar a previa."],
      ignoredLines,
      sensitiveWarnings
    };
  }

  for (const line of lines) {
    if (sensitivePatterns.some((pattern) => pattern.test(line))) {
      sensitiveWarnings.push(`Linha exige revisao humana por possivel dado sensivel: ${line}`);
    }

    if (parsePeriodLine(line, fields, recognizedFields)) continue;
    if (parseKeyValueLine(line, fields, recognizedFields, warnings)) continue;
    if (parseSeparatedMetricLine(line, fields, recognizedFields, warnings)) continue;

    ignoredLines.push(line);
  }

  if (recognizedFields.length === 0) {
    warnings.push("Nenhum campo conhecido foi identificado. Use linhas no formato 'campo: valor' ou uma tabela com campo e valor.");
  }

  return {
    fields,
    recognizedFields,
    warnings: unique(warnings),
    ignoredLines,
    sensitiveWarnings: unique(sensitiveWarnings)
  };
}

export function applyWeeklyAssistedImport(baseData: WeeklyMarketingData, result: WeeklyAssistedImportResult): WeeklyMarketingData {
  return normalizeWeeklyMarketingData(
    createWeeklyMarketingDataFromEditableFields({
      ...baseData,
      ...result.fields
    })
  );
}

function parsePeriodLine(
  line: string,
  fields: Partial<WeeklyMarketingWeekInput>,
  recognizedFields: WeeklyAssistedImportField[]
): boolean {
  if (!normalizeLabel(line).includes("periodo")) return false;
  const dates = Array.from(line.matchAll(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g)).map((match) => normalizeDate(match[0]));
  if (dates.length < 2 || !dates[0] || !dates[1]) return false;

  fields.startDate = dates[0];
  fields.endDate = dates[1];
  recognizedFields.push(importField("startDate", dates[0], dates[0], line));
  recognizedFields.push(importField("endDate", dates[1], dates[1], line));
  return true;
}

function parseKeyValueLine(
  line: string,
  fields: Partial<WeeklyMarketingWeekInput>,
  recognizedFields: WeeklyAssistedImportField[],
  warnings: string[]
): boolean {
  const match = line.match(/^([^:：=]+)[:：=](.+)$/);
  if (!match) return false;
  return parsePair(match[1], match[2], line, fields, recognizedFields, warnings);
}

function parseSeparatedMetricLine(
  line: string,
  fields: Partial<WeeklyMarketingWeekInput>,
  recognizedFields: WeeklyAssistedImportField[],
  warnings: string[]
): boolean {
  const separator = line.includes("\t") ? "\t" : line.includes(";") ? ";" : null;
  if (!separator) return false;
  const parts = line.split(separator).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return false;

  if (isFieldValueHeader(parts)) return false;
  return parsePair(parts[0], parts.slice(1).join(" "), line, fields, recognizedFields, warnings);
}

function parsePair(
  rawLabel: string,
  rawValue: string,
  sourceLine: string,
  fields: Partial<WeeklyMarketingWeekInput>,
  recognizedFields: WeeklyAssistedImportField[],
  warnings: string[]
): boolean {
  const definition = findField(rawLabel);
  if (!definition) return false;

  const parsedValue = parseValue(rawValue, definition.kind);
  if (parsedValue.valid) {
    (fields[definition.key] as string | number | null | undefined) = parsedValue.value;
    recognizedFields.push(importField(definition.key, parsedValue.value, rawValue, sourceLine));
    return true;
  }

  warnings.push(`${definition.label}: ${parsedValue.error}`);
  return true;
}

function parseValue(
  rawValue: string,
  kind: FieldAlias["kind"]
): { valid: true; value: string | number | null } | { valid: false; error: string } {
  const cleaned = rawValue.trim();
  if (kind === "text") return { valid: true, value: cleaned };

  if (kind === "date") {
    const parsed = normalizeDate(cleaned);
    return parsed ? { valid: true, value: parsed } : { valid: false, error: "data nao reconhecida." };
  }

  if (kind === "nullableInteger" && !cleaned) return { valid: true, value: null };

  const number = parseNumber(cleaned);
  if (number === null) return { valid: false, error: "numero nao reconhecido." };
  if (number < 0) return { valid: false, error: "valor negativo nao permitido." };
  if ((kind === "integer" || kind === "nullableInteger") && !Number.isInteger(number)) {
    return { valid: false, error: "valor precisa ser inteiro." };
  }

  return { valid: true, value: number };
}

function parseNumber(value: string): number | null {
  const match = value.replace(/[^\d,.-]/g, "").match(/-?\d[\d.,]*/);
  if (!match) return null;
  const compact = match[0].replace(/\s/g, "");
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: string): string | null {
  const match = value.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (!match) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? value.trim() : null;
  }

  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  const iso = `${year}-${month}-${day}`;
  const parsed = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso ? null : iso;
}

function findField(rawLabel: string): FieldAlias | null {
  const normalized = normalizeLabel(rawLabel);
  return fieldAliases.find((item) => item.aliases.some((alias) => normalized === normalizeLabel(alias) || normalized.includes(normalizeLabel(alias)))) ?? null;
}

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function importField(key: ImportableField, value: string | number | null, rawValue: string, sourceLine: string): WeeklyAssistedImportField {
  return {
    key,
    label: fieldAliases.find((field) => field.key === key)?.label ?? String(key),
    value,
    rawValue,
    sourceLine
  };
}

function field(key: ImportableField, label: string, kind: FieldAlias["kind"], aliases: string[]): FieldAlias {
  return { key, label, kind, aliases };
}

function isFieldValueHeader(parts: string[]): boolean {
  const normalized = parts.map(normalizeLabel);
  return normalized[0] === "campo" && normalized[1] === "valor";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
