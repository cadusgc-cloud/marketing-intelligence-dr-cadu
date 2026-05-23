import type { FlowProgress, GuidedFlow, GuidedFlowRun, GuidedFlowStatus } from "@/lib/guided-flows/types";

export function calculateFlowProgress(flow: GuidedFlow, completedStepIds: string[] = []): FlowProgress {
  const validCompleted = completedStepIds.filter((id) => flow.steps.some((step) => step.id === id));
  const unique = Array.from(new Set(validCompleted));
  const totalSteps = flow.steps.length;
  const completedSteps = unique.length;
  const progressPercent = totalSteps === 0 ? 0 : Math.min(100, Math.round((completedSteps / totalSteps) * 100));
  const status: GuidedFlowStatus = progressPercent === 100 ? "concluido" : completedSteps > 0 ? "em_andamento" : "nao_iniciado";
  return {
    totalSteps,
    completedSteps,
    progressPercent,
    status,
    nextStep: flow.steps.find((step) => !unique.includes(step.id))
  };
}

export function updateRunProgress(flow: GuidedFlow, run: GuidedFlowRun): GuidedFlowRun {
  const progress = calculateFlowProgress(flow, run.completedStepIds);
  return {
    ...run,
    status: progress.status,
    progressPercent: progress.progressPercent,
    currentStepId: progress.nextStep?.id,
    updatedAt: run.updatedAt
  };
}
