export type WeeklyAuditChannel = "meta" | "google" | "instagram" | "content" | "funnel" | "budget";
export type WeeklyAuditClassification =
  | "clear_win"
  | "partial_win"
  | "operational_error"
  | "silent_risk"
  | "missed_opportunity"
  | "needs_more_data";
export type WeeklyAuditImpact = "low" | "medium" | "high";
export type WeeklyAuditConfidence = "low" | "medium" | "high";
export type WeeklyAuditOwner = "internal" | "agency" | "cadu" | "unknown";
export type WeeklyAuditStatus = "open" | "monitoring" | "resolved" | "ignored";

export type WeeklyAuditDecision = {
  id: string;
  date: string;
  channel: WeeklyAuditChannel;
  title: string;
  description: string;
  classification: WeeklyAuditClassification;
  impact: WeeklyAuditImpact;
  confidence: WeeklyAuditConfidence;
  evidence: string;
  recommendation: string;
  nextAction: string;
  owner: WeeklyAuditOwner;
  status: WeeklyAuditStatus;
  relatedMetric: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WeeklyAuditSummary = {
  weekLabel: string;
  startDate: string;
  endDate: string;
  executiveDiagnosis: string;
  metaDecision: string;
  googleDecision: string;
  organicDecision: string;
  contentDecision: string;
  funnelDiagnosis: string;
  budgetDiagnosis: string;
  mainRisk: string;
  mainOpportunity: string;
  next72hPlan: string[];
};

export type WeeklyAuditFilters = {
  channel?: WeeklyAuditChannel;
  classification?: WeeklyAuditClassification;
  impact?: WeeklyAuditImpact;
  status?: WeeklyAuditStatus;
};

const baseDate = new Date("2026-05-09T12:00:00.000Z");

export const WEEKLY_AUDIT_SUMMARY: WeeklyAuditSummary = {
  weekLabel: "Auditoria interna até 31/07/2026",
  startDate: "2026-05-04",
  endDate: "2026-05-10",
  executiveDiagnosis:
    "Meta Ads deve continuar como canal principal de escala, enquanto Google Ads permanece em diagnóstico até a conversão ficar confiável. A rotina de conteúdo precisa sustentar o funil com Stories e reaproveitamento semanal.",
  metaDecision: "Escalar com prioridade os aprendizados de BOFU WhatsApp Escala.",
  googleDecision: "Não escalar Google Ads enquanto as conversões estiverem zeradas ou inconsistentes.",
  organicDecision: "Instagram orgânico precisa sustentar as visitas geradas pelo tráfego pago.",
  contentDecision: "Cada ideia relevante deve virar Stories, Reels/Shorts e TikTok quando fizer sentido.",
  funnelDiagnosis: "Topo e meio precisam alimentar o BOFU sem dispersar verba em testes fracos.",
  budgetDiagnosis: "Orçamento deve proteger campanhas confiáveis e limitar termos genéricos.",
  mainRisk: "Risco silencioso de aumentar investimento antes de corrigir rastreamento e sustentacao organica.",
  mainOpportunity: "Transformar criativos vencedores em rotina semanal de conteúdo e prova de autoridade.",
  next72hPlan: [
    "Manter Meta Ads como canal principal de escala.",
    "Pausar ou reduzir prioridade de BOFU Teste ABO.",
    "Validar rastreamento de conversões do Google Ads antes de ampliar verba.",
    "Separar Ubá em campanha própria ou negativar quando atrapalhar a leitura.",
    "Garantir Stories diários como parte do funil."
  ]
};

export const WEEKLY_AUDIT_DECISIONS: WeeklyAuditDecision[] = [
  {
    id: "meta-canal-principal-escala",
    date: "2026-05-04",
    channel: "meta",
    title: "Meta Ads deve seguir como canal principal de escala",
    description: "Meta Ads concentra os sinais mais confiáveis de aprendizado, volume e criativos acionáveis.",
    classification: "clear_win",
    impact: "high",
    confidence: "high",
    evidence: "Criativos BOFU com CPL baixo e volume util de conversas.",
    recommendation: "Proteger verba de Meta Ads antes de ampliar canais menos rastreáveis.",
    nextAction: "Priorizar escala controlada em campanhas e criativos vencedores.",
    owner: "agency",
    status: "monitoring",
    relatedMetric: "CPL Meta e conversas no WhatsApp",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "bofu-whatsapp-escala-confiavel",
    date: "2026-05-04",
    channel: "funnel",
    title: "BOFU WhatsApp Escala e motor confiavel",
    description: "A campanha apresenta sinal consistente para captacao e deve ser tratada como motor do fundo de funil.",
    classification: "clear_win",
    impact: "high",
    confidence: "high",
    evidence: "Volume de conversas e criativos vencedores abaixo do CPL alvo.",
    recommendation: "Escalar com cautela e criar variações dos criativos vencedores.",
    nextAction: "Produzir novas variacoes de prova, naturalidade e pesquisa ativa.",
    owner: "agency",
    status: "monitoring",
    relatedMetric: "Conversas BOFU",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "bofu-teste-abo-pausar",
    date: "2026-05-05",
    channel: "meta",
    title: "BOFU Teste ABO deve ser pausado ou perder prioridade",
    description: "O teste não deve disputar verba com campanhas mais confiáveis enquanto não mostrar ganho claro.",
    classification: "operational_error",
    impact: "medium",
    confidence: "medium",
    evidence: "Teste sem sinal superior ao motor BOFU principal.",
    recommendation: "Pausar, reduzir verba ou manter apenas como experimento controlado.",
    nextAction: "Realocar prioridade para BOFU WhatsApp Escala.",
    owner: "agency",
    status: "open",
    relatedMetric: "CPL por campanha",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "tofu-cbo-melhorou",
    date: "2026-05-05",
    channel: "funnel",
    title: "TOFU Teste CBO performou melhor que TOFU Escala antigo",
    description: "O teste de topo mostrou sinal melhor que a estrutura antiga e merece monitoramento.",
    classification: "partial_win",
    impact: "medium",
    confidence: "medium",
    evidence: "Melhor resposta de alcance e distribuicao no topo de funil.",
    recommendation: "Manter teste CBO com limite de verba e comparar por periodo.",
    nextAction: "Revisar criativos de topo e acompanhar queda/recuperacao de alcance.",
    owner: "agency",
    status: "monitoring",
    relatedMetric: "Alcance e seguidores",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "google-nao-escalar-sem-conversao",
    date: "2026-05-06",
    channel: "google",
    title: "Google Ads não deve escalar enquanto conversões estiverem zeradas",
    description: "Sem conversão confiável, Google Ads deve permanecer em diagnóstico, não em escala.",
    classification: "silent_risk",
    impact: "high",
    confidence: "high",
    evidence: "Conversões zeradas ou inconsistentes impedem a leitura do CPA real.",
    recommendation: "Corrigir rastreamento antes de aumentar verba.",
    nextAction: "Auditar tag, evento e importacao de conversões.",
    owner: "agency",
    status: "open",
    relatedMetric: "Conversões Google",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "google-intencao-melhorou",
    date: "2026-05-06",
    channel: "google",
    title: "Google melhorou intencao em abril/maio, mas precisa rastrear conversões",
    description: "Termos mais próximos da intenção cirúrgica apareceram, mas sem conversão confiável o canal segue em diagnóstico.",
    classification: "partial_win",
    impact: "medium",
    confidence: "medium",
    evidence: "Keywords de cirurgia plástica ganharam relevância, mas a conversão ainda precisa de validação.",
    recommendation: "Manter leitura qualitativa e não escalar ainda.",
    nextAction: "Separar termos de intencao real de consultas genericas.",
    owner: "agency",
    status: "monitoring",
    relatedMetric: "Cliques e conversões Google",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "cirurgia-estetica-generico",
    date: "2026-05-07",
    channel: "google",
    title: "Cirurgia estetica deve ser limitada ou pausada",
    description: "Termo genérico demais pode consumir verba sem representar intenção clara de procedimento.",
    classification: "missed_opportunity",
    impact: "medium",
    confidence: "high",
    evidence: "Busca ampla, pouco especifica e com risco de baixa qualificacao.",
    recommendation: "Limitar correspondencia, pausar ou mover para experimento com baixa verba.",
    nextAction: "Adicionar negativas e priorizar termos de procedimento.",
    owner: "agency",
    status: "open",
    relatedMetric: "CPA por keyword",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "uba-separar-negativar",
    date: "2026-05-07",
    channel: "budget",
    title: "Ubá deve ser separada em campanha própria ou negativada",
    description: "Misturar Ubá com a leitura geral pode distorcer a decisão de orçamento e intenção.",
    classification: "needs_more_data",
    impact: "medium",
    confidence: "medium",
    evidence: "Localidade pode ter comportamento diferente e precisa leitura propria.",
    recommendation: "Separar campanha, ajustar geografico ou negativar quando atrapalhar leitura.",
    nextAction: "Comparar volume, custo e qualidade por localidade.",
    owner: "agency",
    status: "open",
    relatedMetric: "Custo por localidade",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "organico-sustentar-visitas",
    date: "2026-05-08",
    channel: "instagram",
    title: "Instagram orgânico precisa sustentar visitas do tráfego pago",
    description: "Visitas ao perfil geradas por tráfego pago perdem força se o perfil não sustentar autoridade e prova.",
    classification: "silent_risk",
    impact: "high",
    confidence: "high",
    evidence: "Criativos podem gerar visita sem conversa quando o perfil não fecha a confiança.",
    recommendation: "Aumentar cadência de Stories, prova social e conteúdos de autoridade.",
    nextAction: "Garantir stories diarios e destaques alinhados aos procedimentos prioritarios.",
    owner: "internal",
    status: "open",
    relatedMetric: "Visitas ao perfil e conversas",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "stories-parte-do-funil",
    date: "2026-05-08",
    channel: "content",
    title: "Stories devem ser tratados como parte do funil",
    description: "Stories não são enfeite: sustentam recorrência, confiança e resposta ao tráfego pago.",
    classification: "missed_opportunity",
    impact: "high",
    confidence: "high",
    evidence: "Queda de cadencia de stories afeta nutricao e reduz contexto para visitantes.",
    recommendation: "Planejar mínimo de 6 Stories por dia conectados aos temas pagos.",
    nextAction: "Criar pauta diária de Stories com CTA para WhatsApp.",
    owner: "internal",
    status: "open",
    relatedMetric: "Story count e retencao",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "reaproveitar-ideias",
    date: "2026-05-09",
    channel: "content",
    title: "Cada ideia relevante deve virar Stories, Reels/Shorts e TikTok",
    description: "A mesma ideia precisa ser reaproveitada em formatos diferentes para ganhar volume sem dispersar estrategia.",
    classification: "clear_win",
    impact: "medium",
    confidence: "high",
    evidence: "Content Studio e Calendário editorial ja organizam reaproveitamento por formato.",
    recommendation: "Transformar ideias vencedoras em rotina de produção semanal.",
    nextAction: "Revisar calendário e garantir roteiro, gravação, edição e agendamento.",
    owner: "internal",
    status: "monitoring",
    relatedMetric: "Conteúdos reaproveitaveis",
    createdAt: baseDate,
    updatedAt: baseDate
  }
];

export function filterWeeklyAuditDecisions(
  decisions: WeeklyAuditDecision[],
  filters: WeeklyAuditFilters
): WeeklyAuditDecision[] {
  return decisions.filter((decision) => {
    if (filters.channel && decision.channel !== filters.channel) return false;
    if (filters.classification && decision.classification !== filters.classification) return false;
    if (filters.impact && decision.impact !== filters.impact) return false;
    if (filters.status && decision.status !== filters.status) return false;
    return true;
  });
}

export function countByClassification(decisions: WeeklyAuditDecision[]): Record<WeeklyAuditClassification, number> {
  return countBy(decisions, "classification", {
    clear_win: 0,
    partial_win: 0,
    operational_error: 0,
    silent_risk: 0,
    missed_opportunity: 0,
    needs_more_data: 0
  });
}

export function countByChannel(decisions: WeeklyAuditDecision[]): Record<WeeklyAuditChannel, number> {
  return countBy(decisions, "channel", {
    meta: 0,
    google: 0,
    instagram: 0,
    content: 0,
    funnel: 0,
    budget: 0
  });
}

export function getHighImpactRisks(decisions: WeeklyAuditDecision[]): WeeklyAuditDecision[] {
  return decisions.filter(
    (decision) =>
      decision.impact === "high" &&
      (decision.classification === "silent_risk" || decision.classification === "operational_error")
  );
}

export function getHighImpactOpportunities(decisions: WeeklyAuditDecision[]): WeeklyAuditDecision[] {
  return decisions.filter(
    (decision) =>
      decision.impact === "high" &&
      (decision.classification === "clear_win" ||
        decision.classification === "partial_win" ||
        decision.classification === "missed_opportunity")
  );
}

export function generateWeeklyAuditExecutiveSummary(
  decisions: WeeklyAuditDecision[] = WEEKLY_AUDIT_DECISIONS,
  summary: WeeklyAuditSummary = WEEKLY_AUDIT_SUMMARY
): string {
  const risks = getHighImpactRisks(decisions).length;
  const opportunities = getHighImpactOpportunities(decisions).length;
  return `${summary.weekLabel}: ${summary.metaDecision} Google Ads permanece em diagnóstico até corrigir conversões. Foram identificados ${risks} risco(s) de alto impacto e ${opportunities} oportunidade(s) de alto impacto.`;
}

function countBy<T extends string, K extends keyof WeeklyAuditDecision>(
  decisions: WeeklyAuditDecision[],
  key: K,
  initial: Record<T, number>
): Record<T, number> {
  const result = { ...initial };
  for (const decision of decisions) {
    const value = decision[key] as unknown as T;
    result[value] = (result[value] ?? 0) + 1;
  }
  return result;
}

export function channelLabel(value: WeeklyAuditChannel): string {
  return {
    meta: "Meta Ads",
    google: "Google Ads",
    instagram: "Instagram orgânico",
    content: "Conteúdo/Calendario",
    funnel: "Funil",
    budget: "Orcamento"
  }[value];
}

export function classificationLabel(value: WeeklyAuditClassification): string {
  return {
    clear_win: "Acerto claro",
    partial_win: "Acerto parcial",
    operational_error: "Erro operacional",
    silent_risk: "Risco silencioso",
    missed_opportunity: "Oportunidade perdida",
    needs_more_data: "Precisa de mais dados"
  }[value];
}

export function impactLabel(value: WeeklyAuditImpact): string {
  return { low: "Baixo", medium: "Médio", high: "Alto" }[value];
}

export function confidenceLabel(value: WeeklyAuditConfidence): string {
  return { low: "Baixa", medium: "Média", high: "Alta" }[value];
}

export function ownerLabel(value: WeeklyAuditOwner): string {
  return { internal: "Equipe interna", agency: "Agência", cadu: "Dr. Cadu", unknown: "Não definido" }[value];
}

export function statusLabel(value: WeeklyAuditStatus): string {
  return { open: "Aberto", monitoring: "Monitorando", resolved: "Resolvido", ignored: "Ignorado" }[value];
}
