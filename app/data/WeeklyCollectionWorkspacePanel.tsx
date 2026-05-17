"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildWeeklyCollectionWorkspaceSummaryText,
  calculateWeeklyCollectionWorkspaceProgress,
  createInitialWorkspaceState,
  normalizeWorkspaceState,
  type WeeklyCollectionWorkspace,
  type WeeklyCollectionWorkspaceItem,
  type WeeklyCollectionWorkspaceItemStatus,
  type WeeklyCollectionWorkspaceProgress,
  type WeeklyCollectionWorkspaceState
} from "@/lib/weeklyCollectionWorkspace";
import { buildWeeklyCollectionDecisionGate, type WeeklyCollectionDecisionGate } from "@/lib/weeklyCollectionDecisionGate";
import { buildWeeklyCollectionSaveHandoff, type WeeklyCollectionSaveHandoff } from "@/lib/weeklyCollectionSaveHandoff";
import type { WeeklySaveReadinessReport } from "@/lib/weeklyDataInput";

const statusOptions: Array<{ status: WeeklyCollectionWorkspaceItemStatus; label: string }> = [
  { status: "pending", label: "Pendente" },
  { status: "done", label: "Coletado" },
  { status: "blocked", label: "Bloqueado" }
];

export function WeeklyCollectionWorkspacePanel({ workspace, saveReadiness }: { workspace: WeeklyCollectionWorkspace; saveReadiness: WeeklySaveReadinessReport }) {
  const [state, setState] = useState<WeeklyCollectionWorkspaceState>(() => createInitialWorkspaceState(workspace));
  const [copied, setCopied] = useState(false);
  const [gateCopied, setGateCopied] = useState(false);
  const [handoffCopied, setHandoffCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const progress = useMemo(() => calculateWeeklyCollectionWorkspaceProgress(workspace, state), [workspace, state]);
  const decisionGate = useMemo(() => buildWeeklyCollectionDecisionGate(workspace, state), [workspace, state]);
  const saveHandoff = useMemo(() => buildWeeklyCollectionSaveHandoff(decisionGate, saveReadiness), [decisionGate, saveReadiness]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(workspace.storageKey);
      setState(normalizeWorkspaceState(workspace, stored ? (JSON.parse(stored) as Partial<WeeklyCollectionWorkspaceState>) : null));
    } catch {
      setState(createInitialWorkspaceState(workspace));
    }
    setHydrated(true);
  }, [workspace]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(workspace.storageKey, JSON.stringify(state));
    } catch {
      // Local progress is optional; the checklist remains usable without persistence.
    }
  }, [hydrated, workspace.storageKey, state]);

  function updateItemStatus(itemId: string, status: WeeklyCollectionWorkspaceItemStatus) {
    setCopied(false);
    setGateCopied(false);
    setHandoffCopied(false);
    setState((current) => ({
      statuses: {
        ...current.statuses,
        [itemId]: status
      },
      updatedAt: new Date().toISOString()
    }));
  }

  function resetWorkspace() {
    setCopied(false);
    setGateCopied(false);
    setHandoffCopied(false);
    setState(createInitialWorkspaceState(workspace));
  }

  async function copyWorkspaceSummary() {
    if (!navigator.clipboard) {
      setCopied(false);
      return;
    }

    await navigator.clipboard.writeText(buildWeeklyCollectionWorkspaceSummaryText(workspace, state));
    setCopied(true);
  }

  async function copyDecisionGate() {
    if (!navigator.clipboard) {
      setGateCopied(false);
      return;
    }

    await navigator.clipboard.writeText(decisionGate.copyText);
    setGateCopied(true);
  }

  async function copySaveHandoff() {
    if (!navigator.clipboard) {
      setHandoffCopied(false);
      return;
    }

    await navigator.clipboard.writeText(saveHandoff.copyText);
    setHandoffCopied(true);
  }

  return (
    <section className="panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-ocean">Workspace local v3.1</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{workspace.title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{workspace.summary}</p>
          <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
            Progresso salvo apenas neste navegador. Nao ha campo de texto livre para evitar dado pessoal, DM, print, conversa ou informacao clinica.
          </p>
        </div>
        <WorkspaceProgressBadge progress={progress} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <MetricCard label="Concluidos" value={progress.done} detail={`${progress.percent}% do checklist`} />
        <MetricCard label="Pendentes" value={progress.pending} detail="Ainda exigem coleta ou revisao." />
        <MetricCard label="Bloqueados" value={progress.blocked} detail="Nao salvar conclusao forte." />
        <MetricCard label="Total" value={progress.total} detail={workspace.weekLabel} />
      </div>

      <WorkspaceDecisionGateCard gate={decisionGate} copied={gateCopied} onCopy={copyDecisionGate} />
      <WorkspaceSaveHandoffCard handoff={saveHandoff} copied={handoffCopied} onCopy={copySaveHandoff} />

      <div className="mt-5 grid gap-3">
        {workspace.items.map((item) => (
          <WorkspaceItemRow key={item.id} item={item} status={state.statuses[item.id] ?? "pending"} onStatusChange={updateItemStatus} />
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)]">
        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold">Guardrails fixos</p>
          <ul className="mt-2 space-y-1">
            {workspace.guardrails.map((guardrail) => (
              <li key={guardrail}>- {guardrail}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-semibold">Acoes locais</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={copyWorkspaceSummary} className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
              Copiar status
            </button>
            <button type="button" onClick={resetWorkspace} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
              Resetar checklist local
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">O resumo copia apenas status de tarefas e guardrails. Nao ha envio automatico.</p>
          {copied ? <p className="mt-3 rounded-md bg-green-50 p-2 text-xs font-medium text-leaf">Status copiado para revisao manual.</p> : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {workspace.nextRoutes.map((route) => (
          <a key={route.href} href={route.href} title={route.purpose} className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
            {route.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function WorkspaceSaveHandoffCard({ handoff, copied, onCopy }: { handoff: WeeklyCollectionSaveHandoff; copied: boolean; onCopy: () => void }) {
  return (
    <article aria-label="Handoff pre-salvamento da semana" className={`mt-5 rounded-md border p-4 ${handoffPanelClass(handoff.severity)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Handoff local v3.2</p>
            <span className={`badge ${handoffBadgeClass(handoff.severity)}`}>{handoffStatusLabel(handoff.status)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{handoff.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{handoff.summary}</p>
        </div>
        <button type="button" onClick={onCopy} className="w-fit rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          Copiar handoff
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        {handoff.checklist.map((item) => (
          <div key={item.id} className="rounded-md bg-white/80 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${handoffItemBadgeClass(item.status)}`}>{handoffItemStatusLabel(item.status)}</span>
              <p className="font-semibold">{item.label}</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-md bg-white/80 p-3 text-sm text-slate-700">
        <p className="font-semibold">Proximas acoes</p>
        <ul className="mt-2 space-y-1">
          {handoff.nextActions.slice(0, 5).map((action) => (
            <li key={action}>- {action}</li>
          ))}
        </ul>
      </div>

      <p className="mt-4 rounded-md bg-white/80 p-3 text-xs leading-5 text-slate-600">
        Este handoff nao salva automaticamente e nao altera banco. Ele apenas cruza o gate de coleta com a validacao do formulario para orientar revisao humana antes de salvar.
      </p>
      {copied ? <p className="mt-3 rounded-md bg-green-50 p-2 text-xs font-medium text-leaf">Handoff copiado para revisao manual.</p> : null}
    </article>
  );
}

function WorkspaceDecisionGateCard({ gate, copied, onCopy }: { gate: WeeklyCollectionDecisionGate; copied: boolean; onCopy: () => void }) {
  return (
    <article aria-label="Gate de decisao da coleta" className={`mt-5 rounded-md border p-4 ${gatePanelClass(gate.severity)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Gate local v3.1</p>
            <span className={`badge ${gateBadgeClass(gate.severity)}`}>{gateStatusLabel(gate.status)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{gate.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{gate.summary}</p>
        </div>
        <button type="button" onClick={onCopy} className="w-fit rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          Copiar gate
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <GateList title="Proximas acoes" items={gate.nextActions.slice(0, 4)} />
        <GateList title="Perguntas de revisao" items={gate.reviewQuestions.slice(0, 4)} />
        <GateList title="Bloqueios marcados" items={gate.blockedItems.length ? gate.blockedItems.slice(0, 4) : ["Nenhum bloqueio marcado."]} />
      </div>

      <p className="mt-4 rounded-md bg-white/80 p-3 text-xs leading-5 text-slate-600">
        Nao salva automaticamente; decisao final continua humana. Use somente metricas agregadas e mantenha APIs, OAuth, scraping, publicacao e dados pessoais fora deste fluxo.
      </p>
      {copied ? <p className="mt-3 rounded-md bg-green-50 p-2 text-xs font-medium text-leaf">Gate copiado para revisao manual.</p> : null}
    </article>
  );
}

function GateList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-white/80 p-3 text-sm text-slate-700">
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function WorkspaceItemRow({
  item,
  status,
  onStatusChange
}: {
  item: WeeklyCollectionWorkspaceItem;
  status: WeeklyCollectionWorkspaceItemStatus;
  onStatusChange: (itemId: string, status: WeeklyCollectionWorkspaceItemStatus) => void;
}) {
  return (
    <article className={`rounded-md border p-3 ${itemStatusPanelClass(status)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${kindClass(item.kind)}`}>{kindLabel(item.kind)}</span>
            <span className={`badge ${priorityClass(item.priority)}`}>{priorityLabel(item.priority)}</span>
            <span className="text-xs font-semibold text-slate-500">{item.ownerSuggestion}</span>
          </div>
          <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">{item.detail}</p>
          <p className="mt-2 rounded-md bg-white p-2 text-xs leading-5 text-slate-600">{item.guardrail}</p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {statusOptions.map((option) => (
            <button
              key={option.status}
              type="button"
              onClick={() => onStatusChange(item.id, option.status)}
              className={`rounded-md px-3 py-2 text-xs font-semibold ${status === option.status ? activeStatusButtonClass(option.status) : "bg-white text-slate-700 hover:bg-slate-100"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function WorkspaceProgressBadge({ progress }: { progress: WeeklyCollectionWorkspaceProgress }) {
  return (
    <div className={`rounded-md border p-3 text-sm ${progressClass(progress.status)}`}>
      <p className="font-semibold">{progressStatusLabel(progress.status)}</p>
      <p className="mt-1 leading-5">{progress.summary}</p>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function progressClass(status: WeeklyCollectionWorkspaceProgress["status"]): string {
  if (status === "complete") return "border-green-200 bg-green-50 text-leaf";
  if (status === "blocked") return "border-red-200 bg-red-50 text-danger";
  if (status === "not_started") return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-cyan-200 bg-cyan-50 text-ocean";
}

function progressStatusLabel(status: WeeklyCollectionWorkspaceProgress["status"]): string {
  if (status === "complete") return "Coleta completa";
  if (status === "blocked") return "Coleta com bloqueio";
  if (status === "not_started") return "Nao iniciada";
  return "Em andamento";
}

function itemStatusPanelClass(status: WeeklyCollectionWorkspaceItemStatus): string {
  if (status === "done") return "border-green-200 bg-green-50";
  if (status === "blocked") return "border-red-200 bg-red-50";
  return "border-slate-200 bg-white";
}

function activeStatusButtonClass(status: WeeklyCollectionWorkspaceItemStatus): string {
  if (status === "done") return "bg-green-600 text-white";
  if (status === "blocked") return "bg-red-600 text-white";
  return "bg-slate-900 text-white";
}

function kindClass(kind: WeeklyCollectionWorkspaceItem["kind"]): string {
  if (kind === "task") return "bg-cyan-50 text-ocean";
  if (kind === "daily") return "bg-green-50 text-leaf";
  if (kind === "weekly_close") return "bg-amber-50 text-amber";
  return "bg-slate-100 text-slate-700";
}

function kindLabel(kind: WeeklyCollectionWorkspaceItem["kind"]): string {
  if (kind === "task") return "tarefa";
  if (kind === "daily") return "diario";
  if (kind === "weekly_close") return "fechamento";
  return "gate";
}

function priorityClass(priority: WeeklyCollectionWorkspaceItem["priority"]): string {
  if (priority === "high") return "bg-red-50 text-red-700";
  if (priority === "medium") return "bg-amber-50 text-amber";
  return "bg-green-50 text-leaf";
}

function priorityLabel(priority: WeeklyCollectionWorkspaceItem["priority"]): string {
  if (priority === "high") return "alta";
  if (priority === "medium") return "media";
  return "baixa";
}

function gatePanelClass(severity: WeeklyCollectionDecisionGate["severity"]): string {
  if (severity === "success") return "border-green-200 bg-green-50";
  if (severity === "critical") return "border-red-200 bg-red-50";
  if (severity === "warning") return "border-amber-200 bg-amber-50";
  return "border-cyan-200 bg-cyan-50";
}

function gateBadgeClass(severity: WeeklyCollectionDecisionGate["severity"]): string {
  if (severity === "success") return "bg-green-100 text-leaf";
  if (severity === "critical") return "bg-red-100 text-red-700";
  if (severity === "warning") return "bg-amber-100 text-amber";
  return "bg-cyan-100 text-ocean";
}

function gateStatusLabel(status: WeeklyCollectionDecisionGate["status"]): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  if (status === "review_required") return "revisao final";
  return "coleta pendente";
}

function handoffPanelClass(severity: WeeklyCollectionSaveHandoff["severity"]): string {
  if (severity === "success") return "border-green-200 bg-green-50";
  if (severity === "critical") return "border-red-200 bg-red-50";
  if (severity === "warning") return "border-amber-200 bg-amber-50";
  return "border-cyan-200 bg-cyan-50";
}

function handoffBadgeClass(severity: WeeklyCollectionSaveHandoff["severity"]): string {
  if (severity === "success") return "bg-green-100 text-leaf";
  if (severity === "critical") return "bg-red-100 text-red-700";
  if (severity === "warning") return "bg-amber-100 text-amber";
  return "bg-cyan-100 text-ocean";
}

function handoffStatusLabel(status: WeeklyCollectionSaveHandoff["status"]): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  if (status === "review_before_save") return "revisar antes de salvar";
  return "coletar antes de salvar";
}

function handoffItemBadgeClass(status: WeeklyCollectionSaveHandoff["checklist"][number]["status"]): string {
  if (status === "ok") return "bg-green-50 text-leaf";
  if (status === "blocked") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber";
}

function handoffItemStatusLabel(status: WeeklyCollectionSaveHandoff["checklist"][number]["status"]): string {
  if (status === "ok") return "ok";
  if (status === "blocked") return "bloqueio";
  return "revisar";
}
