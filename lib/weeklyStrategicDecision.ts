import { getCalculatedWeeklyMetrics, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

export type WeeklyMetricDirection = "up" | "down" | "flat";
export type WeeklyMetricClassification = "improved" | "worsened" | "neutral" | "contextual";
export type WeeklyStrategicSeverity = "info" | "attention" | "warning" | "critical";
export type WeeklyStrategicRecommendationType = "marketing" | "commercial" | "content" | "operations" | "tracking" | "strategy";
export type WeeklyStrategicPriority = "low" | "medium" | "high";
export type WeeklyStrategicOwner = "Cadu" | "equipe comercial" | "marketing" | "atendimento" | "revisão humana";
export type WeeklyStrategicActionWindow = "esta semana" | "próxima semana" | "revisar mensalmente";
export type WeeklyStrategicReportStatus = "baseline" | "compared" | "limited";

export type WeeklyMetricComparison = {
  key: string;
  label: string;
  current: number | null;
  previous: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;
  direction: WeeklyMetricDirection;
  classification: WeeklyMetricClassification;
  unit: "BRL" | "count" | "rate";
};

export type WeeklyStrategicSignal = {
  id: string;
  title: string;
  description: string;
  rationale: string;
  severity: WeeklyStrategicSeverity;
  relatedMetricKeys: string[];
};

export type WeeklyStrategicRecommendation = {
  id: string;
  type: WeeklyStrategicRecommendationType;
  title: string;
  description: string;
  rationale: string;
  priority: WeeklyStrategicPriority;
  ownerSuggestion: WeeklyStrategicOwner;
  actionWindow: WeeklyStrategicActionWindow;
};

export type WeeklyStrategicDecisionReport = {
  id: string;
  weekLabel: string;
  status: WeeklyStrategicReportStatus;
  statusMessage: string;
  comparisonLabel: string;
  comparisons: WeeklyMetricComparison[];
  signals: WeeklyStrategicSignal[];
  recommendations: WeeklyStrategicRecommendation[];
  caution: string;
};

type MetricDefinition = {
  key: string;
  label: string;
  unit: WeeklyMetricComparison["unit"];
  higherIsBetter: boolean | "contextual";
  getValue: (data: WeeklyMarketingData) => number | null;
};

const metricDefinitions: MetricDefinition[] = [
  metric("metaSpend", "Investimento Meta Ads", "BRL", "contextual", (data) => data.metaSpend),
  metric("metaWhatsappConversations", "Conversas Meta/WhatsApp", "count", true, (data) => data.metaWhatsappConversations),
  metric("metaCostPerWhatsapp", "Custo por conversa Meta", "BRL", false, (data) => getCalculatedWeeklyMetrics(data).metaCostPerWhatsapp),
  metric("metaProfileVisits", "Visitas ao perfil via Meta", "count", true, (data) => data.metaProfileVisits),
  metric("googleSpend", "Investimento Google Ads", "BRL", "contextual", (data) => data.googleSpend),
  metric("googleClicks", "Cliques Google Ads", "count", "contextual", (data) => data.googleClicks),
  metric("googleConversions", "Conversões Google Ads", "count", true, (data) => data.googleConversions),
  metric("googleCostPerClick", "Custo por clique Google", "BRL", false, (data) => getCalculatedWeeklyMetrics(data).googleCostPerClick),
  metric("googleConversionRate", "Taxa de conversão Google", "rate", true, (data) => getCalculatedWeeklyMetrics(data).googleConversionRate),
  metric("instagramStories", "Stories publicados", "count", true, (data) => data.instagramStories),
  metric("instagramReels", "Reels/Shorts publicados", "count", true, (data) => data.instagramReels),
  metric("instagramPosts", "Posts publicados", "count", true, (data) => data.instagramPosts),
  metric("instagramProfileVisits", "Visitas ao perfil Instagram", "count", true, (data) => data.instagramProfileVisits),
  metric("whatsappTotal", "WhatsApps totais", "count", true, (data) => data.whatsappTotal),
  metric("qualifiedConversations", "Conversas qualificadas", "count", true, (data) => data.qualifiedConversations),
  metric("consultationsScheduled", "Consultas marcadas", "count", true, (data) => data.consultationsScheduled),
  metric("consultationsAttended", "Consultas comparecidas", "count", true, (data) => data.consultationsAttended),
  metric("consultationShowRate", "Taxa de comparecimento", "rate", true, (data) => getCalculatedWeeklyMetrics(data).consultationShowRate),
  metric("surgeriesClosed", "Cirurgias fechadas", "count", true, (data) => data.surgeriesClosed),
  metric("surgeryCloseRate", "Taxa de fechamento", "rate", true, (data) => getCalculatedWeeklyMetrics(data).surgeryCloseRate)
];

export function calculateMetricDelta(
  current: number | null | undefined,
  previous: number | null | undefined,
  higherIsBetter: boolean | "contextual" = true
): Pick<WeeklyMetricComparison, "deltaAbsolute" | "deltaPercent" | "direction" | "classification"> {
  if (!isUsableNumber(current) || !isUsableNumber(previous)) {
    return { deltaAbsolute: null, deltaPercent: null, direction: "flat", classification: "neutral" };
  }

  const deltaAbsolute = round(current - previous);
  const deltaPercent = previous === 0 ? null : round(deltaAbsolute / Math.abs(previous));
  const direction: WeeklyMetricDirection = deltaAbsolute > 0 ? "up" : deltaAbsolute < 0 ? "down" : "flat";

  if (direction === "flat") {
    return { deltaAbsolute, deltaPercent, direction, classification: "neutral" };
  }

  if (higherIsBetter === "contextual") {
    return { deltaAbsolute, deltaPercent, direction, classification: "contextual" };
  }

  const classification =
    (direction === "up" && higherIsBetter) || (direction === "down" && !higherIsBetter) ? "improved" : "worsened";

  return { deltaAbsolute, deltaPercent, direction, classification };
}

export function compareWeeklyMarketingWeeks(current: WeeklyMarketingData, previous?: WeeklyMarketingData | null): WeeklyMetricComparison[] {
  return metricDefinitions.map((definition) => {
    const currentValue = definition.getValue(current);
    const previousValue = previous ? definition.getValue(previous) : null;
    const delta = calculateMetricDelta(currentValue, previousValue, definition.higherIsBetter);

    return {
      key: definition.key,
      label: definition.label,
      current: currentValue,
      previous: previousValue,
      unit: definition.unit,
      ...delta
    };
  });
}

export function detectWeeklyStrategicSignals(current: WeeklyMarketingData, previous?: WeeklyMarketingData | null): WeeklyStrategicSignal[] {
  const signals: WeeklyStrategicSignal[] = [];
  const currentMetrics = getCalculatedWeeklyMetrics(current);
  const previousMetrics = previous ? getCalculatedWeeklyMetrics(previous) : null;
  const consultRate = current.consultationsScheduled === null ? null : safeDivide(current.consultationsScheduled, current.whatsappTotal);
  const totalSpend = current.metaSpend + current.googleSpend;
  const previousTotalSpend = previous ? previous.metaSpend + previous.googleSpend : null;
  const demand = current.metaWhatsappConversations + current.googleConversions;
  const previousDemand = previous ? previous.metaWhatsappConversations + previous.googleConversions : null;

  if (!previous) {
    signals.push(signal("baseline-reading", "Leitura basal da semana", "Primeira semana salva sem comparação anterior.", "Use esta leitura como ponto de referência para as próximas semanas.", "info", ["weekLabel"]));
  }

  if (current.consultationsScheduled === null || current.consultationsAttended === null || current.surgeriesClosed === null) {
    signals.push(signal("limited-funnel-data", "Leitura limitada por dados de funil", "Há campos comerciais incompletos para consultas, comparecimento ou fechamento.", "Sem esses dados, a leitura ajuda a organizar a operação, mas não deve sustentar conclusão forte sobre gargalos.", "info", ["consultationsScheduled", "consultationsAttended", "surgeriesClosed"]));
  }

  if (current.metaWhatsappConversations >= 40 && current.consultationsScheduled !== null && consultRate !== null && consultRate < 0.12) {
    signals.push(signal("meta-commercial-bottleneck", "Muitas conversas com baixa conversão em consulta", "Meta gerou volume relevante de conversas, mas poucas viraram consultas marcadas.", "Pode haver gargalo de atendimento, qualificação ou follow-up no WhatsApp.", "warning", ["metaWhatsappConversations", "consultationsScheduled", "whatsappTotal"]));
  }

  if (current.whatsappTotal >= 60 && current.consultationsScheduled !== null && consultRate !== null && consultRate < 0.15) {
    signals.push(signal("whatsapp-consult-rate-low", "Taxa baixa de WhatsApp para consulta", "O volume total de WhatsApps não está se convertendo proporcionalmente em agenda.", "Revisar abordagem comercial, tempo de resposta e critérios de qualificação pode melhorar a leitura da próxima semana.", "attention", ["whatsappTotal", "consultationsScheduled"]));
  }

  if (current.consultationsScheduled !== null && current.consultationsAttended !== null && current.consultationsScheduled >= 8 && currentMetrics.consultationShowRate !== null && currentMetrics.consultationShowRate < 0.65) {
    signals.push(signal("consultation-show-rate-low", "Comparecimento abaixo do esperado", "Há consultas marcadas suficientes, mas a proporção de comparecimento está baixa.", "Pode haver problema de confirmação, lembrete, qualificação ou expectativa antes da consulta.", "warning", ["consultationsScheduled", "consultationsAttended"]));
  }

  if (current.googleSpend >= 100 && current.googleConversions <= 1) {
    signals.push(signal("google-cost-with-low-conversion", "Google com custo e baixa conversão", "Google Ads consumiu verba com baixo volume de conversões registradas.", "Antes de aumentar investimento, revisar intenção das campanhas, termos, página e rastreamento.", "warning", ["googleSpend", "googleConversions"]));
  }

  if (previous && previous.instagramStories > 0 && current.instagramStories < previous.instagramStories * 0.75) {
    signals.push(signal("stories-presence-drop", "Queda de presença em Stories", "Stories caíram de forma relevante em relação à semana anterior salva.", "A presença orgânica pode estar deixando de sustentar confiança e resposta no funil.", "attention", ["instagramStories"]));
  }

  if (
    previous &&
    previousTotalSpend !== null &&
    previousDemand !== null &&
    totalSpend > previousTotalSpend * 1.2 &&
    demand <= previousDemand * 1.05
  ) {
    signals.push(signal("spend-efficiency-alert", "Investimento subiu sem ganho proporcional", "O investimento cresceu mais do que os sinais de demanda acompanhados.", "Trate como alerta de eficiência e revise distribuição de verba antes de ampliar orçamento.", "warning", ["metaSpend", "googleSpend", "metaWhatsappConversations", "googleConversions"]));
  }

  if (previous && previousMetrics && currentMetrics.metaCostPerWhatsapp !== null && previousMetrics.metaCostPerWhatsapp !== null && currentMetrics.metaCostPerWhatsapp > previousMetrics.metaCostPerWhatsapp * 1.25) {
    signals.push(signal("meta-cost-pressure", "Custo por conversa Meta pressionado", "O custo por conversa no Meta subiu mais de 25% frente à semana anterior.", "Revisar criativos, públicos e cadência antes de escalar o mesmo conjunto.", "attention", ["metaCostPerWhatsapp"]));
  }

  return uniqueSignals(signals);
}

export function generateWeeklyRecommendations(
  current: WeeklyMarketingData,
  previous: WeeklyMarketingData | null | undefined,
  signals: WeeklyStrategicSignal[]
): WeeklyStrategicRecommendation[] {
  const recommendations: WeeklyStrategicRecommendation[] = [];
  const has = (id: string) => signals.some((signal) => signal.id === id);

  if (has("limited-funnel-data")) {
    recommendations.push(recommendation("complete-funnel-tracking", "tracking", "Completar o rastreamento comercial da semana", "Registrar consultas marcadas, comparecimentos e fechamentos por origem antes da próxima leitura.", "A ausência desses dados limita a interpretação de gargalos comerciais.", "high", "revisão humana", "esta semana"));
  }

  if (has("meta-commercial-bottleneck") || has("whatsapp-consult-rate-low")) {
    recommendations.push(recommendation("review-whatsapp-flow", "commercial", "Revisar o fluxo de atendimento no WhatsApp", "Auditar tempo de resposta, mensagem inicial, critérios de qualificação e rotina de follow-up.", "O volume de conversas só vira decisão útil quando a passagem para consulta está visível.", "high", "atendimento", "esta semana"));
  }

  if (has("consultation-show-rate-low")) {
    recommendations.push(recommendation("improve-confirmation-routine", "operations", "Reforçar confirmação e lembretes de consulta", "Testar lembrete manual, confirmação ativa e revisão de expectativa antes da consulta.", "Comparecimento baixo pode ser gargalo operacional, não necessariamente problema de mídia.", "medium", "equipe comercial", "próxima semana"));
  }

  if (has("google-cost-with-low-conversion")) {
    recommendations.push(recommendation("audit-google-before-scaling", "marketing", "Auditar Google antes de ampliar verba", "Revisar termos, intenção, página e conversões antes de aumentar investimento.", "A leitura atual sugere cautela: custo sem conversão suficiente não justifica escala automática.", "high", "marketing", "esta semana"));
  }

  if (has("stories-presence-drop")) {
    recommendations.push(recommendation("restore-stories-cadence", "content", "Retomar cadência mínima de Stories", "Planejar sequência simples de bastidor, prova de rotina e CTA para WhatsApp ao longo da semana.", "Queda de presença orgânica pode reduzir sustentação de confiança depois do clique.", "medium", "marketing", "próxima semana"));
  }

  if (has("spend-efficiency-alert") || has("meta-cost-pressure")) {
    recommendations.push(recommendation("review-budget-efficiency", "strategy", "Revisar eficiência antes de subir orçamento", "Comparar verba, conversas, conversões e agenda antes de ampliar investimento.", "Aumento de investimento sem resposta proporcional pede revisão humana antes de nova decisão de verba.", "high", "Cadu", "esta semana"));
  }

  if (recommendations.length === 0) {
    recommendations.push(recommendation("maintain-human-review", "strategy", "Manter revisão humana da semana", "Usar os dados como apoio para priorizar ações, sem automatizar decisões de investimento.", "Mesmo com leitura estável, a decisão final deve considerar contexto comercial e operacional.", "low", "Cadu", "revisar mensalmente"));
  }

  if (!previous) {
    recommendations.push(recommendation("use-baseline-next-week", "tracking", "Usar esta semana como linha de base", "Na próxima semana, comparar evolução de custo, volume, agenda e presença orgânica.", "Sem semana anterior, a melhor ação é criar um padrão de comparação consistente.", "medium", "revisão humana", "próxima semana"));
  }

  return uniqueRecommendations(recommendations).slice(0, 5);
}

export function buildWeeklyStrategicDecisionReport(
  current: WeeklyMarketingData,
  previous?: WeeklyMarketingData | null
): WeeklyStrategicDecisionReport {
  const comparisons = compareWeeklyMarketingWeeks(current, previous);
  const signals = detectWeeklyStrategicSignals(current, previous);
  const recommendations = generateWeeklyRecommendations(current, previous, signals);
  const hasLimitedSignal = signals.some((signal) => signal.id === "limited-funnel-data");
  const status: WeeklyStrategicReportStatus = !previous ? "baseline" : hasLimitedSignal ? "limited" : "compared";

  return {
    id: `${current.id}-strategic-decision`,
    weekLabel: current.weekLabel,
    status,
    statusMessage: getStatusMessage(status, previous),
    comparisonLabel: previous ? `Comparando com ${previous.weekLabel}` : "Primeira semana salva: leitura basal sem comparação",
    comparisons,
    signals: signals.slice(0, 5),
    recommendations,
    caution: "Esta leitura apoia a organização da operação e deve ser revisada por uma pessoa antes de decisões de investimento."
  };
}

function getStatusMessage(status: WeeklyStrategicReportStatus, previous?: WeeklyMarketingData | null): string {
  if (!previous) return "Primeira semana salva: leitura basal sem delta comparativo.";
  if (status === "limited") return "Comparando com a semana anterior salva, com cautela por dados incompletos.";
  return "Comparando com a semana anterior salva.";
}

function metric(
  key: string,
  label: string,
  unit: WeeklyMetricComparison["unit"],
  higherIsBetter: MetricDefinition["higherIsBetter"],
  getValue: MetricDefinition["getValue"]
): MetricDefinition {
  return { key, label, unit, higherIsBetter, getValue };
}

function signal(
  id: string,
  title: string,
  description: string,
  rationale: string,
  severity: WeeklyStrategicSeverity,
  relatedMetricKeys: string[]
): WeeklyStrategicSignal {
  return { id, title, description, rationale, severity, relatedMetricKeys };
}

function recommendation(
  id: string,
  type: WeeklyStrategicRecommendationType,
  title: string,
  description: string,
  rationale: string,
  priority: WeeklyStrategicPriority,
  ownerSuggestion: WeeklyStrategicOwner,
  actionWindow: WeeklyStrategicActionWindow
): WeeklyStrategicRecommendation {
  return { id, type, title, description, rationale, priority, ownerSuggestion, actionWindow };
}

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return round(numerator / denominator);
}

function isUsableNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function uniqueSignals(signals: WeeklyStrategicSignal[]): WeeklyStrategicSignal[] {
  return Array.from(new Map(signals.map((item) => [item.id, item])).values());
}

function uniqueRecommendations(recommendations: WeeklyStrategicRecommendation[]): WeeklyStrategicRecommendation[] {
  return Array.from(new Map(recommendations.map((item) => [item.id, item])).values());
}
