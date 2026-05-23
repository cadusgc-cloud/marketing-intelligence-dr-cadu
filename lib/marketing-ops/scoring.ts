import type { DailyExecutionPlan, PublishingReadiness } from "@/lib/marketing-ops/types";
import type { SafetyClassification } from "@/lib/monthly-editorial";

export function calculatePublishingReadiness(input: {
  hasContent: boolean;
  hasMedia: boolean;
  hasExport: boolean;
  safety: SafetyClassification;
  hasTasks: boolean;
  blockers?: string[];
}): PublishingReadiness {
  const blockers = [...(input.blockers ?? [])];
  const contentDefined = input.hasContent;
  const mediaDefined = input.hasMedia;
  const textExportable = input.hasExport;
  const safetyApproved = input.safety === "seguro" || input.safety === "atencao";
  const taskCreated = input.hasTasks;

  let score = 0;
  if (contentDefined) score += 20;
  if (mediaDefined) score += 20;
  if (textExportable) score += 20;
  if (safetyApproved) score += input.safety === "seguro" ? 30 : 20;
  if (taskCreated) score += 10;

  if (input.safety === "bloquear") {
    score = Math.min(score, 25);
    blockers.push("conteudo bloqueado pelo safety gate");
  }
  if (input.safety === "revisar_antes_de_postar") {
    score = Math.min(score, 70);
    blockers.push("precisa revisao medico-publicitaria");
  }
  if (!mediaDefined) blockers.push("midia natural insuficiente");
  if (!textExportable) blockers.push("exportacao textual ausente");

  const normalizedScore = Math.max(0, Math.min(100, score));
  const status = getReadinessStatus(normalizedScore, input.safety, mediaDefined, blockers);

  return {
    score: normalizedScore,
    status,
    contentDefined,
    mediaDefined,
    textExportable,
    safetyApproved,
    taskCreated,
    readyForManualPublishing: normalizedScore >= 85 && safetyApproved && blockers.length === 0,
    blockers: Array.from(new Set(blockers))
  };
}

export function aggregateReadiness(days: DailyExecutionPlan[]): PublishingReadiness {
  if (days.length === 0) {
    return calculatePublishingReadiness({ hasContent: false, hasMedia: false, hasExport: false, safety: "bloquear", hasTasks: false, blockers: ["sem dias operacionais"] });
  }
  const avg = Math.round(days.reduce((sum, day) => sum + day.readiness.score, 0) / days.length);
  const blockers = Array.from(new Set(days.flatMap((day) => day.readiness.blockers))).slice(0, 8);
  const worstSafety = days.some((day) => day.risk === "bloquear")
    ? "bloquear"
    : days.some((day) => day.risk === "revisar_antes_de_postar")
      ? "revisar_antes_de_postar"
      : days.some((day) => day.risk === "atencao")
        ? "atencao"
        : "seguro";

  return {
    score: avg,
    status: getReadinessStatus(avg, worstSafety, days.every((day) => day.readiness.mediaDefined), blockers),
    contentDefined: days.every((day) => day.readiness.contentDefined),
    mediaDefined: days.every((day) => day.readiness.mediaDefined),
    textExportable: days.every((day) => day.readiness.textExportable),
    safetyApproved: days.every((day) => day.readiness.safetyApproved),
    taskCreated: days.every((day) => day.readiness.taskCreated),
    readyForManualPublishing: avg >= 85 && blockers.length === 0,
    blockers
  };
}

export function readinessStatusLabel(status: PublishingReadiness["status"]): string {
  return {
    pronto: "Pronto",
    quase_pronto: "Quase pronto",
    precisa_midia: "Precisa midia",
    precisa_revisao: "Precisa revisao",
    bloqueado: "Bloqueado"
  }[status];
}

function getReadinessStatus(score: number, safety: SafetyClassification, hasMedia: boolean, blockers: string[]): PublishingReadiness["status"] {
  if (safety === "bloquear") return "bloqueado";
  if (safety === "revisar_antes_de_postar" || blockers.some((item) => item.includes("revisao"))) return "precisa_revisao";
  if (!hasMedia || blockers.some((item) => item.includes("midia"))) return "precisa_midia";
  if (score >= 85) return "pronto";
  return "quase_pronto";
}
