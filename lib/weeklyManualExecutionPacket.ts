import type { WeeklyCommandResult } from "@/lib/weeklyCommandResult";
import type { WeeklyExecutionBoard, WeeklyExecutionTask } from "@/lib/weeklyExecutionBoard";

export type WeeklyExecutionGateStatus = "required" | "optional" | "blocked";
export type WeeklyExecutionCollectionPriority = "high" | "medium" | "low";

export type WeeklyExecutionApprovalGate = {
  id: string;
  title: string;
  status: WeeklyExecutionGateStatus;
  question: string;
  requiredEvidence: string[];
  defaultDecision: string;
};

export type WeeklyExecutionOwnerBrief = {
  id: string;
  owner: string;
  focus: string;
  tasks: Array<{
    id: string;
    title: string;
    rank: number;
    status: WeeklyExecutionTask["status"];
    riskLevel: WeeklyExecutionTask["riskLevel"];
  }>;
  risksToWatch: string[];
  nextCheckIn: string;
};

export type WeeklyExecutionCollectionItem = {
  id: string;
  label: string;
  priority: WeeklyExecutionCollectionPriority;
  source: string;
  whyItMatters: string;
  privacyRule: string;
};

export type WeeklyExecutionReviewScriptItem = {
  id: string;
  order: number;
  title: string;
  prompt: string;
  expectedDecision: string;
};

export type WeeklyManualExecutionPacket = {
  id: string;
  weekLabel: string;
  sourceReportId: string;
  executiveBrief: string;
  weeklyFocus: string[];
  approvalGates: WeeklyExecutionApprovalGate[];
  ownerBriefs: WeeklyExecutionOwnerBrief[];
  dataCollectionPlan: WeeklyExecutionCollectionItem[];
  reviewScript: WeeklyExecutionReviewScriptItem[];
  doNotDo: string[];
  nextOpenLinks: Array<{ label: string; href: string }>;
};

export function buildWeeklyManualExecutionPacket(
  report: WeeklyCommandResult,
  board: WeeklyExecutionBoard
): WeeklyManualExecutionPacket {
  const tasks = board.lanes.flatMap((lane) => lane.tasks);

  return {
    id: `weekly-manual-execution-packet-${report.id}`,
    weekLabel: report.weekLabel,
    sourceReportId: board.sourceReportId,
    executiveBrief: buildExecutiveBrief(report, board, tasks),
    weeklyFocus: buildWeeklyFocus(report, tasks),
    approvalGates: buildApprovalGates(report, tasks),
    ownerBriefs: buildOwnerBriefs(tasks),
    dataCollectionPlan: buildDataCollectionPlan(report, tasks),
    reviewScript: buildReviewScript(report, board, tasks),
    doNotDo: [
      "Nao publicar conteudo automaticamente.",
      "Nao enviar recomendacoes automaticamente para equipe, WhatsApp, e-mail, Instagram ou qualquer canal externo.",
      "Nao usar dados de pacientes, DMs, nomes, prontuarios, prints privados, fotos identificaveis ou informacao clinica sensivel.",
      "Nao aumentar, pausar ou redistribuir verba sem revisao humana.",
      "Nao usar Dezembro/2025 como benchmark normal ou base de projecao.",
      "Nao transformar Team Audit Mode em orientacao externa sem pedido explicito."
    ],
    nextOpenLinks: [
      { label: "Weekly Command Center", href: `/weekly?week=${board.sourceReportId}` },
      { label: "Board de execucao", href: `/weekly/execution?week=${board.sourceReportId}` },
      { label: "Guia de coleta", href: "/data/collection-guide" },
      { label: "Dados semanais", href: "/data" },
      { label: "Stories de hoje", href: "/stories/today" },
      { label: "Plano da proxima semana", href: "/stories/next-week" },
      { label: "Auditoria", href: "/audit" }
    ]
  };
}

function buildExecutiveBrief(
  report: WeeklyCommandResult,
  board: WeeklyExecutionBoard,
  tasks: WeeklyExecutionTask[]
): string {
  const topTasks = tasks.slice(0, 3).map((task) => `#${task.rank} ${task.title}`).join("; ");
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const review = tasks.filter((task) => task.status === "needs_review").length;

  return `${report.weekLabel}: ${report.statusLabel}. ${board.summary.summary} Topo operacional: ${topTasks || "sem tarefa prioritaria"}. ${blocked} bloqueio(s) e ${review} item(ns) exigindo revisao humana antes de execucao.`;
}

function buildWeeklyFocus(report: WeeklyCommandResult, tasks: WeeklyExecutionTask[]): string[] {
  const focus = [
    report.cadenceQuality.nextAction,
    ...tasks.slice(0, 3).map((task) => `${task.title}: ${task.objective}`),
    report.nextWeekPlan.avoid[0]
  ];

  return unique(focus.filter(Boolean)).slice(0, 6);
}

