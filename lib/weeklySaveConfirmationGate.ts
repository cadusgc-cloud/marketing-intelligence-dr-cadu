import type { WeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import type { WeeklySaveReadinessReport } from "@/lib/weeklyDataInput";
import type { WeeklySourceEvidenceLedger } from "@/lib/weeklySourceEvidenceLedger";

export type WeeklySaveConfirmationStatus = "ready_to_save" | "review_before_save" | "blocked";
export type WeeklySaveConfirmationSeverity = "success" | "warning" | "critical";
export type WeeklySaveConfirmationCheckStatus = "ok" | "review" | "blocked";

export type WeeklySaveConfirmationCheck = {
  id: string;
  label: string;
  status: WeeklySaveConfirmationCheckStatus;
  detail: string;
  targetHref: string;
};

export type WeeklySaveConfirmationFocus = {
  status: WeeklySaveConfirmationCheckStatus;
  title: string;
  detail: string;
  targetLabel: string;
  targetHref: string;
  action: string;
};

export type WeeklySaveConfirmationGate = {
  id: string;
  title: string;
  status: WeeklySaveConfirmationStatus;
  severity: WeeklySaveConfirmationSeverity;
  canSubmit: boolean;
  submitLabel: string;
  summary: string;
  checks: WeeklySaveConfirmationCheck[];
  focus: WeeklySaveConfirmationFocus;
  nextActions: string[];
  guardrails: string[];
  copyMarkdown: string;
};

export type BuildWeeklySaveConfirmationGateInput = {
  saveReadiness: WeeklySaveReadinessReport;
  collectionReadiness: WeeklyCollectionReadinessBoard;
  sourceEvidenceLedger: WeeklySourceEvidenceLedger;
};

const guardrails = [
  "Salvar e uma acao manual do usuario, nao uma automacao.",
  "Usar somente metricas agregadas e revisadas.",
  "Nao salvar nomes, DMs, telefones, prints, prontuarios, dados clinicos ou dados pessoais.",
  "Nao conectar API externa, OAuth, scraping, WhatsApp, e-mail ou publicacao automatica.",
  "Dezembro/2025 permanece fora de benchmark normal, media, score, projecao e recomendacao.",
  "A leitura do Weekly Command Center continua apoio interno, nao decisao automatica."
];

export function buildWeeklySaveConfirmationGate(input: BuildWeeklySaveConfirmationGateInput): WeeklySaveConfirmationGate {
  const status = decideStatus(input);
  const checks = buildChecks(input);
  const focus = buildFocus(checks, input);
  const gate: Omit<WeeklySaveConfirmationGate, "copyMarkdown"> = {
    id: `weekly-save-confirmation-${input.sourceEvidenceLedger.id}`,
    title: "Conferencia final antes de salvar",
    status,
    severity: status === "ready_to_save" ? "success" : status === "blocked" ? "critical" : "warning",
    canSubmit: status !== "blocked",
    submitLabel: status === "blocked" ? "Resolver bloqueio" : "Salvar semana",
    summary: buildSummary(status, input),
    checks,
    focus,
    nextActions: buildNextActions(status, input),
    guardrails
  };

  return {
    ...gate,
    copyMarkdown: buildGateMarkdown(gate)
  };
}

function decideStatus(input: BuildWeeklySaveConfirmationGateInput): WeeklySaveConfirmationStatus {
  if (
    input.saveReadiness.status === "blocked" ||
    input.collectionReadiness.status === "blocked" ||
    input.sourceEvidenceLedger.status === "blocked"
  ) {
    return "blocked";
  }

  if (
    input.saveReadiness.status === "needs-review" ||
    input.collectionReadiness.status === "needs_review" ||
    input.collectionReadiness.status === "missing" ||
    input.sourceEvidenceLedger.status === "needs_review" ||
    input.sourceEvidenceLedger.status === "missing"
  ) {
    return "review_before_save";
  }

  return "ready_to_save";
}

function buildChecks(input: BuildWeeklySaveConfirmationGateInput): WeeklySaveConfirmationCheck[] {
  return [
    check(
      "form-readiness",
      "Formulario semanal",
      input.saveReadiness.status === "blocked" ? "blocked" : input.saveReadiness.status === "needs-review" ? "review" : "ok",
      input.saveReadiness.summary,
      "#weekly-save-readiness"
    ),
    check(
      "source-evidence",
      "Mapa de origem",
      input.sourceEvidenceLedger.status === "blocked" ? "blocked" : input.sourceEvidenceLedger.status === "verified" ? "ok" : "review",
      input.sourceEvidenceLedger.summary,
      "#weekly-source-evidence-ledger"
    ),
    check(
      "collection-readiness",
      "Prontidao por fonte",
      input.collectionReadiness.status === "blocked" ? "blocked" : input.collectionReadiness.status === "ready" ? "ok" : "review",
      input.collectionReadiness.summary,
      "#weekly-collection-readiness"
    ),
    check(
      "privacy-safety",
      "Privacidade e seguranca",
      input.collectionReadiness.status === "blocked" || input.sourceEvidenceLedger.status === "blocked" ? "blocked" : "ok",
      "Somente metricas agregadas; sem dados pessoais, clinicos, DMs, conversas, prints privados ou pacientes.",
      "#weekly-source-evidence-ledger"
    ),
    check(
      "human-review",
      "Revisao humana",
      "ok",
      "A decisao de salvar e interpretar a semana permanece humana e interna.",
      "#weekly-manual-review-trail"
    )
  ];
}

function buildSummary(status: WeeklySaveConfirmationStatus, input: BuildWeeklySaveConfirmationGateInput): string {
  if (status === "ready_to_save") {
    return "Semana pronta para salvamento manual. Depois de salvar, abra /weekly para revisar diagnostico e proximos passos.";
  }

  if (status === "blocked") {
    const blockerCount =
      input.saveReadiness.blockers.length +
      input.sourceEvidenceLedger.totals.blocked +
      input.collectionReadiness.sources.filter((source) => source.status === "blocked").length;
    return `Nao salvar agora: ${blockerCount} bloqueio(s) exigem correcao antes de registrar a semana.`;
  }

  return "Semana pode ser salva com cautela se a revisao humana aceitar as lacunas. A leitura posterior deve permanecer limitada.";
}

function buildNextActions(status: WeeklySaveConfirmationStatus, input: BuildWeeklySaveConfirmationGateInput): string[] {
  if (status === "ready_to_save") {
    return [
      "Salvar a semana manualmente em /data.",
      "Abrir /weekly e revisar diagnostico, sinais e plano da proxima semana.",
      "Manter o mapa de origem e a trilha manual como referencia interna."
    ];
  }

  if (status === "blocked") {
    return unique([
      ...input.saveReadiness.blockers.slice(0, 3),
      ...input.sourceEvidenceLedger.sources
        .filter((source) => source.status === "blocked")
        .slice(0, 3)
        .map((source) => `${source.title}: ${source.nextAction}`),
      ...input.collectionReadiness.priorityActions.slice(0, 3),
      "Nao salvar enquanto houver bloqueio de privacidade, periodo ou fonte essencial."
    ]);
  }

  return unique([
    ...input.saveReadiness.reviewNotes.slice(0, 3),
    ...input.sourceEvidenceLedger.sources
      .filter((source) => source.status === "needs_review" || source.status === "missing")
      .slice(0, 3)
      .map((source) => `${source.title}: ${source.nextAction}`),
    "Se salvar, interpretar a semana como leitura limitada e revisar manualmente antes de decisao operacional."
  ]);
}

function buildFocus(checks: WeeklySaveConfirmationCheck[], input: BuildWeeklySaveConfirmationGateInput): WeeklySaveConfirmationFocus {
  const firstBlocked = checks.find((checkItem) => checkItem.status === "blocked");
  if (firstBlocked) {
    return focus(
      "blocked",
      `Resolver ${firstBlocked.label}`,
      firstBlocked.detail,
      firstBlocked.label,
      firstBlocked.targetHref,
      firstFocusAction(firstBlocked.id, input)
    );
  }

  const firstReview = checks.find((checkItem) => checkItem.status === "review");
  if (firstReview) {
    return focus(
      "review",
      `Revisar ${firstReview.label}`,
      firstReview.detail,
      firstReview.label,
      firstReview.targetHref,
      firstFocusAction(firstReview.id, input)
    );
  }

  return focus(
    "ok",
    "Salvar e revisar leitura semanal",
    "Todos os checks do gate final estao adequados para salvamento manual.",
    "Botao Salvar semana",
    "#weekly-save-top",
    "Salvar a semana manualmente e abrir /weekly para revisar diagnostico, sinais e plano."
  );
}

function firstFocusAction(checkId: string, input: BuildWeeklySaveConfirmationGateInput): string {
  if (checkId === "form-readiness") {
    return input.saveReadiness.blockers[0] ?? input.saveReadiness.reviewNotes[0] ?? "Abrir a validacao do formulario e revisar campos essenciais.";
  }

  if (checkId === "source-evidence") {
    const source = input.sourceEvidenceLedger.sources.find((item) => item.status === "blocked" || item.status === "missing" || item.status === "needs_review");
    return source ? `${source.title}: ${source.nextAction}` : "Abrir o mapa de origem e revisar fontes, lacunas e evidencias agregadas.";
  }

  if (checkId === "collection-readiness") {
    return input.collectionReadiness.priorityActions[0] ?? "Abrir prontidao por fonte e revisar a primeira acao de coleta.";
  }

  if (checkId === "privacy-safety") {
    const source = input.sourceEvidenceLedger.sources.find((item) => item.status === "blocked");
    return source ? `${source.title}: remover dado sensivel ou identificavel antes de salvar.` : "Revisar privacidade antes de qualquer salvamento.";
  }

  return "Fazer revisao humana antes de salvar ou interpretar a semana.";
}

function buildGateMarkdown(gate: Omit<WeeklySaveConfirmationGate, "copyMarkdown">): string {
  return [
    `# ${gate.title}`,
    "",
    `Status: ${statusLabel(gate.status)}`,
    `Pode salvar no painel: ${gate.canSubmit ? "sim, manualmente" : "nao"}`,
    `Resumo: ${gate.summary}`,
    "",
    "## Checks",
    "",
    ...gate.checks.map((checkItem) => `- [${checkStatusLabel(checkItem.status)}] ${checkItem.label}: ${checkItem.detail}`),
    "",
    "## Primeiro foco",
    "",
    `- [${checkStatusLabel(gate.focus.status)}] ${gate.focus.title}`,
    `- Area: ${gate.focus.targetLabel}`,
    `- Acao: ${gate.focus.action}`,
    `- Detalhe: ${gate.focus.detail}`,
    "",
    "## Proximas acoes",
    "",
    ...gate.nextActions.map((action) => `- ${action}`),
    "",
    "## Guardrails",
    "",
    ...gate.guardrails.map((guardrail) => `- ${guardrail}`),
    ""
  ].join("\n");
}

function check(
  id: string,
  label: string,
  status: WeeklySaveConfirmationCheckStatus,
  detail: string,
  targetHref: string
): WeeklySaveConfirmationCheck {
  return { id, label, status, detail, targetHref };
}

function focus(
  status: WeeklySaveConfirmationCheckStatus,
  title: string,
  detail: string,
  targetLabel: string,
  targetHref: string,
  action: string
): WeeklySaveConfirmationFocus {
  return { status, title, detail, targetLabel, targetHref, action };
}

function statusLabel(status: WeeklySaveConfirmationStatus): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  return "revisar antes de salvar";
}

function checkStatusLabel(status: WeeklySaveConfirmationCheckStatus): string {
  if (status === "ok") return "ok";
  if (status === "blocked") return "bloqueio";
  return "revisar";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}
