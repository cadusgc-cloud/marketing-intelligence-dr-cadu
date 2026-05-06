import type { ParsedChannel, ParsedCreative, ParsedKeyword, ParsedReport, ReportType } from "@/lib/types";
import { extractPeriod, isInsideDecember2025 } from "@/lib/utils/dates";
import { parseMoney, parseNumber, parsePercent } from "@/lib/utils/money";

const money = "(?:R\\$\\s*)?[\\d\\.]+(?:,\\d{1,2})?";
const brl = "R\\$\\s*[\\d\\.]+(?:,\\d{1,2})?";
const int = "[\\d\\.]+";
const decimal = "[\\d\\.]+(?:,\\d+)?";

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
  const normalized = text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (normalized.includes("quinzenal")) return "biweekly";
  if (normalized.includes("semanal")) return "weekly";
  if (normalized.includes("mensal")) return "monthly";
  if (normalized.includes("conteudo") || normalized.includes("conteÃºdo") || normalized.includes("content")) return "content";
  if (normalized.includes("trafego") || normalized.includes("trÃ¡fego") || normalized.includes("traffic")) return "traffic";
  return "mixed";
}

function extractTitle(rawText: string): string {
  const firstLine = rawText.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  if (firstLine && firstLine.length < 140) return firstLine.replace(/^titulo:\s*/i, "");
  const { periodStart, periodEnd } = extractPeriod(rawText);
  if (periodStart && periodEnd) return "Relatorio de marketing importado";
  return "Relatorio sem titulo";
}

function splitLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n|;/)
    .map((line) => line.replace(/^[\s\-•*]+/, "").trim())
    .filter(Boolean);
}

