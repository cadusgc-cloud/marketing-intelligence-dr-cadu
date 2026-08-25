import type { CanonicalReportField, ReportSource, SourceSchemaPreset } from "@/lib/report-imports/types";

const commonHeaders: Record<CanonicalReportField, string[]> = {
  date: ["data", "date", "dia", "created at", "criado em", "periodo", "horario de publicacao", "publish time", "data de publicacao", "publish date"],
  channel: ["canal", "channel", "rede", "network", "plataforma"],
  profile: ["perfil", "profile", "conta", "account"],
  format: ["formato", "format", "tipo", "content type", "tipo de conteudo", "tipo de publicacao", "post type"],
  title: ["titulo", "title", "publicacao", "postagem", "ad", "campaign", "campanha"],
  theme: ["tema", "theme", "assunto"],
  pillar: ["pilar", "pillar", "linha editorial"],
  caption: ["legenda", "caption", "texto", "copy", "descricao"],
  reach: ["alcance", "reach", "total de alcance", "total de alcance das postagens"],
  impressions: ["impressoes", "impressions", "total de impressoes", "visualizacoes"],
  likes: ["curtidas", "likes", "reactions", "reacoes"],
  comments: ["comentarios", "comments"],
  shares: ["compartilhamentos", "shares", "share"],
  saves: ["salvamentos", "saves", "saved"],
  replies: ["respostas", "replies", "story replies"],
  clicks: ["cliques", "clicks", "link clicks", "cliques no link"],
  profileVisits: ["visitas ao perfil", "profile visits", "visitas do perfil organicas"],
  follows: ["comecaram a seguir", "follows", "seguidores ganhos", "new followers"],
  dms: ["dms", "mensagens", "dm iniciadas", "mensagens iniciadas"],
  engagement: ["engajamento", "engagement", "taxa de engajamento"],
  link: ["link", "url", "permalink"],
  spend: ["gasto", "valor gasto", "spend", "cost", "investimento"],
  cpc: ["cpc", "custo por clique"],
  cpm: ["cpm"],
  ctr: ["ctr", "taxa de clique"],
  frequency: ["frequencia", "frequency"],
  leads: ["leads", "cadastros"],
  results: ["resultados", "results", "conversions", "conversoes"],
  effort: ["esforco", "effort", "nivel de esforco"],
  risk: ["risco", "risk", "safety"],
  status: ["status", "situacao"],
  media: ["midia", "media", "asset"],
  notes: ["observacoes", "notes", "obs"],
  unknown: []
};

export const sourceSchemaPresets: Record<ReportSource, SourceSchemaPreset> = {
  reportei: {
    source: "reportei",
    label: "Reportei",
    requiredFields: ["date", "format"],
    recommendedFields: ["channel", "title", "reach", "impressions", "likes", "comments", "shares", "saves"],
    acceptedHeaders: commonHeaders
  },
  instagram: {
    source: "instagram",
    label: "Instagram Insights",
    requiredFields: ["date", "format"],
    recommendedFields: ["caption", "reach", "impressions", "likes", "comments", "shares", "saves", "replies", "profileVisits", "follows"],
    acceptedHeaders: commonHeaders
  },
  meta_ads: {
    source: "meta_ads",
    label: "Meta Ads manual",
    requiredFields: ["date"],
    recommendedFields: ["title", "spend", "reach", "impressions", "clicks", "cpc", "cpm", "ctr", "frequency", "results", "leads"],
    acceptedHeaders: commonHeaders
  },
  etus_manual: {
    source: "etus_manual",
    label: "Etus/manual",
    requiredFields: ["date", "channel", "format"],
    recommendedFields: ["title", "caption", "status", "media", "notes"],
    acceptedHeaders: commonHeaders
  },
  google_sheets: {
    source: "google_sheets",
    label: "Google Sheets manual",
    requiredFields: ["date", "channel", "format"],
    recommendedFields: ["theme", "pillar", "reach", "impressions", "saves", "shares", "effort", "risk"],
    acceptedHeaders: commonHeaders
  },
  generic: {
    source: "generic",
    label: "CSV/TSV generico",
    requiredFields: ["date"],
    recommendedFields: ["channel", "format", "theme", "pillar", "reach", "impressions", "saves", "shares", "effort"],
    acceptedHeaders: commonHeaders
  },
  manual: {
    source: "manual",
    label: "Entrada manual simplificada",
    requiredFields: ["date"],
    recommendedFields: ["channel", "format", "theme", "pillar", "reach", "impressions", "saves", "shares"],
    acceptedHeaders: commonHeaders
  }
};

export function getSourcePreset(source: ReportSource): SourceSchemaPreset {
  return sourceSchemaPresets[source] ?? sourceSchemaPresets.generic;
}

export function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}
