import type { Channel, ParsedChannel, ParsedCreative, ParsedRecommendation, ParsedReport } from "@/lib/types";
import { isInsideDecember2025 } from "@/lib/utils/dates";

export type RecommendationHistoryReport = Pick<ParsedReport, "title" | "periodStart" | "periodEnd" | "isOperationalAnomaly"> & {
  channels: ParsedReport["channels"];
  creatives?: ParsedReport["creatives"];
  keywords?: ParsedReport["keywords"];
};

export type RecommendationBenchmarks = {
  metaCplExcellent: number;
  metaCplAttention: number;
  googleCpaCritical: number;
  storiesRetentionGood: number;
  reachDropAttention: number;
  googleConversionDropCritical: number;
  creativeConcentrationRisk: number;
};

export const DEFAULT_RECOMMENDATION_BENCHMARKS: RecommendationBenchmarks = {
  metaCplExcellent: 6,
  metaCplAttention: 20,
  googleCpaCritical: 30,
  storiesRetentionGood: 0.75,
  reachDropAttention: 0.1,
  googleConversionDropCritical: 0.3,
  creativeConcentrationRisk: 0.7
};

export function hasValue(value: number | null | undefined): value is number {
  return value !== null && value !== undefined;
}

export function percentChange(current?: number | null, previous?: number | null): number | null {
  if (!hasValue(current) || !hasValue(previous) || previous === 0) return null;
  return (current - previous) / previous;
}

export function getChannel(report: Pick<ParsedReport, "channels">, channel: Channel): ParsedChannel | undefined {
  return report.channels.find((item) => item.channel === channel);
}

export function findPreviousEligibleReport(
  currentReport: Pick<ParsedReport, "periodStart">,
  previousReports: RecommendationHistoryReport[]
): RecommendationHistoryReport | null {
  if (!currentReport.periodStart) return null;
  return (
    previousReports
      .filter((report) => report.periodEnd)
      .filter((report) => !report.isOperationalAnomaly)
      .filter((report) => !isInsideDecember2025(report.periodStart, report.periodEnd))
      .filter((report) => report.periodEnd && report.periodEnd.getTime() < currentReport.periodStart!.getTime())
      .sort((a, b) => (b.periodEnd?.getTime() ?? 0) - (a.periodEnd?.getTime() ?? 0))[0] ?? null
  );
}

function rec(input: ParsedRecommendation): ParsedRecommendation {
  return input;
}

function formatPercentChange(change: number): string {
  return `${Math.abs(change * 100).toFixed(0)}%`;
}

function creativeVolume(creative: ParsedCreative): number {
  return creative.leads ?? creative.conversations ?? 0;
}

function isCommercialIntentCreative(creative: ParsedCreative): boolean {
  return creative.funnelStage === "bofu" || /resultado|pesquis|procur|cirurgia|lipo|mamoplastia|seios|preço|valor/i.test(creative.name);
}

function isProblematicCreative(creative: ParsedCreative): boolean {
  const conversations = creative.conversations ?? creative.leads ?? 0;
  return conversations <= 1 && ((creative.profileVisits ?? 0) >= 500 || (creative.investment ?? 0) >= 200);
}

export function classifyCreative(creative: ParsedCreative, benchmarks: RecommendationBenchmarks = DEFAULT_RECOMMENDATION_BENCHMARKS): ParsedCreative {
  const volume = creativeVolume(creative);
  if (isProblematicCreative(creative)) return { ...creative, diagnosis: volume === 0 ? "pause" : "investigate" };
  if (hasValue(creative.cpl)) {
    if (creative.cpl < benchmarks.metaCplExcellent && volume >= 5) return { ...creative, diagnosis: "scale" };
    if (creative.cpl >= benchmarks.metaCplExcellent && creative.cpl <= 15) return { ...creative, diagnosis: "keep" };
    if (creative.cpl > benchmarks.metaCplAttention) return { ...creative, diagnosis: volume >= 3 ? "investigate" : "pause" };
  }
  return { ...creative, diagnosis: creative.diagnosis ?? "unknown" };
}

function leadShareTopTwo(creatives: ParsedCreative[]): number {
  const total = creatives.reduce((sum, creative) => sum + creativeVolume(creative), 0);
  if (!total) return 0;
  const topTwo = creatives
    .map(creativeVolume)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((sum, leads) => sum + leads, 0);
  return topTwo / total;
}

function getPrimaryReachChannel(report: Pick<ParsedReport, "channels">): ParsedChannel | undefined {
  return getChannel(report, "consolidated") ?? getChannel(report, "meta_ads") ?? getChannel(report, "instagram_organic");
}

export function generateRecommendations(parsed: ParsedReport): {
  creatives: ParsedCreative[];
  keywords: ParsedReport["keywords"];
  recommendations: ParsedRecommendation[];
} {
  return generateRecommendationsWithHistory(parsed, [], DEFAULT_RECOMMENDATION_BENCHMARKS);
}

