export type WeeklyCollectionFieldStatus = "active_input" | "optional_note" | "future_metric";
export type WeeklyCollectionCadence = "weekly_close" | "daily_support" | "review_only";

export type WeeklyDataCollectionField = {
  id: string;
  label: string;
  appField: string;
  status: WeeklyCollectionFieldStatus;
  sourceMetric: string;
  whereToFind: string;
  acceptedFormat: string;
  inputHint: string;
  required: boolean;
};

export type WeeklyDataCollectionSource = {
  id: string;
  title: string;
  sourceOwner: string;
  cadence: WeeklyCollectionCadence;
  manualPath: string[];
  fields: WeeklyDataCollectionField[];
  qualityChecks: string[];
  privacyRules: string[];
  appDestination: string;
};

export type WeeklyCollectionRoutineStep = {
  id: string;
  order: number;
  title: string;
  action: string;
  expectedOutput: string;
};

export type WeeklyDataCollectionGuide = {
  id: string;
  title: string;
  summary: string;
  operatingPrinciple: string;
  sources: WeeklyDataCollectionSource[];
  routine: WeeklyCollectionRoutineStep[];
  doNotCollect: string[];
  routeFlow: Array<{ label: string; href: string; purpose: string }>;
};

export function buildWeeklyDataCollectionGuide(): WeeklyDataCollectionGuide {
  return {
    id: "weekly-data-collection-guide-v2-5",
    title: "Guia de Coleta Semanal",
    summary: "Diretriz interna para saber de onde tirar cada dado agregado antes de preencher /data.",
    operatingPrinciple: "Coletar metricas agregadas e numeros consolidados por semana, revisar manualmente e so entao alimentar o Weekly Command Center.",
    sources: buildWeeklyDataCollectionSources(),
    routine: buildWeeklyCollectionRoutine(),
    doNotCollect: [
      "Nao usar dados de pacientes, nomes, telefones, DMs, conversas individuais ou prints de conversas.",
      "Dados clinicos, prontuarios, fotos privadas, antes/depois identificavel ou qualquer material de paciente.",
      "Credenciais, tokens, senhas, chaves de API ou conteudo de .env.",
      "Metricas de Dezembro/2025 como benchmark normal.",
      "Recomendacoes enviadas automaticamente para equipe ou canais externos."
    ],
    routeFlow: [
      { label: "Guia de coleta", href: "/data/collection-guide", purpose: "Entender fonte, caminho manual e regra de privacidade de cada dado." },
      { label: "Dados semanais", href: "/data", purpose: "Preencher, importar, revisar e salvar os numeros agregados." },
      { label: "Weekly Command Center", href: "/weekly", purpose: "Ler diagnostico, sinais, metricas e prioridades." },
      { label: "Board de execucao", href: "/weekly/execution", purpose: "Converter prioridades em tarefas internas." },
      { label: "Pacote manual", href: "/weekly/execution/packet", purpose: "Revisar gates, responsaveis e plano de coleta da semana seguinte." }
    ]
  };
}

