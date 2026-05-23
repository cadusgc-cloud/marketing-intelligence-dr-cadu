import { calculateFlowProgress } from "@/lib/guided-flows/progress";
import { getGuidedFlowById } from "@/lib/guided-flows/registry";
import type { FlowRunContext, GuidedFlow, GuidedFlowRun } from "@/lib/guided-flows/types";

export function createFlowRun(flowId: string, context: FlowRunContext = {}): GuidedFlowRun {
  const flow = getGuidedFlowById(flowId);
  if (!flow) throw new Error(`Fluxo desconhecido: ${flowId}`);
  const now = context.now ?? "2026-05-24T09:00:00.000Z";
  const completedStepIds = context.completedStepIds ?? [];
  const progress = calculateFlowProgress(flow, completedStepIds);
  return {
    id: `run-${flowId}-${now.slice(0, 10)}`,
    flowId,
    startedAt: now,
    updatedAt: now,
    status: progress.status,
    completedStepIds: Array.from(new Set(completedStepIds.filter((id) => flow.steps.some((step) => step.id === id)))),
    currentStepId: progress.nextStep?.id,
    progressPercent: progress.progressPercent,
    exportText: exportFlowRunSummary(flow, completedStepIds)
  };
}

export function completeFlowStep(run: GuidedFlowRun, stepId: string, now = "2026-05-24T09:30:00.000Z"): GuidedFlowRun {
  const flow = getGuidedFlowById(run.flowId);
  if (!flow) throw new Error(`Fluxo desconhecido: ${run.flowId}`);
  if (!flow.steps.some((step) => step.id === stepId)) throw new Error(`Etapa inexistente: ${stepId}`);
  const completedStepIds = Array.from(new Set([...run.completedStepIds, stepId]));
  const progress = calculateFlowProgress(flow, completedStepIds);
  return {
    ...run,
    completedStepIds,
    currentStepId: progress.nextStep?.id,
    progressPercent: progress.progressPercent,
    status: progress.status,
    updatedAt: now,
    exportText: exportFlowRunSummary(flow, completedStepIds)
  };
}

export function resetFlowRun(run: GuidedFlowRun): GuidedFlowRun {
  return createFlowRun(run.flowId, { now: run.startedAt, completedStepIds: [] });
}

export function resumeFlowRun(run: GuidedFlowRun): GuidedFlowRun {
  const flow = getGuidedFlowById(run.flowId);
  if (!flow) throw new Error(`Fluxo desconhecido: ${run.flowId}`);
  const progress = calculateFlowProgress(flow, run.completedStepIds);
  return {
    ...run,
    currentStepId: progress.nextStep?.id,
    progressPercent: progress.progressPercent,
    status: progress.status,
    exportText: exportFlowRunSummary(flow, run.completedStepIds)
  };
}

export function exportFlowRunSummary(flow: GuidedFlow, completedStepIds: string[] = []): string {
  const progress = calculateFlowProgress(flow, completedStepIds);
  const lines = [
    `# Fluxo guiado: ${flow.name}`,
    "",
    `Status: ${progress.status}`,
    `Progresso: ${progress.completedSteps}/${progress.totalSteps} (${progress.progressPercent}%)`,
    `Duracao estimada: ${flow.estimatedMinutes} minutos`,
    "",
    "## Etapas"
  ];
  flow.steps.forEach((step) => {
    const marker = completedStepIds.includes(step.id) ? "[x]" : "[ ]";
    lines.push(`- ${marker} ${step.title} (${step.route}) - ${step.expectedOutput}`);
  });
  lines.push("", "## Saidas esperadas");
  flow.outputs.forEach((item) => lines.push(`- ${item.label}: ${item.description}`));
  lines.push("", "Publicacao, upload, API externa e push nao sao executados por este fluxo.");
  return lines.join("\n");
}

export function buildFlowHistoryEvents(run: GuidedFlowRun) {
  return [
    { type: "flow_started", title: "Fluxo iniciado", description: run.flowId },
    ...run.completedStepIds.map((id) => ({ type: "flow_step_completed", title: "Etapa concluida", description: id })),
    ...(run.status === "concluido" ? [{ type: "flow_completed", title: "Fluxo concluido", description: run.flowId }] : [])
  ];
}
