import {
  CONTENT_IDEAS,
  type ContentFunnelStage,
  type ContentPriority,
  type ContentStatus,
  type ReusableContentIdea,
  funnelStageLabel
} from "@/lib/contentStudio";

export type EditorialFormat = "stories" | "reels" | "shorts" | "tiktok" | "carousel" | "all";
export type ProductionStatus = "planned" | "scripted" | "recorded" | "edited" | "scheduled" | "published";

export type EditorialCalendarItem = {
  id: string;
  contentId: string;
  title: string;
  pillar: string;
  funnelStage: ContentFunnelStage;
  scheduledDate: string;
  weekLabel: string;
  format: EditorialFormat;
  productionStatus: ProductionStatus;
  priority: ContentPriority;
  objective: string;
  hook: string;
  cta: string;
  notes: string;
  relatedCampaign: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EditorialCalendarFilters = {
  productionStatus?: ProductionStatus;
  pillar?: string;
  format?: EditorialFormat;
  priority?: ContentPriority;
  funnelStage?: ContentFunnelStage;
};

export type EditorialCalendarIndicators = {
  total: number;
  scripted: number;
  recorded: number;
  edited: number;
  scheduled: number;
  published: number;
  highPriority: number;
  byPillar: Record<string, number>;
  byFunnelStage: Record<ContentFunnelStage, number>;
  byFormat: Record<EditorialFormat, number>;
  funnelBalance: string;
};

export const WEEKLY_CONTENT_RULES = [
  "Mínimo de 6 Stories por dia.",
  "3 reels/shorts por semana.",
  "1 conteúdo de autoridade.",
  "1 conteúdo de prova/resultado.",
  "1 conteúdo de maternidade/naturalidade.",
  "CTA diário para WhatsApp.",
  "Cada ideia relevante deve ser reaproveitada em Stories + Reels/Shorts + TikTok sempre que possível.",
  "Priorizar mamas/silicone, lipo/contorno, maternidade/naturalidade e autoridade médica."
];

const baseDate = new Date("2026-05-09T12:00:00.000Z");

function content(id: string): ReusableContentIdea {
  const idea = CONTENT_IDEAS.find((item) => item.id === id);
  if (!idea) throw new Error(`Missing content idea: ${id}`);
  return idea;
}

function calendarItem(
  id: string,
  contentId: string,
  scheduledDate: string,
  weekLabel: string,
  format: EditorialFormat,
  productionStatus: ProductionStatus,
  priority: ContentPriority,
  funnelStage: ContentFunnelStage,
  notes: string,
  relatedCampaign: string | null
): EditorialCalendarItem {
  const idea = content(contentId);

  return {
    id,
    contentId,
    title: idea.title,
    pillar: idea.pillar,
    funnelStage,
    scheduledDate,
    weekLabel,
    format,
    productionStatus,
    priority,
    objective: idea.mainObjective,
    hook: idea.hook,
    cta: idea.cta,
    notes,
    relatedCampaign,
    createdAt: baseDate,
    updatedAt: baseDate
  };
}

export const EDITORIAL_CALENDAR_ITEMS: EditorialCalendarItem[] = [
  calendarItem(
    "segunda-silicone-ml",
    "silicone-nao-e-so-ml",
    "2026-05-11",
    "Segunda-feira",
    "all",
    "scripted",
    "high",
    "MOFU",
    "Gravar roteiro principal e separar stories de apoio com enquete sobre ml.",
    "Meta Ads - Mamas e prótese"
  ),
  calendarItem(
    "terca-lipo-contorno",
    "lipo-nao-e-emagrecimento",
    "2026-05-12",
    "Terça-feira",
    "all",
    "planned",
    "high",
    "MOFU",
    "Priorizar corte curto para Reels, Shorts e TikTok com gancho direto.",
    "Meta Ads - Lipo e contorno"
  ),
  calendarItem(
    "quarta-redutora",
    "redutora-nao-e-so-diminuir",
    "2026-05-13",
    "Quarta-feira",
    "all",
    "recorded",
    "high",
    "BOFU",
    "Usar Stories para perguntas e Reels para explicar proporção, conforto e segurança.",
    "Meta Ads - Mamoplastia"
  ),
  calendarItem(
    "quinta-maternidade",
    "maternidade-reconhecer",
    "2026-05-14",
    "Quinta-feira",
    "all",
    "edited",
    "high",
    "TOFU",
    "Tom acolhedor; conectar maternidade, naturalidade e avaliação responsável.",
    null
  ),
  calendarItem(
    "sexta-resultado-tres-meses",
    "resultado-tres-meses",
    "2026-05-15",
    "Sexta-feira",
    "all",
    "scheduled",
    "high",
    "BOFU",
    "Transformar prova de resultado em educacao sobre tempo de maturacao.",
    "Meta Ads - Resultado 3 meses pós"
  ),
  calendarItem(
    "sabado-naturalidade",
    "nem-toda-mulher-exagero",
    "2026-05-16",
    "Sábado",
    "all",
    "scripted",
    "medium",
    "TOFU",
    "Gancho forte para TikTok/Reels e stories com caixa de perguntas sobre naturalidade.",
    "Meta Ads - Naturalidade"
  ),
  {
    id: "domingo-bastidores-autoridade",
    contentId: "bastidores-autoridade-medica",
    title: "Bastidores e autoridade médica",
    pillar: "Bastidores e rotina",
    funnelStage: "TOFU",
    scheduledDate: "2026-05-17",
    weekLabel: "Domingo",
    format: "stories",
    productionStatus: "planned",
    priority: "medium",
    objective: "Humanizar a rotina e reforçar autoridade sem promessa de resultado.",
    hook: "O que acontece antes de um conteúdo médico chegar até você?",
    cta: "Acompanhe os Stories da semana e envie dúvidas gerais sobre planejamento cirúrgico.",
    notes: "Sequência simples de bastidores, agenda, estudo e preparação da semana.",
    relatedCampaign: null,
    createdAt: baseDate,
    updatedAt: baseDate
  }
];

export function expandedFormats(format: EditorialFormat): EditorialFormat[] {
  if (format === "all") return ["stories", "reels", "shorts", "tiktok"];
  return [format];
}

export function filterEditorialCalendarItems(
  items: EditorialCalendarItem[],
  filters: EditorialCalendarFilters
): EditorialCalendarItem[] {
  return items.filter((item) => {
    if (filters.productionStatus && item.productionStatus !== filters.productionStatus) return false;
    if (filters.pillar && item.pillar !== filters.pillar) return false;
    if (filters.format && !expandedFormats(item.format).includes(filters.format)) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.funnelStage && item.funnelStage !== filters.funnelStage) return false;
    return true;
  });
}