function normalizeForSearch(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function mergeCreatives(creatives: ParsedCreative[]): ParsedCreative[] {
  const merged = new Map<string, ParsedCreative>();
  for (const creative of creatives) {
    const key = creative.name.toLowerCase();
    const current = merged.get(key);
    if (!current) {
      merged.set(key, creative);
      continue;
    }
    merged.set(key, {
      ...current,
      ...creative,
      investment: current.investment ?? creative.investment,
      conversations: current.conversations ?? creative.conversations,
      leads: current.leads ?? creative.leads,
      cpl: current.cpl ?? creative.cpl,
      profileVisits: current.profileVisits ?? creative.profileVisits
    });
  }
  return Array.from(merged.values());
}

function formatForLine(lower: string): ParsedCreative["format"] {
  if (lower.includes("story")) return "story";
  if (lower.includes("reel")) return "reel";
  if (lower.includes("img")) return "image";
  return "unknown";
}

function funnelForLine(lower: string): ParsedCreative["funnelStage"] {
  if (lower.includes("tofu")) return "tofu";
  if (lower.includes("mofu")) return "mofu";
  if (lower.includes("bofu")) return "bofu";
  return "unknown";
}

function extractCreatives(rawText: string): ParsedCreative[] {
  const creatives: ParsedCreative[] = [];
  const lines = splitLines(rawText);
  const creativeLine = /(?:criativo(?:s)?(?: vencedor(?:es)?| problematico)?|^["“]?)(?:[:\-]\s*)?["“]?(.+?)["”]?\s*(?:—|-|:)\s*(?:(?:R\$\s*[\d\.,]+)\s*investidos?\s*(?:—|-)\s*)?(?:(\d+)\s*(?:leads?|conversas?|conv\.?))?/i;
  const quotedMetric = new RegExp(`["“]([^"”]+)["”]\\s*\\((?:(${decimal})\\s*(?:leads?|conversas?|conv\\.?)\\s*,\\s*)?(${money})(?:\\/conv\\.)?\\)`, "gi");
  const quotedLeadCpl = new RegExp(`["“]([^"”]+)["”][^\\.\\n]*?(${decimal})\\s*(?:leads?|conversas?|conv\\.?)\\s*(?:a|por)?[^\\.\\n]*?(${money})`, "gi");
  const quotedVisits = new RegExp(`["“]([^"”]+)["”][^\\.\\n]*?(${decimal})\\s*visitas? ao perfil[^\\.\\n]*?(${money})\\s*invest`, "gi");
  const quotedConversationInvestment = new RegExp(`["“]([^"”]+)["”][^\\.\\n]*?(${decimal})\\s*(?:conversa|conversas|lead|leads|conv\\.?).*?(${money})`, "gi");
  const quotedAggregatedLeads = new RegExp(`["“]([^"”]+)["”][^\\.\\n]*?somando\\s*(${decimal})\\s*(?:leads?|conversas?|conv\\.?)`, "gi");

  for (const line of lines) {
    const lower = line.toLowerCase();
    const looksCreative = lower.includes("criativo") || lower.includes("anuncio") || lower.includes("cpl") || lower.includes("conversa") || lower.includes("lead");
    if (!looksCreative) continue;

    for (const match of line.matchAll(quotedMetric)) {
      const conversations = parseNumber(match[2]);
      creatives.push({
        platform: "meta_ads",
        name: match[1].trim(),
        format: formatForLine(lower),
        funnelStage: funnelForLine(lower),
        conversations,
        leads: conversations,
        cpl: parseMoney(match[3])
      });
    }

    for (const match of line.matchAll(quotedLeadCpl)) {
      const conversations = parseNumber(match[2]);
      creatives.push({
        platform: "meta_ads",
        name: match[1].trim(),
        format: formatForLine(lower),
        funnelStage: funnelForLine(lower),
        conversations,
        leads: conversations,
        cpl: parseMoney(match[3])
      });
    }

    for (const match of line.matchAll(quotedVisits)) {
      creatives.push({
        platform: "meta_ads",
        name: match[1].trim(),
        format: "image",
        funnelStage: funnelForLine(lower),
        investment: parseMoney(match[3]),
        profileVisits: parseNumber(match[2])
      });
    }

    for (const match of line.matchAll(quotedConversationInvestment)) {
      const conversations = parseNumber(match[2]);
      creatives.push({
        platform: "meta_ads",
        name: match[1].trim(),
        format: formatForLine(lower),
        funnelStage: funnelForLine(lower),
        investment: parseMoney(match[3]),
        conversations,
        leads: conversations
      });
    }

    for (const match of line.matchAll(quotedAggregatedLeads)) {
      const leads = parseNumber(match[2]);
      creatives.push({
        platform: "meta_ads",
        name: match[1].trim(),
        format: "unknown",
        funnelStage: funnelForLine(lower),
        conversations: leads,
        leads
      });
    }

    const nameMatch = line.match(creativeLine);
    const cpl = firstMoney(line, [new RegExp(`CPL\\s*(${money})`, "i")]);
    const investment = firstMoney(line, [new RegExp(`(${money})\\s*invest`, "i")]);
    const profileVisits = firstNumber(line, [new RegExp(`(${int})\\s*visitas? ao perfil`, "i")]);
    const leads = firstNumber(line, [new RegExp(`(${decimal})\\s*(?:leads?|conversas?|conv\\.?)`, "i")]);
    const name = nameMatch?.[1]?.trim();
    if (!name || (!leads && !cpl && !investment && !profileVisits)) continue;
    if (/criativos?|vencedores?|problematico/i.test(name) && !line.includes("—") && !line.includes("-")) continue;
    creatives.push({
      platform: "meta_ads",
      name: name.replace(/^(vencedor(?:es)?|problematico):?\s*/i, "").trim(),
      format: formatForLine(lower),
      funnelStage: funnelForLine(lower),
      investment,
      conversations: leads,
      leads,
      cpl,
      profileVisits
    });
  }

  return mergeCreatives(creatives);
}

function extractKeywords(rawText: string): ParsedKeyword[] {
  const keywords: ParsedKeyword[] = [];
  const lines = splitLines(rawText);
  for (const line of lines) {
    const searchable = normalizeForSearch(line);
    if (!/(keyword|palavra|lipoaspiracao|mamoplastia|cirurgia plastica|seios)/i.test(searchable)) continue;
    const quotedKeyword = new RegExp(`["“]([^"”]+)["”]\\s*\\((?:(?:(${decimal})\\s*cliques?\\s*,\\s*)?(?:(${decimal})\\s*conv(?:ers(?:o|oe|õe)s?)?)|(?:(${money})\\/conv\\.))\\)`, "gi");
    for (const match of line.matchAll(quotedKeyword)) {
      keywords.push({
        keyword: match[1].trim(),
        clicks: match[2] ? parseNumber(match[2]) : null,
        conversions: match[3] ? parseNumber(match[3]) : null,
        cpa: match[4] ? parseMoney(match[4]) : null
      });
    }
    const pieces = line.split(/;|,\s*(?=[a-záéíóúãõç ]+\s*—)/i);
    for (const piece of pieces) {
      const match = piece.match(new RegExp(`(?:keywords?(?: vencedoras?)?:\\s*)?(.+?)\\s*(?:—|-)\\s*(?:(${decimal})\\s*convers(?:o|oe|õe)s?\\s*(?:—|-)\\s*)?(?:CPA\\s*)?(${money})`, "i"));
      if (!match) continue;
      keywords.push({
        keyword: match[1].trim(),
        conversions: match[2] ? parseNumber(match[2]) : null,
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
  if (/instagram/i.test(rawText)) return "Instagram organico";
  return null;
}

export function parseReport(rawText: string): ParsedReport {
  const { periodStart, periodEnd } = extractPeriod(rawText);
  const investmentTotal = firstMoney(rawText, [
    new RegExp(`Investimento total:?\\s*(${money})`, "i"),
    new RegExp(`Total investido:?\\s*(${money})`, "i"),
    new RegExp(`Total gasto nas campanhas:?\\s*(${money})`, "i")
  ]);
  const metaInvestment = firstMoney(rawText, [
    new RegExp(`(?:Meta Ads|Investimento Meta):?\\s*(${brl})`, "i"),
    new RegExp(`Meta:?\\s*(${brl})`, "i"),
    new RegExp(`(${money})\\s*Meta Ads`, "i")
  ]);
  const googleInvestment = firstMoney(rawText, [
    new RegExp(`(?:Google Ads|Investimento Google):?\\s*(${brl})`, "i"),
    new RegExp(`Google:?\\s*(${brl})`, "i"),
    new RegExp(`(${money})\\s*Google Ads`, "i"),
    new RegExp(`Custo\\s*(${money})`, "i")
  ]);
  const reach = firstNumber(rawText, [/Alcance(?: Total)?:?\s*([\d\.]+)/i]);
  const impressions = firstNumber(rawText, [/Impress[^\s:]*:?\s*([\d\.]+)/i]);
  const newFollowers = firstNumber(rawText, [/(?:Novos seguidores|Seguidores l\S*quidos?|Seguidores liquidos?|Seguidores lÃ­quidos):?\s*([\d\.]+)/i]);
  const conversations = firstNumber(rawText, [/(?:Conversas Meta|Leads Meta|Conversas geradas \(leads\)):?\s*([\d\.]+)/i]);
  const googleConversions = firstNumber(rawText, [
    /Google\s+convers\S*:?\s*([\d\.,]+)/i,
    /Google[^\r\n]*?convers\S*:?\s*([\d\.,]+)/i,
    /Google Ads:?\s*([\d\.,]+)\s*convers/i,
    /Google Ads:?\s*[\d\.,]+\s*cliques?\s*com\s*([\d\.,]+)\s*convers/i
  ]);
  const cpl = firstMoney(rawText, [new RegExp(`CPL Meta:?\\s*(${money})`, "i"), new RegExp(`CPL \\(custo por lead\\):?\\s*(${money})`, "i")]);
  const cpa = firstMoney(rawText, [
    new RegExp(`Google CPA:?\\s*(${money})`, "i"),
    new RegExp(`CPA Google:?\\s*(${money})`, "i"),
    new RegExp(`Google Ads:?.*?convers\\S*\\s*a\\s*(${money})`, "i"),
    new RegExp(`CPA de\\s*(${money})`, "i")
  ]);
  const cps = firstMoney(rawText, [new RegExp(`CPS:?\\s*(${money})`, "i")]);
  const clicks = firstNumber(rawText, [/Google cliques:?\s*([\d\.]+)/i, /Cliques:?\s*([\d\.]+)/i, /Google Ads:?\s*([\d\.]+)\s*cliques/i]);
  const frequency = firstNumber(rawText, [/Frequencia:?\s*([\d\.,]+)/i]);
  const postCount = firstNumber(rawText, [/(?:Posts|Publicacoes):?\s*([\d\.]+)/i]);
  const reelCount = firstNumber(rawText, [/Reels:?\s*([\d\.]+)/i]);
  const storyCount = firstNumber(rawText, [/Stories:?\s*([\d\.]+)/i]);
  const storyRetention = (() => {
    const match = rawText.match(/Retencao(?: de stories)?:?\s*([\d\.,]+)%/i);
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
      cpl,
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
      title: "Recomendacao presente no relatorio",
      evidence: line,
      recommendation: line.replace(/^recomenda(?:cao|coes)?:?\s*/i, ""),
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
    anomalyReason: isOperationalAnomaly ? "Conta hackeada; desconsiderar de benchmarks e medias historicas" : null,
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
            description: "Periodo dentro de dezembro de 2025; excluir de benchmarks e medias historicas.",
            fieldName: "period",
            expectedValue: "Fora de dezembro/2025",
            foundValue: "Dezembro/2025"
          }
        ]
      : []
  };
}
