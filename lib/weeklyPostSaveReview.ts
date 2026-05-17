import type { WeeklyCommandResult } from "@/lib/weeklyCommandResult";
import { isWeeklyMarketingDataOperationalAnomaly } from "@/lib/weeklyCommandResult";
import type { WeeklyMarketingData } from "@/lib/weeklyDataInput";

export type WeeklyPostSaveReviewStatus = "ready_for_review" | "limited_review" | "needs_data_review";
export type WeeklyPostSaveReviewConfidence = "alta" | "media" | "baixa";
export type WeeklyPostSaveReviewItemStatus = "ok" | "review" | "limited";

export type WeeklyPostSaveReviewSnapshotItem = {
  label: string;
  value: string;
  detail: string;
};

export type WeeklyPostSaveReviewItem = {
  id: string;
  label: string;
  status: WeeklyPostSaveReviewItemStatus;
  detail: string;
  action: string;
  targetHref: string;
};

export type WeeklyPostSaveReviewAction = {
  title: string;
  detail: string;
  targetLabel: string;
  targetHref: string;
  ownerSuggestion: string;
  actionWindow: string;
};

export type WeeklyPostSaveReviewReport = {
  id: string;
  title: string;
  status: WeeklyPostSaveReviewStatus;
  statusLabel: string;
  confidence: WeeklyPostSaveReviewConfidence;
  confidenceScore: number;
  summary: string;
  savedSnapshot: WeeklyPostSaveReviewSnapshotItem[];
  firstAction: WeeklyPostSaveReviewAction;
  reviewItems: WeeklyPostSaveReviewItem[];
  nextOpenLinks: Array<{ label: string; href: string; purpose: string }>;
  guardrails: string[];
  copyMarkdown: string;
};

const guardrails = [
  "Revisao pos-salvamento e interna, deterministica e baseada em metricas agregadas.",
  "Nao publica, nao envia mensagens, nao aciona API externa e nao interfere automaticamente com a equipe.",
  "Nao usar nomes, DMs, prints privados, dados clinicos, prontuarios, fotos privadas ou informacao de paciente.",
  "Dezembro/2025 permanece fora de benchmark normal, media, score, projecao e recomendacao.",
  "Decisoes de verba, conteudo, equipe e comunicacao medica continuam dependendo de revisao humana."
];

export function buildWeeklyPostSaveReview(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  commandResult: WeeklyCommandResult
): WeeklyPostSaveReviewReport {
  const confidenceScore = calculateConfidenceScore(current, previous, commandResult);
  const confidence = confidenceLabel(confidenceScore);
  const status = determinePostSaveStatus(current, commandResult, confidenceScore);
  const reviewItems = buildReviewItems(current, previous, commandResult);
  const firstAction = selectFirstAction(current, previous, commandResult, reviewItems);
  const report: Omit<WeeklyPostSaveReviewReport, "copyMarkdown"> = {
    id: `weekly-post-save-review-${current.id}`,
    title: "Revisao compacta pos-salvamento",
    status,
    statusLabel: statusLabel(status),
    confidence,
    confidenceScore,
    summary: buildSummary(current, previous, commandResult, status, confidence),
    savedSnapshot: buildSavedSnapshot(current, commandResult),
    firstAction,
    reviewItems,
    nextOpenLinks: buildNextOpenLinks(current, commandResult),
    guardrails
  };

  return {
    ...report,
    copyMarkdown: buildCopyMarkdown(report)
  };
}

function calculateConfidenceScore(current: WeeklyMarketingData, previous: WeeklyMarketingData | null, commandResult: WeeklyCommandResult): number {
  let score = 100;

  if (!previous) score -= 15;
  if (isWeeklyMarketingDataOperationalAnomaly(current)) score -= 35;
  if (commandResult.historyContext.status === "empty") score -= 10;
  if (commandResult.historyContext.status === "limited") score -= 5;
  if (current.consultationsScheduled === null || current.consultationsAttended === null || current.surgeriesClosed === null) score -= 25;
  if (current.instagramStories < 42) score -= 10;
  if (current.instagramReels < 3) score -= 6;
  if (current.googleSpend > 0 && current.googleConversions === 0) score -= 10;
  if (commandResult.status === "insufficient_data") score -= 8;

  return Math.max(0, Math.min(100, score));
}

