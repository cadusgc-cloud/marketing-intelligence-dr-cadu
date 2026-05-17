import { buildWeeklyDataCollectionGuide } from "@/lib/weeklyDataCollectionGuide";
import type { WeeklyMarketingData } from "@/lib/weeklyDataInput";
import { isInsideDecember2025 } from "@/lib/utils/dates";

export type WeeklyCollectionReadinessStatus = "ready" | "needs_review" | "missing" | "blocked";

export type WeeklyCollectionSourceFieldReadiness = {
  id: string;
  label: string;
  appField: keyof WeeklyMarketingData | "notes";
  status: "ok" | "missing" | "review";
  valueLabel: string;
  detail: string;
};

export type WeeklyCollectionSourceReadiness = {
  id: string;
  title: string;
  sourceOwner: string;
  status: WeeklyCollectionReadinessStatus;
  score: number;
  summary: string;
  nextAction: string;
  fields: WeeklyCollectionSourceFieldReadiness[];
  evidence: string[];
  reviewNotes: string[];
  missingFields: string[];
  routeHref: string;
};

export type WeeklyCollectionReadinessBoard = {
  id: string;
  title: string;
  status: WeeklyCollectionReadinessStatus;
  score: number;
  summary: string;
  sources: WeeklyCollectionSourceReadiness[];
  priorityActions: string[];
  privacyGuardrails: string[];
  nextRoutes: Array<{ label: string; href: string; purpose: string }>;
};

export function buildWeeklyCollectionReadinessBoard(data: WeeklyMarketingData): WeeklyCollectionReadinessBoard {
  const guide = buildWeeklyDataCollectionGuide();
  const sources = [
    evaluateWeekIdentity(data),
    evaluateInstagramOrganic(data),
    evaluateMetaAds(data),
    evaluateGoogleAds(data),
    evaluateCommercialFunnel(data),
    evaluateExecutionContext(data)
  ];
  const score = round(sources.reduce((sum, source) => sum + source.score, 0) / sources.length);
  const status = summarizeBoardStatus(sources, data);

  return {
    id: `weekly-collection-readiness-${data.id || "draft"}`,
    title: "Prontidao da coleta por fonte",
    status,
    score,
    summary: buildBoardSummary(status, score, sources),
    sources,
    priorityActions: buildPriorityActions(sources),
    privacyGuardrails: [
      "Usar somente metricas agregadas e numeros consolidados por semana.",
      "Nao inserir nomes, telefones, DMs, conversas, prints privados ou informacao clinica.",
      "Nao conectar API, OAuth, scraping, WhatsApp, e-mail ou envio externo nesta fase.",
      "Nao usar Dezembro/2025 como benchmark normal, meta, media ou projecao.",
      "Revisar manualmente antes de salvar e antes de qualquer decisao de investimento."
    ],
    nextRoutes: [
      { label: "Pacote copiavel", href: "/data/collection-packet", purpose: "Copiar template, CSV e handoff interno." },
      { label: "Guia de coleta", href: "/data/collection-guide", purpose: "Conferir fonte e caminho manual de cada dado." },
      { label: "Dados semanais", href: "/data", purpose: "Preencher e salvar somente depois da revisao." },
      { label: "Weekly Command Center", href: "/weekly", purpose: "Ler a semana apenas depois de salvar os dados." }
    ].filter((route) => guide.routeFlow.some((item) => item.href === route.href) || route.href === "/data/collection-packet")
  };
}

export function getBlockingCollectionSources(board: WeeklyCollectionReadinessBoard): WeeklyCollectionSourceReadiness[] {
  return board.sources.filter((source) => source.status === "blocked");
}

export function getSourcesNeedingCollection(board: WeeklyCollectionReadinessBoard): WeeklyCollectionSourceReadiness[] {
  return board.sources.filter((source) => source.status === "missing" || source.status === "needs_review");
}

