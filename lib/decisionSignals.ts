export type DecisionSignalChannel = "meta" | "google" | "instagram" | "content" | "funnel" | "budget";
export type DecisionOperator = "lt" | "lte" | "gt" | "gte" | "eq" | "neq" | "contains" | "missing";
export type DecisionSeverity = "low" | "medium" | "high" | "critical";
export type DecisionType = "scale" | "maintain" | "reduce" | "pause" | "test" | "investigate" | "restructure";
export type RelatedAuditClassification =
  | "clear_win"
  | "partial_win"
  | "operational_error"
  | "silent_risk"
  | "missed_opportunity"
  | "needs_more_data";
export type SignalConfidence = "low" | "medium" | "high";

export type DecisionSignalInput = {
  id: string;
  periodLabel: string;
  channel: DecisionSignalChannel;
  metric: string;
  value: number | string | null;
  unit: string;
  context: string;
  source: string;
  createdAt: Date;
};

export type DecisionRule = {
  id: string;
  channel: DecisionSignalChannel;
  title: string;
  conditionDescription: string;
  metric: string;
  operator: DecisionOperator;
  threshold: number | string | null;
  severity: DecisionSeverity;
  decisionType: DecisionType;
  recommendation: string;
  nextAction: string;
  rationale: string;
  relatedAuditClassification: RelatedAuditClassification;
};

export type DecisionSignalResult = {
  id: string;
  ruleId: string;
  inputId: string;
  channel: DecisionSignalChannel;
  title: string;
  triggered: boolean;
  severity: DecisionSeverity;
  decisionType: DecisionType;
  recommendation: string;
  nextAction: string;
  rationale: string;
  confidence: SignalConfidence;
};

const baseDate = new Date("2026-05-09T12:00:00.000Z");

