import type {
  WeeklyCommandResult,
  WeeklyPriorityLever,
  WeeklyPriorityLeverAction,
  WeeklyPriorityLeverArea,
  WeeklyPriorityLeverPriority
} from "@/lib/weeklyCommandResult";

export type WeeklyExecutionTaskStatus = "planned" | "needs_review" | "ready" | "blocked";
export type WeeklyExecutionLaneId = "today" | "this_week" | "next_week" | "monthly_review";
export type WeeklyExecutionRiskLevel = "low" | "medium" | "high";

export type WeeklyExecutionTask = {
  id: string;
  leverId: string;
  rank: number;
  title: string;
  lane: WeeklyExecutionLaneId;
  action: WeeklyPriorityLeverAction;
  area: WeeklyPriorityLeverArea;
  priority: WeeklyPriorityLeverPriority;
  status: WeeklyExecutionTaskStatus;
  riskLevel: WeeklyExecutionRiskLevel;
  ownerSuggestion: string;
  actionWindow: WeeklyPriorityLever["actionWindow"];
  objective: string;
  acceptanceCriteria: string[];
  checklist: string[];
  evidence: string[];
  guardrail: string;
  sourceLeverScore: number;
};

export type WeeklyExecutionLane = {
  id: WeeklyExecutionLaneId;
  title: string;
  description: string;
  tasks: WeeklyExecutionTask[];
};

export type WeeklyExecutionMeetingAgenda = {
  id: string;
  title: string;
  prompt: string;
  expectedOutput: string;
};

export type WeeklyExecutionDecisionLogItem = {
  id: string;
  question: string;
  options: string[];
  defaultRecommendation: string;
};

export type WeeklyExecutionBoardSummary = {
  totalTasks: number;
  highPriorityTasks: number;
  blockedTasks: number;
  readyTasks: number;
  manualReviewRequired: boolean;
  summary: string;
  warnings: string[];
};

export type WeeklyExecutionBoard = {
  id: string;
  weekLabel: string;
  sourceReportId: string;
  summary: WeeklyExecutionBoardSummary;
  lanes: WeeklyExecutionLane[];
  agenda: WeeklyExecutionMeetingAgenda[];
  decisionLog: WeeklyExecutionDecisionLogItem[];
  operatingRules: string[];
  generatedAtLabel: string;
};

const laneDefinitions: Array<Omit<WeeklyExecutionLane, "tasks">> = [
  {
    id: "today",
    title: "Hoje",
    description: "Tarefas de decisao curta para destravar a leitura da semana sem acao externa automatica."
  },
  {
    id: "this_week",
    title: "Esta semana",
    description: "Ajustes operacionais internos que devem ser preparados, revisados e executados manualmente."
  },
  {
    id: "next_week",
    title: "Proxima semana",
    description: "Testes e repeticoes planejadas para entrar no calendario editorial e comercial."
  },
  {
    id: "monthly_review",
    title: "Revisao mensal",
    description: "Itens para aprendizado, governanca e Team Audit Mode sem interferencia direta na equipe."
  }
];

const actionObjective: Record<WeeklyPriorityLeverAction, string> = {
  repeat: "Repetir um padrao com evidencia agregada, mantendo revisao humana antes de ampliar esforco.",
  adjust: "Ajustar a operacao para reduzir incerteza e separar problema de cadencia, qualidade, canal ou funil.",
  pause: "Pausar escala ou decisao automatica ate confirmar rastreamento, contexto e risco operacional.",
  test: "Rodar um teste pequeno, com hipotese simples e leitura agregada na semana seguinte."
};

export function buildWeeklyExecutionBoard(report: WeeklyCommandResult): WeeklyExecutionBoard {
  const tasks = report.priorityLevers.map(mapPriorityLeverToExecutionTask);
  const lanes = laneDefinitions.map((lane) => ({
    ...lane,
    tasks: tasks.filter((task) => task.lane === lane.id)
  }));

  return {
    id: `weekly-execution-board-${report.id}`,
    weekLabel: report.weekLabel,
    sourceReportId: report.id.replace(/^weekly-result-/, ""),
    summary: summarizeWeeklyExecutionBoard(tasks),
    lanes,
    agenda: buildExecutionMeetingAgenda(report, tasks),
    decisionLog: buildExecutionDecisionLog(report, tasks),
    operatingRules: [
      "Board interno: nao publica, nao envia mensagens e nao aciona a equipe automaticamente.",
      "Usar apenas metricas agregadas ja registradas no Marketing Intelligence OS.",
      "Nao usar dados de pacientes, DMs, nomes, prontuarios, prints privados ou material identificavel.",
      "Decisoes de verba, criativo, calendario e equipe dependem de revisao humana.",
      "Dezembro/2025 continua fora de medias, benchmarks, projecoes e recomendacoes normais.",
      "Team Audit Mode permanece interno por padrao ate 2026-07-31."
    ],
    generatedAtLabel: "gerado localmente sem persistencia"
  };
}

