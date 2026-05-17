import {
  buildWeeklyCollectionReadinessBoard,
  getBlockingCollectionSources,
  getSourcesNeedingCollection,
  type WeeklyCollectionReadinessBoard,
  type WeeklyCollectionReadinessStatus,
  type WeeklyCollectionSourceReadiness
} from "@/lib/weeklyCollectionReadiness";
import type { WeeklyMarketingData } from "@/lib/weeklyDataInput";

export type WeeklyNextCollectionPlanStatus = "ready_to_plan" | "needs_collection" | "blocked";
export type WeeklyNextCollectionTaskPriority = "high" | "medium" | "low";
export type WeeklyNextCollectionTaskCadence = "before_week_starts" | "daily" | "weekly_close" | "review_only";
export type WeeklyNextCollectionTaskOwner = "Cadu" | "marketing" | "atendimento" | "revisao humana";

export type WeeklyNextCollectionTask = {
  id: string;
  sourceId: string;
  title: string;
  priority: WeeklyNextCollectionTaskPriority;
  cadence: WeeklyNextCollectionTaskCadence;
  ownerSuggestion: WeeklyNextCollectionTaskOwner;
  trigger: string;
  action: string;
  evidenceToCollect: string[];
  acceptanceCriteria: string[];
  guardrail: string;
};

export type WeeklyNextCollectionPlan = {
  id: string;
  title: string;
  weekLabel: string;
  status: WeeklyNextCollectionPlanStatus;
  summary: string;
  tasks: WeeklyNextCollectionTask[];
  dailyRoutine: string[];
  weeklyCloseRoutine: string[];
  handoffScript: string;
  doNotDo: string[];
  nextRoutes: Array<{ label: string; href: string; purpose: string }>;
};

type WeeklyNextCollectionTaskConfig = Omit<WeeklyNextCollectionTask, "sourceId"> & {
  source: WeeklyCollectionSourceReadiness;
};

const coreDoNotDo = [
  "Nao conectar API externa, OAuth, scraping, WhatsApp, e-mail ou rede social nesta fase.",
  "Nao usar nomes, DMs, conversas, prints privados, dados clinicos, pacientes ou identificadores pessoais.",
  "Nao enviar este plano automaticamente para equipe ou terceiros.",
  "Nao usar Dezembro/2025 como media, benchmark, meta, projecao ou base de recomendacao normal.",
  "Nao salvar conclusoes fortes antes de revisao humana dos numeros agregados."
];

export function buildWeeklyNextCollectionPlan(
  data: WeeklyMarketingData,
  readiness: WeeklyCollectionReadinessBoard = buildWeeklyCollectionReadinessBoard(data)
): WeeklyNextCollectionPlan {
  const tasks = buildNextCollectionTasks(readiness);
  const status = getPlanStatus(readiness);
  const normalizedTasks = tasks.length ? tasks : buildMaintenanceTasks(readiness);
  const plan: Omit<WeeklyNextCollectionPlan, "handoffScript"> = {
    id: `weekly-next-collection-plan-${data.id || "draft"}`,
    title: "Plano de coleta da proxima semana",
    weekLabel: data.weekLabel.trim() || "Rascunho da semana",
    status,
    summary: buildPlanSummary(status, readiness, normalizedTasks),
    tasks: normalizedTasks,
    dailyRoutine: buildDailyCollectionRoutine(readiness),
    weeklyCloseRoutine: buildWeeklyCloseRoutine(readiness),
    doNotDo: coreDoNotDo,
    nextRoutes: [
      { label: "Pacote copiavel", href: "/data/collection-packet", purpose: "Copiar checklist, template, CSV e handoff manual." },
      { label: "Guia de coleta", href: "/data/collection-guide", purpose: "Conferir fonte exata de cada metrica agregada." },
      { label: "Dados semanais", href: "/data", purpose: "Preencher e revisar antes de salvar." },
      { label: "Weekly Command Center", href: "/weekly", purpose: "Ler diagnostico somente depois de salvar a semana." }
    ]
  };

  return {
    ...plan,
    handoffScript: buildNextCollectionHandoffScript(plan)
  };
}

