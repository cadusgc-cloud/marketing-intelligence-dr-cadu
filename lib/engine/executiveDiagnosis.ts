import type { ParsedCreative, ParsedDataIssue, ParsedKeyword, ParsedRecommendation } from "@/lib/types";

type DiagnosisStatus = "critical" | "attention" | "stable" | "good";

export type ExecutiveDiagnosisInput = {
  report?: {
    title?: string | null;
    periodStart?: Date | null;
    periodEnd?: Date | null;
  } | null;
  channels?: Array<Record<string, unknown>>;
  creatives?: Array<Pick<ParsedCreative, "name" | "diagnosis" | "cpl" | "investment" | "profileVisits" | "conversations" | "leads">>;
  keywords?: Array<Pick<ParsedKeyword, "keyword" | "diagnosis" | "cpa" | "conversions">>;
  recommendations?: ParsedRecommendation[];
  dataIssues?: ParsedDataIssue[];
  benchmarkSettings?: Array<Record<string, unknown>>;
  rawText?: string | null;
};

export type ExecutiveDiagnosis = {
  summary: string;
  healthScore: number;
  status: DiagnosisStatus;
  whatHappened: string[];
  worsened: string[];
  improved: string[];
  wastePoints: string[];
  scalePoints: string[];
  investigateOrPause: string[];
  mainProblemAreas: string[];
  criticalAlerts: string[];
  topWins: string[];
  nextWeekActionPlan: string[];
  budgetSuggestions: string[];
  creativeSuggestions: string[];
};

