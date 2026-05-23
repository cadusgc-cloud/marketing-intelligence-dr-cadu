import type { ManualMetricRecord, MetricImportResult, MetricValidationIssue } from "@/lib/marketing-intelligence/types";
import { allowedFormats, allowedPillars, detectSensitiveTerms, normalizeFormat, normalizeMetricRows, normalizePillar } from "@/lib/marketing-intelligence/normalization";

const headerAliases: Record<string, keyof ManualMetricRecord> = {
  data: "date",
  date: "date",
  canal: "channel",
  channel: "channel",
  formato: "format",
  format: "format",
  tema: "theme",
  theme: "theme",
  pilar: "pillar",
  pillar: "pillar",
  titulo: "title",
  title: "title",
  impressoes: "impressions",
  impressions: "impressions",
  alcance: "reach",
  reach: "reach",
  curtidas: "likes",
  likes: "likes",
  comentarios: "comments",
  comments: "comments",
  compartilhamentos: "shares",
  shares: "shares",
  salvamentos: "saves",
  saves: "saves",
  respostas: "replies",
  replies: "replies",
  cliques: "clicks",
  clicks: "clicks",
  visitas_ao_perfil: "profileVisits",
  profilevisits: "profileVisits",
  dms: "dms",
  retencao: "retentionSeconds",
  retention: "retentionSeconds",
  retentionseconds: "retentionSeconds",
  status: "status",
  risco: "risk",
  risk: "risk",
  esforco: "effort",
  effort: "effort",
  observacoes: "notes",
  notes: "notes"
};

const numericFields: (keyof ManualMetricRecord)[] = [
  "impressions",
  "reach",
  "likes",
  "comments",
  "shares",
  "saves",
  "replies",
  "clicks",
  "profileVisits",
  "dms",
  "retentionSeconds",
  "effort"
];

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseNumber(value: string) {
  const clean = value.trim().replace(/\./g, "").replace(",", ".");
  if (!clean) return 0;
  const number = Number(clean);
  return Number.isFinite(number) ? number : Number.NaN;
}

function detectDelimiter(input: string): "," | ";" | "\t" {
  const firstLine = input.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const candidates: ("," | ";" | "\t")[] = ["\t", ";", ","];
  return candidates.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
}

function emptyRecord(): ManualMetricRecord {
  return {
    date: "",
    channel: "Instagram organico",
    format: "post",
    theme: "",
    pillar: "expectativa_realista",
    title: "",
    impressions: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    replies: 0,
    clicks: 0,
    profileVisits: 0,
    dms: 0,
    retentionSeconds: 0,
    status: "rascunho",
    risk: "baixo",
    effort: 2,
    notes: ""
  };
}

export function validateMetricRows(rows: ManualMetricRecord[]): MetricValidationIssue[] {
  const issues: MetricValidationIssue[] = [];
  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || Number.isNaN(Date.parse(`${row.date}T12:00:00.000Z`))) {
      issues.push({ row: rowNumber, field: "date", severity: "error", message: "Data invalida. Use YYYY-MM-DD." });
    }
    if (!normalizeFormat(String(row.format))) {
      issues.push({ row: rowNumber, field: "format", severity: "error", message: `Formato desconhecido: ${row.format}. Use ${allowedFormats.join(", ")}.` });
    }
    if (!normalizePillar(String(row.pillar))) {
      issues.push({ row: rowNumber, field: "pillar", severity: "error", message: `Pilar desconhecido: ${row.pillar}. Use ${allowedPillars.join(", ")}.` });
    }
    numericFields.forEach((field) => {
      const value = Number(row[field]);
      if (!Number.isFinite(value)) {
        issues.push({ row: rowNumber, field: String(field), severity: "error", message: "Numero invalido." });
      }
      if (value < 0) {
        issues.push({ row: rowNumber, field: String(field), severity: "error", message: "Metrica negativa nao e aceita." });
      }
    });
    if (!row.theme.trim()) issues.push({ row: rowNumber, field: "theme", severity: "warning", message: "Tema vazio reduz a leitura estrategica." });
    const sensitive = detectSensitiveTerms([row.theme, row.title, row.notes].join(" "));
    sensitive.forEach((term) => issues.push({ row: rowNumber, field: "notes", severity: "blocking", message: `Possivel dado sensivel ou termo bloqueante: ${term}` }));
  });
  return issues;
}

export function parseManualMetrics(input: string): MetricImportResult {
  const delimiter = detectDelimiter(input);
  const lines = input.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    return { rows: [], normalized: [], issues: [{ row: 1, field: "input", message: "Cole ao menos cabecalho e uma linha.", severity: "error" }], ok: false, blocked: false, delimiter };
  }

  const rawHeaders = lines[0].split(delimiter).map(normalizeHeader);
  const headers = rawHeaders.map((header) => headerAliases[header]);
  const issues: MetricValidationIssue[] = [];
  const required: (keyof ManualMetricRecord)[] = ["date", "channel", "format", "theme", "pillar", "impressions", "reach"];
  required.forEach((field) => {
    if (!headers.includes(field)) issues.push({ row: 1, field: String(field), severity: "error", message: `Coluna obrigatoria ausente: ${field}` });
  });

  const rows = lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    const record = emptyRecord();
    headers.forEach((field, index) => {
      if (!field) return;
      const value = values[index] ?? "";
      if (numericFields.includes(field)) {
        (record[field] as number) = parseNumber(value);
      } else {
        (record[field] as string) = value.trim();
      }
    });
    return record;
  });

  const validationIssues = [...issues, ...validateMetricRows(rows)];
  const normalized = normalizeMetricRows(rows);
  const blocked = validationIssues.some((issue) => issue.severity === "blocking");
  const ok = !validationIssues.some((issue) => issue.severity === "error" || issue.severity === "blocking");
  return { rows, normalized, issues: validationIssues, ok, blocked, delimiter };
}