function determinePostSaveStatus(
  current: WeeklyMarketingData,
  commandResult: WeeklyCommandResult,
  confidenceScore: number
): WeeklyPostSaveReviewStatus {
  if (isWeeklyMarketingDataOperationalAnomaly(current) || confidenceScore < 50) return "needs_data_review";
  if (commandResult.status === "insufficient_data" || confidenceScore < 75) return "limited_review";
  return "ready_for_review";
}

function buildSummary(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  commandResult: WeeklyCommandResult,
  status: WeeklyPostSaveReviewStatus,
  confidence: WeeklyPostSaveReviewConfidence
): string {
  const comparison = previous ? "com comparacao contra semana anterior valida" : "como linha de base sem comparacao anterior valida";
  const base = `${current.weekLabel || "Semana salva"} foi carregada em /weekly ${comparison}. Confianca da leitura: ${confidence}.`;

  if (status === "needs_data_review") {
    return `${base} Antes de concluir a semana, revise dados ausentes, periodo ou anomalia operacional.`;
  }

  if (status === "limited_review") {
    return `${base} A leitura pode orientar a revisao interna, mas ainda pede cautela por historico, cadencia ou funil incompleto.`;
  }

  return `${base} A semana esta pronta para revisao operacional interna, mantendo decisao humana antes de qualquer acao externa. Status principal: ${commandResult.statusLabel}.`;
}

function buildSavedSnapshot(current: WeeklyMarketingData, commandResult: WeeklyCommandResult): WeeklyPostSaveReviewSnapshotItem[] {
  return [
    snapshot("Semana", current.weekLabel || "sem rotulo", `${current.startDate || "sem inicio"} a ${current.endDate || "sem fim"}`),
    snapshot("Status", commandResult.statusLabel, commandResult.executiveSummary),
    snapshot("Meta WhatsApp", String(current.metaWhatsappConversations), formatMoneyDetail(current.metaSpend, "investimento Meta agregado")),
    snapshot("Google conversoes", String(current.googleConversions), formatMoneyDetail(current.googleSpend, "investimento Google agregado")),
    snapshot("Stories", String(current.instagramStories), `${dailyAverage(current.instagramStories)} Stories/dia em media simples.`),
    snapshot("Funil comercial", funnelValue(current), funnelDetail(current))
  ];
}