const areaLabels: Record<string, string> = {
  google_ads: "Google Ads",
  tofu: "Topo de funil",
  mofu: "Meio de funil",
  bofu: "Fundo de funil",
  content: "Conteúdo",
  validation: "Validação de dados",
  creative: "Criativos",
  budget: "Orçamento",
  compliance: "Compliance"
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function titleOf(item: { title: string }): string {
  return item.title;
}

function creativeVolume(creative: Pick<ParsedCreative, "conversations" | "leads">): number {
  return creative.leads ?? creative.conversations ?? 0;
}

function getCriticalRecommendations(recommendations: ParsedRecommendation[]): ParsedRecommendation[] {
  return recommendations.filter((item) => item.priority === "critical");
}

function getHighPriorityRecommendations(recommendations: ParsedRecommendation[]): ParsedRecommendation[] {
  return recommendations.filter((item) => item.priority === "high");
}

function getCriticalDataIssues(dataIssues: ParsedDataIssue[]): ParsedDataIssue[] {
  return dataIssues.filter((item) => item.severity === "critical" || item.severity === "high");
}

function getScaleCreatives(creatives: NonNullable<ExecutiveDiagnosisInput["creatives"]>) {
  return creatives.filter((item) => item.diagnosis === "scale");
}

function getProblematicCreatives(creatives: NonNullable<ExecutiveDiagnosisInput["creatives"]>) {
  return creatives.filter((item) => item.diagnosis === "pause" || item.diagnosis === "investigate");
}

function getScaleKeywords(keywords: NonNullable<ExecutiveDiagnosisInput["keywords"]>) {
  return keywords.filter((item) => item.diagnosis === "scale");
}

function getMainProblemAreas(recommendations: ParsedRecommendation[]): string[] {
  return unique(recommendations.map((item) => item.category)).map((category) => areaLabels[category] ?? category);
}

function buildHealthScore(input: {
  criticalRecommendations: ParsedRecommendation[];
  highRecommendations: ParsedRecommendation[];
  criticalDataIssues: ParsedDataIssue[];
  problematicCreatives: NonNullable<ExecutiveDiagnosisInput["creatives"]>;
  scaleCreatives: NonNullable<ExecutiveDiagnosisInput["creatives"]>;
  scaleKeywords: NonNullable<ExecutiveDiagnosisInput["keywords"]>;
}): number {
  const penalty =
    Math.min(45, input.criticalRecommendations.length * 15) +
    Math.min(32, input.highRecommendations.length * 8) +
    Math.min(30, input.criticalDataIssues.length * 10) +
    Math.min(24, input.problematicCreatives.length * 8);
  const wins = Math.min(20, (input.scaleCreatives.length + input.scaleKeywords.length) * 4);
  return clamp(75 - penalty + wins, 0, 100);
}

function statusForScore(score: number): DiagnosisStatus {
  if (score <= 39) return "critical";
  if (score <= 64) return "attention";
  if (score <= 84) return "stable";
  return "good";
}

function buildSummary(input: {
  recommendations: ParsedRecommendation[];
  scaleCreatives: NonNullable<ExecutiveDiagnosisInput["creatives"]>;
  problematicCreatives: NonNullable<ExecutiveDiagnosisInput["creatives"]>;
  criticalRecommendations: ParsedRecommendation[];
}): string {
  const hasGoogleCritical = input.recommendations.some((item) => item.category === "google_ads" && item.priority === "critical");
  const hasTofu = input.recommendations.some((item) => item.category === "tofu");
  const hasScaleCreatives = input.scaleCreatives.length > 0;
  const hasProblematicCreatives = input.problematicCreatives.length > 0;
  if (hasGoogleCritical && hasScaleCreatives && hasTofu) return "Semana com Google Ads crítico, bons criativos de fundo de funil e atenção no topo de funil.";
  if (hasGoogleCritical && hasScaleCreatives) return "Semana com Google Ads crítico e criativos vencedores para escalar com cautela.";
  if (hasProblematicCreatives) return "Semana com desperdício potencial em criativos que precisam ser pausados ou investigados.";
  if (!input.criticalRecommendations.length && !hasProblematicCreatives) return "Semana sem alertas críticos, com desempenho estável nas métricas analisadas.";
  return "Semana com pontos de atenção operacionais que exigem priorização na próxima rotina de marketing.";
}

function buildNextWeekActionPlan(input: {
  criticalRecommendations: ParsedRecommendation[];
  highRecommendations: ParsedRecommendation[];
  criticalDataIssues: ParsedDataIssue[];
}): string[] {
  const fromCritical = input.criticalRecommendations.map((item) => item.recommendation || item.title);
  const fromHigh = input.highRecommendations.map((item) => item.recommendation || item.title);
  const fromIssues = input.criticalDataIssues.map((item) => `Revisar validação: ${item.description}`);
  return unique([...fromCritical, ...fromHigh, ...fromIssues]).slice(0, 5);
}

function describeCreative(creative: NonNullable<ExecutiveDiagnosisInput["creatives"]>[number]): string {
  const volume = creativeVolume(creative);
  const details = [`${volume} lead(s)`];
  if (creative.cpl !== null && creative.cpl !== undefined) details.push(`CPL R$ ${creative.cpl.toFixed(2)}`);
  if (creative.investment !== null && creative.investment !== undefined) details.push(`R$ ${creative.investment.toFixed(2)} investidos`);
  return `${creative.name}: ${details.join(", ")}`;
}

function describeKeyword(keyword: NonNullable<ExecutiveDiagnosisInput["keywords"]>[number]): string {
  const details = [];
  if (keyword.conversions !== null && keyword.conversions !== undefined) details.push(`${keyword.conversions} conversão(ões)`);
  if (keyword.cpa !== null && keyword.cpa !== undefined) details.push(`CPA R$ ${keyword.cpa.toFixed(2)}`);
  return `${keyword.keyword}${details.length ? `: ${details.join(", ")}` : ""}`;
}

export function generateExecutiveDiagnosis(input: ExecutiveDiagnosisInput): ExecutiveDiagnosis {
  const creatives = input.creatives ?? [];
  const keywords = input.keywords ?? [];
  const recommendations = input.recommendations ?? [];
  const dataIssues = input.dataIssues ?? [];
  const criticalRecommendations = getCriticalRecommendations(recommendations);
  const highRecommendations = getHighPriorityRecommendations(recommendations);
  const criticalDataIssues = getCriticalDataIssues(dataIssues);
  const scaleCreatives = getScaleCreatives(creatives);
  const problematicCreatives = getProblematicCreatives(creatives);
  const scaleKeywords = getScaleKeywords(keywords);
  const healthScore = buildHealthScore({ criticalRecommendations, highRecommendations, criticalDataIssues, problematicCreatives, scaleCreatives, scaleKeywords });
  const criticalAlerts = [
    ...criticalRecommendations.map(titleOf),
    ...criticalDataIssues.map((item) => item.description)
  ];
  const scalePoints = [...scaleCreatives.map(describeCreative), ...scaleKeywords.map(describeKeyword)];
  const investigateOrPause = problematicCreatives.map(describeCreative);
  const wasteRecommendations = recommendations.filter((item) => /desperd|problem|pausar|investig/i.test(`${item.title} ${item.recommendation}`));
  const wastePoints = unique([...investigateOrPause, ...wasteRecommendations.map(titleOf)]);
  const topWins = unique([...scalePoints, ...recommendations.filter((item) => /escalar|vencedor/i.test(`${item.title} ${item.recommendation}`)).map(titleOf)]);
  const mainProblemAreas = getMainProblemAreas(recommendations);
  const nextWeekActionPlan = buildNextWeekActionPlan({ criticalRecommendations, highRecommendations, criticalDataIssues });
  const budgetSuggestions = unique([
    ...(scalePoints.length ? ["Escalar vencedores com cautela e acompanhar CPL/CPA antes de ampliar verba de forma agressiva."] : []),
    ...(recommendations.some((item) => item.category === "google_ads" && item.priority === "critical") ? ["Revisar Google Ads crítico antes de ampliar orçamento do canal."] : []),
    ...(wastePoints.length ? ["Pausar ou investigar pontos de desperdício antes de redistribuir verba."] : [])
  ]);
  const creativeSuggestions = unique([
    ...(scaleCreatives.length ? ["Criar variações dos criativos vencedores para reduzir risco de saturação."] : []),
    ...(problematicCreatives.length ? ["Revisar criativos problemáticos e a ponte entre visita, direct e conversa."] : []),
    ...(recommendations.some((item) => item.category === "tofu") ? ["Criar novos criativos de topo de funil para recuperar alcance e distribuição."] : [])
  ]);

  return {
    summary: buildSummary({ recommendations, scaleCreatives, problematicCreatives, criticalRecommendations }),
    healthScore,
    status: statusForScore(healthScore),
    whatHappened: unique([...criticalAlerts, ...topWins]).slice(0, 6),
    worsened: unique([...criticalAlerts, ...wastePoints]),
    improved: topWins,
    wastePoints,
    scalePoints,
    investigateOrPause,
    mainProblemAreas,
    criticalAlerts,
    topWins,
    nextWeekActionPlan,
    budgetSuggestions,
    creativeSuggestions
  };
}
