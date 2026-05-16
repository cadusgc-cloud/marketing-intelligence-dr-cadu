import { CONTENT_IDEAS } from "@/lib/contentStudio";
import type { DecisionSignalResult } from "@/lib/decisionSignals";
import type { WeeklyAuditDecision } from "@/lib/weeklyAudit";
import type { WeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { getCalculatedWeeklyMetrics, type WeeklyMarketingData } from "@/lib/weeklyDataInput";
import {
  buildWeeklyStrategicDecisionReport,
  type WeeklyStrategicDecisionReport
} from "@/lib/weeklyStrategicDecision";
import { isInsideDecember2025 } from "@/lib/utils/dates";

export type WeeklyResultStatus = "growth" | "stable" | "cadence_drop" | "quality_drop" | "insufficient_data";
export type WeeklyResultSignalType = "positive" | "warning" | "anomaly" | "insufficient_data";
export type WeeklyResultContentFunction = "autoridade" | "confianca" | "educacao" | "desejo" | "conversao" | "distribuicao";

export type WeeklyResultMetricCard = {
  key: string;
  label: string;
  value: number | null;
  previousValue: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;
  unit: "count" | "BRL" | "rate";
  status: "available" | "missing";
  interpretation: string;
};

export type WeeklyResultExecutiveDiagnosis = {
  improved: string[];
  worsened: string[];
  inconclusive: string[];
  needsAttention: string[];
};

export type WeeklyCadenceQualityReading = {
  status: WeeklyResultStatus;
  title: string;
  summary: string;
  evidence: string[];
  nextAction: string;
};

export type WeeklyResultSignal = {
  id: string;
  type: WeeklyResultSignalType;
  title: string;
  description: string;
  source: string;
};

export type WeeklyResultContentLearning = {
  functionName: WeeklyResultContentFunction;
  label: string;
  status: "active" | "attention" | "missing_data";
  evidence: string;
  nextAction: string;
};

export type WeeklyResultStoriesPresence = {
  status: "active" | "attention" | "missing_data";
  summary: string;
  dailyAverage: number | null;
  nextAction: string;
  links: Array<{ label: string; href: string }>;
};

export type WeeklyResultNextWeekPlan = {
  repeat: string[];
  adjust: string[];
  test: string[];
  avoid: string[];
};

export type WeeklyResultTeamAudit = {
  summary: string;
  risks: string[];
  opportunities: string[];
  note: string;
};

export type WeeklyCommandResult = {
  id: string;
  title: "Weekly Command Center";
  weekLabel: string;
  periodLabel: string;
  status: WeeklyResultStatus;
  statusLabel: string;
  executiveSummary: string;
  diagnosis: WeeklyResultExecutiveDiagnosis;
  coreMetrics: WeeklyResultMetricCard[];
  cadenceQuality: WeeklyCadenceQualityReading;
  signals: WeeklyResultSignal[];
  contentLearning: WeeklyResultContentLearning[];
  storiesPresence: WeeklyResultStoriesPresence;
  nextWeekPlan: WeeklyResultNextWeekPlan;
  teamAudit: WeeklyResultTeamAudit;
  finalActions: Array<{ label: string; href: string }>;
  caution: string;
};

type MetricDefinition = {
  key: string;
  label: string;
  unit: WeeklyResultMetricCard["unit"];
  getValue: (data: WeeklyMarketingData) => number | null;
  missingInterpretation?: string;
};

const metricDefinitions: MetricDefinition[] = [
  unavailableMetric("reach", "Alcance", "Alcance ainda nao esta no modelo semanal salvo."),
  unavailableMetric("impressions", "Impressoes", "Impressoes ainda nao estao no modelo semanal salvo."),
  unavailableMetric("interactions", "Interacoes", "Interacoes agregadas ainda nao estao no modelo semanal salvo."),
  unavailableMetric("followers", "Seguidores", "Seguidores ainda nao estao no modelo semanal salvo."),
  metric("instagramProfileVisits", "Visitas ao perfil Instagram", "count", (data) => data.instagramProfileVisits),
  metric("contentPublished", "Conteudo publicado", "count", (data) => getContentCadenceTotal(data)),
  metric("instagramStories", "Stories", "count", (data) => data.instagramStories),
  metric("instagramReels", "Reels/Shorts", "count", (data) => data.instagramReels),
  metric("instagramPosts", "Posts", "count", (data) => data.instagramPosts),
  metric("metaWhatsappConversations", "Conversas Meta", "count", (data) => data.metaWhatsappConversations),
  metric("whatsappTotal", "WhatsApps totais", "count", (data) => data.whatsappTotal),
  metric("qualifiedConversations", "Conversas qualificadas", "count", (data) => data.qualifiedConversations),
  metric("googleConversions", "Conversoes Google", "count", (data) => data.googleConversions),
  metric("consultationsScheduled", "Consultas marcadas", "count", (data) => data.consultationsScheduled),
  metric("consultationsAttended", "Consultas comparecidas", "count", (data) => data.consultationsAttended),
  metric("surgeriesClosed", "Cirurgias fechadas", "count", (data) => data.surgeriesClosed),
  metric("metaCostPerWhatsapp", "Custo por conversa Meta", "BRL", (data) => getCalculatedWeeklyMetrics(data).metaCostPerWhatsapp),
  metric("googleConversionRate", "Taxa de conversao Google", "rate", (data) => getCalculatedWeeklyMetrics(data).googleConversionRate)
];

export function buildWeeklyCommandResult(
  current: WeeklyMarketingData,
  previous?: WeeklyMarketingData | null,
  center: WeeklyCommandCenter = buildWeeklyCommandCenter(current),
  strategicReport?: WeeklyStrategicDecisionReport
): WeeklyCommandResult {
  const validPrevious = previous && !isWeeklyMarketingDataOperationalAnomaly(previous) ? previous : null;
  const safeStrategicReport = strategicReport ?? buildWeeklyStrategicDecisionReport(current, validPrevious);
  const coreMetrics = buildWeeklyResultMetricCards(current, validPrevious);
  const cadenceQuality = interpretCadenceVsQuality(current, validPrevious);
  const status = determineWeeklyResultStatus(current, validPrevious, cadenceQuality, center);
  const diagnosis = buildExecutiveDiagnosis(current, validPrevious, safeStrategicReport, center, cadenceQuality);
  const signals = buildWeeklyResultSignals(current, validPrevious, center, safeStrategicReport);
  const contentLearning = buildContentFunctionLearning(current, center);
  const storiesPresence = buildStoriesPresence(current);
  const nextWeekPlan = buildNextWeekPlan(current, validPrevious, center, cadenceQuality, safeStrategicReport);

  return {
    id: `weekly-result-${current.id}`,
    title: "Weekly Command Center",
    weekLabel: current.weekLabel || "Semana sem rotulo",
    periodLabel: `${current.startDate || "sem inicio"} a ${current.endDate || "sem fim"}`,
    status,
    statusLabel: weeklyResultStatusLabel(status),
    executiveSummary: buildResultExecutiveSummary(current, validPrevious, status, diagnosis, center),
    diagnosis,
    coreMetrics,
    cadenceQuality,
    signals,
    contentLearning,
    storiesPresence,
    nextWeekPlan,
    teamAudit: buildTeamAuditSnapshot(center.auditFindings),
    finalActions: [
      { label: "Historico semanal", href: "/weekly" },
      { label: "Sinais", href: "/signals" },
      { label: "Auditoria", href: "/audit" },
      { label: "Conteudo", href: "/content" },
      { label: "Calendario", href: "/calendar" },
      { label: "Dados semanais", href: "/data" },
      { label: "Stories de hoje", href: "/stories/today" },
      { label: "Plano da proxima semana", href: "/stories/next-week" }
    ],
    caution: "Leitura interna e deterministica com metricas agregadas. Nao publica, nao envia mensagens e nao substitui revisao humana antes de decisoes de investimento ou comunicacao medica."
  };
}

export function buildWeeklyResultMetricCards(current: WeeklyMarketingData, previous?: WeeklyMarketingData | null): WeeklyResultMetricCard[] {
  return metricDefinitions.map((definition) => {
    const value = definition.getValue(current);
    const previousValue = previous ? definition.getValue(previous) : null;
    const delta = calculateDelta(value, previousValue);
    const status = value === null ? "missing" : "available";

    return {
      key: definition.key,
      label: definition.label,
      value,
      previousValue,
      deltaAbsolute: delta.deltaAbsolute,
      deltaPercent: delta.deltaPercent,
      unit: definition.unit,
      status,
      interpretation:
        status === "missing"
          ? definition.missingInterpretation ?? "Dado ainda nao coletado nesta tela semanal."
          : interpretMetricDelta(definition.label, delta.deltaPercent, previousValue)
    };
  });
}

export function interpretCadenceVsQuality(current: WeeklyMarketingData, previous?: WeeklyMarketingData | null): WeeklyCadenceQualityReading {
  const currentCadence = getContentCadenceTotal(current);
  const previousCadence = previous ? getContentCadenceTotal(previous) : null;
  const cadenceDelta = previousCadence === null ? null : calculateDelta(currentCadence, previousCadence).deltaPercent;
  const currentOutcome = getOutcomeDirectionScore(current, previous);
  const currentAdequateCadence = current.instagramStories >= 42 && current.instagramReels >= 3;
  const evidence = [
    `Cadencia atual: ${current.instagramStories} Stories, ${current.instagramReels} Reels/Shorts e ${current.instagramPosts} posts.`,
    previousCadence === null ? "Sem semana anterior valida para delta de cadencia." : `Delta de conteudo publicado: ${formatSignedPercent(cadenceDelta)}.`,
    `Sinais de demanda observados: ${currentOutcome.improved} melhoraram, ${currentOutcome.worsened} pioraram e ${currentOutcome.neutral} ficaram inconclusivos/estaveis.`
  ];

  if (!previous || isWeeklyMarketingDataOperationalAnomaly(current)) {
    return {
      status: "insufficient_data",
      title: "Dados insuficientes para separar cadencia e qualidade",
      summary: "A semana precisa de uma comparacao valida para separar queda de volume, queda de qualidade ou melhora real.",
      evidence,
      nextAction: "Salvar mais uma semana valida e manter o registro de Stories, Reels, perfil e WhatsApp."
    };
  }

  if ((cadenceDelta ?? 0) < -0.15 && currentOutcome.worsened >= 2) {
    return {
      status: "cadence_drop",
      title: "Queda por cadencia",
      summary: "A performance caiu junto com menor volume de publicacao. Nao concluir queda de qualidade antes de normalizar a presenca.",
      evidence,
      nextAction: "Retomar rotina minima de Stories/Reels e comparar novamente antes de trocar posicionamento ou campanha."
    };
  }

  if (currentAdequateCadence && currentOutcome.worsened >= 2) {
    return {
      status: "quality_drop",
      title: "Queda por qualidade",
      summary: "A cadencia esta aceitavel, mas sinais de demanda pioraram. A hipotese principal passa a ser criativo, CTA, oferta ou alinhamento de publico.",
      evidence,
      nextAction: "Auditar criativos, temas, CTAs e funil de atendimento antes de aumentar volume."
    };
  }

  if (currentOutcome.improved >= 2 && (cadenceDelta ?? 0) > 0.15) {
    return {
      status: "growth",
      title: "Crescimento com apoio de volume",
      summary: "A semana melhorou junto com mais presenca. O ganho parece depender de cadencia e deve ser repetido com controle.",
      evidence,
      nextAction: "Repetir a cadencia que funcionou e preservar os temas com melhor resposta agregada."
    };
  }

  if (currentOutcome.improved >= 2) {
    return {
      status: "growth",
      title: "Crescimento com sinal de qualidade",
      summary: "A semana melhorou sem depender claramente de aumento de volume. Ha indicio de melhor qualidade de criativo, CTA ou oferta.",
      evidence,
      nextAction: "Documentar temas, CTAs e criativos que podem virar teste controlado na proxima semana."
    };
  }

  return {
    status: "stable",
    title: "Semana estavel",
    summary: "Nao ha evidencia suficiente de queda estrutural nem crescimento forte. A prioridade e manter comparacao e fechar lacunas.",
    evidence,
    nextAction: "Manter rotina, melhorar preenchimento do funil e usar a proxima semana para confirmar tendencia."
  };
}

export function isWeeklyMarketingDataOperationalAnomaly(data: Pick<WeeklyMarketingData, "startDate" | "endDate">): boolean {
  return isInsideDecember2025(parseIsoDate(data.startDate), parseIsoDate(data.endDate));
}

export function weeklyResultStatusLabel(status: WeeklyResultStatus): string {
  return {
    growth: "Semana em crescimento",
    stable: "Semana estavel",
    cadence_drop: "Queda por cadencia",
    quality_drop: "Queda por qualidade",
    insufficient_data: "Semana insuficiente para conclusao"
  }[status];
}

function determineWeeklyResultStatus(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  cadenceQuality: WeeklyCadenceQualityReading,
  center: WeeklyCommandCenter
): WeeklyResultStatus {
  if (!previous || isWeeklyMarketingDataOperationalAnomaly(current) || center.missingData.length >= 3) return "insufficient_data";
  return cadenceQuality.status;
}

function buildExecutiveDiagnosis(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  strategicReport: WeeklyStrategicDecisionReport,
  center: WeeklyCommandCenter,
  cadenceQuality: WeeklyCadenceQualityReading
): WeeklyResultExecutiveDiagnosis {
  const improved = strategicReport.comparisons.filter((item) => item.classification === "improved").slice(0, 4).map((item) => `${item.label}: ${formatDeltaText(item.deltaPercent)}.`);
  const worsened = strategicReport.comparisons.filter((item) => item.classification === "worsened").slice(0, 4).map((item) => `${item.label}: ${formatDeltaText(item.deltaPercent)}.`);
  const inconclusive: string[] = [];
  const needsAttention: string[] = [];

  if (!previous) inconclusive.push("Nao ha semana anterior valida para comparacao normal.");
  if (isWeeklyMarketingDataOperationalAnomaly(current)) inconclusive.push("Periodo cruza dezembro/2025 e deve ficar fora de conclusoes normais.");
  if (current.consultationsScheduled === null || current.consultationsAttended === null || current.surgeriesClosed === null) {
    inconclusive.push("Funil comercial incompleto limita conclusao sobre qualidade de leads.");
  }
  if (center.missingData.length > 0) needsAttention.push(`Completar dados faltantes: ${center.missingData.slice(0, 2).join("; ")}.`);
  if (current.googleConversions === 0) needsAttention.push("Google Ads segue em diagnostico por conversoes zeradas.");
  if (cadenceQuality.status === "cadence_drop" || current.instagramStories < 42) needsAttention.push("Cadencia organica precisa ser separada de qualidade criativa.");

  return {
    improved: fallback(improved, ["Nenhuma melhora comparativa forte foi confirmada."]),
    worsened: fallback(worsened, ["Nenhuma piora comparativa forte foi confirmada."]),
    inconclusive: fallback(inconclusive, ["Sem grandes lacunas de leitura comparativa nesta camada."]),
    needsAttention: fallback(needsAttention, ["Manter revisao humana antes de mudar verba, criativos ou rotina da equipe."])
  };
}

function buildWeeklyResultSignals(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  center: WeeklyCommandCenter,
  strategicReport: WeeklyStrategicDecisionReport
): WeeklyResultSignal[] {
  const positiveComparisons = strategicReport.comparisons.filter((item) => item.classification === "improved").slice(0, 2);
  const warningSignals = center.triggeredSignals.filter((signal) => signal.severity === "high" || signal.severity === "critical").slice(0, 4);
  const resultSignals: WeeklyResultSignal[] = [
    ...positiveComparisons.map((item) => ({
      id: `positive-${item.key}`,
      type: "positive" as const,
      title: `${item.label} melhorou`,
      description: `${item.label} teve ${formatDeltaText(item.deltaPercent)} frente a semana anterior valida.`,
      source: "Comparacao semanal"
    })),
    ...warningSignals.map((signal) => signalToWeeklyResultSignal(signal))
  ];

  if (isWeeklyMarketingDataOperationalAnomaly(current) || (previous && isWeeklyMarketingDataOperationalAnomaly(previous))) {
    resultSignals.push({
      id: "december-2025-anomaly",
      type: "anomaly",
      title: "Dezembro/2025 fora da leitura normal",
      description: "Periodo operacionalmente anomalo por hackeamento deve permanecer excluido de benchmarks, medias, projecoes e recomendacoes.",
      source: "Regra de governanca"
    });
  }

  for (const item of center.missingData.slice(0, 3)) {
    resultSignals.push({
      id: `missing-${slug(item)}`,
      type: "insufficient_data",
      title: "Dado insuficiente",
      description: item,
      source: "Validacao semanal"
    });
  }

  return uniqueById(resultSignals).slice(0, 8);
}

function buildContentFunctionLearning(current: WeeklyMarketingData, center: WeeklyCommandCenter): WeeklyResultContentLearning[] {
  const hasContentClassification = CONTENT_IDEAS.length > 0;
  if (!hasContentClassification) {
    return contentFunctions().map((item) => ({
      functionName: item.functionName,
      label: item.label,
      status: "missing_data",
      evidence: "Sem classificacao de conteudo conectada nesta versao.",
      nextAction: "Classificar conteudos por funcao antes de concluir aprendizado criativo."
    }));
  }

  const signalTitles = center.triggeredSignals.map((signal) => signal.title.toLocaleLowerCase("pt-BR")).join(" ");
  return [
    contentLearning("autoridade", "Autoridade", signalTitles.includes("sem conteudo de autoridade") ? "attention" : "active", "Content Studio possui pilar de autoridade medica, mas a semana precisa confirmar execucao real.", "Garantir ao menos um conteudo de criterio medico e seguranca."),
    contentLearning("confianca", "Confianca", "active", "Ha ideias de naturalidade, seguranca e prova responsavel para sustentar confianca.", "Repetir formatos que educam sem promessa de resultado."),
    contentLearning("educacao", "Educacao", "active", `${CONTENT_IDEAS.filter((idea) => idea.funnelStage === "TOFU" || idea.funnelStage === "MOFU").length} ideias TOFU/MOFU podem sustentar explicacao educativa.`, "Transformar melhores temas em Stories, Reels e Shorts."),
    contentLearning("desejo", "Desejo", "missing_data", "A funcao desejo ainda nao tem performance separada por classificacao real.", "Rotular criativos futuros por funcao antes de comparar desejo com conversao."),
    contentLearning("conversao", "Conversao", current.whatsappTotal > 0 ? "active" : "attention", `${current.whatsappTotal} WhatsApps totais e ${current.qualifiedConversations} conversas qualificadas informadas.`, "Relacionar CTA, tema e origem quando registrar proximas semanas."),
    contentLearning("distribuicao", "Distribuicao", current.instagramReels >= 3 && current.instagramStories >= 42 ? "active" : "attention", `${current.instagramStories} Stories e ${current.instagramReels} Reels/Shorts na semana.`, "Corrigir cadencia antes de concluir queda de qualidade.")
  ];
}

function buildStoriesPresence(current: WeeklyMarketingData): WeeklyResultStoriesPresence {
  const dailyAverage = current.instagramStories > 0 ? round(current.instagramStories / 7) : null;
  if (current.instagramStories <= 0) {
    return {
      status: "missing_data",
      summary: "Stories ainda nao foram informados nesta semana.",
      dailyAverage,
      nextAction: "Planejar presenca diaria com bastidor, estudo, rotina profissional e observacoes educativas sem inventar eventos reais.",
      links: [{ label: "Planejar Stories", href: "/stories" }, { label: "Briefing de hoje", href: "/stories/today" }]
    };
  }

  const status = current.instagramStories >= 42 ? "active" : "attention";
  return {
    status,
    summary:
      status === "active"
        ? `A semana tem media de ${dailyAverage} Stories/dia, suficiente para leitura inicial de presenca diaria.`
        : `A semana tem media de ${dailyAverage} Stories/dia, abaixo da referencia operacional de 6 Stories/dia.`,
    dailyAverage,
    nextAction:
      status === "active"
        ? "Manter rotina de bastidores, autoridade, estudo e CTA com revisao manual."
        : "Usar /stories/today e /stories/next-week para recuperar presenca diaria sem publicacao automatica.",
    links: [
      { label: "Briefing de hoje", href: "/stories/today" },
      { label: "Plano da proxima semana", href: "/stories/next-week" },
      { label: "Resultados dos Stories", href: "/stories/results" }
    ]
  };
}

function buildNextWeekPlan(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  center: WeeklyCommandCenter,
  cadenceQuality: WeeklyCadenceQualityReading,
  strategicReport: WeeklyStrategicDecisionReport
): WeeklyResultNextWeekPlan {
  const improved = strategicReport.comparisons.filter((item) => item.classification === "improved").map((item) => item.label);
  const worsened = strategicReport.comparisons.filter((item) => item.classification === "worsened").map((item) => item.label);

  return {
    repeat: fallback([
      improved.includes("Conversas Meta/WhatsApp") ? "Repetir estrutura de Meta/WhatsApp que gerou demanda agregada." : "",
      current.instagramStories >= 42 ? "Manter cadencia de Stories com bastidor, autoridade e CTA." : "",
      center.recommendedContent[0] ? `Reaproveitar tema: ${center.recommendedContent[0].title}.` : ""
    ].filter(Boolean), ["Repetir apenas temas com evidencia agregada ou revisao humana clara."]),
    adjust: fallback([
      cadenceQuality.status === "cadence_drop" ? "Ajustar cadencia antes de concluir problema de qualidade." : "",
      worsened[0] ? `Revisar queda em ${worsened[0]}.` : "",
      current.googleConversions === 0 ? "Manter Google em diagnostico ate validar conversoes." : ""
    ].filter(Boolean), ["Ajustar coleta de dados do funil antes de mudar verba."]),
    test: fallback([
      center.actionPlan72h.find((item) => item.decisionType === "test")?.title ?? "",
      previous ? "Testar nova variacao de CTA comparando com a semana anterior valida." : ""
    ].filter(Boolean), ["Testar com hipotese simples e medicao agregada."]),
    avoid: [
      "Nao enviar recomendacoes automaticamente para a equipe.",
      "Nao publicar ou disparar mensagens pelo sistema.",
      "Nao usar dados pessoais, DMs, prontuarios, prints ou fotos privadas.",
      "Nao usar dezembro/2025 como benchmark normal."
    ]
  };
}

function buildTeamAuditSnapshot(auditFindings: WeeklyAuditDecision[]): WeeklyResultTeamAudit {
  const risks = auditFindings.filter((item) => item.impact === "high" && (item.classification === "silent_risk" || item.classification === "operational_error")).slice(0, 3);
  const opportunities = auditFindings.filter((item) => item.impact === "high" && (item.classification === "clear_win" || item.classification === "missed_opportunity")).slice(0, 3);

  return {
    summary: "Team Audit Mode permanece interno: audita decisoes e execucao de marketing sem interferir diretamente na equipe.",
    risks: fallback(risks.map((item) => item.title), ["Nenhum risco alto novo destacado na auditoria interna."]),
    opportunities: fallback(opportunities.map((item) => item.title), ["Nenhuma oportunidade alta nova destacada na auditoria interna."]),
    note: "Modo interno ate 2026-07-31, salvo pedido explicito para agir externamente."
  };
}

function buildResultExecutiveSummary(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null,
  status: WeeklyResultStatus,
  diagnosis: WeeklyResultExecutiveDiagnosis,
  center: WeeklyCommandCenter
): string {
  const comparison = previous ? "comparada com a semana anterior valida" : "sem semana anterior valida";
  return `${current.weekLabel}: ${weeklyResultStatusLabel(status).toLocaleLowerCase("pt-BR")} ${comparison}. ${diagnosis.improved[0]} ${diagnosis.worsened[0]} Principal atencao: ${diagnosis.needsAttention[0]} Decisao interna: ${center.mainDecision}`;
}

function getOutcomeDirectionScore(current: WeeklyMarketingData, previous?: WeeklyMarketingData | null): { improved: number; worsened: number; neutral: number } {
  if (!previous) return { improved: 0, worsened: 0, neutral: 5 };
  const keys: Array<keyof WeeklyMarketingData> = ["instagramProfileVisits", "whatsappTotal", "qualifiedConversations", "metaWhatsappConversations", "googleConversions"];
  return keys.reduce(
    (acc, key) => {
      const delta = calculateDelta(current[key] as number | null, previous[key] as number | null).deltaPercent;
      if (delta === null || Math.abs(delta) < 0.1) acc.neutral += 1;
      else if (delta > 0) acc.improved += 1;
      else acc.worsened += 1;
      return acc;
    },
    { improved: 0, worsened: 0, neutral: 0 }
  );
}

function getContentCadenceTotal(data: WeeklyMarketingData): number {
  return data.instagramStories + data.instagramReels + data.instagramPosts;
}

function calculateDelta(current: number | null, previous: number | null): { deltaAbsolute: number | null; deltaPercent: number | null } {
  if (current === null || previous === null) return { deltaAbsolute: null, deltaPercent: null };
  const deltaAbsolute = round(current - previous);
  if (previous === 0) return { deltaAbsolute, deltaPercent: null };
  return { deltaAbsolute, deltaPercent: round(deltaAbsolute / previous) };
}

function interpretMetricDelta(label: string, deltaPercent: number | null, previousValue: number | null): string {
  if (previousValue === null) return `${label} sem comparacao anterior valida.`;
  if (deltaPercent === null) return `${label} nao permite percentual porque a base anterior era zero.`;
  if (Math.abs(deltaPercent) < 0.05) return `${label} ficou estavel.`;
  return `${label} ${deltaPercent > 0 ? "subiu" : "caiu"} ${formatSignedPercent(deltaPercent)}.`;
}

function signalToWeeklyResultSignal(signal: DecisionSignalResult): WeeklyResultSignal {
  return {
    id: `warning-${signal.ruleId}`,
    type: signal.severity === "critical" ? "insufficient_data" : "warning",
    title: signal.title,
    description: signal.nextAction,
    source: "Sinais deterministico"
  };
}

function contentFunctions(): Array<{ functionName: WeeklyResultContentFunction; label: string }> {
  return [
    { functionName: "autoridade", label: "Autoridade" },
    { functionName: "confianca", label: "Confianca" },
    { functionName: "educacao", label: "Educacao" },
    { functionName: "desejo", label: "Desejo" },
    { functionName: "conversao", label: "Conversao" },
    { functionName: "distribuicao", label: "Distribuicao" }
  ];
}

function contentLearning(
  functionName: WeeklyResultContentFunction,
  label: string,
  status: WeeklyResultContentLearning["status"],
  evidence: string,
  nextAction: string
): WeeklyResultContentLearning {
  return { functionName, label, status, evidence, nextAction };
}

function metric(
  key: string,
  label: string,
  unit: WeeklyResultMetricCard["unit"],
  getValue: (data: WeeklyMarketingData) => number | null
): MetricDefinition {
  return { key, label, unit, getValue };
}

function unavailableMetric(key: string, label: string, missingInterpretation: string): MetricDefinition {
  return { key, label, unit: "count", getValue: () => null, missingInterpretation };
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDeltaText(deltaPercent: number | null): string {
  if (deltaPercent === null) return "sem percentual comparavel";
  if (Math.abs(deltaPercent) < 0.05) return "estabilidade";
  return `${deltaPercent > 0 ? "alta" : "queda"} de ${formatSignedPercent(deltaPercent).replace("+", "")}`;
}

function formatSignedPercent(value: number | null): string {
  if (value === null) return "sem comparacao";
  const percent = `${(Math.abs(value) * 100).toFixed(1).replace(".", ",")}%`;
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${percent}`;
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function fallback(values: string[], fallbackValues: string[]): string[] {
  const clean = values.filter(Boolean);
  return clean.length > 0 ? clean : fallbackValues;
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
