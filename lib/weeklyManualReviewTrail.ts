import type { WeeklyCollectionDecisionGate } from "@/lib/weeklyCollectionDecisionGate";
import type { WeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import type { WeeklyCollectionSaveHandoff } from "@/lib/weeklyCollectionSaveHandoff";
import type { WeeklySaveReadinessReport } from "@/lib/weeklyDataInput";
import {
  calculateWeeklyCollectionWorkspaceProgress,
  type WeeklyCollectionWorkspace,
  type WeeklyCollectionWorkspaceState
} from "@/lib/weeklyCollectionWorkspace";

export type WeeklyManualReviewTrailStatus = "ready" | "review" | "collecting" | "blocked";
export type WeeklyManualReviewTrailSectionStatus = "ok" | "review" | "blocked" | "info";

export type WeeklyManualReviewTrailSection = {
  id: string;
  title: string;
  status: WeeklyManualReviewTrailSectionStatus;
  lines: string[];
};

export type WeeklyManualReviewTrail = {
  id: string;
  title: string;
  status: WeeklyManualReviewTrailStatus;
  summary: string;
  weekLabel: string;
  generatedAtLabel: string;
  sections: WeeklyManualReviewTrailSection[];
  guardrails: string[];
  copyMarkdown: string;
};

export type BuildWeeklyManualReviewTrailInput = {
  workspace: WeeklyCollectionWorkspace;
  state: WeeklyCollectionWorkspaceState;
  decisionGate: WeeklyCollectionDecisionGate;
  saveHandoff: WeeklyCollectionSaveHandoff;
  saveReadiness: WeeklySaveReadinessReport;
  collectionReadiness: WeeklyCollectionReadinessBoard;
};

const guardrails = [
  "Usar somente metricas agregadas e numeros consolidados.",
  "Nao inserir dados pessoais, clinicos, DMs, conversas, prints privados ou pacientes.",
  "Nao conectar API externa, OAuth, scraping, WhatsApp, e-mail, redes sociais ou publicacao automatica.",
  "Nao salva automaticamente e nao altera banco, campanha, conteudo ou equipe.",
  "Dezembro/2025 permanece fora de benchmark normal, media, score, projecao e recomendacao.",
  "Decisao final sobre salvar ou aguardar continua humana."
];

export function buildWeeklyManualReviewTrail(input: BuildWeeklyManualReviewTrailInput): WeeklyManualReviewTrail {
  const progress = calculateWeeklyCollectionWorkspaceProgress(input.workspace, input.state);
  const status = decideTrailStatus(input, progress.blocked, progress.pending);
  const sections = buildTrailSections(input, progress.done, progress.pending, progress.blocked, progress.percent);
  const trail: Omit<WeeklyManualReviewTrail, "copyMarkdown"> = {
    id: `weekly-manual-review-trail-${input.workspace.id}`,
    title: "Trilha de revisao manual da semana",
    status,
    summary: buildTrailSummary(status, input),
    weekLabel: input.workspace.weekLabel,
    generatedAtLabel: "Gerado localmente no navegador no momento da copia.",
    sections,
    guardrails
  };

  return {
    ...trail,
    copyMarkdown: buildTrailMarkdown(trail)
  };
}

function decideTrailStatus(input: BuildWeeklyManualReviewTrailInput, blocked: number, pending: number): WeeklyManualReviewTrailStatus {
  if (
    blocked > 0 ||
    input.decisionGate.status === "blocked" ||
    input.saveHandoff.status === "blocked" ||
    input.saveReadiness.status === "blocked" ||
    input.collectionReadiness.status === "blocked"
  ) {
    return "blocked";
  }

  if (input.saveHandoff.status === "collect_first" || input.decisionGate.status === "needs_collection" || pending > 0 || input.collectionReadiness.status === "missing") {
    return "collecting";
  }

  if (
    input.saveHandoff.status === "review_before_save" ||
    input.decisionGate.status === "review_required" ||
    input.saveReadiness.status === "needs-review" ||
    input.collectionReadiness.status === "needs_review"
  ) {
    return "review";
  }

  return "ready";
}

function buildTrailSections(
  input: BuildWeeklyManualReviewTrailInput,
  done: number,
  pending: number,
  blocked: number,
  percent: number
): WeeklyManualReviewTrailSection[] {
  return [
    section("decision-summary", "Resumo da decisao", statusFromTrailStatus(decideTrailStatus(input, blocked, pending)), [
      `Gate de coleta: ${gateStatusLabel(input.decisionGate.status)}.`,
      `Handoff: ${handoffStatusLabel(input.saveHandoff.status)}.`,
      `Salvamento manual permitido pelo painel: ${input.saveHandoff.manualSaveAllowed ? "sim, com revisao humana" : "nao"}.`,
      `Primeiro foco: ${input.saveHandoff.focus.title}.`,
      `Acao sugerida: ${input.saveHandoff.focus.action}.`
    ]),
    section("collection-progress", "Progresso da coleta", blocked > 0 ? "blocked" : pending > 0 ? "info" : "ok", [
      `Itens concluidos: ${done}.`,
      `Itens pendentes: ${pending}.`,
      `Itens bloqueados: ${blocked}.`,
      `Percentual concluido: ${percent}%.`,
      firstPendingOrBlockedLine(input.workspace, input.state)
    ]),
    section("form-readiness", "Prontidao do formulario", saveReadinessSectionStatus(input.saveReadiness.status), [
      input.saveReadiness.summary,
      ...listOrFallback("Bloqueios do formulario", input.saveReadiness.blockers.slice(0, 3), "Nenhum bloqueio essencial no formulario."),
      ...listOrFallback("Revisoes do formulario", input.saveReadiness.reviewNotes.slice(0, 3), "Sem notas adicionais de revisao do formulario.")
    ]),
    section("source-readiness", "Prontidao por fonte", collectionReadinessSectionStatus(input.collectionReadiness.status), [
      `${input.collectionReadiness.summary}`,
      `Score de coleta: ${input.collectionReadiness.score}/100.`,
      ...input.collectionReadiness.sources.slice(0, 6).map((source) => `${source.title}: ${sourceStatusLabel(source.status)} - ${source.nextAction}`),
      ...listOrFallback("Acoes prioritarias por fonte", input.collectionReadiness.priorityActions.slice(0, 4), "Nenhuma acao prioritaria adicional.")
    ]),
    section("human-decision", "Decisao humana", "review", [
      "[ ] Salvar semana manualmente em /data.",
      "[ ] Revisar antes de salvar.",
      "[ ] Manter como coleta pendente.",
      "[ ] Bloquear conclusao por falta de dado, risco de privacidade ou anomalia.",
      "[ ] Registrar observacao operacional agregada, se necessario."
    ]),
    section("next-actions", "Proximas acoes", input.saveHandoff.status === "ready_to_save" ? "ok" : "info", [
      ...unique([...input.saveHandoff.nextActions, ...input.collectionReadiness.priorityActions]).slice(0, 8)
    ]),
    section("safety", "Limites de seguranca", "info", guardrails)
  ];
}

function buildTrailSummary(status: WeeklyManualReviewTrailStatus, input: BuildWeeklyManualReviewTrailInput): string {
  if (status === "ready") return "Semana pronta para salvamento manual, mantendo revisao humana antes de usar a leitura operacional.";
  if (status === "blocked") return "Semana bloqueada para conclusao forte; resolva bloqueios de coleta, formulario, fonte ou privacidade antes de salvar.";
  if (status === "review") return "Semana utilizavel com cautela; ainda ha revisao humana pendente antes de conclusao operacional.";
  return `Coleta ainda em andamento; primeiro foco sugerido: ${input.saveHandoff.focus.title}.`;
}

function buildTrailMarkdown(trail: Omit<WeeklyManualReviewTrail, "copyMarkdown">): string {
  return [
    `# ${trail.title}`,
    "",
    `Semana: ${trail.weekLabel}`,
    `Status: ${trailStatusLabel(trail.status)}`,
    `Resumo: ${trail.summary}`,
    `Geracao: ${trail.generatedAtLabel}`,
    "",
    ...trail.sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      `Status da secao: ${sectionStatusLabel(section.status)}`,
      "",
      ...section.lines.map((line) => `- ${line}`),
      ""
    ]),
    "## Guardrails finais",
    "",
    ...trail.guardrails.map((item) => `- ${item}`),
    ""
  ].join("\n");
}

