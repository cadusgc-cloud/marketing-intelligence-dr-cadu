import type {
  WeeklyNextCollectionPlan,
  WeeklyNextCollectionTask,
  WeeklyNextCollectionTaskOwner
} from "@/lib/weeklyNextCollectionPlan";

export type WeeklyNextCollectionPacketArtifactType = "full_plan" | "daily_routine" | "weekly_close" | "handoff" | "owner_brief";

export type WeeklyNextCollectionPacketArtifact = {
  id: string;
  title: string;
  type: WeeklyNextCollectionPacketArtifactType;
  description: string;
  content: string;
  usage: string[];
};

export type WeeklyNextCollectionOwnerBrief = {
  owner: WeeklyNextCollectionTaskOwner;
  title: string;
  taskCount: number;
  content: string;
};

export type WeeklyNextCollectionPacket = {
  id: string;
  title: string;
  summary: string;
  planStatus: WeeklyNextCollectionPlan["status"];
  artifacts: WeeklyNextCollectionPacketArtifact[];
  ownerBriefs: WeeklyNextCollectionOwnerBrief[];
  fullPacketText: string;
  nextRoutes: Array<{ label: string; href: string; purpose: string }>;
  doNotUse: string[];
};

export function buildWeeklyNextCollectionPacket(plan: WeeklyNextCollectionPlan): WeeklyNextCollectionPacket {
  const ownerBriefs = buildWeeklyNextCollectionOwnerBriefs(plan);
  const fullPacketText = buildWeeklyNextCollectionPacketText(plan, ownerBriefs);

  return {
    id: `weekly-next-collection-packet-${plan.id}`,
    title: "Pacote copiavel do plano de coleta",
    summary:
      "Pacote interno para copiar, revisar e executar manualmente a coleta agregada da proxima semana. Ele nao envia mensagens, nao conecta APIs e nao substitui revisao humana.",
    planStatus: plan.status,
    artifacts: [
      artifact(
        "full-plan",
        "Plano completo copiavel",
        "full_plan",
        "Resumo completo com tarefas, rotinas, aceite, limites e handoff interno.",
        fullPacketText,
        ["Use como roteiro interno.", "Revise antes de compartilhar manualmente.", "Remova qualquer item que nao se aplique a semana real."]
      ),
      artifact(
        "daily-routine",
        "Roteiro diario",
        "daily_routine",
        "Checklist curto para registrar presenca diaria sem dado pessoal.",
        buildRoutineText("Roteiro diario", plan.dailyRoutine),
        ["Usar durante a semana.", "Registrar apenas contagens agregadas.", "Nao inventar rotina, evento ou bastidor."]
      ),
      artifact(
        "weekly-close",
        "Fechamento semanal",
        "weekly_close",
        "Sequencia de fechamento antes de preencher ou salvar /data.",
        buildRoutineText("Fechamento semanal", plan.weeklyCloseRoutine),
        ["Usar no ultimo dia da semana.", "Conferir mesmo periodo entre fontes.", "Salvar somente depois de revisao humana."]
      ),
      artifact(
        "internal-handoff",
        "Handoff interno",
        "handoff",
        "Texto seguro para pedir os totais agregados internamente.",
        plan.handoffScript,
        ["Copiar manualmente se fizer sentido.", "O sistema nao envia essa mensagem.", "Manter apenas metricas agregadas."]
      ),
      artifact(
        "owner-briefs",
        "Briefs por responsavel",
        "owner_brief",
        "Blocos separados por responsavel sugerido para facilitar coleta manual.",
        ownerBriefs.map((brief) => brief.content).join("\n\n---\n\n"),
        ["Usar como divisao interna de tarefas.", "Nao enviar automaticamente.", "Validar responsavel antes de executar."]
      )
    ],
    ownerBriefs,
    fullPacketText,
    nextRoutes: [
      { label: "Dados semanais", href: "/data", purpose: "Voltar ao formulario e revisar o plano calculado pelos dados atuais." },
      { label: "Workspace local", href: "/data/collection-workspace", purpose: "Acompanhar status da coleta no navegador." },
      { label: "Guia de coleta", href: "/data/collection-guide", purpose: "Conferir fonte manual de cada metrica." },
      { label: "Pacote de coleta", href: "/data/collection-packet", purpose: "Copiar template geral de coleta semanal." },
      { label: "Weekly Command Center", href: "/weekly", purpose: "Ler diagnostico apenas depois de salvar a semana." }
    ],
    doNotUse: plan.doNotDo
  };
}

