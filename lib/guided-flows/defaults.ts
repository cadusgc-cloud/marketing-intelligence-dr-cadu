import { buildCommandCenterDashboard, generateNextOperationalAction } from "@/lib/guided-flows/recommendations";
import { getGuidedFlowCatalog } from "@/lib/guided-flows/registry";
import { createFlowRun } from "@/lib/guided-flows/runner";

export function buildDefaultGuidedFlowState() {
  const flows = getGuidedFlowCatalog();
  const run = createFlowRun(flows[0].id);
  return {
    flows,
    run,
    nextAction: generateNextOperationalAction(),
    dashboard: buildCommandCenterDashboard()
  };
}
