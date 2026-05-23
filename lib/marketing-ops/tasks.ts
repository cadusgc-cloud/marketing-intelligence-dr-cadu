import type {
  ContentProductionQueue,
  DailyExecutionPlan,
  ExecutionTask,
  MediaCaptureTask,
  TaskPriority,
  TaskStatus
} from "@/lib/marketing-ops/types";
import type { EditorialDay, SafetyClassification } from "@/lib/monthly-editorial";

export function buildTasksForEditorialDay(day: EditorialDay): ExecutionTask[] {
  const blocked = day.safetyGate.classification === "bloquear";
  const needsReview = day.safetyGate.classification === "revisar_antes_de_postar" || day.safetyGate.classification === "atencao";
  const tasks: ExecutionTask[] = [];

  tasks.push(task(day, "stories-copy", "Copiar stories do dia", "Copiar a sequencia de 6 stories do StoryOps para revisao humana.", "stories", "alta", "Cadu", false, day.content.storySequence.exportText));

  if (day.mediaSuggestions.length === 0 || day.mediaSuggestions.some((media) => media.risk !== "seguro")) {
    tasks.push(task(day, "media-capture", "Capturar midia natural segura", "Separar foto/video neutro sem local, paciente, tela ou documento.", "media", "alta", "marketing", false));
  }

  if (needsReview || blocked) {
    tasks.push(task(day, "safety-review", "Revisar seguranca editorial", "Conferir alertas medico-publicitarios antes de qualquer uso externo.", "safety", blocked ? "critica" : "alta", "revisao humana", blocked));
  }

  if (day.content.reelPlan) {
    tasks.push(task(day, "record-reel", "Gravar video curto", "Gravar reel curto com fala natural, fundo neutro e sem promessa.", "reels", "alta", "Cadu", false, day.content.reelPlan.exportText));
    tasks.push(task(day, "editor-brief", "Enviar briefing ao editor", "Copiar briefing de cortes, texto na tela e seguranca para edicao manual.", "exports", "media", "editor", false, day.content.reelPlan.exportText));
  }

  if (day.content.carouselPlan) {
    tasks.push(task(day, "prepare-carousel", "Preparar carrossel", "Transformar cards em layout limpo, sem pessoa identificavel ou comparacao visual indevida.", "carrossel", "media", "marketing", false, day.content.carouselPlan.exportText));
  }

  if (day.content.postPlan) {
    tasks.push(task(day, "prepare-post", "Preparar post", "Revisar legenda curta e escolher imagem neutra para publicacao manual.", "post", "media", "marketing", false, day.content.postPlan.exportText));
  }

  if (!blocked) {
    tasks.push(task(day, "manual-publish", "Publicar manualmente apos revisao", "Publicar fora do sistema somente se texto, midia e safety estiverem aprovados.", "publishing", needsReview ? "media" : "alta", "Cadu", false));
  }

  return tasks;
}

export function buildProductionQueue(days: DailyExecutionPlan[]): ContentProductionQueue {
  const tasks = days.flatMap((day) => day.tasks);
  const mediaTasks = tasks
    .filter((taskItem) => taskItem.area === "media")
    .map((taskItem) => ({
      ...taskItem,
      mediaCategory: "midia natural",
      captureGuidance: "Capturar material vertical, neutro e sem identificacao.",
      privacyNote: "Bloquear se houver paciente, local, tela, prontuario, documento ou dado pessoal."
    })) as MediaCaptureTask[];

  return {
    tasks,
    blockedTasks: tasks.filter((taskItem) => taskItem.status === "bloqueado" || taskItem.blockedBySafety),
    publicationTasks: tasks.filter((taskItem) => taskItem.area === "publishing"),
    reviewTasks: tasks.filter((taskItem) => taskItem.area === "safety"),
    mediaTasks,
    readyTasks: tasks.filter((taskItem) => taskItem.status === "pronto" || taskItem.status === "publicado_manual")
  };
}

export function applyTaskStatusOverrides(tasks: ExecutionTask[], overrides: Record<string, TaskStatus>): ExecutionTask[] {
  return tasks.map((taskItem) => ({ ...taskItem, status: overrides[taskItem.id] ?? taskItem.status }));
}

export function priorityForRisk(risk: SafetyClassification): TaskPriority {
  if (risk === "bloquear") return "critica";
  if (risk === "revisar_antes_de_postar") return "alta";
  if (risk === "atencao") return "media";
  return "baixa";
}

function task(
  day: EditorialDay,
  suffix: string,
  title: string,
  description: string,
  area: ExecutionTask["area"],
  priority: TaskPriority,
  ownerSuggestion: ExecutionTask["ownerSuggestion"],
  blockedBySafety: boolean,
  exportText?: string
): ExecutionTask {
  return {
    id: `${day.id}-${suffix}`,
    dayId: day.id,
    dayNumber: day.dayNumber,
    date: day.date,
    title,
    description,
    status: blockedBySafety ? "bloqueado" : "pendente",
    priority,
    area,
    ownerSuggestion,
    actionWindow: day.dayNumber <= 1 ? "hoje" : day.weekNumber === 1 ? "esta_semana" : "este_mes",
    blockedBySafety,
    exportText
  };
}