export function buildWeeklyNextCollectionPacketText(
  plan: WeeklyNextCollectionPlan,
  ownerBriefs: WeeklyNextCollectionOwnerBrief[] = buildWeeklyNextCollectionOwnerBriefs(plan)
): string {
  return [
    `# ${plan.title}`,
    "",
    `Semana base: ${plan.weekLabel}`,
    `Status: ${planStatusLabel(plan.status)}`,
    "",
    "## Resumo",
    plan.summary,
    "",
    "## Tarefas priorizadas",
    ...plan.tasks.flatMap((task, index) => formatTask(index + 1, task)),
    "",
    "## Roteiro diario",
    ...plan.dailyRoutine.map((item) => `- [ ] ${item}`),
    "",
    "## Fechamento semanal",
    ...plan.weeklyCloseRoutine.map((item) => `- [ ] ${item}`),
    "",
    "## Briefs por responsavel",
    ...ownerBriefs.flatMap((brief) => [brief.title, brief.content, ""]),
    "## Handoff interno",
    plan.handoffScript,
    "",
    "## Nao fazer",
    ...plan.doNotDo.map((item) => `- ${item}`),
    "",
    "## Revisao final",
    "- [ ] Periodo igual em todas as fontes.",
    "- [ ] Somente totais agregados.",
    "- [ ] Nenhum dado pessoal, clinico, conversa, print privado ou identificador.",
    "- [ ] Dezembro/2025 fora de benchmark normal quando aplicavel.",
    "- [ ] Revisao humana concluida antes de salvar em /data."
  ].join("\n");
}

export function buildWeeklyNextCollectionOwnerBriefs(plan: WeeklyNextCollectionPlan): WeeklyNextCollectionOwnerBrief[] {
  const owners: WeeklyNextCollectionTaskOwner[] = ["Cadu", "marketing", "atendimento", "revisao humana"];

  return owners
    .map((owner) => {
      const tasks = plan.tasks.filter((task) => task.ownerSuggestion === owner);
      if (!tasks.length) return null;

      return {
        owner,
        title: `Brief - ${owner}`,
        taskCount: tasks.length,
        content: buildOwnerBriefContent(owner, tasks)
      };
    })
    .filter((brief): brief is WeeklyNextCollectionOwnerBrief => Boolean(brief));
}

function buildOwnerBriefContent(owner: WeeklyNextCollectionTaskOwner, tasks: WeeklyNextCollectionTask[]): string {
  return [
    `Brief - ${owner}`,
    "",
    "Objetivo: coletar apenas metricas agregadas e revisar antes de qualquer uso.",
    "",
    ...tasks.flatMap((task, index) => [
      `${index + 1}. ${task.title}`,
      `   - Prioridade: ${priorityLabel(task.priority)}.`,
      `   - Cadencia: ${cadenceLabel(task.cadence)}.`,
      `   - Acao: ${task.action}`,
      `   - Evidencia: ${task.evidenceToCollect.join("; ")}`,
      `   - Aceite: ${task.acceptanceCriteria.join("; ")}`,
      `   - Limite: ${task.guardrail}`
    ]),
    "",
    "Limites fixos: sem dados pessoais, sem API externa, sem envio automatico e sem decisao sem revisao humana."
  ].join("\n");
}

function formatTask(position: number, task: WeeklyNextCollectionTask): string[] {
  return [
    `${position}. ${task.title}`,
    `   - Responsavel sugerido: ${task.ownerSuggestion}.`,
    `   - Prioridade: ${priorityLabel(task.priority)}.`,
    `   - Cadencia: ${cadenceLabel(task.cadence)}.`,
    `   - Acao: ${task.action}`,
    `   - Evidencia: ${task.evidenceToCollect.join("; ")}`,
    `   - Criterios de aceite: ${task.acceptanceCriteria.join("; ")}`,
    `   - Guardrail: ${task.guardrail}`
  ];
}

function buildRoutineText(title: string, items: string[]): string {
  return [title, "", ...items.map((item) => `- [ ] ${item}`)].join("\n");
}

function artifact(
  id: string,
  title: string,
  type: WeeklyNextCollectionPacketArtifactType,
  description: string,
  content: string,
  usage: string[]
): WeeklyNextCollectionPacketArtifact {
  return { id, title, type, description, content, usage };
}

function planStatusLabel(status: WeeklyNextCollectionPlan["status"]): string {
  if (status === "ready_to_plan") return "rotina pronta";
  if (status === "blocked") return "bloqueado";
  return "coleta pendente";
}

function priorityLabel(priority: WeeklyNextCollectionTask["priority"]): string {
  if (priority === "high") return "alta";
  if (priority === "medium") return "media";
  return "baixa";
}

function cadenceLabel(cadence: WeeklyNextCollectionTask["cadence"]): string {
  return {
    before_week_starts: "antes da semana",
    daily: "diario",
    weekly_close: "fechamento semanal",
    review_only: "revisao obrigatoria"
  }[cadence];
}