export function buildWeeklyDataCollectionSources(): WeeklyDataCollectionSource[] {
  return [
    {
      id: "week-identity",
      title: "Identidade da semana",
      sourceOwner: "Cadu ou revisao humana",
      cadence: "weekly_close",
      manualPath: [
        "Definir o periodo semanal fechado.",
        "Usar o mesmo inicio e fim em todas as plataformas.",
        "Criar um rotulo claro para a semana."
      ],
      fields: [
        field("week-label", "Rotulo da semana", "weekLabel", "active_input", "Nome operacional da semana", "Calendario interno ou revisao semanal", "Texto curto", "Ex.: Semana 11/05 a 17/05/2026"),
        field("start-date", "Data de inicio", "startDate", "active_input", "Primeiro dia do periodo", "Calendario interno", "AAAA-MM-DD", "Ex.: 2026-05-11"),
        field("end-date", "Data de fim", "endDate", "active_input", "Ultimo dia do periodo", "Calendario interno", "AAAA-MM-DD", "Ex.: 2026-05-17")
      ],
      qualityChecks: [
        "A data de fim nao pode ser anterior a data de inicio.",
        "Todas as fontes precisam usar o mesmo periodo.",
        "Se houver anomalia operacional, registrar em observacoes."
      ],
      privacyRules: ["Nao colocar evento pessoal, agenda sensivel ou dado identificavel no rotulo."],
      appDestination: "/data: campos de periodo e rotulo"
    },
    {
      id: "instagram-organic",
      title: "Instagram organico",
      sourceOwner: "Instagram Insights, Meta Business Suite, Reportei ou conferencia editorial",
      cadence: "weekly_close",
      manualPath: [
        "Abrir Instagram Insights, Meta Business Suite ou relatorio consolidado.",
        "Filtrar exatamente o periodo semanal.",
        "Copiar totais agregados de publicacao e visitas ao perfil.",
        "Registrar alcance, impressoes e interacoes em observacoes enquanto nao houver campo dedicado."
      ],
      fields: [
        field("instagram-stories", "Stories publicados", "instagramStories", "active_input", "Total de Stories publicados na semana", "Insights/Conteudo/Stories ou calendario editorial", "Numero inteiro", "Somar o total semanal, nao media diaria"),
        field("instagram-reels", "Reels/Shorts publicados", "instagramReels", "active_input", "Total de Reels ou Shorts publicados", "Insights/Conteudo/Reels ou calendario editorial", "Numero inteiro", "Usar total publicado no periodo"),
        field("instagram-posts", "Posts publicados", "instagramPosts", "active_input", "Posts, feed ou carrossel publicados", "Calendario editorial ou Insights de conteudo", "Numero inteiro", "Contar apenas posts do periodo"),
        field("instagram-profile-visits", "Visitas ao perfil Instagram", "instagramProfileVisits", "active_input", "Visitas agregadas ao perfil", "Insights/Atividade/Visitas ao perfil", "Numero inteiro", "Usar total semanal"),
        field("instagram-reach", "Alcance", "notes", "optional_note", "Alcance organico agregado", "Insights ou Reportei", "Numero inteiro", "Registrar em observacoes ate virar campo dedicado", false),
        field("instagram-impressions", "Impressoes", "notes", "optional_note", "Impressoes agregadas", "Insights ou Reportei", "Numero inteiro", "Registrar em observacoes ate virar campo dedicado", false),
        field("instagram-interactions", "Interacoes", "notes", "optional_note", "Curtidas, comentarios, salvamentos ou interacoes agregadas", "Insights ou Reportei", "Numero inteiro", "Registrar em observacoes, sem prints", false)
      ],
      qualityChecks: [
        "Separar volume de publicacao de qualidade criativa.",
        "Nao comparar semana com periodo diferente.",
        "Se Stories estiverem baixos, tratar como possivel problema de cadencia."
      ],
      privacyRules: [
        "Nao usar DMs, nomes de seguidores, prints ou comentarios individuais.",
        "Nao usar imagem de paciente ou material identificavel."
      ],
      appDestination: "/data: Instagram organico e observacoes"
    },
    {
      id: "meta-ads",
      title: "Meta Ads",
      sourceOwner: "Meta Ads Manager, Meta Business Suite ou Reportei",
      cadence: "weekly_close",
      manualPath: [
        "Abrir Meta Ads Manager ou relatorio consolidado.",
        "Filtrar o mesmo periodo semanal.",
        "Usar totais da conta/campanhas relevantes.",
        "Copiar investimento, conversas WhatsApp e visitas ao perfil quando disponivel."
      ],
      fields: [
        field("meta-spend", "Investimento Meta Ads", "metaSpend", "active_input", "Valor gasto no periodo", "Meta Ads Manager/Valor gasto", "Numero ou moeda", "Ex.: 780 ou R$ 780,00"),
        field("meta-whatsapp", "Conversas Meta", "metaWhatsappConversations", "active_input", "Conversas iniciadas ou atribuidas ao Meta", "Coluna de resultados/conversas WhatsApp", "Numero inteiro", "Usar total semanal"),
        field("meta-profile-visits", "Visitas ao perfil Meta", "metaProfileVisits", "active_input", "Visitas ao perfil atribuidas as campanhas", "Relatorio de campanha, quando disponivel", "Numero inteiro", "Se nao houver, usar 0 ou registrar limitacao")
      ],
      qualityChecks: [
        "Conferir se o resultado e conversa WhatsApp, nao clique generico.",
        "Nao misturar campanhas fora do periodo.",
        "Custo por conversa sera calculado pelo sistema quando houver investimento e conversas."
      ],
      privacyRules: ["Nao exportar nomes, telefones, mensagens, IDs individuais ou listas de leads."],
      appDestination: "/data: Meta Ads"
    },
    {
      id: "google-ads",
      title: "Google Ads",
      sourceOwner: "Google Ads ou relatorio consolidado",
      cadence: "weekly_close",
      manualPath: [
        "Abrir Google Ads.",
        "Filtrar o mesmo periodo semanal.",
        "Selecionar conta ou campanhas usadas no funil.",
        "Copiar investimento, cliques e conversoes agregadas."
      ],
      fields: [
        field("google-spend", "Investimento Google Ads", "googleSpend", "active_input", "Valor gasto no periodo", "Google Ads/Custo", "Numero ou moeda", "Ex.: 220 ou R$ 220,00"),
        field("google-clicks", "Cliques Google Ads", "googleClicks", "active_input", "Cliques agregados", "Google Ads/Cliques", "Numero inteiro", "Usar total semanal"),
        field("google-conversions", "Conversoes Google Ads", "googleConversions", "active_input", "Conversoes rastreadas", "Google Ads/Conversoes", "Numero inteiro", "Zero e dado valido quando nao houve conversao")
      ],
      qualityChecks: [
        "Conversao zerada deve ficar como diagnostico, nao como conclusao definitiva.",
        "Conferir se a conversao esta configurada antes de julgar campanha.",
        "Taxa de conversao sera calculada pelo sistema."
      ],
      privacyRules: ["Nao copiar termos de busca com dados pessoais ou identificaveis."],
      appDestination: "/data: Google Ads"
    },
    {
      id: "commercial-funnel",
      title: "WhatsApp e funil comercial",
      sourceOwner: "Planilha interna, atendimento, agenda ou CRM simples",
      cadence: "weekly_close",
      manualPath: [
        "Consolidar apenas numeros da semana.",
        "Separar WhatsApps totais de conversas qualificadas.",
        "Contar consultas marcadas, comparecidas e fechamentos.",
        "Registrar lacunas quando o dado ainda nao existir."
      ],
      fields: [
        field("whatsapp-total", "WhatsApps totais", "whatsappTotal", "active_input", "Total agregado de conversas recebidas", "Planilha/atendimento/CRM", "Numero inteiro", "Nao copiar conversas"),
        field("qualified-conversations", "Conversas qualificadas", "qualifiedConversations", "active_input", "Conversas com potencial comercial apos triagem", "Atendimento ou CRM", "Numero inteiro", "Definir criterio simples e consistente"),
        field("consultations-scheduled", "Consultas marcadas", "consultationsScheduled", "active_input", "Consultas marcadas na semana", "Agenda ou CRM", "Numero inteiro ou vazio", "Vazio significa dado ausente"),
        field("consultations-attended", "Consultas comparecidas", "consultationsAttended", "active_input", "Consultas com comparecimento", "Agenda ou CRM", "Numero inteiro ou vazio", "Vazio significa dado ausente"),
        field("surgeries-closed", "Cirurgias fechadas", "surgeriesClosed", "active_input", "Fechamentos confirmados", "Controle comercial agregado", "Numero inteiro ou vazio", "Vazio significa dado ausente")
      ],
      qualityChecks: [
        "Sem funil completo, nao concluir qualidade do lead.",
        "Manter o mesmo criterio de conversa qualificada toda semana.",
        "Separar volume de lead de comparecimento e fechamento."
      ],
      privacyRules: [
        "Nao inserir nomes, telefones, mensagens, DMs, prontuarios ou motivo clinico.",
        "Usar apenas contagens agregadas."
      ],
      appDestination: "/data: WhatsApp e funil"
    },
    {
      id: "execution-context",
      title: "Contexto editorial e anomalias",
      sourceOwner: "Revisao humana, calendario editorial e observacoes da semana",
      cadence: "review_only",
      manualPath: [
        "Registrar o que foi executado manualmente.",
        "Anotar se houve feriado, baixa producao, problema tecnico ou mudanca de campanha.",
        "Marcar Dezembro/2025 como anomalia operacional quando aplicavel.",
        "Resumir aprendizados sem nomes ou dados sensiveis."
      ],
      fields: [
        field("notes", "Observacoes agregadas", "notes", "active_input", "Contexto operacional resumido", "Revisao semanal", "Texto curto", "Sem dados pessoais"),
        field("content-functions", "Funcoes de conteudo", "notes", "optional_note", "Autoridade, confianca, educacao, desejo, conversao, distribuicao", "Calendario editorial", "Resumo textual", "Usar como observacao ate haver classificacao dedicada", false),
        field("anomaly", "Anomalia operacional", "notes", "optional_note", "Hackeamento, feriado, pausa tecnica ou evento atipico", "Revisao humana", "Resumo textual", "Registrar contexto sem dados pessoais", false)
      ],
      qualityChecks: [
        "Nao inventar evento real para explicar performance.",
        "Nao usar Dezembro/2025 em medias normais.",
        "Diferenciar anotacao operacional de conclusao definitiva."
      ],
      privacyRules: ["Nao registrar agenda sensivel, nomes de pacientes, detalhes clinicos ou prints."],
      appDestination: "/data: Observacoes"
    }
  ];
}

