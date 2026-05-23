"use client";

import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { useGuidedFlowProgress } from "@/components/flows/useGuidedFlowProgress";
import { buildFlowExportBundle, evaluateFlowPrerequisites, type GuidedFlow } from "@/lib/guided-flows";

export function FlowRunnerClient({ flow }: { flow: GuidedFlow }) {
  const { run, storageStatus, markStep, reset, start } = useGuidedFlowProgress(flow.id);
  const prerequisites = evaluateFlowPrerequisites(flow);
  const exports = buildFlowExportBundle(flow, run);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Fluxo guiado</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">{flow.name}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{flow.description}</p>
            <p className="mt-2 text-xs text-slate-500">{storageStatus} | {flow.estimatedMinutes} min | {flow.complexity}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={start} className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Iniciar</button>
            <button type="button" onClick={reset} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Resetar</button>
            <LocalCopyButton text={run.exportText} label="Copiar fluxo" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Status" value={run.status} />
        <MetricCard label="Progresso" value={`${run.progressPercent}%`} />
        <MetricCard label="Etapas" value={`${run.completedStepIds.length}/${flow.steps.length}`} />
        <MetricCard label="Outputs" value={flow.outputs.length} />
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Pre-requisitos</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {prerequisites.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <span className={`badge ${item.status === "ok" ? "bg-green-50 text-leaf" : item.status === "bloqueante" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber"}`}>{item.status}</span>
              <p className="mt-2 font-semibold text-ink">{item.description}</p>
              <p className="mt-1 text-slate-600">{item.suggestion}</p>
              <Link href={item.routeToResolve} className="mt-2 inline-flex text-sm font-semibold text-ocean">Resolver em {item.routeToResolve}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Etapas</p>
        <div className="mt-4 space-y-3">
          {flow.steps.map((step, index) => {
            const done = run.completedStepIds.includes(step.id);
            return (
              <article key={step.id} className={`grid gap-3 rounded-lg border p-4 lg:grid-cols-[1fr_180px] lg:items-center ${done ? "border-green-200 bg-green-50" : "border-slate-200"}`}>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-slate-100 text-slate-700">Etapa {index + 1}</span>
                    <span className={`badge ${done ? "bg-green-100 text-leaf" : "bg-slate-100 text-slate-700"}`}>{done ? "concluida" : "pendente"}</span>
                    <span className="badge bg-slate-100 text-slate-700">{step.estimatedMinutes} min</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Validacao: {step.validation}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={step.route} className="rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir rota</Link>
                  <button type="button" onClick={() => markStep(step.id)} className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700" disabled={done}>
                    {done ? "Concluida" : "Marcar concluida"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ocean">Exportacao</p>
              <h3 className="mt-1 text-lg font-semibold">Resumo do fluxo</h3>
            </div>
            <LocalCopyButton text={exports.flowSummaryMarkdown} label="Copiar resumo" />
          </div>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{exports.flowSummaryMarkdown}</pre>
        </section>
        <section className="panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ocean">Checklist</p>
              <h3 className="mt-1 text-lg font-semibold">Conclusao local</h3>
            </div>
            <LocalCopyButton text={exports.flowChecklistMarkdown} label="Copiar checklist" />
          </div>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{exports.flowChecklistMarkdown}</pre>
        </section>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
    </div>
  );
}