export const DECISION_RULES: DecisionRule[] = [
  {
    id: "meta-bofu-whatsapp-scale",
    channel: "meta",
    title: "BOFU WhatsApp com custo excelente",
    conditionDescription: "Se custo por WhatsApp BOFU for menor que R$ 6,50, considerar escalar.",
    metric: "meta_bofu_whatsapp_cost",
    operator: "lt",
    threshold: 6.5,
    severity: "high",
    decisionType: "scale",
    recommendation: "Escalar Meta BOFU com cautela, protegendo criativos vencedores.",
    nextAction: "Aumentar verba gradualmente e criar novas variacoes de prova/resultado.",
    rationale: "Meta Ads segue como canal principal de escala quando BOFU entrega WhatsApp barato.",
    relatedAuditClassification: "clear_win"
  },
  {
    id: "meta-bofu-whatsapp-maintain",
    channel: "meta",
    title: "BOFU WhatsApp em zona de monitoramento",
    conditionDescription: "Se custo por WhatsApp BOFU ficar entre R$ 6,50 e R$ 8,00, manter e monitorar.",
    metric: "meta_bofu_whatsapp_cost",
    operator: "lte",
    threshold: 8,
    severity: "medium",
    decisionType: "maintain",
    recommendation: "Manter campanha e acompanhar variacao diaria antes de escalar.",
    nextAction: "Comparar criativos e segurar aumento de verba ate estabilizar.",
    rationale: "A faixa ainda pode ser saudável, mas não justifica escala agressiva.",
    relatedAuditClassification: "partial_win"
  },
  {
    id: "meta-bofu-whatsapp-review",
    channel: "meta",
    title: "BOFU WhatsApp acima do limite",
    conditionDescription: "Se custo por conversa no WhatsApp BOFU passar de R$ 8,00, não escalar; revisar criativo.",
    metric: "meta_bofu_whatsapp_cost",
    operator: "gt",
    threshold: 8,
    severity: "high",
    decisionType: "investigate",
    recommendation: "Não escalar BOFU; revisar criativo, público e oferta.",
    nextAction: "Comparar contra BOFU WhatsApp Escala e pausar conjuntos fracos.",
    rationale: "Custo acima do limite reduz previsibilidade de captacao.",
    relatedAuditClassification: "operational_error"
  },
  {
    id: "meta-tofu-profile-visit-scale",
    channel: "meta",
    title: "TOFU com visita barata",
    conditionDescription: "Se custo por visita ao perfil TOFU for menor que R$ 0,14, considerar escalar.",
    metric: "meta_tofu_profile_visit_cost",
    operator: "lt",
    threshold: 0.14,
    severity: "medium",
    decisionType: "scale",
    recommendation: "Escalar TOFU com criativos que geram visita qualificada.",
    nextAction: "Aumentar verba com limite e sustentar perfil com stories diarios.",
    rationale: "Visita barata só vale se o orgânico sustentar confiança depois do clique.",
    relatedAuditClassification: "partial_win"
  },
  {
    id: "meta-tofu-profile-visit-review",
    channel: "meta",
    title: "TOFU com visita cara",
    conditionDescription: "Se custo por visita ao perfil TOFU passar de R$ 0,20, revisar criativo/publico.",
    metric: "meta_tofu_profile_visit_cost",
    operator: "gt",
    threshold: 0.2,
    severity: "medium",
    decisionType: "investigate",
    recommendation: "Revisar criativo, publico e promessa de topo.",
    nextAction: "Testar novos ganchos e comparar TOFU CBO contra estrutura antiga.",
    rationale: "TOFU caro pode alimentar menos o funil e desperdiçar distribuicao.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "meta-frequency-fatigue",
    channel: "meta",
    title: "Risco de fadiga criativa",
    conditionDescription: "Se frequencia subir demais sem melhora de resultado, risco de fadiga criativa.",
    metric: "meta_frequency_without_result",
    operator: "gt",
    threshold: 2.8,
    severity: "high",
    decisionType: "test",
    recommendation: "Renovar criativos antes de ampliar verba.",
    nextAction: "Criar novas variacoes de ganchos e reduzir repeticao da mesma audiencia.",
    rationale: "Frequencia alta sem ganho sugere saturacao.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "google-zero-conversions",
    channel: "google",
    title: "Google com conversões zeradas",
    conditionDescription: "Se conversões estiverem zeradas, não escalar Google Ads.",
    metric: "google_conversions",
    operator: "eq",
    threshold: 0,
    severity: "critical",
    decisionType: "pause",
    recommendation: "Não escalar Google Ads enquanto conversões estiverem zeradas.",
    nextAction: "Auditar tag, evento e importacao de conversões antes de ampliar verba.",
    rationale: "Google Ads permanece em diagnóstico até corrigir rastreamento de conversões.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "google-generic-term-spend",
    channel: "google",
    title: "Termo generico consumindo verba",
    conditionDescription: "Se termo generico consumir verba relevante, reduzir ou pausar.",
    metric: "google_generic_term_spend",
    operator: "gt",
    threshold: 80,
    severity: "high",
    decisionType: "reduce",
    recommendation: "Reduzir verba de termos genericos sem intencao clara.",
    nextAction: "Adicionar negativas e priorizar termos de procedimento.",
    rationale: "Termos genericos enfraquecem leitura de intencao e CPA.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "google-cirurgia-estetica",
    channel: "google",
    title: "Cirurgia estetica consumindo verba",
    conditionDescription: "Se cirurgia estetica consumir verba relevante, limitar ou pausar.",
    metric: "google_search_term",
    operator: "contains",
    threshold: "cirurgia estetica",
    severity: "high",
    decisionType: "pause",
    recommendation: "Limitar ou pausar o termo cirurgia estetica.",
    nextAction: "Mover para experimento de baixa verba ou negativar se não converter.",
    rationale: "Termo amplo demais pode consumir verba sem intencao cirurgica especifica.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "google-uba-volume",
    channel: "google",
    title: "Uba com volume relevante",
    conditionDescription: "Se Uba aparecer com volume relevante, separar campanha ou negativar.",
    metric: "google_location_term",
    operator: "contains",
    threshold: "uba",
    severity: "medium",
    decisionType: "restructure",
    recommendation: "Separar Uba em campanha propria ou negativar.",
    nextAction: "Avaliar volume, custo e qualidade por localidade.",
    rationale: "Localidade com comportamento próprio pode distorcer a decisóo de orçamento.",
    relatedAuditClassification: "needs_more_data"
  },
  {
    id: "google-mamas-ctr-intent",
    channel: "google",
    title: "Campanha de mamas com CTR forte",
    conditionDescription: "Se campanha de mamas tiver CTR forte e intencao clara, manter/expandir com cautela.",
    metric: "google_mamas_ctr",
    operator: "gte",
    threshold: 7,
    severity: "medium",
    decisionType: "maintain",
    recommendation: "Manter campanha de mamas e expandir com cautela.",
    nextAction: "Validar conversões antes de liberar escala real.",
    rationale: "CTR forte indica intenção, mas Google Ads ainda depende de conversóo confiável.",
    relatedAuditClassification: "partial_win"
  },
  {
    id: "google-high-cpc-no-conversion",
    channel: "google",
    title: "CPC alto sem conversóo rastreada",
    conditionDescription: "Se Google Ads tiver CPC alto sem conversão rastreada, manter em diagnóstico.",
    metric: "google_cpc_without_tracked_conversion",
    operator: "gt",
    threshold: 8,
    severity: "high",
    decisionType: "investigate",
    recommendation: "Manter Google Ads em diagnóstico até corrigir conversóo.",
    nextAction: "Revisar termos, tracking e landing/WhatsApp.",
    rationale: "CPC alto sem conversóo confiável aumenta risco de alocação ruim.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "instagram-reach-cadence-drop",
    channel: "instagram",
    title: "Alcance caiu junto com cadencia",
    conditionDescription: "Se alcance cair junto com queda de cadência, não concluir queda de qualidade sem olhar média por conteúdo.",
    metric: "instagram_reach_with_cadence_drop",
    operator: "gt",
    threshold: 0,
    severity: "medium",
    decisionType: "investigate",
    recommendation: "Separar queda de cadencia de queda de qualidade.",
    nextAction: "Comparar média por conteúdo antes de julgar pauta ou formato.",
    rationale: "Menos publicacoes podem derrubar alcance agregado sem piorar qualidade individual.",
    relatedAuditClassification: "needs_more_data"
  },
  {
    id: "instagram-few-stories",
    channel: "instagram",
    title: "Poucos stories no dia",
    conditionDescription: "Se stories forem poucos no dia, alerta de cadencia.",
    metric: "instagram_daily_stories",
    operator: "lt",
    threshold: 6,
    severity: "high",
    decisionType: "maintain",
    recommendation: "Tratar Stories como parte do funil, não como enfeite.",
    nextAction: "Publicar mínimo de 6 Stories por dia com CTA para WhatsApp.",
    rationale: "Stories sustentam confianca e nutricao dos visitantes do trafego pago.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "instagram-missing-whatsapp-cta",
    channel: "instagram",
    title: "Sem CTA diário para WhatsApp",
    conditionDescription: "Se não houver CTA diário para WhatsApp, alerta de fundo de funil.",
    metric: "instagram_daily_whatsapp_cta",
    operator: "eq",
    threshold: 0,
    severity: "high",
    decisionType: "investigate",
    recommendation: "Inserir CTA diário para WhatsApp no orgânico.",
    nextAction: "Planejar stories com chamada clara para conversa qualificada.",
    rationale: "Sem CTA, o perfil pode receber visita mas perder demanda.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "instagram-no-authority",
    channel: "instagram",
    title: "Sem conteúdo de autoridade",
    conditionDescription: "Se não houver conteúdo de autoridade na semana, risco de perda de confiança.",
    metric: "weekly_authority_content_count",
    operator: "eq",
    threshold: 0,
    severity: "medium",
    decisionType: "test",
    recommendation: "Incluir conteúdo de autoridade médica na semana.",
    nextAction: "Gravar bastidor técnico, explicação de segurança ou critério médico.",
    rationale: "Autoridade sustenta decisóo em procedimentos de alto valor.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "instagram-no-proof",
    channel: "instagram",
    title: "Sem conteúdo de prova/resultado",
    conditionDescription: "Se não houver conteúdo de prova/resultado, oportunidade perdida.",
    metric: "weekly_proof_content_count",
    operator: "eq",
    threshold: 0,
    severity: "medium",
    decisionType: "test",
    recommendation: "Adicionar conteúdo de prova com explicação responsóvel.",
    nextAction: "Transformar resultado em educação sobre maturação e segurança.",
    rationale: "Prova/resultado ajuda BOFU sem prometer resultado individual.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "content-less-than-3-shorts",
    channel: "content",
    title: "Menos de 3 reels/shorts na semana",
    conditionDescription: "Se semana tiver menos de 3 reels/shorts, alerta de cadencia.",
    metric: "weekly_reels_shorts_count",
    operator: "lt",
    threshold: 3,
    severity: "high",
    decisionType: "maintain",
    recommendation: "Aumentar cadencia para pelo menos 3 reels/shorts por semana.",
    nextAction: "Priorizar roteiros de mamas, lipo e naturalidade.",
    rationale: "Reels/Shorts mantem distribuicao e descoberta.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "content-low-bofu",
    channel: "content",
    title: "Pouco BOFU no calendario",
    conditionDescription: "Se semana tiver pouco BOFU, risco de excesso de topo de funil.",
    metric: "weekly_bofu_content_count",
    operator: "lt",
    threshold: 2,
    severity: "medium",
    decisionType: "test",
    recommendation: "Adicionar conteúdos BOFU de prova, segurança e intenção comercial.",
    nextAction: "Reaproveitar criativos vencedores como roteiro orgânico.",
    rationale: "Topo sem BOFU pode gerar alcance sem conversóo.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "content-not-reused",
    channel: "content",
    title: "Ideias sem reaproveitamento",
    conditionDescription: "Se ideias não forem reaproveitadas em Stories + Reels/Shorts + TikTok, oportunidade perdida.",
    metric: "weekly_reused_ideas_count",
    operator: "lt",
    threshold: 4,
    severity: "medium",
    decisionType: "test",
    recommendation: "Reaproveitar ideias relevantes em Stories + Reels/Shorts + TikTok.",
    nextAction: "Converter ideias principais do Content Studio em matriz de formatos.",
    rationale: "Reaproveitamento aumenta volume sem dispersar estrategia.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "content-production-bottleneck",
    channel: "content",
    title: "Gargalo de produção",
    conditionDescription: "Se o calendário tiver muitos conteúdos planejados e poucos gravados/editados, gargalo de produção.",
    metric: "planned_to_recorded_ratio",
    operator: "gt",
    threshold: 2,
    severity: "high",
    decisionType: "restructure",
    recommendation: "Organizar produção antes de adicionar novas ideias.",
    nextAction: "Priorizar gravação, edição e agendamento dos roteiros já planejados.",
    rationale: "Planejamento sem execucao cria atraso operacional.",
    relatedAuditClassification: "operational_error"
  },
  {
    id: "funnel-whatsapp-no-consult",
    channel: "funnel",
    title: "Muitos WhatsApps e poucas consultas",
    conditionDescription: "Se ha muitos WhatsApps e poucas consultas marcadas, gargalo no atendimento/qualificacao.",
    metric: "whatsapp_to_consult_rate",
    operator: "lt",
    threshold: 0.2,
    severity: "high",
    decisionType: "investigate",
    recommendation: "Auditar atendimento e qualificacao dos leads.",
    nextAction: "Medir motivo de não agendamento e tempo de resposta.",
    rationale: "BOFU bom perde valor se atendimento não converte conversa em consulta.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "funnel-consult-no-show",
    channel: "funnel",
    title: "Consultas marcadas com baixo comparecimento",
    conditionDescription: "Se ha muitas consultas marcadas e poucas comparecidas, gargalo de confirmacao.",
    metric: "consult_show_rate",
    operator: "lt",
    threshold: 0.65,
    severity: "high",
    decisionType: "investigate",
    recommendation: "Revisar confirmacao, lembretes e alinhamento antes da consulta.",
    nextAction: "Criar rotina de confirmacao e motivos de falta.",
    rationale: "Comparecimento baixo distorce leitura de campanha.",
    relatedAuditClassification: "operational_error"
  },
  {
    id: "funnel-consult-no-close",
    channel: "funnel",
    title: "Consultas sem fechamento",
    conditionDescription: "Se ha consultas, mas poucos fechamentos, gargalo de proposta/objeção/valor.",
    metric: "consult_close_rate",
    operator: "lt",
    threshold: 0.2,
    severity: "medium",
    decisionType: "investigate",
    recommendation: "Mapear objecoes e proposta de valor no pos-consulta.",
    nextAction: "Registrar motivos de não fechamento por procedimento.",
    rationale: "Fechamento baixo pode indicar gargalo comercial, não de marketing.",
    relatedAuditClassification: "needs_more_data"
  },
  {
    id: "funnel-missing-consult-data",
    channel: "funnel",
    title: "Sem dados de consulta marcada",
    conditionDescription: "Se não há dados de consulta marcada, precisa de mais dados.",
    metric: "scheduled_consults",
    operator: "missing",
    threshold: null,
    severity: "critical",
    decisionType: "investigate",
    recommendation: "Criar controle de consultas marcadas por origem.",
    nextAction: "Registrar origem, data, comparecimento e fechamento.",
    rationale: "Sem consulta marcada, não dá para auditar o funil completo.",
    relatedAuditClassification: "needs_more_data"
  },
  {
    id: "budget-meta-better-google-new-budget",
    channel: "budget",
    title: "Verba nova indo para canal pior",
    conditionDescription: "Se Meta performa melhor que Google e verba nova vai para Google, risco de alocacao ruim.",
    metric: "new_budget_to_google_when_meta_better",
    operator: "eq",
    threshold: 1,
    severity: "high",
    decisionType: "reduce",
    recommendation: "Não mover verba nova para Google Ads enquanto a conversóo estiver incerta.",
    nextAction: "Proteger Meta Ads e manter Google Ads em diagnóstico.",
    rationale: "Meta e o canal principal de escala no momento.",
    relatedAuditClassification: "silent_risk"
  },
  {
    id: "budget-efficient-bofu-underfunded",
    channel: "budget",
    title: "BOFU eficiente com pouca verba",
    conditionDescription: "Se BOFU eficiente recebe pouca verba, oportunidade perdida.",
    metric: "efficient_bofu_budget_share",
    operator: "lt",
    threshold: 0.35,
    severity: "high",
    decisionType: "scale",
    recommendation: "Realocar verba para BOFU eficiente antes de novos testes.",
    nextAction: "Aumentar participacao de BOFU WhatsApp Escala.",
    rationale: "Campanha eficiente subfinanciada limita captacao.",
    relatedAuditClassification: "missed_opportunity"
  },
  {
    id: "budget-bad-campaign-keeps-budget",
    channel: "budget",
    title: "Campanha ruim mantendo orçamento",
    conditionDescription: "Se campanha ruim continua recebendo orçamento, erro operacional.",
    metric: "bad_campaign_budget_active",
    operator: "eq",
    threshold: 1,
    severity: "high",
    decisionType: "pause",
    recommendation: "Pausar ou reduzir campanha ruim com verba ativa.",
    nextAction: "Realocar para campanha eficiente ou teste com hipotese clara.",
    rationale: "Verba em campanha ruim reduz velocidade de aprendizado.",
    relatedAuditClassification: "operational_error"
  }
];