function evaluateWeekIdentity(data: WeeklyMarketingData): WeeklyCollectionSourceReadiness {
  const start = parseIsoDate(data.startDate);
  const end = parseIsoDate(data.endDate);
  const hasLabel = data.weekLabel.trim().length > 0;
  const hasValidDates = Boolean(start && end && data.endDate >= data.startDate);
  const december = isInsideDecember2025(start, end);
  const fields = [
    sourceField("week-label", "Rotulo da semana", "weekLabel", hasLabel ? "ok" : "missing", data.weekLabel || "vazio", hasLabel ? "Rotulo pronto." : "Informe um rotulo operacional curto."),
    sourceField("start-date", "Data de inicio", "startDate", start ? "ok" : "missing", data.startDate || "vazio", start ? "Inicio em formato valido." : "Use AAAA-MM-DD."),
    sourceField("end-date", "Data de fim", "endDate", end && (!start || data.endDate >= data.startDate) ? "ok" : "missing", data.endDate || "vazio", end ? "Fim em formato valido." : "Use AAAA-MM-DD.")
  ];
  const missingFields = fields.filter((field) => field.status === "missing").map((field) => field.label);
  const reviewNotes = [
    ...(start && end && data.endDate < data.startDate ? ["A data de fim nao pode ser anterior ao inicio."] : []),
    ...(december ? ["Periodo cruza Dezembro/2025; tratar como anomalia operacional e fora de benchmarks normais."] : [])
  ];
  const blocked = missingFields.length > 0 || Boolean(start && end && data.endDate < data.startDate);
  const status = blocked ? "blocked" : december ? "needs_review" : "ready";

  return sourceReadiness({
    id: "week-identity",
    title: "Identidade da semana",
    sourceOwner: "Cadu ou revisao humana",
    status,
    score: status === "ready" ? 100 : status === "needs_review" ? 75 : 0,
    summary: blocked ? "Periodo ou rotulo ainda bloqueiam o salvamento confiavel." : december ? "Semana identificada, mas marcada como anomalia operacional." : "Semana identificada e pronta para consolidar fontes.",
    nextAction: blocked ? "Definir rotulo, inicio e fim antes de coletar conclusoes." : december ? "Registrar anomalia em observacoes e nao usar como benchmark normal." : "Manter o mesmo periodo nas demais fontes.",
    fields,
    evidence: hasValidDates ? [`Periodo: ${data.startDate} a ${data.endDate}.`] : ["Periodo ainda incompleto."],
    reviewNotes,
    missingFields,
    routeHref: "/data"
  });
}

function evaluateInstagramOrganic(data: WeeklyMarketingData): WeeklyCollectionSourceReadiness {
  const fields = [
    numericSourceField("instagram-stories", "Stories publicados", "instagramStories", data.instagramStories, "Referencia operacional: 42 por semana."),
    numericSourceField("instagram-reels", "Reels/Shorts publicados", "instagramReels", data.instagramReels, "Referencia operacional: 3 por semana."),
    numericSourceField("instagram-posts", "Posts publicados", "instagramPosts", data.instagramPosts, "Total de posts/feed/carrossel no periodo."),
    numericSourceField("instagram-profile-visits", "Visitas ao perfil Instagram", "instagramProfileVisits", data.instagramProfileVisits, "Total agregado do periodo.")
  ];
  const hasAny = fields.some((field) => field.status === "ok");
  const reviewNotes = [
    ...(data.instagramStories > 0 && data.instagramStories < 42 ? ["Stories abaixo da referencia operacional; separar queda por cadencia de queda por qualidade."] : []),
    ...(data.instagramReels > 0 && data.instagramReels < 3 ? ["Reels/Shorts abaixo da referencia semanal; revisar cadencia antes de julgar criativo."] : [])
  ];
  const missingFields = fields.filter((field) => field.status === "missing").map((field) => field.label);
  const status = !hasAny ? "missing" : reviewNotes.length ? "needs_review" : "ready";

  return sourceReadiness({
    id: "instagram-organic",
    title: "Instagram organico",
    sourceOwner: "Instagram Insights, Meta Business Suite, Reportei ou calendario editorial",
    status,
    score: !hasAny ? 0 : status === "ready" ? 100 : 70,
    summary: !hasAny ? "Instagram ainda nao tem metricas agregadas preenchidas." : status === "ready" ? "Instagram tem volume minimo para leitura inicial." : "Instagram tem dados, mas a cadencia pede revisao.",
    nextAction: !hasAny ? "Abrir Insights/Reportei ou calendario e coletar Stories, Reels, posts e visitas ao perfil." : status === "ready" ? "Usar a semana no diagnostico e manter observacoes de alcance/impressoes se existirem." : "Revisar se a queda vem de volume antes de concluir problema de qualidade.",
    fields,
    evidence: [`Stories: ${data.instagramStories}.`, `Reels/Shorts: ${data.instagramReels}.`, `Posts: ${data.instagramPosts}.`, `Visitas ao perfil: ${data.instagramProfileVisits}.`],
    reviewNotes,
    missingFields,
    routeHref: "/data/collection-guide"
  });
}

