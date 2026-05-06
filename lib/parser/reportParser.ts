import type { ParsedChannel, ParsedCreative, ParsedKeyword, ParsedReport, ReportType } from "@/lib/types";
import { extractPeriod, isInsideDecember2025 } from "@/lib/utils/dates";
import { parseMoney, parseNumber, parsePercent } from "@/lib/utils/money";

const money = "(?:R\\$\\s*)?[\\d\\.]+,\\d{2}";
const int = "[\\d\\.]+";

function firstNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return parseNumber(match[1]);
  }
  return null;
}

function firstMoney(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return parseMoney(match[1]);
  }
  return null;
}

function inferReportType(text: string): ReportType {
  const normalized = text.toLowerCase();
  if (normalized.includes("quinzenal")) return "biweekly";
  if (normalized.includes("semanal")) return "weekly";
  if (normalized.includes("mensal")) return "monthly";
  if (normalized.includes("conteúdo") || normalized.includes("content")) return "content";
  if (normalized.includes("tráfego") || normalized.includes("traffic")) return "traffic";
  return "mixed";
}

function extractTitle(rawText: string): string {
  const firstLine = rawText.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  if (firstLine && firstLine.length < 140) return firstLine.replace(/^título:\s*/i, "");
  const { periodStart, periodEnd } = extractPeriod(rawText);
  if (periodStart && periodEnd) return "Relatório de marketing importado";
  return "Relatório sem título";
}

function splitLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n|;/)
    .map((line) => line.replace(/^[\s\-•*]+/, "").trim())
    .filter(Boolean);
}