export const DECISION_SIGNAL_INPUTS: DecisionSignalInput[] = [
  signalInput("input-meta-bofu-good", "meta", "meta_bofu_whatsapp_cost", 5.89, "BRL", "Meta BOFU WhatsApp Escala com custo bom.", "Auditoria v0.7"),
  signalInput("input-meta-bofu-abo-worse", "meta", "meta_bofu_whatsapp_cost", 8.6, "BRL", "BOFU Teste ABO com custo pior.", "Auditoria v0.7"),
  signalInput("input-meta-tofu-cheap", "meta", "meta_tofu_profile_visit_cost", 0.12, "BRL", "TOFU Teste CBO com visita barata.", "Auditoria v0.7"),
  signalInput("input-meta-tofu-old", "meta", "meta_tofu_profile_visit_cost", 0.24, "BRL", "TOFU Escala antigo com visita mais cara.", "Auditoria v0.7"),
  signalInput("input-meta-frequency", "meta", "meta_frequency_without_result", 3.1, "ratio", "Frequencia subiu sem melhora de resultado.", "Auditoria v0.7"),
  signalInput("input-google-zero", "google", "google_conversions", 0, "conversions", "Google com conversões zeradas.", "Auditoria v0.7"),
  signalInput("input-google-generic-spend", "google", "google_generic_term_spend", 120, "BRL", "Termo generico consumindo verba.", "Auditoria v0.7"),
  signalInput("input-google-cirurgia", "google", "google_search_term", "cirurgia estetica", "text", "Cirurgia estetica consumindo verba.", "Auditoria v0.7"),
  signalInput("input-google-uba", "google", "google_location_term", "uba", "text", "Uba aparecendo muito nos termos.", "Auditoria v0.7"),
  signalInput("input-google-mamas-ctr", "google", "google_mamas_ctr", 8.4, "%", "Campanha de mamas com CTR forte.", "Auditoria v0.7"),
  signalInput("input-google-cpc", "google", "google_cpc_without_tracked_conversion", 9.2, "BRL", "CPC alto sem conversóo rastreada.", "Auditoria v0.7"),
  signalInput("input-instagram-cadence", "instagram", "instagram_reach_with_cadence_drop", 1, "flag", "Alcance caiu junto com queda de cadencia.", "Calendário editorial"),
  signalInput("input-instagram-stories", "instagram", "instagram_daily_stories", 3, "stories", "Necessidade de stories diarios.", "Calendário editorial"),
  signalInput("input-instagram-cta", "instagram", "instagram_daily_whatsapp_cta", 0, "cta", "Sem CTA diário para WhatsApp.", "Calendário editorial"),
  signalInput("input-instagram-authority", "instagram", "weekly_authority_content_count", 0, "items", "Sem conteúdo de autoridade na semana.", "Calendário editorial"),
  signalInput("input-instagram-proof", "instagram", "weekly_proof_content_count", 0, "items", "Sem conteúdo de prova/resultado.", "Calendário editorial"),
  signalInput("input-content-shorts", "content", "weekly_reels_shorts_count", 2, "items", "Semana com menos de 3 reels/shorts.", "Calendário editorial"),
  signalInput("input-content-bofu", "content", "weekly_bofu_content_count", 1, "items", "Pouco BOFU no calendario.", "Calendário editorial"),
  signalInput("input-content-reuse", "content", "weekly_reused_ideas_count", 3, "ideas", "Conteúdos ainda pouco reaproveitados.", "Content Studio"),
  signalInput("input-content-bottleneck", "content", "planned_to_recorded_ratio", 3, "ratio", "Muitos planejados e poucos gravados/editados.", "Calendário editorial"),
  signalInput("input-funnel-whatsapp-consult", "funnel", "whatsapp_to_consult_rate", 0.12, "rate", "Muitos WhatsApps e poucas consultas marcadas.", "Auditoria interna"),
  signalInput("input-funnel-show", "funnel", "consult_show_rate", 0.52, "rate", "Muitas consultas marcadas e poucas comparecidas.", "Auditoria interna"),
  signalInput("input-funnel-close", "funnel", "consult_close_rate", 0.14, "rate", "Consultas com poucos fechamentos.", "Auditoria interna"),
  signalInput("input-funnel-missing", "funnel", "scheduled_consults", null, "count", "Sem dados suficientes de consultas marcadas.", "Auditoria interna"),
  signalInput("input-budget-google", "budget", "new_budget_to_google_when_meta_better", 1, "flag", "Meta melhor que Google, mas verba nova indo para Google.", "Auditoria v0.7"),
  signalInput("input-budget-bofu", "budget", "efficient_bofu_budget_share", 0.2, "share", "BOFU eficiente com pouca verba.", "Auditoria v0.7"),
  signalInput("input-budget-bad", "budget", "bad_campaign_budget_active", 1, "flag", "Campanha ruim continua recebendo orçamento.", "Auditoria v0.7")
];