function evaluateMetaAds(data: WeeklyMarketingData): WeeklyCollectionSourceReadiness {
  const fields = [
    numericSourceField("meta-spend", "Investimento Meta Ads", "metaSpend", data.metaSpend, "Valor gasto no periodo."),
    numericSourceField("meta-whatsapp", "Conversas Meta", "metaWhatsappConversations", data.metaWhatsappConversations, "Conversas agregadas atribuidas ao Meta."),
    numericSourceField("meta-profile-visits", "Visitas ao perfil Meta", "metaProfileVisits", data.metaProfileVisits, "Visitas agregadas quando disponiveis.")
  ];
  const hasAny = fields.some((field) => field.status === "ok");
  const hasCore = data.metaSpend > 0 && data.metaWhatsappConversations > 0;
  const reviewNotes = [
    ...(data.metaSpend > 0 && data.metaWhatsappConversations === 0 ? ["Ha investimento Meta sem conversas; revisar objetivo, coluna de resultado e periodo."] : []),
    ...(data.metaSpend === 0 && data.metaWhatsappConversations > 0 ? ["Ha conversas Meta sem investimento; conferir origem e periodo."] : [])
  ];
  const status = !hasAny ? "missing" : hasCore && !reviewNotes.length ? "ready" : "needs_review";

  return sourceReadiness({
    id: "meta-ads",
    title: "Meta Ads",
    sourceOwner: "Meta Ads Manager, Meta Business Suite ou Reportei",
    status,
    score: !hasAny ? 0 : status === "ready" ? 100 : 65,
    summary: !hasAny ? "Meta Ads ainda nao foi coletado." : status === "ready" ? "Meta tem investimento e conversas agregadas para leitura." : "Meta tem dados parciais que precisam de conferencia.",
    nextAction: !hasAny ? "Filtrar Meta pelo periodo e coletar investimento, conversas e visitas agregadas." : status === "ready" ? "Conferir custo por conversa no resumo calculado." : "Validar se resultado e conversa WhatsApp, nao clique generico.",
    fields,
    evidence: [`Investimento: ${formatCurrency(data.metaSpend)}.`, `Conversas: ${data.metaWhatsappConversations}.`, `Visitas Meta: ${data.metaProfileVisits}.`],
    reviewNotes,
    missingFields: fields.filter((field) => field.status === "missing").map((field) => field.label),
    routeHref: "/data/collection-guide"
  });
}

