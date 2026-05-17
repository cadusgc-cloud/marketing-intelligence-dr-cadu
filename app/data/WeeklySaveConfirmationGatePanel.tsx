"use client";

import { useState } from "react";
import type {
  WeeklySaveConfirmationCheckStatus,
  WeeklySaveConfirmationGate,
  WeeklySaveConfirmationSeverity
} from "@/lib/weeklySaveConfirmationGate";

export function WeeklySaveConfirmationGatePanel({ gate }: { gate: WeeklySaveConfirmationGate }) {
  const [copied, setCopied] = useState(false);

  async function copyGate() {
    if (!navigator.clipboard) {
      setCopied(false);
      return;
    }

    await navigator.clipboard.writeText(gate.copyMarkdown);
    setCopied(true);
  }

  return (
    <section id="weekly-save-confirmation-gate" className={`mt-4 rounded-md border p-4 ${panelClass(gate.severity)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Gate final v3.6</p>
            <span className={`badge ${badgeClass(gate.severity)}`}>{statusLabel(gate.status)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{gate.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{gate.summary}</p>
        </div>
        <button type="button" onClick={copyGate} className="w-fit rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          Copiar conferencia
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {gate.checks.map((check) => (
          <a key={check.id} href={check.targetHref} className="rounded-md bg-white/80 p-3 text-sm text-slate-700 hover:bg-white">
            <span className={`badge ${checkBadgeClass(check.status)}`}>{checkStatusLabel(check.status)}</span>
            <p className="mt-2 font-semibold text-slate-900">{check.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p>
          </a>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)]">
        <div className="rounded-md bg-white/80 p-3 text-sm text-slate-700">
          <p className="font-semibold">Proximas acoes</p>
          <ul className="mt-2 space-y-1">
            {gate.nextActions.slice(0, 5).map((action) => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-white/80 p-3 text-xs leading-5 text-slate-600">
          <p className="font-semibold text-slate-800">Limites fixos</p>
          <ul className="mt-2 space-y-1">
            {gate.guardrails.slice(0, 4).map((guardrail) => (
              <li key={guardrail}>- {guardrail}</li>
            ))}
          </ul>
        </div>
      </div>

      {copied ? <p className="mt-3 rounded-md bg-green-50 p-2 text-xs font-medium text-leaf">Conferencia copiada para revisao manual.</p> : null}
    </section>
  );
}

function panelClass(severity: WeeklySaveConfirmationSeverity): string {
  if (severity === "success") return "border-green-200 bg-green-50";
  if (severity === "critical") return "border-red-200 bg-red-50";
  return "border-amber-200 bg-amber-50";
}

function badgeClass(severity: WeeklySaveConfirmationSeverity): string {
  if (severity === "success") return "bg-green-100 text-leaf";
  if (severity === "critical") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber";
}

function statusLabel(status: WeeklySaveConfirmationGate["status"]): string {
  if (status === "ready_to_save") return "pronto para salvar";
  if (status === "blocked") return "bloqueado";
  return "revisar antes de salvar";
}

function checkBadgeClass(status: WeeklySaveConfirmationCheckStatus): string {
  if (status === "ok") return "bg-green-50 text-leaf";
  if (status === "blocked") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber";
}

function checkStatusLabel(status: WeeklySaveConfirmationCheckStatus): string {
  if (status === "ok") return "ok";
  if (status === "blocked") return "bloqueio";
  return "revisar";
}