function buildReviewItems(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  commandResult: WeeklyCommandResult
): WeeklyPostSaveReviewItem[] {
  const funnelComplete = current.consultationsScheduled !== null && current.consultationsAttended !== null && current.surgeriesClosed !== null;
  const hasOrganicCadence = current.instagramStories >= 42 && current.instagramReels >= 3;
  const googleNeedsReview = current.googleSpend > 0 && current.googleConversions === 0;
  const anomaly = isWeeklyMarketingDataOperationalAnomaly(current);

  return [
    reviewItem(
      "saved-week",
      "Semana salva",
      anomaly ? "limited" : "ok",
      anomaly ? "Periodo cruza dezembro/2025 e deve ficar fora de benchmark normal." : "Semana carregada para leitura operacional interna.",
      anomaly ? "Manter como contexto historico anomalo, sem media ou recomendacao normal." : "Usar como base para diagnostico e plano interno.",
      "/weekly"
    ),
    reviewItem(
      "valid-history",
      "Historico valido",
      previous && commandResult.historyContext.status !== "empty" ? "ok" : "review",
      commandResult.historyContext.summary,
      previous ? "Usar comparacao com cautela e continuar acumulando semanas validas." : "Salvar novas semanas agregadas para formar comparacao normal.",
      "/weekly"
    ),
    reviewItem(
      "commercial-funnel",
      "Funil comercial",
      funnelComplete ? "ok" : "limited",
      funnelComplete ? "Consultas, comparecimentos e fechamentos foram informados." : "Consultas, comparecimentos ou fechamentos ainda estao incompletos.",
      funnelComplete ? "Usar funil para separar demanda, atendimento e fechamento." : "Voltar em /data e completar apenas totais agregados do funil.",
      "/data"
    ),
    reviewItem(
      "organic-cadence",
      "Cadencia organica",
      hasOrganicCadence ? "ok" : "review",
      `${current.instagramStories} Stories e ${current.instagramReels} Reels/Shorts registrados.`,
      hasOrganicCadence ? "Manter rotina e revisar qualidade criativa." : "Planejar presenca diaria antes de concluir queda de qualidade.",
      "/stories/today"
    ),
    reviewItem(
      "google-tracking",
      "Google e tracking",
      googleNeedsReview ? "review" : "ok",
      googleNeedsReview ? "Google teve investimento agregado sem conversoes registradas." : "Google nao apresenta bloqueio direto nesta revisao compacta.",
      googleNeedsReview ? "Auditar conversoes, termos e pagina antes de escalar investimento." : "Manter leitura comparativa sem ampliar conclusoes automaticamente.",
      "/signals"
    ),
    reviewItem(
      "team-audit",
      "Team Audit Mode",
      "ok",
      commandResult.teamAudit.summary,
      "Usar achados internamente; nao enviar recomendacoes para a equipe automaticamente.",
      "/audit"
    )
  ];
}

function selectFirstAction(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  commandResult: WeeklyCommandResult,
  reviewItems: WeeklyPostSaveReviewItem[]
): WeeklyPostSaveReviewAction {
  const anomaly = isWeeklyMarketingDataOperationalAnomaly(current);
  if (anomaly) {
    return firstAction(
      "Preservar anomalia operacional",
      "A semana cruza dezembro/2025 e deve ficar fora de medias, benchmark, score, projecao e recomendacao normal.",
      "Historico semanal",
      "/weekly",
      "Cadu",
      "agora"
    );
  }

  const firstLimited = reviewItems.find((item) => item.status === "limited");
  if (firstLimited) {
    return firstAction(firstLimited.label, firstLimited.detail, firstLimited.label, firstLimited.targetHref, "revisao humana", "agora");
  }

  const firstReview = reviewItems.find((item) => item.status === "review");
  if (firstReview) {
    return firstAction(firstReview.label, firstReview.detail, firstReview.label, firstReview.targetHref, firstReview.id === "organic-cadence" ? "marketing" : "Cadu", "esta semana");
  }

  if (!previous) {
    return firstAction(
      "Acumular proxima semana valida",
      "Esta leitura e basal. A proxima semana salva melhora comparacao e historico.",
      "Dados semanais",
      "/data",
      "Cadu",
      "proxima semana"
    );
  }

  return firstAction(
    "Abrir board de execucao",
    commandResult.priorityLevers[0]?.title ?? "Transformar a leitura em plano manual interno.",
    "Board de execucao",
    "/weekly/execution",
    commandResult.priorityLevers[0]?.ownerSuggestion ?? "Cadu",
    commandResult.priorityLevers[0]?.actionWindow ?? "esta semana"
  );
}

function buildNextOpenLinks(current: WeeklyMarketingData, commandResult: WeeklyCommandResult): WeeklyPostSaveReviewReport["nextOpenLinks"] {
  const links = [
    { label: "Board de execucao", href: "/weekly/execution", purpose: "Transformar leitura em tarefas internas manuais." },
    { label: "Pacote manual", href: "/weekly/execution/packet", purpose: "Copiar plano de revisao humana e execucao." },
    { label: "Dados semanais", href: "/data", purpose: "Corrigir ou completar metricas agregadas da proxima semana." },
    { label: "Sinais", href: "/signals", purpose: "Ver mudancas relevantes e alertas deterministicos." },
    { label: "Auditoria", href: "/audit", purpose: "Usar Team Audit Mode internamente." }
  ];

  if (current.instagramStories < 42 || commandResult.storiesPresence.status !== "active") {
    links.unshift({ label: "Stories de hoje", href: "/stories/today", purpose: "Recuperar presenca diaria com planejamento manual." });
  }

  return uniqueLinks(links).slice(0, 6);
}

