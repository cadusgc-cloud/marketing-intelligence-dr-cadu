import {
  calculateWeeklyCollectionWorkspaceProgress,
  type WeeklyCollectionWorkspace,
  type WeeklyCollectionWorkspaceItem,
  type WeeklyCollectionWorkspaceState
} from "@/lib/weeklyCollectionWorkspace";

export type WeeklyCollectionDecisionGateStatus = "ready_to_save" | "needs_collection" | "review_required" | "blocked";
export type WeeklyCollectionDecisionGateSeverity = "success" | "info" | "warning" | "critical";

export type WeeklyCollectionDecisionGate = {
  id: string;
  title: string;
  status: WeeklyCollectionDecisionGateStatus;
  severity: WeeklyCollectionDecisionGateSeverity;
  canRecommendSave: boolean;
  summary: string;
  completedItems: string[];
  pendingItems: string[];
  blockedItems: string[];
  reviewQuestions: string[];
  nextActions: string[];
  copyText: string;
};

export function buildWeeklyCollectionDecisionGate(
  workspace: WeeklyCollectionWorkspace,
  state: WeeklyCollectionWorkspaceState
): WeeklyCollectionDecisionGate {
  const progress = calculateWeeklyCollectionWorkspaceProgress(workspace, state);
  const completedItems = titlesByStatus(workspace, state, "done");
  const pendingItems = titlesByStatus(workspace, state, "pending");
  const blockedItems = titlesByStatus(workspace, state, "blocked");
  const pendingReviewGates = workspace.items.filter((item) => item.kind === "review_gate" && state.statuses[item.id] !== "done");
  const status = decideGateStatus(progress.blocked, pendingItems.length, pendingReviewGates.length);
  const gate: Omit<WeeklyCollectionDecisionGate, "copyText"> = {
    id: `weekly-collection-decision-gate-${workspace.id}`,
    title: "Gate de decisao da coleta",
    status,
    severity: gateSeverity(status),
    canRecommendSave: status === "ready_to_save",
    summary: gateSummary(status, progress.done, progress.total, progress.blocked, pendingReviewGates.length),
    completedItems,
    pendingItems,
    blockedItems,
    reviewQuestions: buildReviewQuestions(workspace, state),
    nextActions: buildNextActions(status, workspace, state, pendingReviewGates),
  };

  return {
    ...gate,
    copyText: buildWeeklyCollectionDecisionGateCopyText(gate)
  };
}

export function buildWeeklyCollectionDecisionGateCopyText(gate: Omit<WeeklyCollectionDecisionGate, "copyText">): string {
  return [
    `${gate.title}: ${gateStatusLabel(gate.status)}`,
    "",
    gate.summary,
    "",
    "Proxima decisao:",
    gate.canRecommendSave
      ? "- A semana pode seguir para salvamento em /data, mantendo revisao humana."
      : "- Nao salvar conclusao forte antes de resolver pendencias, bloqueios ou gates.",
    "",
    "Acoes:",
    ...gate.nextActions.map((action) => `- ${action}`),
    "",
    "Perguntas de revisao:",
    ...gate.reviewQuestions.map((question) => `- ${question}`),
    "",
    "Bloqueios:",
    ...(gate.blockedItems.length ? gate.blockedItems.map((item) => `- ${item}`) : ["- Nenhum bloqueio marcado."]),
    "",
    "Limites:",
    "- Somente metricas agregadas.",
    "- Sem dados pessoais, clinicos, DMs, conversas, prints privados ou pacientes.",
    "- Sem API externa, OAuth, scraping, envio automatico ou publicacao.",
    "- Dezembro/2025 permanece fora de benchmark normal.",
    "- Revisao humana antes de salvar e antes de qualquer decisao operacional."
  ].join("\n");
}

