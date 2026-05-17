import type {
  WeeklyNextCollectionPlan,
  WeeklyNextCollectionTask,
  WeeklyNextCollectionTaskOwner
} from "@/lib/weeklyNextCollectionPlan";

export type WeeklyCollectionWorkspaceItemKind = "task" | "daily" | "weekly_close" | "review_gate";
export type WeeklyCollectionWorkspaceItemStatus = "pending" | "done" | "blocked";

export type WeeklyCollectionWorkspaceItem = {
  id: string;
  kind: WeeklyCollectionWorkspaceItemKind;
  title: string;
  detail: string;
  ownerSuggestion: WeeklyNextCollectionTaskOwner | "revisao";
  priority: WeeklyNextCollectionTask["priority"];
  guardrail: string;
};

export type WeeklyCollectionWorkspaceState = {
  statuses: Record<string, WeeklyCollectionWorkspaceItemStatus>;
  updatedAt: string | null;
};

export type WeeklyCollectionWorkspaceProgress = {
  total: number;
  done: number;
  blocked: number;
  pending: number;
  percent: number;
  status: "not_started" | "in_progress" | "blocked" | "complete";
  summary: string;
};

export type WeeklyCollectionWorkspace = {
  id: string;
  title: string;
  weekLabel: string;
  storageKey: string;
  summary: string;
  items: WeeklyCollectionWorkspaceItem[];
  guardrails: string[];
  nextRoutes: Array<{ label: string; href: string; purpose: string }>;
};

const reviewGates = [
  "Periodo igual em todas as fontes.",
  "Somente totais agregados.",
  "Nenhum dado pessoal, clinico, conversa, print privado ou identificador.",
  "Dezembro/2025 fora de benchmark normal quando aplicavel.",
  "Revisao humana concluida antes de salvar em /data."
];

export function buildWeeklyCollectionWorkspace(plan: WeeklyNextCollectionPlan): WeeklyCollectionWorkspace {
  const items = [
    ...plan.tasks.map(taskToWorkspaceItem),
    ...plan.dailyRoutine.map((item, index) =>
      workspaceItem(`daily-${index + 1}`, "daily", item, "Registrar durante a semana sem dado pessoal.", "marketing", "medium", "Usar apenas contagens agregadas e fatos reais.")
    ),
    ...plan.weeklyCloseRoutine.map((item, index) =>
      workspaceItem(`weekly-close-${index + 1}`, "weekly_close", item, "Conferir no fechamento antes de salvar a semana.", "revisao humana", "medium", "Salvar somente depois de revisao humana.")
    ),
    ...reviewGates.map((item, index) =>
      workspaceItem(`review-gate-${index + 1}`, "review_gate", item, "Gate final antes de qualquer salvamento ou leitura decisoria.", "revisao", "high", "Se falhar, nao salvar conclusao forte.")
    )
  ];

  return {
    id: `weekly-collection-workspace-${plan.id}`,
    title: "Workspace local de coleta semanal",
    weekLabel: plan.weekLabel,
    storageKey: `marketing-os:weekly-collection-workspace:${plan.id}`,
    summary:
      "Checklist local para acompanhar a coleta agregada da semana. O progresso fica apenas neste navegador e nao salva dados reais no banco.",
    items,
    guardrails: [
      "Registrar somente status de tarefa: pendente, coletado ou bloqueado.",
      "Nao inserir nomes, DMs, conversas, prints privados, dados clinicos ou pacientes.",
      "Nao conectar API, OAuth, scraping, e-mail, WhatsApp ou redes sociais.",
      "Nao usar Dezembro/2025 como benchmark normal.",
      "Revisar manualmente antes de salvar em /data."
    ],
    nextRoutes: [
      { label: "Dados semanais", href: "/data", purpose: "Preencher metricas agregadas depois da coleta." },
      { label: "Plano copiavel", href: "/data/next-collection-plan", purpose: "Abrir o pacote do plano de coleta." },
      { label: "Guia de coleta", href: "/data/collection-guide", purpose: "Conferir a fonte manual de cada metrica." },
      { label: "Trilha de revisao", href: "/data/manual-review-trail", purpose: "Copiar registro interno de revisao antes de salvar." },
      { label: "Weekly Command Center", href: "/weekly", purpose: "Ler a semana depois de salvar." }
    ]
  };
}

