export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";
export type RiskLevel = "baixo" | "medio" | "alto" | "bloqueado" | "desconhecido";
export type ReadinessLevel = "excelente" | "bom" | "revisar" | "bloquear";

export const PRODUCT_STATUS_LABELS = {
  localOnly: "Local e manual",
  noExternalApi: "Sem integracao externa",
  fictitiousData: "Dados ficticios",
  reviewBeforeUse: "Revisar antes de usar",
  manualExport: "Exportacao copiavel",
  technicalBackup: "Backup tecnico",
  editorialRisk: "Risco editorial",
  readyForReview: "Pronto para revisao",
  blockedBySafety: "Bloqueado por seguranca"
} as const;

export function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function badgeClassForTone(tone: BadgeTone) {
  return {
    neutral: "bg-slate-100 text-slate-700",
    info: "bg-cyan-50 text-ocean",
    success: "bg-green-50 text-leaf",
    warning: "bg-amber-50 text-amber",
    danger: "bg-red-50 text-danger"
  }[tone];
}

export function riskLabel(level: RiskLevel) {
  return {
    baixo: "baixo",
    medio: "medio",
    alto: "alto",
    bloqueado: "bloqueado",
    desconhecido: "desconhecido"
  }[level];
}

export function readinessLabel(level: ReadinessLevel) {
  return {
    excelente: "excelente",
    bom: "bom",
    revisar: "revisar",
    bloquear: "bloquear"
  }[level];
}

export function readinessFromScore(score: number): ReadinessLevel {
  const normalized = clampProgress(score);
  if (normalized >= 90) return "excelente";
  if (normalized >= 75) return "bom";
  if (normalized >= 50) return "revisar";
  return "bloquear";
}

export function riskFromScore(score: number): RiskLevel {
  const normalized = clampProgress(score);
  if (normalized >= 90) return "baixo";
  if (normalized >= 70) return "medio";
  if (normalized >= 45) return "alto";
  return "bloqueado";
}

export function statusLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