export function buildNextCollectionTasks(readiness: WeeklyCollectionReadinessBoard): WeeklyNextCollectionTask[] {
  return readiness.sources
    .filter((source) => source.status !== "ready")
    .flatMap((source) => tasksForSource(source))
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || cadenceWeight(a.cadence) - cadenceWeight(b.cadence))
    .slice(0, 8);
}

export function buildDailyCollectionRoutine(readiness: WeeklyCollectionReadinessBoard): string[] {
  const instagram = readiness.sources.find((source) => source.id === "instagram-organic");
  const context = readiness.sources.find((source) => source.id === "execution-context");
  const routine = [
    "Registrar apenas totais agregados de Stories, Reels/Shorts e posts publicados no dia.",
    "Anotar se houve rotina profissional, estudo, hospital, UFV ou bastidor real sem inventar evento e sem usar dado identificavel.",
    "Marcar anomalias operacionais do dia em uma frase curta, sem nomes, prints, DMs ou informacao clinica.",
    "Guardar duvidas de tracking para revisao humana no fechamento semanal."
  ];

  if (instagram?.status === "missing") {
    routine.unshift("Abrir o calendario editorial ou Instagram Insights e iniciar contagem diaria de presenca organica.");
  }

  if (context?.status === "blocked") {
    routine.unshift("Limpar observacoes sensiveis antes de qualquer uso do rascunho.");
  }

  return unique(routine);
}

export function buildWeeklyCloseRoutine(readiness: WeeklyCollectionReadinessBoard): string[] {
  const blocking = getBlockingCollectionSources(readiness);
  const needingCollection = getSourcesNeedingCollection(readiness);
  const routine = [
    "Usar o mesmo periodo em Instagram, Meta Ads, Google Ads e funil comercial.",
    "Preencher o pacote copiavel de coleta antes de colar ou digitar em /data.",
    "Revisar a prontidao por fonte e resolver bloqueios antes de salvar.",
    "Salvar a semana somente com metricas agregadas e revisao humana.",
    "Abrir /weekly depois do salvamento para ler diagnostico, sinais e plano operacional."
  ];

  if (blocking.length) {
    routine.unshift(`Resolver bloqueio(s) em ${blocking.map((source) => source.title).join(", ")} antes do fechamento.`);
  }

  if (needingCollection.some((source) => source.id === "commercial-funnel")) {
    routine.splice(2, 0, "Conferir com atendimento apenas totais do funil: WhatsApps, qualificadas, consultas, comparecimentos e fechamentos.");
  }

  return unique(routine);
}

export function buildNextCollectionHandoffScript(plan: Omit<WeeklyNextCollectionPlan, "handoffScript">): string {
  const priorityTasks = plan.tasks
    .slice(0, 5)
    .map((task, index) => `${index + 1}. ${task.title} (${ownerLabel(task.ownerSuggestion)}, ${cadenceLabel(task.cadence)}): ${task.action}`);

  return [
    `Pedido interno de coleta para ${plan.weekLabel}`,
    "",
    "Objetivo: consolidar metricas agregadas da semana para alimentar o Marketing Intelligence OS.",
    "",
    "Prioridades:",
    ...(priorityTasks.length ? priorityTasks : ["1. Manter coleta semanal completa e revisar antes de salvar."]),
    "",
    "Limites:",
    "- usar somente totais agregados;",
    "- nao incluir nomes, DMs, conversas, prints privados, dados clinicos ou pacientes;",
    "- nao conectar API, OAuth, scraping ou envio automatico;",
    "- nao usar Dezembro/2025 como benchmark normal;",
    "- revisar manualmente antes de salvar em /data."
  ].join("\n");
}

