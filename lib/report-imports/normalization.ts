import type { CanonicalReportField, NormalizedReportMetrics, NormalizedReportRow, RawReportRow, ReportColumnMapping, ReportSource } from "@/lib/report-imports/types";
import { detectSensitiveText } from "@/lib/report-imports/sensitiveData";

const metricFields: Array<keyof NormalizedReportMetrics> = [
  "reach",
  "impressions",
  "likes",
  "comments",
  "shares",
  "saves",
  "replies",
  "clicks",
  "profileVisits",
  "follows",
  "dms",
  "engagement",
  "spend",
  "cpc",
  "cpm",
  "ctr",
  "frequency",
  "leads",
  "results"
];

export function normalizeReportRows(rows: RawReportRow[], mapping: ReportColumnMapping, source: ReportSource): NormalizedReportRow[] {
  return rows.map((row) => normalizeReportRow(row, mapping, source));
}

export function normalizeReportRow(row: RawReportRow, mapping: ReportColumnMapping, source: ReportSource): NormalizedReportRow {
  const valuesByField: Partial<Record<CanonicalReportField, string>> = {};
  Object.entries(row.values).forEach(([header, value]) => {
    const field = mapping.mapped[header];
    if (field && field !== "unknown" && valuesByField[field] === undefined) valuesByField[field] = value;
  });

  const metrics: NormalizedReportMetrics = {};
  metricFields.forEach((field) => {
    const value = valuesByField[field];
    const parsed = parseNumber(value);
    if (parsed !== undefined) metrics[field] = parsed;
  });

  const title = cleanText(valuesByField.title) || cleanText(valuesByField.caption)?.slice(0, 80) || `registro ${row.rowNumber}`;
  const caption = cleanText(valuesByField.caption);
  const notes = cleanText(valuesByField.notes);
  const allSensitiveText = [title, caption, notes, valuesByField.link].filter(Boolean).join(" ");
  const sensitiveIssues = detectSensitiveText(allSensitiveText, row.rowNumber, "conteudo");

  return {
    id: `${source}-${row.rowNumber}-${slugify(title)}`,
    source,
    rowNumber: row.rowNumber,
    date: parseDate(valuesByField.date),
    channel: normalizeChannel(valuesByField.channel, source),
    profile: cleanText(valuesByField.profile),
    format: normalizeFormat(valuesByField.format, source),
    title,
    theme: cleanText(valuesByField.theme) || inferTheme(title, caption),
    pillar: normalizePillar(valuesByField.pillar, title),
    caption,
    link: cleanText(valuesByField.link),
    status: cleanText(valuesByField.status),
    media: cleanText(valuesByField.media),
    notes,
    effort: parseNumber(valuesByField.effort),
    risk: cleanText(valuesByField.risk),
    metrics,
    raw: row.values,
    sensitiveIssues
  };
}

export function parseDate(value?: string): string | undefined {
  const text = cleanText(value);
  if (!text || text === "-" || /^n\/a$/i.test(text)) return undefined;
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, day, month, year] = br;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return undefined;
}

export function parseNumber(value?: string): number | undefined {
  const raw = cleanText(value);
  if (!raw || raw === "-" || /^n\/a$/i.test(raw)) return undefined;
  let text = raw.replace(/R\$/gi, "").replace(/\s/g, "");
  const isPercent = text.endsWith("%");
  text = text.replace("%", "");
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d+,\d+$/.test(text)) {
    text = text.replace(",", ".");
  } else {
    text = text.replace(/,/g, "");
  }
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return undefined;
  return Number((isPercent ? parsed / 100 : parsed).toFixed(4));
}

export function cleanText(value?: string): string {
  return (value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeChannel(value: string | undefined, source: ReportSource): string {
  const text = cleanText(value).toLowerCase();
  if (text.includes("instagram")) return "instagram";
  if (text.includes("meta") || text.includes("facebook")) return "meta";
  if (text.includes("google")) return "google";
  if (source === "meta_ads") return "meta_ads";
  if (source === "instagram" || source === "reportei") return "instagram";
  return text || "manual";
}

export function normalizeFormat(value: string | undefined, source: ReportSource): string {
  const text = cleanText(value).toLowerCase();
  if (text.includes("reel")) return "reel";
  if (text.includes("carross")) return "carrossel";
  if (text.includes("story")) return "story";
  if (text.includes("short")) return "short";
  if (text.includes("ads") || text.includes("ad") || source === "meta_ads") return "ads";
  if (text.includes("post")) return "post";
  if (text.includes("reflex")) return "reflexao";
  if (text.includes("bastidor")) return "bastidor_neutro";
  return text || "manual";
}

export function normalizePillar(value: string | undefined, fallback = ""): string {
  const text = cleanText(value || fallback).toLowerCase();
  if (text.includes("natural")) return "estetica_natural";
  if (text.includes("expect")) return "expectativa_realista";
  if (text.includes("seguran")) return "seguranca";
  if (text.includes("cicatriz") || text.includes("recuper")) return "cicatrizacao";
  if (text.includes("consulta")) return "consulta_nao_e_venda";
  if (text.includes("plastica em evidencia")) return "plastica_em_evidencia";
  if (text.includes("bastidor")) return "bastidor_neutro";
  if (text.includes("ciencia") || text.includes("estudo")) return "ciencia_simples";
  return cleanText(value) || "estrategia_editorial";
}

function inferTheme(title: string, caption?: string): string {
  const text = `${title} ${caption ?? ""}`.toLowerCase();
  if (text.includes("pressa")) return "cirurgia plastica nao combina com pressa";
  if (text.includes("natural")) return "naturalidade tambem e planejamento";
  if (text.includes("consulta")) return "consulta nao e venda";
  if (text.includes("cicatriz")) return "cicatrizacao exige paciencia";
  return title;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
