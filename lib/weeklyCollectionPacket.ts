import {
  buildWeeklyDataCollectionGuide,
  type WeeklyDataCollectionGuide,
  type WeeklyDataCollectionSource
} from "@/lib/weeklyDataCollectionGuide";

export type WeeklyCollectionPacketArtifactType = "checklist" | "csv" | "field_value" | "handoff";
export type WeeklyCollectionReadinessGateStatus = "required" | "recommended" | "blocked";

export type WeeklyCollectionPacketArtifact = {
  id: string;
  title: string;
  type: WeeklyCollectionPacketArtifactType;
  description: string;
  content: string;
  usage: string[];
};

export type WeeklyCollectionReadinessGate = {
  id: string;
  title: string;
  status: WeeklyCollectionReadinessGateStatus;
  question: string;
  passCriteria: string[];
};

export type WeeklyCollectionSourceHandoff = {
  sourceId: string;
  sourceTitle: string;
  owner: string;
  handoff: string;
  fields: string[];
};

export type WeeklyCollectionPacket = {
  id: string;
  title: string;
  summary: string;
  artifacts: WeeklyCollectionPacketArtifact[];
  readinessGates: WeeklyCollectionReadinessGate[];
  weeklyCloseChecklist: string[];
  sourceHandoffNotes: WeeklyCollectionSourceHandoff[];
  nextRoutes: Array<{ label: string; href: string; purpose: string }>;
  doNotUse: string[];
};

export function buildWeeklyCollectionPacket(
  guide: WeeklyDataCollectionGuide = buildWeeklyDataCollectionGuide()
): WeeklyCollectionPacket {
  const weeklyCloseChecklist = buildWeeklyCloseChecklist(guide);

  return {
    id: "weekly-collection-packet-v2-6",
    title: "Pacote Copiavel de Coleta Semanal",
    summary:
      "Pacote interno para copiar, preencher e revisar metricas agregadas antes de alimentar /data. Nao usa API externa, nao dispara mensagens e nao substitui revisao humana.",
    artifacts: [
      artifact(
        "weekly-close-checklist",
        "Checklist de fechamento semanal",
        "checklist",
        "Sequencia curta para garantir que a semana foi fechada com o mesmo periodo e sem dados sensiveis.",
        weeklyCloseChecklist.map((item) => `- [ ] ${item}`).join("\n"),
        [
          "Use antes de preencher qualquer numero.",
          "Marque cada item manualmente.",
          "Se algum item falhar, registre a limitacao em observacoes antes de salvar."
        ]
      ),
      artifact(
        "field-value-template",
        "Template campo: valor",
        "field_value",
        "Modelo para copiar dados de Instagram, Meta Ads, Google Ads, funil comercial e observacoes em texto simples.",
        buildWeeklyFieldValueTemplate(guide),
        [
          "Preencha somente totais agregados da semana.",
          "Cole o texto na importacao assistida de /data ou use como roteiro manual.",
          "Deixe em branco qualquer dado que ainda nao exista."
        ]
      ),
      artifact(
        "csv-template",
        "Modelo CSV/TSV",
        "csv",
        "Planilha simples em quatro colunas para copiar para CSV, TSV, Excel ou Google Sheets antes da revisao.",
        buildWeeklyCsvTemplate(guide),
        [
          "Use ponto e virgula como separador.",
          "Mantenha uma linha por campo.",
          "Revise o mapeamento antes de aplicar os dados no sistema."
        ]
      ),
      artifact(
        "internal-handoff",
        "Mensagem de handoff interno",
        "handoff",
        "Texto seguro para pedir os numeros agregados internamente sem incluir dados pessoais ou acionar canais externos pelo sistema.",
        buildWeeklyInternalHandoff(guide),
        [
          "Copie manualmente apenas se fizer sentido para sua rotina.",
          "O sistema nao envia esta mensagem automaticamente.",
          "Remova qualquer pedido que possa gerar dado identificavel."
        ]
      )
    ],
    readinessGates: buildWeeklyCollectionReadinessGates(),
    weeklyCloseChecklist,
    sourceHandoffNotes: buildWeeklySourceHandoff(guide),
    nextRoutes: [
      { label: "Guia de coleta", href: "/data/collection-guide", purpose: "Conferir de onde vem cada dado." },
      { label: "Dados semanais", href: "/data", purpose: "Preencher ou importar os numeros agregados." },
      { label: "Weekly Command Center", href: "/weekly", purpose: "Ler diagnostico depois que a semana for salva." },
      { label: "Board de execucao", href: "/weekly/execution", purpose: "Converter prioridades em tarefas internas." },
      { label: "Pacote manual", href: "/weekly/execution/packet", purpose: "Revisar gates e plano de execucao manual." }
    ],
    doNotUse: [
      "Dados de pacientes, nomes, telefones, DMs, comentarios individuais, prints ou conversas.",
      "Dados clinicos, prontuarios, fotos privadas ou material identificavel.",
      "Credenciais, senhas, chaves de API, tokens ou conteudo de .env.",
      "Dezembro/2025 como media, meta, benchmark normal ou base de recomendacao.",
      "Envio externo, publicacao, automacao social ou orientacao direta para equipe sem decisao humana explicita."
    ]
  };
}

