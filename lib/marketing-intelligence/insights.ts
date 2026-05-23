import type {
  ContentInsight,
  ContentOpportunity,
  FormatInsight,
  IntelligenceQualityReport,
  LearningLoopReport,
  ManualMetricFormat,
  ManualMetricPillar,
  NextBestAction,
  NormalizedMetricRecord,
  PerformanceScore,
  PillarInsight,
  TopicInsight
} from "@/lib/marketing-intelligence/types";
import { formatLabels, pillarLabels, sensitiveTerms } from "@/lib/marketing-intelligence/normalization";
import { calculatePerformanceScores } from "@/lib/marketing-intelligence/scoring";
import { sampleDatasetNotice, sampleManualMetricRecords } from "@/lib/marketing-intelligence/sampleData";
import { normalizeMetricRows } from "@/lib/marketing-intelligence/normalization";

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function scoreFor(record: NormalizedMetricRecord, scores: PerformanceScore[]) {
  return scores.find((score) => score.recordId === record.id) ?? calculatePerformanceScores([record])[0];
}

function buildContentInsight(record: NormalizedMetricRecord, score: PerformanceScore): ContentInsight {
  const recommendation = score.classification === "forte" || score.classification === "promissor"
    ? `Repetir o tema "${record.theme}" com outro hook seguro e manter revisao humana.`
    : score.classification === "fraco"
      ? `Pausar ou variar "${record.theme}" antes de aumentar esforco.`
      : "Usar como aprendizado, sem decisao automatica.";
  return { record, score, recommendation };
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const group = key(item);
    acc[group] = acc[group] ?? [];
    acc[group].push(item);
    return acc;
  }, {});
}

export function runIntelligenceQuality(records: NormalizedMetricRecord[], recommendations: string[] = []): IntelligenceQualityReport {
  const joined = [...records.map((record) => `${record.theme} ${record.title} ${record.notes}`), ...recommendations].join(" ").toLowerCase();
  const blockingIssues = sensitiveTerms
    .filter((term) => joined.includes(term))
    .map((term) => `Termo sensivel ou bloqueante detectado: ${term}`);
  const warnings: string[] = [];
  if (!records.length) warnings.push("Sem registros para aprendizado.");
  if (records.some((record) => record.risk === "atencao" || record.risk === "revisar")) warnings.push("Ha conteudos que pedem revisao antes de virar recomendacao.");
  if (recommendations.some((text) => /convers[aã]o medica|funil agressivo|urgencia/i.test(text))) warnings.push("Evitar interpretacao agressiva de conversao medica.");
  const score = Math.max(0, 100 - blockingIssues.length * 35 - warnings.length * 5);
  return {
    score,
    status: blockingIssues.length ? "bloqueado" : score < 85 ? "revisar" : "aprovado",
    blockingIssues,
    warnings,
    checks: [
      "Sem API externa",
      "Sem paciente ou prontuario",
      "Sem localizacao real",
      "Sem promessa de resultado",
      "Sem diagnostico ou prescricao",
      "Sem CTA agressivo",
      "Metricas interpretadas como sinais editoriais, nao como decisao medica"
    ]
  };
}

export function buildPillarInsights(insights: ContentInsight[]): PillarInsight[] {
  return Object.entries(groupBy(insights, (item) => item.record.normalizedPillar)).map(([pillar, items]) => ({
    pillar: pillar as ManualMetricPillar,
    label: pillarLabels[pillar as ManualMetricPillar],
    averageScore: average(items.map((item) => item.score.overallPerformanceScore)),
    records: items.length,
    recommendation: average(items.map((item) => item.score.overallPerformanceScore)) >= 65
      ? "Reforcar no proximo ciclo com variacao de formato."
      : "Manter em teste controlado, sem aumentar volume automaticamente."
  })).sort((a, b) => b.averageScore - a.averageScore);
}