function signalInput(
  id: string,
  channel: DecisionSignalChannel,
  metric: string,
  value: number | string | null,
  unit: string,
  context: string,
  source: string
): DecisionSignalInput {
  return {
    id,
    periodLabel: "Auditoria interna até 31/07/2026",
    channel,
    metric,
    value,
    unit,
    context,
    source,
    createdAt: baseDate
  };
}

export function evaluateDecisionRule(input: DecisionSignalInput, rule: DecisionRule): DecisionSignalResult {
  const matchesScope = input.channel === rule.channel && input.metric === rule.metric;
  const triggered = matchesScope ? evaluateOperator(input.value, rule.operator, rule.threshold) : false;

  return {
    id: `${input.id}-${rule.id}`,
    ruleId: rule.id,
    inputId: input.id,
    channel: rule.channel,
    title: rule.title,
    triggered,
    severity: rule.severity,
    decisionType: rule.decisionType,
    recommendation: rule.recommendation,
    nextAction: rule.nextAction,
    rationale: rule.rationale,
    confidence: triggered ? confidenceFor(rule.severity, rule.relatedAuditClassification) : "low"
  };
}

export function evaluateDecisionSignals(
  inputs: DecisionSignalInput[] = DECISION_SIGNAL_INPUTS,
  rules: DecisionRule[] = DECISION_RULES
): DecisionSignalResult[] {
  const results: DecisionSignalResult[] = [];
  for (const input of inputs) {
    for (const rule of rules) {
      if (input.channel === rule.channel && input.metric === rule.metric) {
        results.push(evaluateDecisionRule(input, rule));
      }
    }
  }
  return results;
}

