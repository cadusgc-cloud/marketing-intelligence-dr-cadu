import {
  buildWeeklyCollectionReadinessBoard,
  type WeeklyCollectionReadinessBoard,
  type WeeklyCollectionReadinessStatus,
  type WeeklyCollectionSourceReadiness
} from "@/lib/weeklyCollectionReadiness";
import { buildWeeklyDataCollectionGuide, type WeeklyDataCollectionField, type WeeklyDataCollectionSource } from "@/lib/weeklyDataCollectionGuide";
import type { WeeklyMarketingData } from "@/lib/weeklyDataInput";

export type WeeklySourceEvidenceStatus = "verified" | "needs_review" | "missing" | "blocked";
export type WeeklySourceEvidenceFieldStatus = "present" | "missing" | "optional" | "review";

export type WeeklySourceEvidenceField = {
  id: string;
  label: string;
  appField: string;
  status: WeeklySourceEvidenceFieldStatus;
  valueLabel: string;
  sourceMetric: string;
  whereToFind: string;
  acceptedFormat: string;
};

export type WeeklySourceEvidenceSource = {
  id: string;
  title: string;
  status: WeeklySourceEvidenceStatus;
  sourceOwner: string;
  appDestination: string;
  evidenceSummary: string;
  manualPath: string[];
  fields: WeeklySourceEvidenceField[];
  missingFields: string[];
  reviewQuestions: string[];
  privacyChecks: string[];
  nextAction: string;
};

export type WeeklySourceEvidenceLedger = {
  id: string;
  title: string;
  status: WeeklySourceEvidenceStatus;
  weekLabel: string;
  summary: string;
  sources: WeeklySourceEvidenceSource[];
  totals: {
    verified: number;
    needsReview: number;
    missing: number;
    blocked: number;
  };
  guardrails: string[];
  copyMarkdown: string;
};

const guardrails = [
  "Usar somente metricas agregadas e numeros consolidados.",
  "Registrar origem manual da fonte, periodo e lacunas sem copiar nomes, DMs, prints, telefones, prontuarios ou dados clinicos.",
  "Nao conectar API externa, OAuth, scraping, WhatsApp, e-mail, redes sociais ou publicacao automatica.",
  "Nao salvar conclusao forte quando a origem estiver bloqueada ou sem periodo consistente.",
  "Dezembro/2025 permanece como anomalia operacional fora de benchmark normal, media, score e recomendacao.",
  "Este mapa nao altera banco, campanha, conteudo ou equipe."
];

export function buildWeeklySourceEvidenceLedger(data: WeeklyMarketingData): WeeklySourceEvidenceLedger {
  const guide = buildWeeklyDataCollectionGuide();
  const readiness = buildWeeklyCollectionReadinessBoard(data);
  const sources = guide.sources.map((source) => buildEvidenceSource(source, readiness, data));
  const status = summarizeLedgerStatus(sources);
  const totals = {
    verified: sources.filter((source) => source.status === "verified").length,
    needsReview: sources.filter((source) => source.status === "needs_review").length,
    missing: sources.filter((source) => source.status === "missing").length,
    blocked: sources.filter((source) => source.status === "blocked").length
  };

  const ledger: Omit<WeeklySourceEvidenceLedger, "copyMarkdown"> = {
    id: `weekly-source-evidence-ledger-${data.id || "draft"}`,
    title: "Mapa de origem dos dados",
    status,
    weekLabel: data.weekLabel || "Rascunho da semana",
    summary: buildLedgerSummary(status, totals),
    sources,
    totals,
    guardrails
  };

  return {
    ...ledger,
    copyMarkdown: buildLedgerMarkdown(ledger)
  };
}

function buildEvidenceSource(
  source: WeeklyDataCollectionSource,
  readiness: WeeklyCollectionReadinessBoard,
  data: WeeklyMarketingData
): WeeklySourceEvidenceSource {
  const sourceReadiness = readiness.sources.find((item) => item.id === source.id);
  const fields = source.fields.map((field) => buildEvidenceField(field, data, sourceReadiness));
  const missingFields = fields.filter((field) => field.status === "missing").map((field) => field.label);
  const reviewQuestions = buildReviewQuestions(source, sourceReadiness, missingFields);
  const status = mapSourceStatus(sourceReadiness?.status ?? "missing");

  return {
    id: source.id,
    title: source.title,
    status,
    sourceOwner: source.sourceOwner,
    appDestination: source.appDestination,
    evidenceSummary: sourceReadiness?.summary ?? "Fonte ainda sem leitura de prontidao.",
    manualPath: source.manualPath,
    fields,
    missingFields,
    reviewQuestions,
    privacyChecks: source.privacyRules,
    nextAction: sourceReadiness?.nextAction ?? "Coletar totais agregados antes de salvar."
  };
}

function buildEvidenceField(
  field: WeeklyDataCollectionField,
  data: WeeklyMarketingData,
  sourceReadiness: WeeklyCollectionSourceReadiness | undefined
): WeeklySourceEvidenceField {
  const readinessField = sourceReadiness?.fields.find((item) => item.id === field.id || item.appField === field.appField);
  const status = decideFieldStatus(field, data, readinessField?.status);

  return {
    id: field.id,
    label: field.label,
    appField: field.appField,
    status,
    valueLabel: readinessField?.valueLabel ?? valueLabelForField(field, data),
    sourceMetric: field.sourceMetric,
    whereToFind: field.whereToFind,
    acceptedFormat: field.acceptedFormat
  };
}

