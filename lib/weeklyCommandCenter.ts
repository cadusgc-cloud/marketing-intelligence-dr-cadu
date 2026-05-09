import { CONTENT_IDEAS, type ContentFunnelStage } from "@/lib/contentStudio";
import { EDITORIAL_CALENDAR_ITEMS, getEditorialBottlenecks } from "@/lib/editorialCalendar";
import {
  DECISION_RULES,
  DECISION_SIGNAL_INPUTS,
  evaluateDecisionSignals,
  getCriticalSignals,
  getTriggeredSignals,
  type DecisionSignalResult,
  type DecisionType
} from "@/lib/decisionSignals";
import {
  WEEKLY_AUDIT_DECISIONS,
  WEEKLY_AUDIT_SUMMARY,
  getHighImpactOpportunities,
  getHighImpactRisks,
  type WeeklyAuditDecision
} from "@/lib/weeklyAudit";
import {
  WEEKLY_MARKETING_DATA_MOCK,
  convertWeeklyDataToDecisionInputs,
  isMetaPerformingBetterThanGoogle,
  summarizeWeeklyMarketingData,
  validateWeeklyMarketingData,
  type WeeklyMarketingData
} from "@/lib/weeklyDataInput";

export type WeeklyOperationalStatus = "healthy" | "attention" | "critical" | "incomplete_data";
export type WeeklyActionChannel = "meta" | "google" | "instagram" | "content" | "funnel" | "budget";
export type WeeklyActionPriority = "low" | "medium" | "high";
export type WeeklyActionUrgency = "today" | "next_72h" | "this_week";
export type WeeklyActionStatus = "pending" | "in_progress" | "done" | "blocked";

export type WeeklyActionItem = {
  id: string;
  title: string;
  description: string;
  channel: WeeklyActionChannel;
  priority: WeeklyActionPriority;
  urgency: WeeklyActionUrgency;
  decisionType: DecisionType;
  rationale: string;
  status: WeeklyActionStatus;
};

export type RecommendedWeeklyContent = {
  id: string;
  title: string;
  pillar: string;
  funnelStage: ContentFunnelStage;
  suggestedFormat: string;
  reason: string;
  relatedSignal: string;
  cta: string;
};

export type WeeklyCommandCenter = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  executiveSummary: string;
  operationalStatus: WeeklyOperationalStatus;
  mainDecision: string;
  mainRisk: string;
  mainOpportunity: string;
  metaSummary: string;
  googleSummary: string;
  instagramSummary: string;
  funnelSummary: string;
  contentSummary: string;
  triggeredSignals: DecisionSignalResult[];
  auditFindings: WeeklyAuditDecision[];
  actionPlan24h: WeeklyActionItem[];
  actionPlan72h: WeeklyActionItem[];
  recommendedContent: RecommendedWeeklyContent[];
  missingData: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const WEEKLY_COMMAND_CENTER_LINKS = [
  { href: "/data", label: "Ver dados semanais" },
  { href: "/signals", label: "Ver sinais de decisão" },
  { href: "/audit", label: "Ver auditoria semanal" },
  { href: "/calendar", label: "Ver calendário editorial" },
  { href: "/content", label: "Ver ideias de conteúdo" }
];