export function mapPriorityLeverToExecutionTask(lever: WeeklyPriorityLever): WeeklyExecutionTask {
  const lane = determineExecutionLane(lever);
  const status = determineExecutionStatus(lever);
  const riskLevel = determineExecutionRiskLevel(lever);

  return {
    id: `execution-${lever.id}`,
    leverId: lever.id,
    rank: lever.rank,
    title: lever.title,
    lane,
    action: lever.action,
    area: lever.area,
    priority: lever.priority,
    status,
    riskLevel,
    ownerSuggestion: lever.ownerSuggestion,
    actionWindow: lever.actionWindow,
    objective: actionObjective[lever.action],
    acceptanceCriteria: buildAcceptanceCriteria(lever),
    checklist: buildExecutionChecklist(lever),
    evidence: lever.evidence,
    guardrail: buildGuardrail(lever),
    sourceLeverScore: lever.score
  };
}

export function determineExecutionLane(lever: WeeklyPriorityLever): WeeklyExecutionLaneId {
  if (lever.actionWindow === "revisar mensalmente") return "monthly_review";
  if (lever.actionWindow === "proxima semana") return "next_week";
  if (lever.priority === "high" && lever.rank <= 2) return "today";
  return "this_week";
}

export function determineExecutionStatus(lever: WeeklyPriorityLever): WeeklyExecutionTaskStatus {
  if (lever.id === "complete-commercial-funnel") return "blocked";
  if (lever.action === "pause" || lever.area === "team") return "needs_review";
  if (lever.priority === "low" && lever.action === "repeat") return "ready";
  if (lever.area === "tracking" || lever.area === "commercial") return "needs_review";
  return "planned";
}

export function determineExecutionRiskLevel(lever: WeeklyPriorityLever): WeeklyExecutionRiskLevel {
  if (lever.priority === "high" || lever.action === "pause" || lever.area === "google") return "high";
  if (lever.priority === "medium" || lever.area === "commercial" || lever.area === "team") return "medium";
  return "low";
}

export function summarizeWeeklyExecutionBoard(tasks: WeeklyExecutionTask[]): WeeklyExecutionBoardSummary {
  const totalTasks = tasks.length;
  const highPriorityTasks = tasks.filter((task) => task.priority === "high").length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
  const readyTasks = tasks.filter((task) => task.status === "ready").length;
  const manualReviewRequired = tasks.some((task) => task.status === "needs_review" || task.riskLevel === "high");
  const topTask = tasks[0];

  return {
    totalTasks,
    highPriorityTasks,
    blockedTasks,
    readyTasks,
    manualReviewRequired,
    summary: topTask
      ? `Board com ${totalTasks} tarefa(s) interna(s). Prioridade #1: ${topTask.title}.`
      : "Board sem tarefas acionaveis; mantenha coleta semanal ate surgir sinal suficiente.",
    warnings: [
      manualReviewRequired
        ? "Ha tarefas que exigem revisao humana antes de mudar verba, criativo, calendario ou rotina de equipe."
        : "Tarefas de baixo risco podem entrar no planejamento manual.",
      blockedTasks > 0
        ? "Ha bloqueio por dado agregado incompleto; complete a coleta antes de concluir qualidade do funil."
        : "Nenhum bloqueio estrutural foi identificado no board.",
      "O board organiza execucao interna, mas nao publica, nao envia e nao altera campanhas."
    ]
  };
}

function buildExecutionChecklist(lever: WeeklyPriorityLever): string[] {
  return [
    "Confirmar que as evidencias sao metricas agregadas e nao incluem dados pessoais.",
    "Definir uma pessoa responsavel pela revisao manual antes da execucao.",
    ...actionChecklist(lever),
    "Registrar a decisao tomada nas observacoes da semana.",
    "Revisar o resultado na proxima abertura do Weekly Command Center."
  ];
}

function actionChecklist(lever: WeeklyPriorityLever): string[] {
  if (lever.action === "repeat") {
    return [
      "Identificar qual estrutura de tema, canal ou CTA sera repetida.",
      "Separar repeticao operacional de aumento automatico de verba.",
      "Definir uma metrica agregada para acompanhar na proxima semana."
    ];
  }

  if (lever.action === "adjust") {
    return [
      "Descrever exatamente o que sera ajustado e o que permanecera igual.",
      "Validar se o ajuste corrige cadencia, qualidade, tracking ou funil.",
      "Evitar conclusao sobre pessoas ou equipe sem revisao humana."
    ];
  }

  if (lever.action === "pause") {
    return [
      "Documentar por que a escala deve ficar pausada ou segurada.",
      "Conferir rastreamento, termos, pagina e custo antes de liberar investimento.",
      "Nao redistribuir verba automaticamente a partir deste board."
    ];
  }

  return [
    "Escrever uma hipotese simples antes do teste.",
    "Definir criterio de sucesso com metrica agregada.",
    "Manter o teste pequeno e reversivel."
  ];
}

