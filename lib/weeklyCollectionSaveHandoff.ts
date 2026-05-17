import type { WeeklyCollectionDecisionGate } from "@/lib/weeklyCollectionDecisionGate";
import type { WeeklySaveReadinessReport } from "@/lib/weeklyDataInput";

export type WeeklyCollectionSaveHandoffStatus = "ready_to_save" | "review_before_save" | "collect_first" | "blocked";
export type WeeklyCollectionSaveHandoffSeverity = "success" | "warning" | "info" | "critical";

export type WeeklyCollectionSaveHandoffItem = {
  id: string;
  label: string;
  status: "ok" | "review" | "blocked";
  detail: string;
};

export type WeeklyCollectionSaveHandoffFocus = {
  status: "ready" | "review" | "collect" | "blocked";
  title: string;
  detail: string;
  targetLabel: string;
  targetHref: string;
  action: string;
};

export type WeeklyCollectionSaveHandoff = {
  id: string;
  title: string;
  status: WeeklyCollectionSaveHandoffStatus;
  severity: WeeklyCollectionSaveHandoffSeverity;
  manualSaveAllowed: boolean;
  summary: string;
  focus: WeeklyCollectionSaveHandoffFocus;
  checklist: WeeklyCollectionSaveHandoffItem[];
  nextActions: string[];
  copyText: string;
};

export function buildWeeklyCollectionSaveHandoff(
  gate: WeeklyCollectionDecisionGate,
  saveReadiness: WeeklySaveReadinessReport
): WeeklyCollectionSaveHandoff {
  const status = decideHandoffStatus(gate, saveReadiness);
  const handoff: Omit<WeeklyCollectionSaveHandoff, "copyText"> = {
    id: `weekly-collection-save-handoff-${gate.id}`,
    title: "Handoff pre-salvamento da semana",
    status,
    severity: handoffSeverity(status),
    manualSaveAllowed: gate.canRecommendSave && saveReadiness.canSave,
    summary: handoffSummary(status, gate, saveReadiness),
    focus: buildHandoffFocus(status, gate, saveReadiness),
    checklist: buildHandoffChecklist(gate, saveReadiness),
    nextActions: buildHandoffNextActions(status, gate, saveReadiness)
  };

  return {
    ...handoff,
    copyText: buildWeeklyCollectionSaveHandoffCopyText(handoff)
  };
}

export function buildWeeklyCollectionSaveHandoffCopyText(handoff: Omit<WeeklyCollectionSaveHandoff, "copyText">): string {
  return [
    `${handoff.title}: ${handoffStatusLabel(handoff.status)}`,
    "",
    handoff.summary,
    "",
    `Salvamento manual permitido pelo painel: ${handoff.manualSaveAllowed ? "sim, com revisao humana" : "nao, resolver pendencias primeiro"}.`,
    "",
    "Primeiro foco:",
    `- ${handoff.focus.title}`,
    `- Area: ${handoff.focus.targetLabel}`,
    `- Acao: ${handoff.focus.action}`,
    `- Detalhe: ${handoff.focus.detail}`,
    "",
    "Checklist:",
    ...handoff.checklist.map((item) => `- [${item.status}] ${item.label}: ${item.detail}`),
    "",
    "Proximas acoes:",
    ...handoff.nextActions.map((action) => `- ${action}`),
    "",
    "Limites:",
    "- Handoff interno, manual e deterministico.",
    "- Nao salva automaticamente.",
    "- Nao altera banco, campanha, conteudo ou equipe.",
    "- Nao usa API externa, OAuth, scraping, envio automatico ou publicacao.",
    "- Usar somente metricas agregadas.",
    "- Nao inserir dados pessoais, clinicos, DMs, conversas, prints privados ou pacientes.",
    "- Dezembro/2025 permanece fora de benchmark normal.",
    "- Revisao humana antes de qualquer decisao operacional."
  ].join("\n");
}

function decideHandoffStatus(gate: WeeklyCollectionDecisionGate, saveReadiness: WeeklySaveReadinessReport): WeeklyCollectionSaveHandoffStatus {
  if (gate.status === "blocked" || saveReadiness.status === "blocked") return "blocked";
  if (gate.status === "needs_collection") return "collect_first";
  if (gate.status === "review_required" || saveReadiness.status === "needs-review") return "review_before_save";
  return "ready_to_save";
}

