import type { FlowPrerequisite, FlowRunContext, GuidedFlow } from "@/lib/guided-flows/types";

export function normalizeFlowContext(context: FlowRunContext = {}): Required<FlowRunContext> {
  return {
    now: context.now ?? "2026-05-24T09:00:00.000Z",
    hasWorkspace: context.hasWorkspace ?? true,
    hasImportedData: context.hasImportedData ?? true,
    hasWeeklyReview: context.hasWeeklyReview ?? true,
    hasBackup: context.hasBackup ?? true,
    hasSafetyReview: context.hasSafetyReview ?? true,
    hasThemes: context.hasThemes ?? true,
    hasReleaseChecks: context.hasReleaseChecks ?? true,
    currentRoute: context.currentRoute ?? "/command-center",
    weekday: context.weekday ?? "domingo",
    completedStepIds: context.completedStepIds ?? []
  };
}

function evaluateOne(prerequisite: FlowPrerequisite, context: Required<FlowRunContext>): FlowPrerequisite {
  const next = { ...prerequisite };
  const missingStatus = next.severity === "bloqueante" ? "bloqueante" : "ausente";
  if (next.id.includes("workspace")) next.status = context.hasWorkspace ? "ok" : missingStatus;
  else if (next.id.includes("report") || next.id.includes("metric") || next.id.includes("import")) next.status = context.hasImportedData ? "ok" : missingStatus;
  else if (next.id.includes("weekly-review")) next.status = context.hasWeeklyReview ? "ok" : missingStatus;
  else if (next.id.includes("backup")) next.status = context.hasBackup ? "ok" : missingStatus;
  else if (next.id.includes("safety")) next.status = context.hasSafetyReview ? "ok" : "bloqueante";
  else if (next.id.includes("theme") || next.id.includes("campaign") || next.id.includes("studio") || next.id.includes("recording")) next.status = context.hasThemes ? "ok" : missingStatus;
  else if (next.id.includes("release")) next.status = context.hasReleaseChecks ? "ok" : "atencao";
  else next.status = "ok";
  return next;
}

export function evaluateFlowPrerequisites(flow: GuidedFlow, context: FlowRunContext = {}): FlowPrerequisite[] {
  const normalized = normalizeFlowContext(context);
  return flow.prerequisites.map((prerequisite) => evaluateOne(prerequisite, normalized));
}

export function canStartFlow(flow: GuidedFlow, context: FlowRunContext = {}): boolean {
  return !evaluateFlowPrerequisites(flow, context).some((prerequisite) => prerequisite.status === "bloqueante");
}