function tasksForSource(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask[] {
  if (source.id === "week-identity") return [weekIdentityTask(source)];
  if (source.id === "instagram-organic") return instagramTasks(source);
  if (source.id === "meta-ads") return [metaAdsTask(source)];
  if (source.id === "google-ads") return [googleAdsTask(source)];
  if (source.id === "commercial-funnel") return [commercialFunnelTask(source)];
  if (source.id === "execution-context") return [executionContextTask(source)];
  return [genericSourceTask(source)];
}

function weekIdentityTask(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask {
  return task({
    id: "define-week-identity",
    source,
    title: "Definir identidade e periodo da semana",
    priority: source.status === "blocked" ? "high" : "medium",
    cadence: "before_week_starts",
    ownerSuggestion: "Cadu",
    trigger: source.summary,
    action: "Definir rotulo, data de inicio e data de fim antes de comparar fontes.",
    evidenceToCollect: ["Rotulo operacional da semana.", "Data de inicio.", "Data de fim.", "Confirmacao de que todas as fontes usam o mesmo periodo."],
    acceptanceCriteria: ["Periodo em formato AAAA-MM-DD.", "Fim nao anterior ao inicio.", "Periodo repetido nas demais fontes."],
    guardrail: "Se o periodo cruzar Dezembro/2025, registrar como anomalia e nao usar em benchmark normal."
  });
}

function instagramTasks(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask[] {
  const tasks = [
    task({
      id: "collect-instagram-weekly-totals",
      source,
      title: "Coletar Instagram organico agregado",
      priority: source.status === "missing" ? "high" : "medium",
      cadence: "weekly_close",
      ownerSuggestion: "marketing",
      trigger: source.summary,
      action: "Fechar a semana com Stories, Reels/Shorts, posts e visitas ao perfil no mesmo periodo.",
      evidenceToCollect: sourceEvidence(source, ["Stories publicados.", "Reels/Shorts publicados.", "Posts publicados.", "Visitas ao perfil."]),
      acceptanceCriteria: ["Numeros agregados por semana.", "Sem prints privados.", "Sem nomes ou interacoes individuais.", "Periodo igual ao das demais fontes."],
      guardrail: "A leitura separa cadencia de qualidade; nao concluir problema criativo antes de conferir volume publicado."
    })
  ];

  if (source.status === "needs_review") {
    tasks.push(
      task({
        id: "track-daily-instagram-cadence",
        source,
        title: "Rastrear cadencia diaria de Stories e Reels",
        priority: "medium",
        cadence: "daily",
        ownerSuggestion: "marketing",
        trigger: source.reviewNotes.join(" ") || "Cadencia organica pede revisao.",
        action: "Registrar diariamente se houve presenca real, Stories e Reels/Shorts planejados.",
        evidenceToCollect: ["Contagem diaria de Stories.", "Contagem semanal de Reels/Shorts.", "Observacao agregada de ausencia ou rotina real."],
        acceptanceCriteria: ["Nao inventar evento.", "Separar queda por volume de queda por qualidade.", "Usar apenas contagens agregadas."],
        guardrail: "Sem automacao de publicacao e sem uso de conteudo privado ou identificavel."
      })
    );
  }

  return tasks;
}

function metaAdsTask(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask {
  return task({
    id: "collect-meta-ads-weekly-totals",
    source,
    title: "Conferir Meta Ads por periodo",
    priority: source.status === "missing" ? "high" : "medium",
    cadence: "weekly_close",
    ownerSuggestion: "marketing",
    trigger: source.reviewNotes.join(" ") || source.summary,
    action: "Filtrar Meta Ads pelo periodo da semana e conferir investimento, conversas e visitas agregadas.",
    evidenceToCollect: sourceEvidence(source, ["Investimento Meta Ads.", "Conversas agregadas no WhatsApp.", "Visitas ao perfil quando disponiveis."]),
    acceptanceCriteria: ["Resultado conferido como conversa de WhatsApp, nao clique generico.", "Periodo igual ao da semana.", "Custo por conversa calculavel quando houver investimento e conversas."],
    guardrail: "Nao alterar campanha, verba ou criativo a partir deste painel; ele apenas organiza coleta para revisao humana."
  });
}

function googleAdsTask(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask {
  return task({
    id: "collect-google-ads-and-tracking",
    source,
    title: "Conferir Google Ads e tracking",
    priority: source.status === "missing" ? "medium" : "high",
    cadence: "weekly_close",
    ownerSuggestion: "marketing",
    trigger: source.reviewNotes.join(" ") || source.summary,
    action: "Coletar investimento, cliques e conversoes agregadas; se conversoes estiverem zeradas, registrar diagnostico de tracking.",
    evidenceToCollect: sourceEvidence(source, ["Investimento Google Ads.", "Cliques.", "Conversoes agregadas.", "Observacao de tracking se houver zero conversao."]),
    acceptanceCriteria: ["Conversao definida antes de interpretar performance.", "Nao escalar verba automaticamente.", "Registrar zero como dado revisado, nao como campo esquecido."],
    guardrail: "Google com conversao zerada pede revisao de tracking, intencao e pagina antes de qualquer decisao."
  });
}

function commercialFunnelTask(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask {
  return task({
    id: "collect-commercial-funnel-totals",
    source,
    title: "Fechar funil comercial agregado",
    priority: "high",
    cadence: "weekly_close",
    ownerSuggestion: "atendimento",
    trigger: source.reviewNotes.join(" ") || source.summary,
    action: "Consolidar apenas totais de WhatsApps, qualificadas, consultas marcadas, comparecidas e fechamentos.",
    evidenceToCollect: sourceEvidence(source, ["WhatsApps totais.", "Conversas qualificadas.", "Consultas marcadas.", "Consultas comparecidas.", "Cirurgias fechadas."]),
    acceptanceCriteria: ["Zeros revisados diferenciam ausencia real de dado nao coletado.", "Sem nomes, telefones ou conversas.", "Totais batem com agenda/planilha interna."],
    guardrail: "Coletar somente numeros agregados; nao copiar mensagens, contatos, DMs ou dados de pacientes."
  });
}

function executionContextTask(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask {
  return task({
    id: "clean-and-record-execution-context",
    source,
    title: source.status === "blocked" ? "Limpar contexto sensivel antes de salvar" : "Registrar contexto operacional seguro",
    priority: source.status === "blocked" ? "high" : "medium",
    cadence: source.status === "blocked" ? "review_only" : "weekly_close",
    ownerSuggestion: "revisao humana",
    trigger: source.reviewNotes.join(" ") || source.summary,
    action: source.status === "blocked" ? "Remover qualquer identificador antes de usar a semana." : "Adicionar observacao curta sobre feriados, cadencia, tracking ou anomalias.",
    evidenceToCollect: ["Observacao agregada da semana.", "Anomalias operacionais sem nomes.", "Decisoes manuais relevantes para interpretar resultados."],
    acceptanceCriteria: ["Sem CPF, RG, telefone, nome, prontuario, conversa individual ou print privado.", "Observacao explica contexto sem expor pessoa.", "Dezembro/2025 marcado quando aplicavel."],
    guardrail: "Contexto editorial ajuda interpretacao, mas nao pode conter dado pessoal, clinico ou identificavel."
  });
}

function genericSourceTask(source: WeeklyCollectionSourceReadiness): WeeklyNextCollectionTask {
  return task({
    id: `collect-${source.id}`,
    source,
    title: `Completar ${source.title}`,
    priority: statusPriority(source.status),
    cadence: "weekly_close",
    ownerSuggestion: "revisao humana",
    trigger: source.summary,
    action: source.nextAction,
    evidenceToCollect: sourceEvidence(source, source.missingFields),
    acceptanceCriteria: ["Numeros agregados.", "Periodo igual ao da semana.", "Revisao humana antes de salvar."],
    guardrail: "Manter o fluxo interno, manual e sem API externa."
  });
}

function buildMaintenanceTasks(readiness: WeeklyCollectionReadinessBoard): WeeklyNextCollectionTask[] {
  const source = readiness.sources.find((item) => item.id === "instagram-organic") ?? readiness.sources[0];
  return [
    task({
      id: "maintain-weekly-collection-routine",
      source,
      title: "Manter rotina de coleta semanal completa",
      priority: "low",
      cadence: "weekly_close",
      ownerSuggestion: "revisao humana",
      trigger: readiness.summary,
      action: "Repetir o pacote de coleta, revisar prontidao por fonte e salvar a semana apenas depois de conferencia.",
      evidenceToCollect: ["Pacote de coleta preenchido.", "Prontidao por fonte revisada.", "Semana salva em /data se estiver adequada."],
      acceptanceCriteria: ["Todas as fontes seguem no mesmo periodo.", "Sem dados pessoais.", "Plano revisado antes de decisoes de investimento."],
      guardrail: "Mesmo com tudo pronto, o sistema nao publica, nao envia e nao decide automaticamente."
    })
  ];
}

function task(config: WeeklyNextCollectionTaskConfig): WeeklyNextCollectionTask {
  const { source, ...taskConfig } = config;
  return {
    ...taskConfig,
    sourceId: source.id,
    evidenceToCollect: unique(config.evidenceToCollect).slice(0, 6),
    acceptanceCriteria: unique(config.acceptanceCriteria).slice(0, 6)
  };
}

function sourceEvidence(source: WeeklyCollectionSourceReadiness, fallback: string[]): string[] {
  const missing = source.missingFields.length ? source.missingFields.map((field) => `${field}.`) : [];
  return unique([...missing, ...fallback]);
}

function getPlanStatus(readiness: WeeklyCollectionReadinessBoard): WeeklyNextCollectionPlanStatus {
  if (readiness.status === "blocked") return "blocked";
  if (readiness.status === "ready") return "ready_to_plan";
  return "needs_collection";
}

function buildPlanSummary(status: WeeklyNextCollectionPlanStatus, readiness: WeeklyCollectionReadinessBoard, tasks: WeeklyNextCollectionTask[]): string {
  if (status === "blocked") return `Ha bloqueios antes da proxima coleta. Priorize ${tasks.filter((task) => task.priority === "high").length} tarefa(s) alta(s) e revise privacidade.`;
  if (status === "ready_to_plan") return "A coleta atual esta pronta. A proxima semana pode seguir rotina de manutencao, fechamento manual e leitura em /weekly.";
  return `A proxima coleta precisa completar ${getSourcesNeedingCollection(readiness).length} fonte(s). Use as tarefas abaixo antes de salvar a semana.`;
}

function statusPriority(status: WeeklyCollectionReadinessStatus): WeeklyNextCollectionTaskPriority {
  if (status === "blocked" || status === "missing") return "high";
  if (status === "needs_review") return "medium";
  return "low";
}

function priorityWeight(priority: WeeklyNextCollectionTaskPriority): number {
  return {
    high: 0,
    medium: 1,
    low: 2
  }[priority];
}

function cadenceWeight(cadence: WeeklyNextCollectionTaskCadence): number {
  return {
    review_only: 0,
    before_week_starts: 1,
    daily: 2,
    weekly_close: 3
  }[cadence];
}

function ownerLabel(owner: WeeklyNextCollectionTaskOwner): string {
  return owner;
}

function cadenceLabel(cadence: WeeklyNextCollectionTaskCadence): string {
  return {
    before_week_starts: "antes da semana",
    daily: "diario",
    weekly_close: "fechamento semanal",
    review_only: "revisao obrigatoria"
  }[cadence];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
}