function evaluateGoogleAds(data: WeeklyMarketingData): WeeklyCollectionSourceReadiness {
  const fields = [
    numericSourceField("google-spend", "Investimento Google Ads", "googleSpend", data.googleSpend, "Valor gasto no periodo."),
    numericSourceField("google-clicks", "Cliques Google Ads", "googleClicks", data.googleClicks, "Cliques agregados."),
    numericSourceField("google-conversions", "Conversoes Google Ads", "googleConversions", data.googleConversions, "Conversoes agregadas rastreadas.")
  ];
  const hasAny = data.googleSpend > 0 || data.googleClicks > 0 || data.googleConversions > 0;
  const reviewNotes = [
    ...(data.googleSpend > 0 && data.googleConversions === 0 ? ["Google tem investimento com conversoes zeradas; manter em diagnostico antes de escalar."] : []),
    ...(data.googleClicks > 0 && data.googleConversions === 0 ? ["Cliques sem conversao exigem revisao de tracking, intencao e pagina."] : [])
  ];
  const status = !hasAny ? "missing" : reviewNotes.length ? "needs_review" : "ready";

  return sourceReadiness({
    id: "google-ads",
    title: "Google Ads",
    sourceOwner: "Google Ads ou relatorio consolidado",
    status,
    score: !hasAny ? 0 : status === "ready" ? 100 : 60,
    summary: !hasAny ? "Google Ads ainda nao foi coletado." : status === "ready" ? "Google tem dados suficientes para leitura inicial." : "Google tem dado, mas segue em diagnostico por conversao ou tracking.",
    nextAction: !hasAny ? "Filtrar Google Ads pelo mesmo periodo e coletar custo, cliques e conversoes." : status === "ready" ? "Revisar taxa de conversao no painel calculado." : "Nao escalar Google automaticamente; revisar tracking antes.",
    fields,
    evidence: [`Investimento: ${formatCurrency(data.googleSpend)}.`, `Cliques: ${data.googleClicks}.`, `Conversoes: ${data.googleConversions}.`],
    reviewNotes,
    missingFields: fields.filter((field) => field.status === "missing").map((field) => field.label),
    routeHref: "/data/collection-guide"
  });
}

function evaluateCommercialFunnel(data: WeeklyMarketingData): WeeklyCollectionSourceReadiness {
  const fields = [
    numericSourceField("whatsapp-total", "WhatsApps totais", "whatsappTotal", data.whatsappTotal, "Total agregado de conversas."),
    numericSourceField("qualified-conversations", "Conversas qualificadas", "qualifiedConversations", data.qualifiedConversations, "Total agregado apos triagem."),
    nullableSourceField("consultations-scheduled", "Consultas marcadas", "consultationsScheduled", data.consultationsScheduled, "Vazio significa dado ausente; zero significa nenhum agendamento."),
    nullableSourceField("consultations-attended", "Consultas comparecidas", "consultationsAttended", data.consultationsAttended, "Vazio significa dado ausente; zero significa nenhum comparecimento."),
    nullableSourceField("surgeries-closed", "Cirurgias fechadas", "surgeriesClosed", data.surgeriesClosed, "Vazio significa dado ausente; zero significa nenhum fechamento.")
  ];
  const hasAny = data.whatsappTotal > 0 || data.qualifiedConversations > 0 || data.consultationsScheduled !== null || data.consultationsAttended !== null || data.surgeriesClosed !== null;
  const hasFullFunnel = data.whatsappTotal > 0 && data.qualifiedConversations > 0 && data.consultationsScheduled !== null && data.consultationsAttended !== null && data.surgeriesClosed !== null;
  const reviewNotes = [
    ...(data.consultationsScheduled === null ? ["Consultas marcadas ausentes; nao concluir qualidade do funil."] : []),
    ...(data.consultationsAttended === null ? ["Consultas comparecidas ausentes; taxa de comparecimento ficara sem leitura."] : []),
    ...(data.surgeriesClosed === null ? ["Cirurgias fechadas ausentes; fechamento ficara sem leitura."] : []),
    ...(data.whatsappTotal > 0 && data.qualifiedConversations === 0 ? ["WhatsApps sem conversas qualificadas; revisar criterio de qualificacao."] : [])
  ];
  const status = !hasAny ? "missing" : hasFullFunnel && !reviewNotes.length ? "ready" : "needs_review";

  return sourceReadiness({
    id: "commercial-funnel",
    title: "WhatsApp e funil comercial",
    sourceOwner: "Planilha interna, atendimento, agenda ou CRM simples",
    status,
    score: !hasAny ? 0 : status === "ready" ? 100 : 55,
    summary: !hasAny ? "Funil comercial ainda nao foi coletado." : status === "ready" ? "Funil tem dados agregados suficientes para leitura." : "Funil tem lacunas que limitam conclusoes de qualidade e conversao.",
    nextAction: !hasAny ? "Coletar apenas totais agregados de WhatsApps, qualificadas, consultas e fechamentos." : status === "ready" ? "Usar funil para separar demanda, atendimento e fechamento." : "Completar consultas/comparecimentos/fechamentos antes de concluir qualidade dos leads.",
    fields,
    evidence: [`WhatsApps: ${data.whatsappTotal}.`, `Qualificadas: ${data.qualifiedConversations}.`, `Consultas: ${data.consultationsScheduled ?? "ausente"}.`, `Comparecidas: ${data.consultationsAttended ?? "ausente"}.`, `Fechadas: ${data.surgeriesClosed ?? "ausente"}.`],
    reviewNotes,
    missingFields: fields.filter((field) => field.status === "missing").map((field) => field.label),
    routeHref: "/data/collection-guide"
  });
}

