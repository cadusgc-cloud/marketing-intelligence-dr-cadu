import type { ParsedCreative, ParsedRecommendation, ParsedReport } from "@/lib/types";

function rec(input: ParsedRecommendation): ParsedRecommendation {
  return input;
}

export function classifyCreative(creative: ParsedCreative): ParsedCreative {
  const volume = creative.leads ?? creative.conversations ?? 0;
  if (creative.cpl !== null && creative.cpl !== undefined) {
    if (creative.cpl < 6 && volume >= 5) return { ...creative, diagnosis: "scale" };
    if (creative.cpl >= 6 && creative.cpl <= 15) return { ...creative, diagnosis: "keep" };
    if (creative.cpl > 20) return { ...creative, diagnosis: volume >= 3 ? "investigate" : "pause" };
  }
  return { ...creative, diagnosis: creative.diagnosis ?? "unknown" };
}

function leadShareTopTwo(creatives: ParsedCreative[]): number {
  const total = creatives.reduce((sum, creative) => sum + (creative.leads ?? creative.conversations ?? 0), 0);
  if (!total) return 0;
  const topTwo = creatives
    .map((creative) => creative.leads ?? creative.conversations ?? 0)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((sum, leads) => sum + leads, 0);
  return topTwo / total;
}

export function generateRecommendations(parsed: ParsedReport): {
  creatives: ParsedCreative[];
  keywords: ParsedReport["keywords"];
  recommendations: ParsedRecommendation[];
} {
  const creatives = parsed.creatives.map(classifyCreative);
  const keywords = parsed.keywords.map((keyword) => {
    if ((keyword.cpa ?? Infinity) <= 7 && (keyword.conversions ?? 0) >= 2) return { ...keyword, diagnosis: "scale" as const };
    if ((keyword.cpa ?? 0) > 20) return { ...keyword, diagnosis: "investigate" as const };
    return { ...keyword, diagnosis: keyword.diagnosis ?? "unknown" };
  });
  const meta = parsed.channels.find((channel) => channel.channel === "meta_ads");
  const google = parsed.channels.find((channel) => channel.channel === "google_ads");
  const organic = parsed.channels.find((channel) => channel.channel === "instagram_organic");
  const recommendations: ParsedRecommendation[] = [...parsed.recommendations];

  for (const creative of creatives.filter((item) => item.diagnosis === "scale")) {
    recommendations.push(
      rec({
        category: "creative",
        priority: "high",
        title: `Escalar criativo: ${creative.name}`,
        evidence: `CPL ${creative.cpl?.toFixed(2) ?? "-"} com ${creative.leads ?? creative.conversations ?? 0} oportunidades.`,
        recommendation: "Aumentar distribuição de forma gradual e criar variações de gancho, prova e CTA para reduzir risco de saturação.",
        confidence: 0.86
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

  if ((google?.cpa ?? 0) > 30) {
    recommendations.push(
      rec({
        category: "google_ads",
        priority: "critical",
        title: "Google Ads em CPA crítico",
        evidence: `CPA Google em ${google?.cpa?.toFixed(2)}.`,
        recommendation: "Revisar keywords, termos de pesquisa, correspondência, landing page e tracking antes de ampliar orçamento.",
        confidence: 0.9
      })
    );
  }

  if (meta?.reach && organic?.newFollowers && /alcance.*baixo|satura/i.test(parsed.rawText)) {
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

  if ((organic?.storyRetention ?? 0) >= 0.75) {
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

  if (leadShareTopTwo(creatives) > 0.7) {
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