export function buildFormatInsights(insights: ContentInsight[]): FormatInsight[] {
  return Object.entries(groupBy(insights, (item) => item.record.normalizedFormat)).map(([format, items]) => ({
    format: format as ManualMetricFormat,
    label: formatLabels[format as ManualMetricFormat],
    averageScore: average(items.map((item) => item.score.overallPerformanceScore)),
    records: items.length,
    recommendation: average(items.map((item) => item.score.overallPerformanceScore)) >= 65
      ? "Usar como formato de repeticao com hooks novos."
      : "Revisar tema, ritmo e esforco antes de repetir."
  })).sort((a, b) => b.averageScore - a.averageScore);
}

export function buildTopicInsights(insights: ContentInsight[]): TopicInsight[] {
  return Object.entries(groupBy(insights, (item) => item.record.theme)).map(([theme, items]) => ({
    theme,
    pillar: items[0].record.normalizedPillar,
    averageScore: average(items.map((item) => item.score.overallPerformanceScore)),
    saves: items.reduce((sum, item) => sum + item.record.saves, 0),
    shares: items.reduce((sum, item) => sum + item.record.shares, 0),
    dms: items.reduce((sum, item) => sum + item.record.dms, 0),
    recommendation: average(items.map((item) => item.score.repeatPotentialScore)) >= 65
      ? "Repetir com novo angulo e manter linguagem educativa."
      : "Variar antes de repetir."
  })).sort((a, b) => b.averageScore - a.averageScore);
}

function buildNextActions(topics: TopicInsight[], formats: FormatInsight[], pillars: PillarInsight[]): NextBestAction[] {
  const format = formats[0]?.format ?? "reel";
  const actions = topics.slice(0, 10).map((topic, index) => ({
    id: `nba-${index + 1}`,
    order: index + 1,
    title: `${index < 3 ? "Priorizar" : "Testar"} ${topic.theme}`,
    rationale: `${pillarLabels[topic.pillar]} teve sinal agregado relevante: score ${topic.averageScore}, ${topic.saves} salvamentos e ${topic.shares} compartilhamentos.`,
    priority: index < 3 ? "alta" as const : "media" as const,
    effort: format === "reel" ? "medio" as const : "baixo" as const,
    expectedImpact: topic.averageScore >= 70 ? "alto" as const : "medio" as const,
    risk: "baixo" as const,
    suggestedFormat: index % 3 === 0 ? "reel" as const : index % 3 === 1 ? "carrossel" as const : "story" as const,
    relatedRoute: index % 2 === 0 ? "/studio" : "/strategy",
    exportText: `Acao ${index + 1}: ${topic.theme}\nFormato sugerido: ${index % 3 === 0 ? "reel" : index % 3 === 1 ? "carrossel" : "story"}\nJustificativa: sinal agregado, sem promessa e com revisao humana.\nProximo passo: gerar pacote no Content Studio.`
  }));
  if (pillars.some((pillar) => pillar.records <= 3)) {
    actions.push({
      id: "nba-equilibrio-pilares",
      order: actions.length + 1,
      title: "Equilibrar pilares subutilizados",
      rationale: "Alguns pilares importantes aparecem pouco no dataset ficticio e devem ser testados com baixo risco.",
      priority: "media",
      effort: "baixo",
      expectedImpact: "medio",
      risk: "baixo",
      suggestedFormat: "story",
      relatedRoute: "/metrics",
      exportText: "Acao: equilibrar pilares subutilizados com stories leves e educativos, sem automatizar publicacao."
    });
  }
  return actions.slice(0, 10);
}