function buildApprovalGates(
  report: WeeklyCommandResult,
  tasks: WeeklyExecutionTask[]
): WeeklyExecutionApprovalGate[] {
  const hasBudgetTask = tasks.some((task) => task.area === "google" || task.area === "meta" || task.action === "pause");
  const hasTrackingBlock = tasks.some((task) => task.status === "blocked" || task.area === "tracking");
  const hasTeamTask = tasks.some((task) => task.area === "team");

  const gates: WeeklyExecutionApprovalGate[] = [
    gate(
      "privacy",
      "Privacidade e dados agregados",
      "required",
      "Alguma tarefa usa dado identificavel, conversa individual, DM, prontuario, print privado ou informacao clinica?",
      ["Tarefas revisadas uma a uma.", "Evidencias descritas apenas como metricas agregadas."],
      "Bloquear qualquer item que dependa de dado sensivel ou identificavel."
    ),
    gate(
      "medical-governance",
      "Governanca de comunicacao medica",
      "required",
      "Alguma recomendacao promete resultado, sugere garantia ou usa tom inadequado para perfil medico?",
      ["Texto revisado em portugues claro.", "Sem promessa de resultado ou automacao ilusoria."],
      "Ajustar linguagem antes de executar."
    ),
    gate(
      "automatic-publishing",
      "Publicacao ou envio automatico",
      "blocked",
      "Este pacote autoriza publicacao, envio para equipe ou alteracao automatica de campanha?",
      ["Confirmacao de que a resposta e nao.", "Execucao permanece manual e interna."],
      "Nao autoriza. Qualquer envio externo exige pedido explicito separado."
    )
  ];

  if (hasBudgetTask) {
    gates.push(gate(
      "budget",
      "Verba e campanhas",
      "required",
      "Alguma tarefa muda verba, escala, pausa ou campanha?",
      ["Custo e conversao agregados conferidos.", "Responsavel humano definido."],
      "Manter como plano de revisao; nao alterar verba automaticamente."
    ));
  }

  if (hasTrackingBlock) {
    gates.push(gate(
      "tracking",
      "Tracking e funil comercial",
      "required",
      "Faltam consultas marcadas, comparecimentos, fechamentos ou outra metrica agregada essencial?",
      ["Campos faltantes listados.", "Plano de coleta para a semana seguinte definido."],
      "Completar dados agregados antes de concluir qualidade do funil."
    ));
  }

  if (hasTeamTask || report.teamAudit.risks.length > 0) {
    gates.push(gate(
      "team-audit",
      "Team Audit Mode",
      "optional",
      "Algum achado interno precisa virar conversa humana com a equipe?",
      ["Risco e oportunidade foram lidos no contexto.", "A decisao de falar com a equipe foi humana."],
      "Manter interno por padrao ate 2026-07-31."
    ));
  }

  return gates;
}

function buildOwnerBriefs(tasks: WeeklyExecutionTask[]): WeeklyExecutionOwnerBrief[] {
  const grouped = tasks.reduce((map, task) => {
    const owner = normalizeOwner(task.ownerSuggestion);
    map.set(owner, [...(map.get(owner) ?? []), task]);
    return map;
  }, new Map<string, WeeklyExecutionTask[]>());

  return Array.from(grouped.entries()).map(([owner, ownerTasks]) => {
    const highestRisk = ownerTasks.some((task) => task.riskLevel === "high");
    const blocked = ownerTasks.some((task) => task.status === "blocked");

    return {
      id: `owner-${slug(owner)}`,
      owner,
      focus: summarizeOwnerFocus(ownerTasks),
      tasks: ownerTasks.map((task) => ({
        id: task.id,
        title: task.title,
        rank: task.rank,
        status: task.status,
        riskLevel: task.riskLevel
      })),
      risksToWatch: [
        highestRisk ? "Existe item de risco alto; revisar antes de mudar verba, campanha ou calendario." : "Sem risco alto concentrado neste responsavel.",
        blocked ? "Ha tarefa bloqueada por dado agregado incompleto." : "Nenhum bloqueio direto neste responsavel.",
        "Nao acionar equipe automaticamente a partir deste pacote."
      ],
      nextCheckIn: blocked ? "antes de executar" : highestRisk ? "em ate 24h" : "na revisao semanal"
    };
  });
}