export function filterSignalsByChannel(results: DecisionSignalResult[], channel: DecisionSignalChannel): DecisionSignalResult[] {
  return results.filter((result) => result.channel === channel);
}

export function filterSignalsBySeverity(results: DecisionSignalResult[], severity: DecisionSeverity): DecisionSignalResult[] {
  return results.filter((result) => result.severity === severity);
}

export function filterSignalsByDecisionType(results: DecisionSignalResult[], decisionType: DecisionType): DecisionSignalResult[] {
  return results.filter((result) => result.decisionType === decisionType);
}

export function getTriggeredSignals(results: DecisionSignalResult[]): DecisionSignalResult[] {
  return results.filter((result) => result.triggered);
}

export function getCriticalSignals(results: DecisionSignalResult[]): DecisionSignalResult[] {
  return getTriggeredSignals(results).filter((result) => result.severity === "critical");
}

export function getSignalsByChannel(results: DecisionSignalResult[]): Record<DecisionSignalChannel, number> {
  return countBy(getTriggeredSignals(results), "channel", {
    meta: 0,
    google: 0,
    instagram: 0,
    content: 0,
    funnel: 0,
    budget: 0
  });
}

export function getSignalsByDecisionType(results: DecisionSignalResult[]): Record<DecisionType, number> {
  return countBy(getTriggeredSignals(results), "decisionType", {
    scale: 0,
    maintain: 0,
    reduce: 0,
    pause: 0,
    test: 0,
    investigate: 0,
    restructure: 0
  });
}