export function buildEditorialCalendarIndicators(items: EditorialCalendarItem[]): EditorialCalendarIndicators {
  const byPillar: Record<string, number> = {};
  const byFunnelStage: Record<ContentFunnelStage, number> = { TOFU: 0, MOFU: 0, BOFU: 0 };
  const byFormat: Record<EditorialFormat, number> = {
    stories: 0,
    reels: 0,
    shorts: 0,
    tiktok: 0,
    carousel: 0,
    all: 0
  };

  for (const item of items) {
    byPillar[item.pillar] = (byPillar[item.pillar] ?? 0) + 1;
    byFunnelStage[item.funnelStage] += 1;
    byFormat[item.format] += 1;
    for (const format of expandedFormats(item.format)) {
      if (format !== item.format) byFormat[format] += 1;
    }
  }

  return {
    total: items.length,
    scripted: items.filter((item) => item.productionStatus === "scripted").length,
    recorded: items.filter((item) => item.productionStatus === "recorded").length,
    edited: items.filter((item) => item.productionStatus === "edited").length,
    scheduled: items.filter((item) => item.productionStatus === "scheduled").length,
    published: items.filter((item) => item.productionStatus === "published").length,
    highPriority: items.filter((item) => item.priority === "high").length,
    byPillar,
    byFunnelStage,
    byFormat,
    funnelBalance: `TOFU ${byFunnelStage.TOFU} / MOFU ${byFunnelStage.MOFU} / BOFU ${byFunnelStage.BOFU}`
  };
}

export function getEditorialBottlenecks(items: EditorialCalendarItem[]): string[] {
  const indicators = buildEditorialCalendarIndicators(items);
  const bottlenecks = new Set<string>();

  if (items.some((item) => item.productionStatus === "planned" || item.productionStatus === "scripted")) {
    bottlenecks.add("Falta gravar parte da semana.");
  }
  if (items.some((item) => item.productionStatus === "recorded")) bottlenecks.add("Falta editar conteúdos já gravados.");
  if (items.some((item) => item.productionStatus === "edited")) bottlenecks.add("Falta agendar conteúdos editados.");
  if (items.some((item) => !item.cta.trim())) bottlenecks.add("Há conteúdo sem CTA definido.");
  if (indicators.byFunnelStage.TOFU > indicators.byFunnelStage.BOFU + 2) bottlenecks.add("Excesso de TOFU em relacao a BOFU.");
  if (indicators.byFunnelStage.BOFU < 2) bottlenecks.add("Pouco BOFU para sustentar captação.");
  if (!items.some((item) => item.pillar === "Autoridade médica" || item.pillar === "Bastidores e rotina")) {
    bottlenecks.add("Pouca prova de autoridade na semana.");
  }
  if (indicators.byFormat.stories < 7) bottlenecks.add("Poucos conteúdos com apoio em Stories.");
  if (indicators.byFormat.all < 4) bottlenecks.add("Poucos conteúdos reaproveitáveis em múltiplas plataformas.");
  if (!items.some((item) => item.relatedCampaign)) bottlenecks.add("Ausência de conteúdo conectado a campanhas pagas.");

  return Array.from(bottlenecks);
}

export function formatLabel(value: EditorialFormat): string {
  return {
    stories: "Stories",
    reels: "Reels",
    shorts: "Shorts",
    tiktok: "TikTok",
    carousel: "Carrossel",
    all: "Stories + Reels/Shorts + TikTok"
  }[value];
}

export function productionStatusLabel(value: ProductionStatus): string {
  return {
    planned: "Planejado",
    scripted: "Roteirizado",
    recorded: "Gravado",
    edited: "Editado",
    scheduled: "Agendado",
    published: "Publicado"
  }[value];
}

export function priorityLabel(value: ContentPriority): string {
  return { low: "Baixa", medium: "Média", high: "Alta" }[value];
}

export { funnelStageLabel };