function decideFieldStatus(
  field: WeeklyDataCollectionField,
  data: WeeklyMarketingData,
  readinessStatus: WeeklyCollectionSourceReadiness["fields"][number]["status"] | undefined
): WeeklySourceEvidenceFieldStatus {
  if (field.status !== "active_input") return "optional";
  if (readinessStatus === "review") return "review";
  if (readinessStatus === "ok") return "present";
  return hasFieldValue(field, data) ? "present" : "missing";
}

function hasFieldValue(field: WeeklyDataCollectionField, data: WeeklyMarketingData): boolean {
  const value = data[field.appField as keyof WeeklyMarketingData];
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value > 0 || field.id === "google-conversions";
  if (value === null) return false;
  return Boolean(value);
}

function valueLabelForField(field: WeeklyDataCollectionField, data: WeeklyMarketingData): string {
  const value = data[field.appField as keyof WeeklyMarketingData];
  if (field.status !== "active_input") return "registrar em observacoes quando existir";
  if (value === null || value === undefined || value === "") return "ausente";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function buildReviewQuestions(
  source: WeeklyDataCollectionSource,
  sourceReadiness: WeeklyCollectionSourceReadiness | undefined,
  missingFields: string[]
): string[] {
  return unique([
    `O periodo desta fonte bate com a semana selecionada?`,
    `A origem usada foi: ${source.sourceOwner}?`,
    ...missingFields.slice(0, 3).map((field) => `Campo ausente: ${field}.`),
    ...source.qualityChecks.slice(0, 3),
    ...source.privacyRules.slice(0, 2),
    ...(sourceReadiness?.reviewNotes ?? [])
  ]);
}

function summarizeLedgerStatus(sources: WeeklySourceEvidenceSource[]): WeeklySourceEvidenceStatus {
  if (sources.some((source) => source.status === "blocked")) return "blocked";
  if (sources.some((source) => source.status === "missing")) return "missing";
  if (sources.some((source) => source.status === "needs_review")) return "needs_review";
  return "verified";
}

function buildLedgerSummary(status: WeeklySourceEvidenceStatus, totals: WeeklySourceEvidenceLedger["totals"]): string {
  if (status === "verified") return `Origens verificadas: ${totals.verified} fonte(s) prontas para revisao humana antes do salvamento.`;
  if (status === "blocked") return `Ha origem bloqueada: ${totals.blocked} fonte(s) precisam ser corrigidas antes de conclusao forte.`;
  if (status === "missing") return `Mapa incompleto: ${totals.missing} fonte(s) ainda sem coleta suficiente.`;
  return `Mapa exige revisao: ${totals.needsReview} fonte(s) pedem conferencia antes de salvar ou interpretar.`;
}

function buildLedgerMarkdown(ledger: Omit<WeeklySourceEvidenceLedger, "copyMarkdown">): string {
  return [
    `# ${ledger.title}`,
    "",
    `Semana: ${ledger.weekLabel}`,
    `Status: ${statusLabel(ledger.status)}`,
    `Resumo: ${ledger.summary}`,
    "",
    "## Totais",
    "",
    `- Origens verificadas: ${ledger.totals.verified}`,
    `- Origens em revisao: ${ledger.totals.needsReview}`,
    `- Origens ausentes: ${ledger.totals.missing}`,
    `- Origens bloqueadas: ${ledger.totals.blocked}`,
    "",
    ...ledger.sources.flatMap((source) => [
      `## ${source.title}`,
      "",
      `Status: ${statusLabel(source.status)}`,
      `Responsavel/fonte: ${source.sourceOwner}`,
      `Destino no sistema: ${source.appDestination}`,
      `Resumo: ${source.evidenceSummary}`,
      `Proxima acao: ${source.nextAction}`,
      "",
      "Campos:",
      ...source.fields.map((field) => `- [${fieldStatusLabel(field.status)}] ${field.label} (${field.appField}): ${field.valueLabel} | fonte: ${field.whereToFind}`),
      "",
      "Perguntas de revisao:",
      ...source.reviewQuestions.slice(0, 6).map((question) => `- ${question}`),
      ""
    ]),
    "## Guardrails",
    "",
    ...ledger.guardrails.map((item) => `- ${item}`),
    ""
  ].join("\n");
}

function mapSourceStatus(status: WeeklyCollectionReadinessStatus): WeeklySourceEvidenceStatus {
  if (status === "ready") return "verified";
  if (status === "needs_review") return "needs_review";
  if (status === "blocked") return "blocked";
  return "missing";
}

function statusLabel(status: WeeklySourceEvidenceStatus): string {
  if (status === "verified") return "verificado";
  if (status === "blocked") return "bloqueado";
  if (status === "missing") return "sem coleta";
  return "revisar";
}

function fieldStatusLabel(status: WeeklySourceEvidenceFieldStatus): string {
  if (status === "present") return "presente";
  if (status === "missing") return "ausente";
  if (status === "review") return "revisar";
  return "opcional";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
