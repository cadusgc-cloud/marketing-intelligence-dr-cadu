import { calculateFlowProgress } from "@/lib/guided-flows/progress";
import type { FlowExportBundle, GuidedFlow, GuidedFlowRun } from "@/lib/guided-flows/types";

export function buildFlowExportBundle(flow: GuidedFlow, run?: GuidedFlowRun): FlowExportBundle {
  const progress = calculateFlowProgress(flow, run?.completedStepIds ?? []);
  const flowSummaryMarkdown = [
    `# ${flow.name}`,
    "",
    flow.description,
    "",
    `Status: ${progress.status}`,
    `Progresso: ${progress.progressPercent}%`,
    `Duracao estimada: ${flow.estimatedMinutes} minutos`,
    "",
    "## Modulos",
    ...flow.modulesUsed.map((moduleName) => `- ${moduleName}`),
    "",
    "## Riscos",
    ...flow.risks.map((risk) => `- ${risk}`)
  ].join("\n");
  const flowChecklistMarkdown = [
    `# Checklist - ${flow.name}`,
    "",
    ...flow.steps.map((step) => `- [${run?.completedStepIds.includes(step.id) ? "x" : " "}] ${step.title} - ${step.route}`)
  ].join("\n");
  const flowOutputsTsv = ["Fluxo\tOutput\tTipo\tDescricao", ...flow.outputs.map((item) => `${flow.name}\t${item.label}\t${item.type}\t${item.description}`)].join("\n");
  return { flowSummaryMarkdown, flowChecklistMarkdown, flowOutputsTsv };
}