export function buildWeeklyCommandCenter(data: WeeklyMarketingData = WEEKLY_MARKETING_DATA_MOCK): WeeklyCommandCenter {
  const inputs = [...convertWeeklyDataToDecisionInputs(data), ...DECISION_SIGNAL_INPUTS];
  const signals = evaluateDecisionSignals(inputs, DECISION_RULES);
  const triggeredSignals = dedupeSignals(getTriggeredSignals(signals));
  const auditFindings = WEEKLY_AUDIT_DECISIONS;
  const missingData = getMissingDataWarnings(data);
  const actionPlan24h = generate24hActionPlan(data, triggeredSignals);
  const actionPlan72h = generate72hActionPlan(data, triggeredSignals);
  const recommendedContent = recommendWeeklyContent(triggeredSignals);
  const centerBase = {
    triggeredSignals,
    auditFindings,
    missingData
  };

  return {
    id: `weekly-command-${data.id}`,
    weekLabel: data.weekLabel,
    startDate: data.startDate,
    endDate: data.endDate,
    executiveSummary: generateWeeklyExecutiveSummary(data, triggeredSignals, missingData),
    operationalStatus: determineOperationalStatus(triggeredSignals, missingData),
    mainDecision: selectMainDecision(data, triggeredSignals),
    mainRisk: selectMainRisk(centerBase),
    mainOpportunity: selectMainOpportunity(centerBase),
    metaSummary: summarizeChannelStatus("meta", data, triggeredSignals),
    googleSummary: summarizeChannelStatus("google", data, triggeredSignals),
    instagramSummary: summarizeChannelStatus("instagram", data, triggeredSignals),
    funnelSummary: summarizeChannelStatus("funnel", data, triggeredSignals),
    contentSummary: summarizeChannelStatus("content", data, triggeredSignals),
    triggeredSignals,
    auditFindings,
    actionPlan24h,
    actionPlan72h,
    recommendedContent,
    missingData,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

export function determineOperationalStatus(
  triggeredSignals: DecisionSignalResult[],
  missingData: string[] = []
): WeeklyOperationalStatus {
  if (missingData.length > 0) return "incomplete_data";
  if (getCriticalSignals(triggeredSignals).length > 0) return "critical";
  if (triggeredSignals.some((signal) => signal.severity === "high")) return "attention";
  return "healthy";
}

export function generateWeeklyExecutiveSummary(
  data: WeeklyMarketingData,
  triggeredSignals: DecisionSignalResult[],
  missingData: string[] = []
): string {
  const critical = getCriticalSignals(triggeredSignals).length;
  return `${data.weekLabel}: Meta Ads segue como canal prioritário de escala, Google Ads permanece em diagnóstico com ${data.googleConversions} conversões e a rotina orgânica precisa sustentar Stories, CTA e conteúdos reaproveitáveis. Há ${critical} sinal(is) crítico(s) e ${missingData.length} ponto(s) de dados faltantes para fechar a leitura do funil.`;
}

export function selectMainDecision(data: WeeklyMarketingData, triggeredSignals: DecisionSignalResult[]): string {
  const metaScale = triggeredSignals.find((signal) => signal.channel === "meta" && signal.decisionType === "scale");
  if (isMetaPerformingBetterThanGoogle(data) && metaScale) return "Priorizar Meta Ads e escalar BOFU eficiente com cautela.";
  if (metaScale) return metaScale.nextAction;
  return "Manter leitura semanal antes de redistribuir orçamento.";
}

export function selectMainRisk(input: {
  triggeredSignals: DecisionSignalResult[];
  auditFindings: WeeklyAuditDecision[];
  missingData: string[];
}): string {
  const googleRisk = input.triggeredSignals.find((signal) => signal.channel === "google" && signal.decisionType === "pause");
  if (googleRisk) return "Escalar Google Ads antes de corrigir conversões pode distorcer orçamento e aprendizado.";
  if (input.missingData.length > 0) return "Dados incompletos de consultas e fechamentos limitam a leitura do funil.";
  return getHighImpactRisks(input.auditFindings)[0]?.title ?? "Nenhum risco alto dominante identificado.";
}

export function selectMainOpportunity(input: {
  triggeredSignals: DecisionSignalResult[];
  auditFindings: WeeklyAuditDecision[];
  missingData: string[];
}): string {
  const metaScale = input.triggeredSignals.find((signal) => signal.channel === "meta" && signal.decisionType === "scale");
  if (metaScale) return "Transformar o BOFU eficiente de Meta Ads em escala controlada e novos criativos de prova.";
  return getHighImpactOpportunities(input.auditFindings)[0]?.title ?? "Manter consistência operacional e ampliar aprendizados confiáveis.";
}

export function generate24hActionPlan(data: WeeklyMarketingData, triggeredSignals: DecisionSignalResult[]): WeeklyActionItem[] {
  const actions: WeeklyActionItem[] = [
    action(
      "hold-google-diagnostic",
      "Não escalar Google Ads",
      "Manter Google Ads em diagnóstico enquanto as conversões estiverem zeradas ou sem rastreamento confiável.",
      "google",
      "high",
      "today",
      "pause",
      "Google com conversões zeradas não deve receber escala."
    ),
    action(
      "protect-meta-bofu",
      "Proteger Meta BOFU eficiente",
      "Priorizar orçamento e leitura dos criativos de fundo de funil com melhor custo por conversa no WhatsApp.",
      "meta",
      "high",
      "today",
      "scale",
      "Meta Ads é o canal principal de escala nesta fase."
    ),
    action(
      "restore-stories-cta",
      "Reforçar Stories com CTA",
      "Publicar Stories com CTA para WhatsApp e conexão com os temas pagos da semana.",
      "instagram",
      "high",
      "today",
      "maintain",
      "Stories fazem parte do funil e sustentam visitas ao perfil."
    )
  ];

  if (data.consultationsScheduled === null) {
    actions.push(
      action(
        "map-consult-data",
        "Mapear consultas marcadas",
        "Registrar consultas marcadas, comparecimentos e fechamentos por origem antes de concluir gargalos comerciais.",
        "funnel",
        "high",
        "today",
        "investigate",
        "Sem esses dados, a leitura do funil fica incompleta."
      )
    );
  }

  const productionSignal = triggeredSignals.find((signal) => signal.channel === "content" && signal.decisionType === "restructure");
  if (productionSignal) {
    actions.push(
      action(
        "clear-production-bottleneck",
        "Destravar produção de conteúdo",
        productionSignal.nextAction,
        "content",
        "medium",
        "today",
        "restructure",
        productionSignal.rationale
      )
    );
  }

  return actions.slice(0, 5);
}

export function generate72hActionPlan(data: WeeklyMarketingData, triggeredSignals: DecisionSignalResult[]): WeeklyActionItem[] {
  const bottlenecks = getEditorialBottlenecks(EDITORIAL_CALENDAR_ITEMS);
  const actions: WeeklyActionItem[] = [
    action(
      "create-meta-variations",
      "Criar variações dos vencedores",
      "Transformar aprendizados de BOFU em novos roteiros de prova, naturalidade e pesquisa ativa.",
      "meta",
      "high",
      "next_72h",
      "test",
      "Escala saudável precisa de variação criativa antes de saturar audiência."
    ),
    action(
      "reuse-content-matrix",
      "Reaproveitar ideias da semana",
      "Converter ideias prioritárias em Stories, Reels/Shorts e TikTok sempre que o tema permitir.",
      "content",
      "high",
      "next_72h",
      "maintain",
      "Cada ideia relevante deve virar matriz de formatos."
    ),
    action(
      "audit-google-tracking",
      "Auditar rastreamento do Google Ads",
      "Revisar tag, evento e importação de conversões antes de qualquer aumento de verba.",
      "google",
      "high",
      "next_72h",
      "investigate",
      "Google Ads segue diagnóstico até corrigir conversões."
    ),
    action(
      "review-calendar-bottlenecks",
      "Revisar gargalos do calendário",
      bottlenecks[0] ?? "Checar gravação, edição e agendamento dos conteúdos planejados.",
      "content",
      "medium",
      "next_72h",
      "restructure",
      "Plano editorial só vira rotina quando produção e agendamento acompanham."
    )
  ];

  if (data.instagramStories < 6) {
    actions.push(
      action(
        "stories-six-per-day",
        "Voltar ao mínimo de Stories",
        "Organizar cadência mínima de 6 Stories por dia com CTA diário para WhatsApp.",
        "instagram",
        "high",
        "next_72h",
        "maintain",
        "Baixa cadência não deve ser confundida com queda de qualidade orgânica."
      )
    );
  }

  return dedupeActions(actions).slice(0, 5);
}

export function recommendWeeklyContent(triggeredSignals: DecisionSignalResult[]): RecommendedWeeklyContent[] {
  const signalTitles = triggeredSignals.map((signal) => signal.title).join(" | ");
  const priorityIdeas = CONTENT_IDEAS.filter((idea) => idea.priority === "high" || idea.suggestedPlatform === "all");
  return priorityIdeas.slice(0, 5).map((idea) => ({
    id: `weekly-${idea.id}`,
    title: idea.title,
    pillar: idea.pillar,
    funnelStage: idea.funnelStage,
    suggestedFormat: idea.suggestedPlatform === "all" ? "Stories + Reels/Shorts + TikTok" : idea.suggestedPlatform,
    reason:
      idea.funnelStage === "BOFU"
        ? "Reforça prova, naturalidade e conversas no WhatsApp para sustentar Meta Ads."
        : "Ajuda a recuperar cadência orgânica e alimentar o funil com tema reaproveitável.",
    relatedSignal: signalTitles.includes("Poucos stories") ? "Poucos Stories no dia" : "Reaproveitamento semanal",
    cta: idea.cta
  }));
}

export function getMissingDataWarnings(data: WeeklyMarketingData): string[] {
  const validation = validateWeeklyMarketingData(data);
  return [
    ...validation.missingFields.map((field) => `Campo ausente: ${field}`),
    ...validation.warnings.filter((warning) => warning.toLocaleLowerCase("pt-BR").includes("funil"))
  ];
}

export function summarizeChannelStatus(
  channel: WeeklyActionChannel,
  data: WeeklyMarketingData,
  triggeredSignals: DecisionSignalResult[]
): string {
  const channelSignals = triggeredSignals.filter((signal) => signal.channel === channel);
  if (channel === "meta") {
    return `Meta Ads gerou ${data.metaWhatsappConversations} conversas no WhatsApp e deve seguir como canal principal de escala.`;
  }
  if (channel === "google") {
    return `Google Ads registrou ${data.googleConversions} conversões e permanece em diagnóstico antes de qualquer escala.`;
  }
  if (channel === "instagram") {
    return `Instagram teve ${data.instagramStories} Stories por dia; a prioridade é cadência, CTA e sustentação das visitas ao perfil.`;
  }
  if (channel === "funnel") {
    return data.consultationsScheduled === null
      ? "Funil comercial ainda precisa de dados de consultas marcadas, comparecimento e fechamentos."
      : "Funil comercial possui dados suficientes para leitura semanal.";
  }
  if (channel === "content") {
    return `${EDITORIAL_CALENDAR_ITEMS.length} conteúdos planejados; foco em reaproveitamento e destravamento de produção.`;
  }
  return `${channelSignals.length} sinal(is) de orçamento acionado(s); proteger Meta Ads antes de ampliar canais em diagnóstico.`;
}

export function summarizeWeeklyCommandData(data: WeeklyMarketingData = WEEKLY_MARKETING_DATA_MOCK): string {
  return summarizeWeeklyMarketingData(data);
}

function action(
  id: string,
  title: string,
  description: string,
  channel: WeeklyActionChannel,
  priority: WeeklyActionPriority,
  urgency: WeeklyActionUrgency,
  decisionType: DecisionType,
  rationale: string
): WeeklyActionItem {
  return {
    id,
    title,
    description,
    channel,
    priority,
    urgency,
    decisionType,
    rationale,
    status: "pending"
  };
}

function dedupeSignals(signals: DecisionSignalResult[]): DecisionSignalResult[] {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${signal.ruleId}:${signal.channel}:${signal.decisionType}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeActions(actions: WeeklyActionItem[]): WeeklyActionItem[] {
  const seen = new Set<string>();
  return actions.filter((item) => {
    const key = `${item.channel}:${item.decisionType}:${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