function buildDataCollectionPlan(
  report: WeeklyCommandResult,
  tasks: WeeklyExecutionTask[]
): WeeklyExecutionCollectionItem[] {
  const hasTrackingBlock = tasks.some((task) => task.status === "blocked" || task.area === "tracking");
  const hasCadenceTask = tasks.some((task) => task.area === "instagram" || task.leverId === "restore-organic-cadence");
  const hasPaidMediaTask = tasks.some((task) => task.area === "meta" || task.area === "google");

  return [
    collectionItem("week-period", "Rotulo e periodo da semana", "high", "Dados semanais", "Permite navegar historico e comparar semanas validas.", "Nao incluir eventos pessoais ou dados identificaveis."),
    collectionItem("meta", "Meta Ads: investimento, conversas e visitas agregadas", hasPaidMediaTask ? "high" : "medium", "Meta Ads", "Separa volume de demanda e custo de conversa.", "Usar apenas totais consolidados por semana."),
    collectionItem("google", "Google Ads: investimento, cliques e conversoes agregadas", hasPaidMediaTask ? "high" : "medium", "Google Ads", "Evita escalar canal em diagnostico sem conversao clara.", "Nao copiar termos de busca com informacao pessoal."),
    collectionItem("instagram-cadence", "Instagram: Stories, Reels, posts e visitas ao perfil", hasCadenceTask ? "high" : "medium", "Instagram Insights", "Separa queda por cadencia de queda por qualidade.", "Nao usar prints, DMs ou nomes de seguidores."),
    collectionItem("commercial-funnel", "Funil: WhatsApps, conversas qualificadas, consultas e fechamentos", hasTrackingBlock ? "high" : "medium", "Atendimento/funil comercial", "Permite entender passagem de demanda para consulta sem analisar conversas individuais.", "Registrar apenas numeros agregados; sem nomes, telefones ou DMs."),
    collectionItem("execution-notes", "Observacoes do que foi executado manualmente", "medium", "Revisao semanal", "Ajuda a saber se o resultado veio de cadencia, qualidade, canal ou atendimento.", "Descrever decisoes e contexto sem dados pessoais."),
    collectionItem("anomaly-check", "Checagem de anomalia operacional", report.historyContext.status === "empty" ? "medium" : "low", "Governanca", "Mantem Dezembro/2025 fora de medias e benchmarks normais.", "Nao usar periodo anomalo como meta ou projecao.")
  ];
}

function buildReviewScript(
  report: WeeklyCommandResult,
  board: WeeklyExecutionBoard,
  tasks: WeeklyExecutionTask[]
): WeeklyExecutionReviewScriptItem[] {
  return [
    scriptItem(1, "Abrir contexto", `Ler o status da semana: ${report.statusLabel}.`, "Confirmar se a leitura geral faz sentido."),
    scriptItem(2, "Validar top 3", `Revisar as primeiras tarefas: ${tasks.slice(0, 3).map((task) => task.title).join("; ") || "sem tarefas"}.`, "Aprovar, reformular ou adiar cada uma."),
    scriptItem(3, "Passar pelos gates", `Checar ${board.summary.manualReviewRequired ? "todos os gates obrigatorios antes de agir" : "se ha algum gate pendente"}.`, "Bloquear qualquer item inseguro."),
    scriptItem(4, "Distribuir responsaveis", "Confirmar quem revisa cada tarefa internamente.", "Responsavel humano definido sem acionamento automatico."),
    scriptItem(5, "Definir coleta", "Marcar quais dados agregados serao coletados na proxima semana.", "Checklist de coleta fechado."),
    scriptItem(6, "Registrar decisao", "Escrever a decisao humana nas observacoes da semana.", "Historico manual suficiente para revisar depois.")
  ];
}

function gate(
  id: string,
  title: string,
  status: WeeklyExecutionGateStatus,
  question: string,
  requiredEvidence: string[],
  defaultDecision: string
): WeeklyExecutionApprovalGate {
  return { id, title, status, question, requiredEvidence, defaultDecision };
}

function collectionItem(
  id: string,
  label: string,
  priority: WeeklyExecutionCollectionPriority,
  source: string,
  whyItMatters: string,
  privacyRule: string
): WeeklyExecutionCollectionItem {
  return { id, label, priority, source, whyItMatters, privacyRule };
}

function scriptItem(
  order: number,
  title: string,
  prompt: string,
  expectedDecision: string
): WeeklyExecutionReviewScriptItem {
  return { id: `script-${order}`, order, title, prompt, expectedDecision };
}

function normalizeOwner(owner: string): string {
  if (owner.toLocaleLowerCase("pt-BR").includes("marketing")) return "marketing";
  if (owner.toLocaleLowerCase("pt-BR").includes("atendimento")) return "atendimento";
  if (owner.toLocaleLowerCase("pt-BR").includes("revisao")) return "revisao humana";
  if (owner.toLocaleLowerCase("pt-BR").includes("cadu")) return "Cadu";
  return owner.trim() || "revisao humana";
}

function summarizeOwnerFocus(tasks: WeeklyExecutionTask[]): string {
  const top = tasks.sort((a, b) => a.rank - b.rank)[0];
  if (!top) return "Sem tarefa atribuida.";
  return `Foco principal: ${top.title}. ${top.objective}`;
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
