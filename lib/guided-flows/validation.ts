import type { FlowValidationResult, GuidedFlow } from "@/lib/guided-flows/types";

export function validateGuidedFlow(flow: GuidedFlow): FlowValidationResult {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];
  if (!flow.id) blockingIssues.push("Fluxo sem id.");
  if (!flow.name) blockingIssues.push("Fluxo sem nome.");
  if (!flow.description) blockingIssues.push("Fluxo sem descricao.");
  if (flow.estimatedMinutes <= 0) blockingIssues.push("Duracao estimada invalida.");
  if (!flow.steps.length) blockingIssues.push("Fluxo sem etapas.");
  if (!flow.outputs.length) blockingIssues.push("Fluxo sem outputs.");
  if (!flow.routeLinks.length) warnings.push("Fluxo sem rotas relacionadas.");
  flow.steps.forEach((step) => {
    if (!step.id || !step.title || !step.route) blockingIssues.push(`Etapa incompleta em ${flow.id}.`);
    if (/paciente|cirurgia de hoje|hospital agora|agende agora|resultado garantido/i.test(`${step.title} ${step.description} ${step.expectedOutput}`)) {
      blockingIssues.push(`Etapa com termo sensivel em ${flow.id}.`);
    }
  });
  return { ok: blockingIssues.length === 0, blockingIssues, warnings };
}

export function validateGuidedFlowCatalog(flows: GuidedFlow[]): FlowValidationResult {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  flows.forEach((flow) => {
    if (ids.has(flow.id)) blockingIssues.push(`Fluxo duplicado: ${flow.id}`);
    ids.add(flow.id);
    const result = validateGuidedFlow(flow);
    blockingIssues.push(...result.blockingIssues);
    warnings.push(...result.warnings);
  });
  if (flows.length < 15) blockingIssues.push("Catalogo deve ter pelo menos 15 fluxos.");
  return { ok: blockingIssues.length === 0, blockingIssues, warnings };
}