export function summarizeDecisionSignals(results: DecisionSignalResult[]): string {
  const triggered = getTriggeredSignals(results);
  const critical = getCriticalSignals(results).length;
  const byType = getSignalsByDecisionType(results);

  return `${triggered.length} sinal(is) acionado(s), ${critical} critico(s), ${byType.scale} decisão(ões) de escala e ${byType.pause + byType.reduce} decisão(ões) de pausa/reducao. Meta Ads segue como canal principal de escala; Google permanece em diagnóstico até corrigir conversões.`;
}

function evaluateOperator(value: DecisionSignalInput["value"], operator: DecisionOperator, threshold: DecisionRule["threshold"]): boolean {
  if (operator === "missing") return value === null || value === undefined || value === "";
  if (value === null || value === undefined) return false;

  if (operator === "contains") return String(value).toLocaleLowerCase("pt-BR").includes(String(threshold ?? "").toLocaleLowerCase("pt-BR"));

  if (typeof value === "number" && typeof threshold === "number") {
    if (operator === "lt") return value < threshold;
    if (operator === "lte") return value <= threshold;
    if (operator === "gt") return value > threshold;
    if (operator === "gte") return value >= threshold;
    if (operator === "eq") return value === threshold;
    if (operator === "neq") return value !== threshold;
  }

  if (operator === "eq") return value === threshold;
  if (operator === "neq") return value !== threshold;
  return false;
}

function confidenceFor(severity: DecisionSeverity, classification: RelatedAuditClassification): SignalConfidence {
  if (severity === "critical") return "high";
  if (classification === "needs_more_data") return "medium";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function countBy<T extends string, K extends keyof DecisionSignalResult>(
  results: DecisionSignalResult[],
  key: K,
  initial: Record<T, number>
): Record<T, number> {
  const counts = { ...initial };
  for (const result of results) {
    const value = result[key] as unknown as T;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export function channelLabel(value: DecisionSignalChannel): string {
  return {
    meta: "Meta Ads",
    google: "Google Ads",
    instagram: "Instagram orgânico",
    content: "Conteúdo/Calendario",
    funnel: "Funil",
    budget: "Orcamento"
  }[value];
}

export function severityLabel(value: DecisionSeverity): string {
  return { low: "Baixa", medium: "Média", high: "Alta", critical: "Critica" }[value];
}

export function decisionTypeLabel(value: DecisionType): string {
  return {
    scale: "Escalar",
    maintain: "Manter",
    reduce: "Reduzir",
    pause: "Pausar",
    test: "Testar",
    investigate: "Investigar",
    restructure: "Reestruturar"
  }[value];
}