function evaluateExecutionContext(data: WeeklyMarketingData): WeeklyCollectionSourceReadiness {
  const sensitiveFlags = detectSensitiveNoteFlags(data.notes);
  const hasNotes = data.notes.trim().length > 0;
  const status: WeeklyCollectionReadinessStatus = sensitiveFlags.length ? "blocked" : hasNotes ? "ready" : "needs_review";
  const fields = [
    sourceField(
      "notes",
      "Observacoes agregadas",
      "notes",
      sensitiveFlags.length ? "review" : hasNotes ? "ok" : "missing",
      hasNotes ? "preenchido" : "vazio",
      hasNotes ? "Observacoes ajudam a interpretar cadencia, anomalia e tracking." : "Adicione contexto operacional sem dados pessoais."
    )
  ];

  return sourceReadiness({
    id: "execution-context",
    title: "Contexto editorial e anomalias",
    sourceOwner: "Revisao humana e calendario editorial",
    status,
    score: status === "ready" ? 100 : status === "needs_review" ? 45 : 0,
    summary: sensitiveFlags.length ? "Observacoes podem conter dado sensivel ou identificavel." : hasNotes ? "Contexto operacional registrado." : "Contexto ainda ausente; diagnostico pode ficar menos explicavel.",
    nextAction: sensitiveFlags.length ? "Remover qualquer dado pessoal ou identificavel antes de salvar." : hasNotes ? "Manter observacao curta e agregada." : "Registrar feriados, baixa cadencia, anomalias ou tracking duvidoso sem dados pessoais.",
    fields,
    evidence: hasNotes ? [`Observacoes com ${data.notes.trim().length} caracteres.`] : ["Sem observacoes."],
    reviewNotes: sensitiveFlags.length ? sensitiveFlags : ["Se houve anomalia, registrar sem nomes, prints ou informacao clinica."],
    missingFields: hasNotes ? [] : ["Observacoes agregadas"],
    routeHref: "/data"
  });
}

function sourceField(
  id: string,
  label: string,
  appField: WeeklyCollectionSourceFieldReadiness["appField"],
  status: WeeklyCollectionSourceFieldReadiness["status"],
  valueLabel: string,
  detail: string
): WeeklyCollectionSourceFieldReadiness {
  return { id, label, appField, status, valueLabel, detail };
}

