"use client";

import { useState } from "react";
import type { WeeklySourceEvidenceLedger, WeeklySourceEvidenceStatus } from "@/lib/weeklySourceEvidenceLedger";

export function WeeklySourceEvidenceLedgerPanel({ ledger }: { ledger: WeeklySourceEvidenceLedger }) {
  const [copied, setCopied] = useState(false);

  async function copyLedger() {
    if (!navigator.clipboard) {
      setCopied(false);
      return;
    }

    await navigator.clipboard.writeText(ledger.copyMarkdown);
    setCopied(true);
  }

  return (
    <section id="weekly-source-evidence-ledger" className={`rounded-md border p-4 ${panelClass(ledger.status)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Mapa local v3.5</p>
            <span className={`badge ${badgeClass(ledger.status)}`}>{statusLabel(ledger.status)}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{ledger.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{ledger.summary}</p>
        </div>
        <button type="button" onClick={copyLedger} className="w-fit rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
          Copiar mapa
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <EvidenceMetric label="Verificadas" value={ledger.totals.verified} />
        <EvidenceMetric label="Revisar" value={ledger.totals.needsReview} />
        <EvidenceMetric label="Sem coleta" value={ledger.totals.missing} />
        <EvidenceMetric label="Bloqueadas" value={ledger.totals.blocked} />
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {ledger.sources.map((source) => (
          <article key={source.id} className="rounded-md bg-white/80 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${badgeClass(source.status)}`}>{statusLabel(source.status)}</span>
              <h4 className="font-semibold text-slate-900">{source.title}</h4>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">{source.evidenceSummary}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{source.sourceOwner}</p>

            <div className="mt-3 grid gap-2">
              {source.fields.slice(0, 4).map((field) => (
                <div key={field.id} className="rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${fieldBadgeClass(field.status)}`}>{fieldStatusLabel(field.status)}</span>
                    <span className="font-semibold text-slate-800">{field.label}</span>
                  </div>
                  <p className="mt-1">{field.valueLabel}</p>
                  <p className="mt-1 text-slate-500">Fonte: {field.whereToFind}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-600">{source.nextAction}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-md bg-white/80 p-3 text-xs leading-5 text-slate-600">
        <p className="font-semibold text-slate-800">Guardrails do mapa</p>
        <ul className="mt-2 space-y-1">
          {ledger.guardrails.slice(0, 4).map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>

      {copied ? <p className="mt-3 rounded-md bg-green-50 p-2 text-xs font-medium text-leaf">Mapa copiado para revisao manual.</p> : null}
    </section>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-md bg-white/80 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function panelClass(status: WeeklySourceEvidenceStatus): string {
  if (status === "verified") return "border-green-200 bg-green-50";
  if (status === "blocked") return "border-red-200 bg-red-50";
  if (status === "missing") return "border-cyan-200 bg-cyan-50";
  return "border-amber-200 bg-amber-50";
}

function badgeClass(status: WeeklySourceEvidenceStatus): string {
  if (status === "verified") return "bg-green-100 text-leaf";
  if (status === "blocked") return "bg-red-100 text-red-700";
  if (status === "missing") return "bg-cyan-100 text-ocean";
  return "bg-amber-100 text-amber";
}

function statusLabel(status: WeeklySourceEvidenceStatus): string {
  if (status === "verified") return "verificado";
  if (status === "blocked") return "bloqueado";
  if (status === "missing") return "sem coleta";
  return "revisar";
}

function fieldBadgeClass(status: WeeklySourceEvidenceLedger["sources"][number]["fields"][number]["status"]): string {
  if (status === "present") return "bg-green-50 text-leaf";
  if (status === "missing") return "bg-cyan-50 text-ocean";
  if (status === "review") return "bg-amber-50 text-amber";
  return "bg-slate-100 text-slate-700";
}

function fieldStatusLabel(status: WeeklySourceEvidenceLedger["sources"][number]["fields"][number]["status"]): string {
  if (status === "present") return "presente";
  if (status === "missing") return "ausente";
  if (status === "review") return "revisar";
  return "opcional";
}