function handoffSeverity(status: WeeklyCollectionSaveHandoffStatus): WeeklyCollectionSaveHandoffSeverity {
  if (status === "ready_to_save") return "success";
  if (status === "blocked") return "critical";
  if (status === "review_before_save") return "warning";
  return "info";
}

function handoffSummary(
  status: WeeklyCollectionSaveHandoffStatus,
  gate: WeeklyCollectionDecisionGate,
  saveReadiness: WeeklySaveReadinessReport
): string {
  if (status === "ready_to_save") return "Coleta e formulario estao prontos para salvamento manual, mantendo revisao humana antes de usar a leitura.";
  if (status === "blocked") return `Nao salvar agora: ${gate.blockedItems.length} bloqueio(s) no checklist e ${saveReadiness.blockers.length} bloqueio(s) no formulario.`;
  if (status === "review_before_save") return "A semana pode estar operacionalmente salvavel, mas ainda exige revisao humana antes de gerar conclusao forte.";
  return `Complete a coleta antes de salvar: ${gate.pendingItems.length} item(ns) seguem pendentes no workspace.`;
}

function buildHandoffChecklist(gate: WeeklyCollectionDecisionGate, saveReadiness: WeeklySaveReadinessReport): WeeklyCollectionSaveHandoffItem[] {
  const formBlocked = saveReadiness.status === "blocked";
  const formNeedsReview = saveReadiness.status === "needs-review";
  const gateBlocked = gate.status === "blocked";
  const gateNeedsReview = gate.status === "review_required";
  const gateNeedsCollection = gate.status === "needs_collection";

  return [
    item(
      "collection-gate",
      "Gate de coleta",
      gateBlocked ? "blocked" : gateNeedsCollection || gateNeedsReview ? "review" : "ok",
      gate.summary
    ),
    item(
      "form-readiness",
      "Validacao do formulario",
      formBlocked ? "blocked" : formNeedsReview ? "review" : "ok",
      saveReadiness.summary
    ),
    item(
      "blockers",
      "Bloqueios conhecidos",
      gateBlocked || formBlocked ? "blocked" : "ok",
      [...gate.blockedItems, ...saveReadiness.blockers].length ? [...gate.blockedItems, ...saveReadiness.blockers].slice(0, 3).join(" | ") : "Nenhum bloqueio ativo."
    ),
    item(
      "review-notes",
      "Pontos de revisao",
      gateNeedsReview || formNeedsReview ? "review" : "ok",
      [...gate.reviewQuestions.slice(0, 2), ...saveReadiness.reviewNotes.slice(0, 2)].join(" | ") || "Sem pontos extras de revisao."
    ),
    item(
      "privacy-safety",
      "Privacidade e fonte",
      "ok",
      "Somente metricas agregadas; sem dados pessoais, clinicos, DMs, prints privados, API externa ou publicacao."
    )
  ];
}

function buildHandoffFocus(
  status: WeeklyCollectionSaveHandoffStatus,
  gate: WeeklyCollectionDecisionGate,
  saveReadiness: WeeklySaveReadinessReport
): WeeklyCollectionSaveHandoffFocus {
  if (gate.status === "blocked") {
    const blockedItem = gate.blockedItems[0] ?? "Item bloqueado no checklist.";
    return focus(
      "blocked",
      "Resolver bloqueio do workspace",
      blockedItem,
      "Workspace local de coleta",
      "#weekly-collection-workspace",
      `Abrir o checklist e destravar: ${blockedItem}`
    );
  }

  if (saveReadiness.status === "blocked") {
    const item = firstSaveReadinessIssue(saveReadiness, "missing") ?? firstSaveReadinessIssue(saveReadiness, "review");
    const blocker = saveReadiness.blockers[0] ?? item?.detail ?? "Campo essencial pendente.";
    return focus(
      "blocked",
      "Corrigir bloqueio do formulario",
      blocker,
      saveReadinessTargetLabel(item?.id),
      saveReadinessTargetHref(item?.id),
      item ? `Corrigir: ${item.label}.` : "Corrigir o primeiro campo essencial antes de salvar."
    );
  }

  if (status === "collect_first") {
    const pendingItem = gate.pendingItems[0] ?? "Item de coleta pendente.";
    return focus(
      "collect",
      "Completar coleta antes de salvar",
      pendingItem,
      "Workspace local de coleta",
      "#weekly-collection-workspace",
      `Completar coleta: ${pendingItem}`
    );
  }

  if (gate.status === "review_required") {
    const question = gate.reviewQuestions[0] ?? "Revisar gates finais.";
    return focus("review", "Concluir revisao final da coleta", question, "Workspace local de coleta", "#weekly-collection-workspace", question);
  }

  if (saveReadiness.status === "needs-review") {
    const item = firstSaveReadinessIssue(saveReadiness, "review");
    const reviewNote = saveReadiness.reviewNotes[0] ?? item?.detail ?? "Revisao operacional pendente.";
    return focus(
      "review",
      "Revisar qualidade da semana",
      reviewNote,
      saveReadinessTargetLabel(item?.id),
      saveReadinessTargetHref(item?.id),
      item ? `Revisar: ${item.label}.` : "Revisar pontos operacionais antes de concluir leitura forte."
    );
  }

  return focus(
    "ready",
    "Salvar e revisar leitura semanal",
    "Coleta e formulario estao prontos, mantendo decisao humana.",
    "Botao Salvar semana",
    "#weekly-save-top",
    "Salvar a semana manualmente e abrir /weekly para conferir a leitura."
  );
}

