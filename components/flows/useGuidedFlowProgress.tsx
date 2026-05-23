"use client";

import { useEffect, useMemo, useState } from "react";
import { completeFlowStep, createFlowRun, resetFlowRun, resumeFlowRun, type GuidedFlowRun } from "@/lib/guided-flows";

const FLOW_STORAGE_KEY = "marketing-os-v9-guided-flow-runs";

function readRuns(): Record<string, GuidedFlowRun> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FLOW_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, GuidedFlowRun>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRuns(runs: Record<string, GuidedFlowRun>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(runs));
  } catch {
    // Local progress is optional; failing to persist must not break the app.
  }
}

export function useGuidedFlowProgress(flowId: string) {
  const [runs, setRuns] = useState<Record<string, GuidedFlowRun>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRuns(readRuns());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeRuns(runs);
  }, [hydrated, runs]);

  const run = useMemo(() => {
    const stored = runs[flowId];
    return stored ? resumeFlowRun(stored) : createFlowRun(flowId);
  }, [flowId, runs]);

  function markStep(stepId: string) {
    setRuns((current) => ({ ...current, [flowId]: completeFlowStep(current[flowId] ?? createFlowRun(flowId), stepId) }));
  }

  function reset() {
    setRuns((current) => ({ ...current, [flowId]: resetFlowRun(current[flowId] ?? createFlowRun(flowId)) }));
  }

  function start() {
    setRuns((current) => ({ ...current, [flowId]: current[flowId] ?? createFlowRun(flowId) }));
  }

  return {
    run,
    hydrated,
    storageStatus: hydrated ? "progresso local ativo" : "carregando progresso local",
    markStep,
    reset,
    start
  };
}