function numericSourceField(
  id: string,
  label: string,
  appField: keyof WeeklyMarketingData,
  value: number,
  detail: string
): WeeklyCollectionSourceFieldReadiness {
  return sourceField(id, label, appField, value > 0 ? "ok" : "missing", String(value), detail);
}

function nullableSourceField(
  id: string,
  label: string,
  appField: keyof WeeklyMarketingData,
  value: number | null,
  detail: string
): WeeklyCollectionSourceFieldReadiness {
  return sourceField(id, label, appField, value === null ? "missing" : "ok", value === null ? "ausente" : String(value), detail);
}

function sourceReadiness(source: WeeklyCollectionSourceReadiness): WeeklyCollectionSourceReadiness {
  return source;
}

function summarizeBoardStatus(sources: WeeklyCollectionSourceReadiness[], data: WeeklyMarketingData): WeeklyCollectionReadinessStatus {
  if (sources.some((source) => source.status === "blocked")) return "blocked";
  const usableSources = sources.filter((source) => source.status === "ready" || source.status === "needs_review").length;
  if (usableSources <= 2 && !data.weekLabel.trim()) return "missing";
  if (sources.every((source) => source.status === "ready")) return "ready";
  return "needs_review";
}

function buildBoardSummary(status: WeeklyCollectionReadinessStatus, score: number, sources: WeeklyCollectionSourceReadiness[]): string {
  const missing = sources.filter((source) => source.status === "missing").length;
  const review = sources.filter((source) => source.status === "needs_review").length;
  if (status === "ready") return `Coleta pronta para salvar. Score ${score}/100, com todas as fontes essenciais em estado adequado.`;
  if (status === "blocked") return `Ha bloqueio antes de salvar. Score ${score}/100; revise periodo, observacoes e privacidade.`;
  if (status === "missing") return `Coleta ainda inicial. Score ${score}/100; preencha identidade da semana e fontes principais.`;
  return `Coleta utilizavel com revisao. Score ${score}/100; ${missing} fonte(s) ausente(s) e ${review} fonte(s) pedem conferencia.`;
}

function buildPriorityActions(sources: WeeklyCollectionSourceReadiness[]): string[] {
  const actions = sources
    .filter((source) => source.status !== "ready")
    .sort((a, b) => statusWeight(a.status) - statusWeight(b.status) || a.score - b.score)
    .map((source) => `${source.title}: ${source.nextAction}`);

  return actions.length
    ? actions.slice(0, 5)
    : [
        "Salvar a semana em /data depois da revisao humana.",
        "Abrir /weekly para ler diagnostico e prioridades.",
        "Registrar aprendizados sem enviar recomendacoes automaticamente."
      ];
}

function statusWeight(status: WeeklyCollectionReadinessStatus): number {
  return {
    blocked: 0,
    missing: 1,
    needs_review: 2,
    ready: 3
  }[status];
}

function detectSensitiveNoteFlags(notes: string): string[] {
  const normalized = notes.toLocaleLowerCase("pt-BR");
  const flags: string[] = [];
  if (/\bcpf\b|\brg\b/.test(normalized)) flags.push("Observacoes parecem citar documento pessoal; remover antes de salvar.");
  if (/telefone|celular|whatsapp pessoal/.test(normalized)) flags.push("Observacoes parecem citar contato individual; manter apenas contagens agregadas.");
  if (/nome\s*:|paciente\s*:|prontuario\s*:|prontu[aá]rio\s*:/.test(normalized)) flags.push("Observacoes parecem conter identificacao clinica ou individual; remover antes de salvar.");
  if (/print privado|conversa individual|dm individual|direct individual/.test(normalized)) flags.push("Observacoes parecem depender de conversa ou print individual; usar apenas resumo agregado.");
  return unique(flags);
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? null : parsed;
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function round(value: number): number {
  return Math.round(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