export function generateRecommendationsWithHistory(
  parsed: ParsedReport,
  previousReports: RecommendationHistoryReport[],
  benchmarks: Partial<RecommendationBenchmarks> = {}
): {
  creatives: ParsedCreative[];
  keywords: ParsedReport["keywords"];
  recommendations: ParsedRecommendation[];
} {
  const resolvedBenchmarks = { ...DEFAULT_RECOMMENDATION_BENCHMARKS, ...benchmarks };
  const creatives = parsed.creatives.map((creative) => classifyCreative(creative, resolvedBenchmarks));
  const keywords = parsed.keywords.map((keyword) => {
    if ((keyword.cpa ?? Infinity) <= 7 && (keyword.conversions ?? 0) >= 2) return { ...keyword, diagnosis: "scale" as const };
    if ((keyword.cpa ?? 0) > 20) return { ...keyword, diagnosis: "investigate" as const };
    return { ...keyword, diagnosis: keyword.diagnosis ?? "unknown" };
  });
  const meta = getChannel(parsed, "meta_ads");
  const google = getChannel(parsed, "google_ads");
  const organic = getChannel(parsed, "instagram_organic");
  const recommendations: ParsedRecommendation[] = [...parsed.recommendations];
  const previous = findPreviousEligibleReport(parsed, previousReports);

  for (const creative of creatives.filter((item) => item.diagnosis === "scale")) {
    recommendations.push(
      rec({
        category: isCommercialIntentCreative(creative) ? "bofu" : "creative",
        priority: "high",
        title: `Escalar criativo: ${creative.name}`,
        evidence: `CPL ${creative.cpl?.toFixed(2) ?? "-"} com ${creativeVolume(creative)} oportunidades.`,
        recommendation: "Aumentar distribuição de forma gradual e criar variações de gancho, prova e CTA para reduzir risco de saturação.",
        confidence: 0.86
      })
    );
  }

  for (const creative of creatives.filter((item) => item.diagnosis === "investigate" || item.diagnosis === "pause").filter(isProblematicCreative)) {
    recommendations.push(
      rec({
        category: "creative",
        priority: "high",
        title: `Criativo problemático: ${creative.name}`,
        evidence: `${creative.investment ? `R$ ${creative.investment.toFixed(2)} investidos, ` : ""}${creative.profileVisits ?? 0} visitas ao perfil e ${creative.conversations ?? creative.leads ?? 0} conversa(s).`,
        recommendation: "Investigar a ponte entre visita ao perfil e conversa antes de manter verba; pausar se o padrão se repetir.",
        confidence: 0.82
      })
    );
  }

  for (const keyword of keywords.filter((item) => item.diagnosis === "scale")) {
    recommendations.push(
      rec({
        category: "google_ads",
        priority: "high",
        title: `Keyword vencedora: ${keyword.keyword}`,
        evidence: `CPA ${keyword.cpa?.toFixed(2) ?? "-"} com ${keyword.conversions ?? 0} conversões.`,
        recommendation: "Aumentar lance ou orçamento com monitoramento de termos de pesquisa e qualidade da página de destino.",
        confidence: 0.82
      })
    );
  }

  const previousGoogle = previous ? getChannel(previous, "google_ads") : undefined;
  const googleConversionChange = percentChange(google?.conversions, previousGoogle?.conversions);
  const googleCpaCritical = (google?.cpa ?? 0) > resolvedBenchmarks.googleCpaCritical;
  const googleConversionDrop = hasValue(googleConversionChange) && googleConversionChange < -resolvedBenchmarks.googleConversionDropCritical;
  if (googleCpaCritical || googleConversionDrop) {
    const evidenceParts = [];
    if (googleCpaCritical) evidenceParts.push(`CPA Google em ${google?.cpa?.toFixed(2)}.`);
    if (googleConversionDrop) evidenceParts.push(`Conversões Google caíram ${formatPercentChange(googleConversionChange!)}.`);
    recommendations.push(
      rec({
        category: "google_ads",
        priority: "critical",
        title: googleCpaCritical && googleConversionDrop ? "Google Ads em estado crítico" : googleCpaCritical ? "Google Ads em CPA crítico" : "Queda crítica de conversões Google",
        evidence: evidenceParts.join(" "),
        recommendation: "Revisar keywords, termos de pesquisa, correspondência, landing page e tracking antes de ampliar orçamento.",
        confidence: 0.9
      })
    );
  }

  const currentReachChannel = getPrimaryReachChannel(parsed);
  const previousReachChannel = previous ? getPrimaryReachChannel(previous) : undefined;
  const reachChange = percentChange(currentReachChannel?.reach, previousReachChannel?.reach);
  const followersChange = percentChange(currentReachChannel?.newFollowers, previousReachChannel?.newFollowers);
  const impressionsChange = percentChange(currentReachChannel?.impressions, previousReachChannel?.impressions);

  if (hasValue(reachChange) && reachChange < -resolvedBenchmarks.reachDropAttention) {
    const followerEvidence = hasValue(followersChange) && followersChange < 0 ? ` Seguidores caíram ${formatPercentChange(followersChange)}.` : "";
    recommendations.push(
      rec({
        category: "tofu",
        priority: "high",
        title: "Queda real de ToFu",
        evidence: `Alcance caiu ${formatPercentChange(reachChange)} vs período anterior.${followerEvidence}`,
        recommendation: "Renovar criativos de topo e testar expansão de público antes de aumentar investimento.",
        confidence: 0.84
      })
    );
  } else if (meta?.reach && organic?.newFollowers && /alcance.*baixo|satura/i.test(parsed.rawText)) {
    recommendations.push(
      rec({
        category: "tofu",
        priority: "high",
        title: "Topo de funil com possível saturação",
        evidence: "O relatório indica alcance ou seguidores abaixo do esperado.",
        recommendation: "Testar novos criativos de topo, novas abordagens de público e ângulos educativos antes de aumentar verba.",
        confidence: 0.72
      })
    );
  }

  if (hasValue(impressionsChange) && hasValue(reachChange) && impressionsChange > 0 && reachChange < 0) {
    recommendations.push(
      rec({
        category: "tofu",
        priority: "high",
        title: "Saturação de audiência",
        evidence: `Impressões subiram ${formatPercentChange(impressionsChange)} enquanto alcance caiu ${formatPercentChange(reachChange)}.`,
        recommendation: "Trocar ângulos criativos ou expandir público para reduzir repetição sobre a mesma audiência.",
        confidence: 0.86
      })
    );
  }

  if (meta?.impressions && meta.reach && meta.frequency && meta.frequency > 3.5) {
    recommendations.push(
      rec({
        category: "tofu",
        priority: "medium",
        title: "Frequência alta",
        evidence: `Frequência em ${meta.frequency.toFixed(2)}.`,
        recommendation: "Renovar criativos ou expandir audiência para evitar repetição excessiva sobre o mesmo público.",
        confidence: 0.7
      })
    );
  }

  const previousOrganic = previous ? getChannel(previous, "instagram_organic") : undefined;
  const storyCountChange = percentChange(organic?.storyCount, previousOrganic?.storyCount);
  if (hasValue(storyCountChange) && storyCountChange < -0.5 && (organic?.storyRetention ?? 0) >= resolvedBenchmarks.storiesRetentionGood) {
    recommendations.push(
      rec({
        category: "content",
        priority: "medium",
        title: "Queda de cadência em stories",
        evidence: `Stories caíram ${formatPercentChange(storyCountChange)} com retenção em ${Math.round((organic?.storyRetention ?? 0) * 100)}%.`,
        recommendation: "Retomar volume de stories; o sinal é queda de cadência, não queda de qualidade.",
        confidence: 0.84
      })
    );
  } else if ((organic?.storyRetention ?? 0) >= resolvedBenchmarks.storiesRetentionGood) {
    recommendations.push(
      rec({
        category: "content",
        priority: "medium",
        title: "Stories são ativo de relacionamento",
        evidence: `Retenção de stories em ${Math.round((organic?.storyRetention ?? 0) * 100)}%.`,
        recommendation: "Manter cadência de stories e usar pontes para direct, destaques e conteúdo educativo.",
        confidence: 0.78
      })
    );
  }

  if (leadShareTopTwo(creatives) > resolvedBenchmarks.creativeConcentrationRisk) {
    recommendations.push(
      rec({
        category: "creative",
        priority: "high",
        title: "Concentração perigosa em poucos criativos",
        evidence: "Top 2 criativos geram mais de 70% das oportunidades do conjunto identificado.",
        recommendation: "Produzir 3 variações de cada criativo vencedor para diluir dependência e preservar performance.",
        confidence: 0.84
      })
    );
  }

  if (meta?.profileVisits && meta.reach && meta.profileVisits / meta.reach < 0.003) {
    recommendations.push(
      rec({
        category: "mofu",
        priority: "medium",
        title: "Baixa visita ao perfil",
        evidence: `Relação visitas/alcance em ${(meta.profileVisits / meta.reach).toFixed(4)}.`,
        recommendation: "Melhorar CTA, último slide, legenda e ponte para direct ou destaques.",
        confidence: 0.74
      })
    );
  }

  recommendations.push(
    rec({
      category: "compliance",
      priority: "medium",
      title: "Checklist de publicidade médica",
      evidence: "Revisão humana recomendada antes de escalar peças.",
      recommendation:
        "Verificar promessa de resultado, antes/depois sem contexto educativo, depoimento com superioridade ou garantia, imagem identificável, CTA agressivo e ausência de CRM/RQE em contexto de autoridade.",
      confidence: 0.68
    })
  );

  return { creatives, keywords, recommendations };
}