function buildHandoffNextActions(
  status: WeeklyCollectionSaveHandoffStatus,
  gate: WeeklyCollectionDecisionGate,
  saveReadiness: WeeklySaveReadinessReport
): string[] {
  if (status === "ready_to_save") {
    return [
      "Salvar a semana em /data se os valores visiveis no formulario estiverem corretos.",
      "Abrir /weekly depois do salvamento para revisar diagnostico, sinais e plano da proxima semana.",
      "Registrar limitacoes apenas como observacao operacional agregada."
    ];
  }

  if (status === "blocked") {
    return unique([
      ...gate.blockedItems.slice(0, 3).map((item) => `Resolver bloqueio de coleta: ${item}.`),
      ...saveReadiness.blockers.slice(0, 3),
      "Nao salvar conclusao forte enquanto houver bloqueio."
    ]);
  }

  if (status === "review_before_save") {
    return unique([
      ...gate.reviewQuestions.slice(0, 3),
      ...saveReadiness.reviewNotes.slice(0, 3),
      "Se a revisao humana confirmar os limites, salvar e ler a semana com cautela."
    ]);
  }

  return unique([
    ...gate.pendingItems.slice(0, 5).map((item) => `Completar coleta: ${item}.`),
    "Depois da coleta, revisar o formulario antes de salvar."
  ]);
}

function item(id: string, label: string, status: WeeklyCollectionSaveHandoffItem["status"], detail: string): WeeklyCollectionSaveHandoffItem {
  return { id, label, status, detail };
}

function focus(
  status: WeeklyCollectionSaveHandoffFocus["status"],
  title: string,
  detail: string,
  targetLabel: string,
  targetHref: string,
  action: string
): WeeklyCollectionSaveHandoffFocus {
  return { status, title, detail, targetLabel, targetHref, action };
}

function firstSaveReadinessIssue(saveReadiness: WeeklySaveReadinessReport, status: WeeklySaveReadinessReport["items"][number]["status"]) {
  return saveReadiness.items.find((item) => item.status === status);
}

function saveReadinessTargetLabel(itemId: string | undefined): string {
  if (itemId === "week-identity" || itemId === "week-period") return "Dados da semana";
  if (itemId === "paid-media") return "Meta Ads / Google Ads";
  if (itemId === "organic-instagram") return "Instagram organico";
  if (itemId === "commercial-funnel") return "Funil comercial";
  return "Validacao antes de salvar";
}

function saveReadinessTargetHref(itemId: string | undefined): string {
  if (itemId === "week-identity" || itemId === "week-period") return "#weekly-fields-identity";
  if (itemId === "paid-media") return "#weekly-fields-paid-media";
  if (itemId === "organic-instagram") return "#weekly-fields-instagram";
  if (itemId === "commercial-funnel") return "#weekly-fields-funnel";
  return "#weekly-save-readiness";
}

function handoffStatusLabel(status: WeeklyCollectionSaveHandoffStatus): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  if (status === "review_before_save") return "revisao antes de salvar";
  return "coletar antes de salvar";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