function extractCreatives(rawText: string): ParsedCreative[] {
  const creatives: ParsedCreative[] = [];
  const lines = splitLines(rawText);
  const creativeLine = /(?:criativo(?:s)?(?: vencedor(?:es)?| problemático)?|^["“]?)(?:[:\-]\s*)?["“]?(.+?)["”]?\s*(?:—|-|:)\s*(?:(?:R\$\s*[\d\.,]+)\s*investidos?\s*(?:—|-)\s*)?(?:(\d+)\s*(?:leads?|conversas?))?/i;

  for (const line of lines) {
    const lower = line.toLowerCase();
    const looksCreative = lower.includes("criativo") || lower.includes("cpl") || lower.includes("conversa") || lower.includes("lead");
    if (!looksCreative) continue;

    const nameMatch = line.match(creativeLine);
    const cpl = firstMoney(line, [new RegExp(`CPL\\s*(${money})`, "i")]);
    const investment = firstMoney(line, [new RegExp(`(${money})\\s*invest`, "i")]);
    const profileVisits = firstNumber(line, [new RegExp(`(${int})\\s*visitas? ao perfil`, "i")]);
    const leads = firstNumber(line, [/(\d+)\s*(?:leads?|conversas?)/i]);
    const name = nameMatch?.[1]?.trim();
    if (!name || (!leads && !cpl && !investment && !profileVisits)) continue;
    if (/criativos?|vencedores?|problemático/i.test(name) && !line.includes("—")) continue;
    creatives.push({
      platform: "meta_ads",
      name: name.replace(/^(vencedor(?:es)?|problemático):?\s*/i, "").trim(),
      format: lower.includes("story") ? "story" : lower.includes("reel") ? "reel" : lower.includes("img") ? "image" : "unknown",
      funnelStage: lower.includes("tofu") ? "tofu" : lower.includes("bofu") ? "bofu" : "unknown",
      investment,
      conversations: leads,
      leads,
      cpl,
      profileVisits
    });
  }

  return dedupeBy(creatives, (creative) => creative.name.toLowerCase());
}

function extractKeywords(rawText: string): ParsedKeyword[] {
  const keywords: ParsedKeyword[] = [];
  const lines = splitLines(rawText);
  for (const line of lines) {
    if (!/(keyword|palavra|lipoaspiração|mamoplastia|cirurgia plástica|seios)/i.test(line)) continue;
    const pieces = line.split(/;|,\s*(?=[a-záéíóúãõç ]+\s*—)/i);
    for (const piece of pieces) {
      const match = piece.match(/(?:keywords?(?: vencedoras?)?:\s*)?(.+?)\s*(?:—|-)\s*(?:(\d+)\s*conversões?\s*(?:—|-)\s*)?(?:CPA\s*)?((?:R\$\s*)?[\d\.]+,\d{2})/i);
      if (!match) continue;
      keywords.push({
        keyword: match[1].trim(),
        conversions: match[2] ? Number(match[2]) : null,
        cpa: parseMoney(match[3])
      });
    }
  }
  return dedupeBy(keywords, (keyword) => keyword.keyword.toLowerCase());
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractSourceLabel(rawText: string): string | null {
  if (/reportei/i.test(rawText)) return "Reportei";
  if (/meta ads/i.test(rawText) && /google ads/i.test(rawText)) return "Meta Ads + Google Ads";
  if (/instagram/i.test(rawText)) return "Instagram orgânico";
  return null;
}

export function parseReport(rawText: string): ParsedReport {
  const { periodStart, periodEnd } = extractPeriod(rawText);
  const investmentTotal = firstMoney(rawText, [
    new RegExp(`Investimento total:?\\s*(${money})`, "i"),
    new RegExp(`Total investido:?\\s*(${money})`, "i")
  ]);
  const metaInvestment = firstMoney(rawText, [
    new RegExp(`(?:Meta Ads|Investimento Meta):?\\s*(${money})`, "i"),
    new RegExp(`Meta:?\\s*(${money})`, "i")
  ]);
  const googleInvestment = firstMoney(rawText, [
    new RegExp(`(?:Google Ads|Investimento Google):?\\s*(${money})`, "i"),
    new RegExp(`Google:?\\s*(${money})`, "i")
  ]);
  const reach = firstNumber(rawText, [/Alcance:?\s*([\d\.]+)/i]);
  const impressions = firstNumber(rawText, [/Impressões:?\s*([\d\.]+)/i]);
  const newFollowers = firstNumber(rawText, [/(?:Novos seguidores|Seguidores líquidos):?\s*([\d\.]+)/i]);
  const conversations = firstNumber(rawText, [/(?:Conversas Meta|Leads Meta):?\s*([\d\.]+)/i]);
  const googleConversions = firstNumber(rawText, [/Google conversões:?\s*([\d\.]+)/i, /Google.*?conversões:?\s*([\d\.]+)/i]);
  const cpl = firstMoney(rawText, [new RegExp(`CPL Meta:?\\s*(${money})`, "i")]);
  const cpa = firstMoney(rawText, [new RegExp(`Google CPA:?\\s*(${money})`, "i"), new RegExp(`CPA Google:?\\s*(${money})`, "i")]);
  const cps = firstMoney(rawText, [new RegExp(`CPS:?\\s*(${money})`, "i")]);
  const clicks = firstNumber(rawText, [/Google cliques:?\s*([\d\.]+)/i, /Cliques:?\s*([\d\.]+)/i]);
  const frequency = firstNumber(rawText, [/Frequ[eê]ncia:?\s*([\d\.,]+)/i]);
  const postCount = firstNumber(rawText, [/(?:Posts|Publicações):?\s*([\d\.]+)/i]);
  const reelCount = firstNumber(rawText, [/Reels:?\s*([\d\.]+)/i]);
  const storyCount = firstNumber(rawText, [/Stories:?\s*([\d\.]+)/i]);
  const storyRetention = (() => {
    const match = rawText.match(/Reten(?:ç|c)[aã]o(?: de stories)?:?\s*([\d\.,]+)%/i);
    return match?.[1] ? parsePercent(match[1]) : null;
  })();
  const profileVisits = firstNumber(rawText, [/Visitas? ao perfil:?\s*([\d\.]+)/i]);
  const title = extractTitle(rawText);
  const isOperationalAnomaly = isInsideDecember2025(periodStart, periodEnd);
  const channels: ParsedChannel[] = [
    {
      channel: "consolidated",
      investment: investmentTotal ?? ((metaInvestment ?? 0) + (googleInvestment ?? 0) || null),
      reach,
      impressions,
      frequency,
      clicks,
      profileVisits,
      newFollowers,
      conversions: googleConversions,
      conversations,
      opportunities: (conversations ?? 0) + (googleConversions ?? 0) || null,
      cps,
      storyCount,
      storyRetention,
      reelCount,
      postCount
    },
    {
      channel: "meta_ads",
      investment: metaInvestment,
      reach,
      impressions,
      frequency,
      profileVisits,
      conversations,
      opportunities: conversations,
      cpl
    },
    {
      channel: "google_ads",
      investment: googleInvestment,
      clicks,
      conversions: googleConversions,
      opportunities: googleConversions,
      cpa
    },
    {
      channel: "instagram_organic",
      reach,
      impressions,
      profileVisits,
      newFollowers,
      storyCount,
      storyRetention,
      reelCount,
      postCount
    }
  ];

  const textualRecommendations = splitLines(rawText)
    .filter((line) => /recomenda/i.test(line))
    .slice(0, 5)
    .map((line) => ({
      category: "validation" as const,
      priority: "medium" as const,
      title: "Recomendação presente no relatório",
      evidence: line,
      recommendation: line.replace(/^recomenda(?:ção|ções)?:?\s*/i, ""),
      confidence: 0.65
    }));

  return {
    title,
    rawText,
    reportType: inferReportType(rawText),
    periodStart,
    periodEnd,
    receivedAt: new Date(),
    sourceLabel: extractSourceLabel(rawText),
    isOperationalAnomaly,
    anomalyReason: isOperationalAnomaly ? "Conta hackeada; desconsiderar de benchmarks e médias históricas" : null,
    confidenceScore: [periodStart, periodEnd, reach, impressions, metaInvestment, googleInvestment, conversations, googleConversions].filter(Boolean).length / 8,
    channels,
    creatives: extractCreatives(rawText),
    keywords: extractKeywords(rawText),
    recommendations: textualRecommendations,
    dataIssues: isOperationalAnomaly
      ? [
          {
            severity: "critical",
            issueType: "operational_anomaly",
            description: "Período dentro de dezembro de 2025; excluir de benchmarks e médias históricas.",
            fieldName: "period",
            expectedValue: "Fora de dezembro/2025",
            foundValue: "Dezembro/2025"
          }
        ]
      : []
  };
}