export function buildWeeklyFieldValueTemplate(
  guide: WeeklyDataCollectionGuide = buildWeeklyDataCollectionGuide()
): string {
  const activeFields = guide.sources.flatMap((source) => source.fields).filter((field) => field.status === "active_input");
  const grouped = guide.sources
    .map((source) => {
      const fields = source.fields.filter((field) => field.status === "active_input");
      if (!fields.length) return "";
      return [
        `## ${source.title}`,
        ...fields.map((field) => `${field.label}: `)
      ].join("\n");
    })
    .filter(Boolean);

  return [
    "Periodo: ",
    "Rotulo da semana: ",
    "Regra: preencher somente metricas agregadas do mesmo periodo.",
    "Revisao humana: confirmar antes de salvar em /data.",
    "",
    ...grouped,
    "",
    "Checklist rapido:",
    `- Campos ativos esperados: ${activeFields.length}.`,
    "- Sem dados pessoais, mensagens privadas, prints ou informacao clinica.",
    "- Se o dado nao existir, deixar vazio e registrar a limitacao em Observacoes.",
    "- Se a semana cruzar Dezembro/2025, tratar como anomalia operacional."
  ].join("\n");
}

export function buildWeeklyCsvTemplate(
  guide: WeeklyDataCollectionGuide = buildWeeklyDataCollectionGuide()
): string {
  const rows = guide.sources
    .flatMap((source) => source.fields.map((field) => ({ source, field })))
    .filter(({ field }) => field.status === "active_input")
    .map(({ source, field }) => `${field.label};;${source.title};${field.inputHint}`);

  return ["campo;valor;fonte;observacao", ...rows].join("\n");
}

export function buildWeeklySourceHandoff(
  guide: WeeklyDataCollectionGuide = buildWeeklyDataCollectionGuide()
): WeeklyCollectionSourceHandoff[] {
  return guide.sources.map((source) => {
    const activeFields = source.fields.filter((field) => field.status === "active_input");
    const fields = activeFields.length ? activeFields : source.fields;

    return {
      sourceId: source.id,
      sourceTitle: source.title,
      owner: source.sourceOwner,
      handoff: buildSourceHandoffText(source),
      fields: fields.map((field) => field.label)
    };
  });
}