export function buildOpportunityMap(insights: ContentInsight[]): ContentOpportunity[] {
  const buckets: ContentOpportunity[] = [
    {
      bucket: "alto_desempenho_baixo_esforco",
      label: "Alto desempenho / baixo esforco",
      items: insights.filter((item) => item.score.overallPerformanceScore >= 65 && item.record.effort <= 2).slice(0, 6),
      recommendation: "Repetir com variacoes pequenas e manter tom natural."
    },
    {
      bucket: "alto_desempenho_alto_esforco",
      label: "Alto desempenho / alto esforco",
      items: insights.filter((item) => item.score.overallPerformanceScore >= 65 && item.record.effort >= 4).slice(0, 6),
      recommendation: "Transformar em serie ou gravacao em lote para diluir esforco."
    },
    {
      bucket: "baixo_desempenho_baixo_esforco",
      label: "Baixo desempenho / baixo esforco",
      items: insights.filter((item) => item.score.overallPerformanceScore < 45 && item.record.effort <= 2).slice(0, 6),
      recommendation: "Variar hook e manter apenas se tiver valor estrategico."
    },
    {
      bucket: "baixo_desempenho_alto_esforco",
      label: "Baixo desempenho / alto esforco",
      items: insights.filter((item) => item.score.overallPerformanceScore < 45 && item.record.effort >= 4).slice(0, 6),
      recommendation: "Pausar antes de gastar mais producao."
    },
    {
      bucket: "alto_risco_evitar",
      label: "Alto risco / evitar",
      items: insights.filter((item) => item.score.classification === "bloquear" || item.score.classification === "revisar").slice(0, 6),
      recommendation: "Nao transformar em pauta sem revisao humana."
    },
    {
      bucket: "alto_valor_estrategico_manter",
      label: "Alto valor estrategico / manter",
      items: insights.filter((item) => ["expectativa_realista", "seguranca", "consulta_nao_e_venda"].includes(item.record.normalizedPillar)).slice(0, 6),
      recommendation: "Manter como eixo de autoridade medica responsavel."
    },
    {
      bucket: "subutilizado_testar",
      label: "Subutilizado / testar",
      items: insights.filter((item) => item.record.normalizedFormat === "story" || item.record.normalizedFormat === "reflexao").slice(0, 6),
      recommendation: "Testar com baixa carga de producao."
    },
    {
      bucket: "saturado_variar",
      label: "Saturado / variar",
      items: insights.filter((item, index) => index % 5 === 0).slice(0, 6),
      recommendation: "Variar angulo, hook e formato antes de repetir."
    }
  ];
  return buckets;
}

export function generateLearningLoopReport(records: NormalizedMetricRecord[] = normalizeMetricRows(sampleManualMetricRecords)): LearningLoopReport {
  const scores = calculatePerformanceScores(records);
  const insights = records.map((record) => buildContentInsight(record, scoreFor(record, scores)));
  const sorted = [...insights].sort((a, b) => b.score.overallPerformanceScore - a.score.overallPerformanceScore);
  const topContents = sorted.slice(0, 10);
  const weakContents = [...sorted].reverse().slice(0, 8);
  const pillarInsights = buildPillarInsights(insights);
  const formatInsights = buildFormatInsights(insights);
  const topicInsights = buildTopicInsights(insights);
  const recommendations = buildNextActions(topicInsights, formatInsights, pillarInsights);
  const imbalanceAlerts = pillarInsights.filter((pillar) => pillar.records < 4).map((pillar) => `${pillar.label} aparece pouco no periodo e pode ser testado com baixo risco.`);
  const learning = {
    repeat: topContents.slice(0, 5),
    vary: sorted.filter((item) => item.score.classification === "neutro" || item.score.classification === "promissor").slice(0, 5),
    pause: weakContents.filter((item) => item.score.overallPerformanceScore < 48).slice(0, 5),
    transformToReel: sorted.filter((item) => item.record.normalizedFormat !== "reel" && item.score.conversationScore >= 60).slice(0, 5),
    transformToCarousel: sorted.filter((item) => item.record.normalizedFormat !== "carrossel" && item.score.saveShareScore >= 62).slice(0, 5),
    transformToStories: sorted.filter((item) => item.record.normalizedFormat !== "story" && item.score.efficiencyScore >= 60).slice(0, 5),
    strongPillars: pillarInsights.slice(0, 4),
    strongFormats: formatInsights.slice(0, 4),
    imbalanceAlerts
  };
  const quality = runIntelligenceQuality(records, recommendations.map((item) => `${item.title} ${item.rationale}`));

  return {
    generatedAt: "2026-05-23",
    datasetLabel: sampleDatasetNotice,
    records,
    scores,
    topContents,
    weakContents,
    pillarInsights,
    formatInsights,
    topicInsights,
    learning,
    recommendations,
    opportunities: buildOpportunityMap(insights),
    quality,
    summary: `Leitura local com ${records.length} registros ficticios agregados. Recomendacoes sao editoriais, conservadoras e dependem de revisao humana.`
  };
}