function section(id: string, title: string, status: WeeklyManualReviewTrailSectionStatus, lines: string[]): WeeklyManualReviewTrailSection {
  return { id, title, status, lines: lines.filter(Boolean) };
}

function firstPendingOrBlockedLine(workspace: WeeklyCollectionWorkspace, state: WeeklyCollectionWorkspaceState): string {
  const blocked = workspace.items.find((item) => state.statuses[item.id] === "blocked");
  if (blocked) return `Primeiro bloqueio: ${blocked.title}.`;
  const pending = workspace.items.find((item) => state.statuses[item.id] === "pending");
  if (pending) return `Primeira pendencia: ${pending.title}.`;
  return "Sem pendencia ou bloqueio marcado no workspace.";
}

function listOrFallback(title: string, values: string[], fallback: string): string[] {
  return values.length ? [`${title}:`, ...values] : [fallback];
}

function statusFromTrailStatus(status: WeeklyManualReviewTrailStatus): WeeklyManualReviewTrailSectionStatus {
  if (status === "ready") return "ok";
  if (status === "blocked") return "blocked";
  if (status === "review") return "review";
  return "info";
}

function saveReadinessSectionStatus(status: WeeklySaveReadinessReport["status"]): WeeklyManualReviewTrailSectionStatus {
  if (status === "ready") return "ok";
  if (status === "blocked") return "blocked";
  return "review";
}

function collectionReadinessSectionStatus(status: WeeklyCollectionReadinessBoard["status"]): WeeklyManualReviewTrailSectionStatus {
  if (status === "ready") return "ok";
  if (status === "blocked") return "blocked";
  if (status === "needs_review") return "review";
  return "info";
}

function trailStatusLabel(status: WeeklyManualReviewTrailStatus): string {
  if (status === "ready") return "pronta para salvar manualmente";
  if (status === "blocked") return "bloqueada";
  if (status === "review") return "revisao humana pendente";
  return "coleta pendente";
}

function sectionStatusLabel(status: WeeklyManualReviewTrailSectionStatus): string {
  if (status === "ok") return "ok";
  if (status === "blocked") return "bloqueio";
  if (status === "review") return "revisar";
  return "informativo";
}

function gateStatusLabel(status: WeeklyCollectionDecisionGate["status"]): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  if (status === "review_required") return "revisao final pendente";
  return "coleta pendente";
}

function handoffStatusLabel(status: WeeklyCollectionSaveHandoff["status"]): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  if (status === "review_before_save") return "revisar antes de salvar";
  return "coletar antes de salvar";
}

function sourceStatusLabel(status: WeeklyCollectionReadinessBoard["sources"][number]["status"]): string {
  if (status === "ready") return "pronto";
  if (status === "blocked") return "bloqueado";
  if (status === "needs_review") return "revisar";
  return "sem coleta";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
