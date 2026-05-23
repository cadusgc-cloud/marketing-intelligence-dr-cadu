import { buildMarketingOpsState } from "@/lib/marketing-ops/execution";
import type { OpsLocalState } from "@/lib/marketing-ops/types";

export function getDefaultMarketingOpsState() {
  return buildMarketingOpsState();
}

export function getDefaultOpsLocalState(): OpsLocalState {
  return {
    selectedScope: "hoje",
    taskStatuses: {},
    filters: {}
  };
}