export function createInitialWorkspaceState(workspace: WeeklyCollectionWorkspace): WeeklyCollectionWorkspaceState {
  return {
    statuses: Object.fromEntries(workspace.items.map((item) => [item.id, "pending" as const])),
    updatedAt: null
  };
}

export function normalizeWorkspaceState(
  workspace: WeeklyCollectionWorkspace,
  state: Partial<WeeklyCollectionWorkspaceState> | null | undefined
): WeeklyCollectionWorkspaceState {
  const initial = createInitialWorkspaceState(workspace);
  if (!state || !state.statuses) return initial;

  return {
    statuses: Object.fromEntries(
      workspace.items.map((item) => {
        const status = state.statuses?.[item.id];
        return [item.id, isWorkspaceStatus(status) ? status : "pending"];
      })
    ),
    updatedAt: typeof state.updatedAt === "string" ? state.updatedAt : null
  };
}

export function calculateWeeklyCollectionWorkspaceProgress(
  workspace: WeeklyCollectionWorkspace,
  state: WeeklyCollectionWorkspaceState
): WeeklyCollectionWorkspaceProgress {
  const statuses = workspace.items.map((item) => state.statuses[item.id] ?? "pending");
  const total = statuses.length;
  const done = statuses.filter((status) => status === "done").length;
  const blocked = statuses.filter((status) => status === "blocked").length;
  const pending = total - done - blocked;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const status = blocked > 0 ? "blocked" : done === 0 ? "not_started" : done === total ? "complete" : "in_progress";

  return {
    total,
    done,
    blocked,
    pending,
    percent,
    status,
    summary: buildProgressSummary(status, done, blocked, pending, total)
  };
}

export function buildWeeklyCollectionWorkspaceSummaryText(
  workspace: WeeklyCollectionWorkspace,
  state: WeeklyCollectionWorkspaceState
): string {
  const progress = calculateWeeklyCollectionWorkspaceProgress(workspace, state);
  const lines = [
    `${workspace.title} - ${workspace.weekLabel}`,
    progress.summary,
    "",
    "Itens:",
    ...workspace.items.map((item) => `- [${state.statuses[item.id] ?? "pending"}] ${item.title} (${item.ownerSuggestion})`),
    "",
    "Guardrails:",
    ...workspace.guardrails.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function taskToWorkspaceItem(task: WeeklyNextCollectionTask): WeeklyCollectionWorkspaceItem {
  return workspaceItem(task.id, "task", task.title, task.action, task.ownerSuggestion, task.priority, task.guardrail);
}

function workspaceItem(
  id: string,
  kind: WeeklyCollectionWorkspaceItemKind,
  title: string,
  detail: string,
  ownerSuggestion: WeeklyCollectionWorkspaceItem["ownerSuggestion"],
  priority: WeeklyCollectionWorkspaceItem["priority"],
  guardrail: string
): WeeklyCollectionWorkspaceItem {
  return { id, kind, title, detail, ownerSuggestion, priority, guardrail };
}

function isWorkspaceStatus(value: unknown): value is WeeklyCollectionWorkspaceItemStatus {
  return value === "pending" || value === "done" || value === "blocked";
}

function buildProgressSummary(status: WeeklyCollectionWorkspaceProgress["status"], done: number, blocked: number, pending: number, total: number): string {
  if (status === "complete") return `Coleta marcada como completa: ${done}/${total} itens concluidos.`;
  if (status === "blocked") return `Coleta com bloqueio: ${blocked} item(ns) bloqueado(s), ${done}/${total} concluidos e ${pending} pendente(s).`;
  if (status === "not_started") return `Coleta ainda nao iniciada: ${total} item(ns) pendente(s).`;
  return `Coleta em andamento: ${done}/${total} item(ns) concluidos e ${pending} pendente(s).`;
}