function buildCopyMarkdown(report: Omit<WeeklyPostSaveReviewReport, "copyMarkdown">): string {
  return [
    `# ${report.title}`,
    "",
    `Status: ${report.statusLabel}`,
    `Confianca: ${report.confidence} (${report.confidenceScore}/100)`,
    `Resumo: ${report.summary}`,
    "",
    "## Primeiro passo",
    "",
    `- ${report.firstAction.title}`,
    `- ${report.firstAction.detail}`,
    `- Abrir: ${report.firstAction.targetLabel} (${report.firstAction.targetHref})`,
    `- Responsavel sugerido: ${report.firstAction.ownerSuggestion}`,
    "",
    "## Snapshot salvo",
    "",
    ...report.savedSnapshot.map((item) => `- ${item.label}: ${item.value} | ${item.detail}`),
    "",
    "## Revisao compacta",
    "",
    ...report.reviewItems.map((item) => `- [${item.status}] ${item.label}: ${item.detail} Acao: ${item.action}`),
    "",
    "## Guardrails",
    "",
    ...report.guardrails.map((guardrail) => `- ${guardrail}`),
    ""
  ].join("\n");
}

function confidenceLabel(score: number): WeeklyPostSaveReviewConfidence {
  if (score >= 80) return "alta";
  if (score >= 55) return "media";
  return "baixa";
}

function statusLabel(status: WeeklyPostSaveReviewStatus): string {
  if (status === "ready_for_review") return "pronta para revisao interna";
  if (status === "limited_review") return "leitura limitada";
  return "revisar dados antes de concluir";
}

function snapshot(label: string, value: string, detail: string): WeeklyPostSaveReviewSnapshotItem {
  return { label, value, detail };
}

function reviewItem(
  id: string,
  label: string,
  status: WeeklyPostSaveReviewItemStatus,
  detail: string,
  action: string,
  targetHref: string
): WeeklyPostSaveReviewItem {
  return { id, label, status, detail, action, targetHref };
}

function firstAction(
  title: string,
  detail: string,
  targetLabel: string,
  targetHref: string,
  ownerSuggestion: string,
  actionWindow: string
): WeeklyPostSaveReviewAction {
  return { title, detail, targetLabel, targetHref, ownerSuggestion, actionWindow };
}

function funnelValue(current: WeeklyMarketingData): string {
  const scheduled = current.consultationsScheduled === null ? "sem consultas" : `${current.consultationsScheduled} consultas`;
  const attended = current.consultationsAttended === null ? "sem comparecimento" : `${current.consultationsAttended} comparecimentos`;
  const closed = current.surgeriesClosed === null ? "sem fechamentos" : `${current.surgeriesClosed} fechamentos`;
  return `${scheduled}, ${attended}, ${closed}`;
}

function funnelDetail(current: WeeklyMarketingData): string {
  if (current.consultationsScheduled === null || current.consultationsAttended === null || current.surgeriesClosed === null) {
    return "Funil incompleto limita conclusao sobre qualidade de demanda e atendimento.";
  }

  return "Funil agregado permite revisar demanda, comparecimento e fechamento sem dados pessoais.";
}

function formatMoneyDetail(value: number, label: string): string {
  return `${label}: R$ ${value.toFixed(2).replace(".", ",")}.`;
}

function dailyAverage(total: number): string {
  return (total / 7).toFixed(1).replace(".", ",");
}

function uniqueLinks<T extends { href: string }>(links: T[]): T[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