export function buildWeeklyCollectionReadinessGates(): WeeklyCollectionReadinessGate[] {
  return [
    gate(
      "same-period",
      "Mesmo periodo em todas as fontes",
      "required",
      "Instagram, Meta Ads, Google Ads e funil comercial usam a mesma semana?",
      ["Inicio e fim conferidos.", "Relatorios filtrados pelo mesmo periodo.", "Rotulo da semana definido."]
    ),
    gate(
      "privacy",
      "Privacidade e dados agregados",
      "required",
      "Existe algum dado pessoal, clinico, conversa, print, nome ou telefone no material de coleta?",
      ["Somente totais semanais.", "Nenhum dado identificavel.", "Observacoes sem detalhes sensiveis."]
    ),
    gate(
      "manual-review",
      "Revisao humana antes de salvar",
      "required",
      "Uma pessoa revisou campos, periodo, valores zerados e lacunas antes de salvar em /data?",
      ["Campos essenciais revisados.", "Zeros e vazios diferenciados.", "Limitacoes registradas em observacoes."]
    ),
    gate(
      "december-2025",
      "Anomalia Dezembro/2025",
      "recommended",
      "A semana cruza Dezembro/2025 ou usa esse periodo como comparacao?",
      ["Se cruzar Dezembro/2025, marcar como contexto anomalo.", "Nao usar como benchmark normal.", "Nao usar como meta ou projecao."]
    ),
    gate(
      "no-auto-send",
      "Sem envio ou publicacao automatica",
      "blocked",
      "Este pacote autoriza envio externo, publicacao, API social, WhatsApp, e-mail ou mudanca de campanha?",
      ["Resposta deve ser nao.", "Qualquer acao externa exige pedido explicito separado.", "O pacote e apenas interno e manual."]
    )
  ];
}

export function buildWeeklyCloseChecklist(
  guide: WeeklyDataCollectionGuide = buildWeeklyDataCollectionGuide()
): string[] {
  return [
    "Definir data de inicio, data de fim e rotulo da semana.",
    "Filtrar Instagram, Meta Ads, Google Ads e funil pelo mesmo periodo.",
    "Coletar somente totais agregados e numeros consolidados.",
    "Diferenciar dado ausente de valor zero.",
    "Registrar alcance, impressoes, interacoes, funcoes de conteudo e anomalias em observacoes quando nao houver campo dedicado.",
    "Conferir que nenhum dado sensivel, conversa, print, nome, telefone ou informacao clinica entrou no material.",
    "Marcar Dezembro/2025 como anomalia quando aplicavel.",
    "Revisar tudo manualmente antes de salvar em /data.",
    `Abrir ${guide.routeFlow.find((route) => route.href === "/weekly")?.label ?? "Weekly Command Center"} somente depois de salvar a semana.`
  ];
}

function buildWeeklyInternalHandoff(guide: WeeklyDataCollectionGuide): string {
  return [
    "Oi, preciso fechar a leitura semanal do Marketing Intelligence OS com metricas agregadas.",
    "",
    "Periodo da semana: ____ a ____",
    "Rotulo da semana: ____",
    "",
    "Por favor, separar apenas totais consolidados do periodo, sem nomes, prints, conversas, telefones, dados clinicos ou informacao identificavel.",
    "",
    ...guide.sources.map((source) => buildSourceHandoffText(source)),
    "",
    "Observacoes agregadas da semana:",
    "- Houve feriado, baixa cadencia, problema tecnico, mudanca de campanha ou anomalia?",
    "- Alguma metrica esta ausente ou com tracking duvidoso?",
    "- A semana cruza Dezembro/2025? Se sim, tratar como anomalia operacional.",
    "",
    "Este pedido e apenas para coleta manual interna. Nao autoriza publicacao, envio automatico, API externa, mudanca de campanha ou decisao sem revisao humana."
  ].join("\n");
}

function buildSourceHandoffText(source: WeeklyDataCollectionSource): string {
  const activeFields = source.fields.filter((field) => field.status === "active_input");
  const fields = activeFields.length ? activeFields : source.fields;

  return [
    `${source.title} (${source.sourceOwner})`,
    ...fields.map((field) => `- ${field.label}: ____ (${field.acceptedFormat})`)
  ].join("\n");
}

function artifact(
  id: string,
  title: string,
  type: WeeklyCollectionPacketArtifactType,
  description: string,
  content: string,
  usage: string[]
): WeeklyCollectionPacketArtifact {
  return { id, title, type, description, content, usage };
}

function gate(
  id: string,
  title: string,
  status: WeeklyCollectionReadinessGateStatus,
  question: string,
  passCriteria: string[]
): WeeklyCollectionReadinessGate {
  return { id, title, status, question, passCriteria };
}