export function buildWeeklyCollectionRoutine(): WeeklyCollectionRoutineStep[] {
  return [
    routineStep(1, "Fechar periodo", "Definir a semana exata e usar o mesmo periodo em todas as fontes.", "Periodo e rotulo prontos."),
    routineStep(2, "Coletar canais", "Copiar numeros agregados de Instagram, Meta Ads e Google Ads.", "Metricas de canais reunidas."),
    routineStep(3, "Coletar funil", "Consolidar WhatsApps, conversas qualificadas, consultas e fechamentos.", "Funil comercial agregado."),
    routineStep(4, "Checar privacidade", "Remover nomes, DMs, telefones, prints, prontuarios e qualquer dado identificavel.", "Somente dados agregados permanecem."),
    routineStep(5, "Preencher /data", "Usar template, CSV ou digitacao manual e revisar previa antes de salvar.", "Semana salva com revisao humana."),
    routineStep(6, "Abrir /weekly", "Ler diagnostico, prioridades, board e pacote manual.", "Decisoes internas preparadas para a semana seguinte.")
  ];
}

export function getActiveWeeklyCollectionFields(): WeeklyDataCollectionField[] {
  return buildWeeklyDataCollectionSources()
    .flatMap((source) => source.fields)
    .filter((fieldItem) => fieldItem.status === "active_input");
}

export function getOptionalWeeklyCollectionNotes(): WeeklyDataCollectionField[] {
  return buildWeeklyDataCollectionSources()
    .flatMap((source) => source.fields)
    .filter((fieldItem) => fieldItem.status !== "active_input");
}

function field(
  id: string,
  label: string,
  appField: string,
  status: WeeklyCollectionFieldStatus,
  sourceMetric: string,
  whereToFind: string,
  acceptedFormat: string,
  inputHint: string,
  required = true
): WeeklyDataCollectionField {
  return { id, label, appField, status, sourceMetric, whereToFind, acceptedFormat, inputHint, required };
}

function routineStep(order: number, title: string, action: string, expectedOutput: string): WeeklyCollectionRoutineStep {
  return { id: `routine-${order}`, order, title, action, expectedOutput };
}
