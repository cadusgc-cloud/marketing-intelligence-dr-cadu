import type { MarketingWorkspace, WorkspaceEventSeverity, WorkspaceHistoryEvent, WorkspaceHistoryEventType } from "@/lib/marketing-workspace/types";
import { assertSafeWorkspaceText } from "@/lib/marketing-workspace/validation";

export function appendHistoryEvent(workspace: MarketingWorkspace, event: Omit<WorkspaceHistoryEvent, "id" | "timestamp" | "safetyStatus"> & { timestamp?: string }): MarketingWorkspace {
  const text = `${event.title} ${event.description} ${JSON.stringify(event.metadata)}`;
  const issues = assertSafeWorkspaceText(text, "history");
  const severity: WorkspaceEventSeverity = issues.length ? "bloquear" : event.severity;
  const historyEvent: WorkspaceHistoryEvent = {
    ...event,
    id: `event-${workspace.history.length + 1}-${event.type}`,
    timestamp: event.timestamp ?? "2026-05-23T12:00:00.000Z",
    severity,
    safetyStatus: issues.length ? "bloquear" : "saudavel"
  };
  return { ...workspace, history: [historyEvent, ...workspace.history] };
}

export function filterHistoryEvents(
  events: WorkspaceHistoryEvent[],
  filters: Partial<{ type: WorkspaceHistoryEventType; severity: WorkspaceEventSeverity; sourceModule: string; relatedRoute: string }>
): WorkspaceHistoryEvent[] {
  return events.filter((event) =>
    (!filters.type || event.type === filters.type) &&
    (!filters.severity || event.severity === filters.severity) &&
    (!filters.sourceModule || event.sourceModule === filters.sourceModule) &&
    (!filters.relatedRoute || event.relatedRoute === filters.relatedRoute)
  );
}

export function summarizeHistory(events: WorkspaceHistoryEvent[]): { total: number; critical: number; exports: number; snapshots: number; lastEvent?: WorkspaceHistoryEvent } {
  return {
    total: events.length,
    critical: events.filter((event) => event.severity === "bloquear" || event.severity === "revisar").length,
    exports: events.filter((event) => event.type === "export_generated").length,
    snapshots: events.filter((event) => event.type === "snapshot_created").length,
    lastEvent: [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
  };
}

export function exportHistoryMarkdown(events: WorkspaceHistoryEvent[]): string {
  return ["# Historico operacional", "", ...events.map((event) => `- ${event.timestamp} | ${event.severity} | ${event.type} | ${event.title} | ${event.relatedRoute}`)].join("\n");
}

export function exportHistoryTSV(events: WorkspaceHistoryEvent[]): string {
  return ["Data\tTipo\tSeveridade\tModulo\tRota\tTitulo", ...events.map((event) => [event.timestamp, event.type, event.severity, event.sourceModule, event.relatedRoute, event.title].join("\t"))].join("\n");
}