function buildAcceptanceCriteria(lever: WeeklyPriorityLever): string[] {
  const common = [
    "Decisao revisada por uma pessoa antes da execucao.",
    "Nenhum dado sensivel, identificavel ou clinico usado na tarefa.",
    "Resultado esperado descrito como aprendizado, nao como promessa."
  ];

  if (lever.action === "repeat") {
    return [
      "Padrao a repetir foi nomeado e conectado a pelo menos uma evidencia agregada.",
      "Canal, formato e CTA foram definidos para execucao manual.",
      ...common
    ];
  }

  if (lever.action === "adjust") {
    return [
      "Ajuste foi registrado com motivo, responsavel e janela de revisao.",
      "Mudanca separa causa provavel de cadencia, qualidade, funil ou tracking.",
      ...common
    ];
  }

  if (lever.action === "pause") {
    return [
      "Pausa ou contencao foi confirmada por revisao humana.",
      "Criterio minimo para retomar escala foi registrado.",
      ...common
    ];
  }

  return [
    "Hipotese, periodo e metrica agregada de leitura foram definidos.",
    "Teste e pequeno, reversivel e nao depende de automacao externa.",
    ...common
  ];
}

function buildGuardrail(lever: WeeklyPriorityLever): string {
  const base = lever.guardrail.endsWith(".") ? lever.guardrail : `${lever.guardrail}.`;
  return `${base} Esta tarefa permanece interna e nao autoriza publicacao, envio externo, alteracao de campanha ou contato com equipe sem decisao humana.`;
}

function buildExecutionMeetingAgenda(
  report: WeeklyCommandResult,
  tasks: WeeklyExecutionTask[]
): WeeklyExecutionMeetingAgenda[] {
  return [
    {
      id: "validate-diagnosis",
      title: "Validar leitura da semana",
      prompt: `A leitura "${report.statusLabel}" faz sentido com as evidencias agregadas da semana?`,
      expectedOutput: "Confirmar, ajustar interpretacao ou marcar como inconclusiva."
    },
    {
      id: "choose-top-three",
      title: "Escolher as tres tarefas principais",
      prompt: `As prioridades #1 a #3 (${tasks.slice(0, 3).map((task) => task.title).join("; ") || "sem tarefas"}) sao as mais relevantes para a proxima semana?`,
      expectedOutput: "Lista final de ate tres tarefas para execucao manual."
    },
    {
      id: "confirm-governance",
      title: "Checar governanca e privacidade",
      prompt: "Alguma tarefa depende de dado pessoal, DM, prontuario, print privado, API externa ou envio automatico?",
      expectedOutput: "Bloquear qualquer item que viole privacidade, governanca medica ou regra interna."
    },
    {
      id: "define-learning-log",
      title: "Definir aprendizado a registrar",
      prompt: "Quais metricas agregadas serao registradas para saber se a tarefa ajudou?",
      expectedOutput: "Campos e observacoes que devem entrar na coleta semanal seguinte."
    }
  ];
}

function buildExecutionDecisionLog(
  report: WeeklyCommandResult,
  tasks: WeeklyExecutionTask[]
): WeeklyExecutionDecisionLogItem[] {
  const topTask = tasks[0];
  const hasGooglePause = tasks.some((task) => task.area === "google" && task.action === "pause");
  const hasStoriesCadence = tasks.some((task) => task.leverId === "restore-organic-cadence");
  const hasTrackingBlock = tasks.some((task) => task.area === "tracking");

  return [
    {
      id: "approve-top-priority",
      question: topTask
        ? `A prioridade #1 deve entrar no plano operacional? (${topTask.title})`
        : "Ha prioridade suficiente para entrar no plano operacional?",
      options: ["aprovar", "reformular", "adiar"],
      defaultRecommendation: topTask ? "aprovar com revisao humana e escopo pequeno" : "adiar ate haver sinal suficiente"
    },
    {
      id: "google-scale-decision",
      question: "Google Ads deve receber escala, ficar em diagnostico ou ser revisado primeiro?",
      options: ["manter diagnostico", "revisar rastreamento", "liberar escala manualmente"],
      defaultRecommendation: hasGooglePause ? "manter diagnostico e revisar rastreamento" : "decidir apenas com dados agregados suficientes"
    },
    {
      id: "stories-cadence-decision",
      question: "A rotina de Stories precisa de reforco na proxima semana?",
      options: ["reforcar cadencia", "manter cadencia", "revisar pauta"],
      defaultRecommendation: hasStoriesCadence ? "reforcar cadencia com execucao manual" : "manter cadencia e revisar qualidade"
    },
    {
      id: "funnel-data-decision",
      question: "O funil comercial esta completo o suficiente para concluir qualidade de lead?",
      options: ["completo", "incompleto", "revisar campos"],
      defaultRecommendation: hasTrackingBlock ? "incompleto: completar dados agregados" : "revisar antes de mudar investimento"
    },
    {
      id: "team-audit-boundary",
      question: "Team Audit Mode deve continuar apenas interno nesta semana?",
      options: ["manter interno", "preparar conversa humana", "sem acao"],
      defaultRecommendation: report.teamAudit.note || "manter interno por padrao ate 2026-07-31"
    }
  ];
}