function decideGateStatus(blockedCount: number, pendingCount: number, pendingReviewGateCount: number): WeeklyCollectionDecisionGateStatus {
  if (blockedCount > 0) return "blocked";
  if (pendingReviewGateCount > 0 && pendingReviewGateCount === pendingCount) return "review_required";
  if (pendingCount > 0) return "needs_collection";
  return "ready_to_save";
}

function gateSeverity(status: WeeklyCollectionDecisionGateStatus): WeeklyCollectionDecisionGateSeverity {
  if (status === "ready_to_save") return "success";
  if (status === "blocked") return "critical";
  if (status === "review_required") return "warning";
  return "info";
}

function gateSummary(status: WeeklyCollectionDecisionGateStatus, done: number, total: number, blocked: number, pendingReviewGates: number): string {
  if (status === "ready_to_save") return `Coleta pronta para salvamento manual: ${done}/${total} itens concluidos e nenhum bloqueio marcado.`;
  if (status === "blocked") return `Coleta bloqueada: ${blocked} item(ns) marcado(s) como bloqueado(s). Nao salve conclusao forte antes de resolver.`;
  if (status === "review_required") return `Coleta praticamente concluida, mas ${pendingReviewGates} gate(s) final(is) ainda exigem revisao humana.`;
  return `Coleta ainda em andamento: ${done}/${total} itens concluidos. Complete pendencias antes de salvar a semana.`;
}

function buildReviewQuestions(workspace: WeeklyCollectionWorkspace, state: WeeklyCollectionWorkspaceState): string[] {
  const pendingReviewGates = workspace.items.filter((item) => item.kind === "review_gate" && state.statuses[item.id] !== "done");
  const questions = pendingReviewGates.length
    ? pendingReviewGates.map((item) => item.title)
    : [
        "Periodo, fontes e valores foram revisados por uma pessoa?",
        "Zeros e campos ausentes foram diferenciados?",
        "A leitura nao usa Dezembro/2025 como benchmark normal?"
      ];

  return unique([
    ...questions,
    "A coleta contem somente totais agregados?",
    "Nao ha nomes, DMs, conversas, prints privados, dados clinicos ou pacientes?",
    "A decisao final sera humana antes de salvar em /data?"
  ]);
}

function buildNextActions(
  status: WeeklyCollectionDecisionGateStatus,
  workspace: WeeklyCollectionWorkspace,
  state: WeeklyCollectionWorkspaceState,
  pendingReviewGates: WeeklyCollectionWorkspaceItem[]
): string[] {
  if (status === "ready_to_save") {
    return [
      "Salvar a semana em /data se os numeros do formulario estiverem corretos.",
      "Abrir /weekly depois do salvamento para ler diagnostico e sinais.",
      "Registrar qualquer limitacao operacional sem dados pessoais."
    ];
  }

  if (status === "blocked") {
    return [
      ...workspace.items
        .filter((item) => state.statuses[item.id] === "blocked")
        .slice(0, 4)
        .map((item) => `Resolver bloqueio: ${item.title}.`),
      "Nao salvar conclusao forte enquanto houver item bloqueado."
    ];
  }

  if (status === "review_required") {
    return [
      ...pendingReviewGates.slice(0, 4).map((item) => `Concluir gate: ${item.title}.`),
      "Fazer revisao humana final antes de salvar em /data."
    ];
  }

  return [
    ...workspace.items
      .filter((item) => state.statuses[item.id] === "pending" && item.kind !== "review_gate")
      .slice(0, 5)
      .map((item) => `Completar coleta: ${item.title}.`),
    "Depois das pendencias, concluir os gates finais de revisao."
  ];
}

function titlesByStatus(
  workspace: WeeklyCollectionWorkspace,
  state: WeeklyCollectionWorkspaceState,
  status: WeeklyCollectionWorkspaceState["statuses"][string]
): string[] {
  return workspace.items.filter((item) => state.statuses[item.id] === status).map((item) => item.title);
}

function gateStatusLabel(status: WeeklyCollectionDecisionGateStatus): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  if (status === "review_required") return "revisao final pendente";
  return "coleta pendente";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
