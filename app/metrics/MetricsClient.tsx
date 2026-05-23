"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildMetricsExportBundle, generateExperimentPlans, generateLearningLoopReport, generateStrategyRoadmap, parseManualMetrics, sampleMetricsTsv } from "@/lib/marketing-intelligence";

export function MetricsClient() {
  const [input, setInput] = useState(sampleMetricsTsv);
  const parsed = useMemo(() => parseManualMetrics(input), [input]);
  const report = useMemo(() => generateLearningLoopReport(parsed.normalized), [parsed.normalized]);
  const experiments = useMemo(() => generateExperimentPlans(report), [report]);
  const roadmap = useMemo(() => generateStrategyRoadmap(report), [report]);
  const exports = useMemo(() => buildMetricsExportBundle(report, experiments, roadmap), [report, experiments, roadmap]);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Metricas Manuais</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Cole TSV/CSV exportado manualmente, valide colunas e gere score editorial local. Nada conecta API, nada publica e nada deve conter dado sensivel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={sampleMetricsTsv} label="Copiar exemplo TSV" />
            <Link href="/imports" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Importacoes v7</Link>
            <Link href="/weekly-review" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Fechamento</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Status importacao" value={parsed.ok ? "ok" : parsed.blocked ? "bloqueado" : "revisar"} detail={`delimitador ${parsed.delimiter === "\t" ? "tab" : parsed.delimiter}`} />
        <MetricCard label="Linhas" value={parsed.rows.length} detail="entrada manual" />
        <MetricCard label="Issues" value={parsed.issues.length} detail={`${parsed.issues.filter((issue) => issue.severity === "blocking").length} bloqueantes`} />
        <MetricCard label="Score" value={`${report.quality.score}/100`} detail={report.quality.status} />
        <MetricCard label="Recomendacoes" value={report.recommendations.length} detail="geradas localmente" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="panel">
          <label className="text-sm font-semibold text-ink" htmlFor="manual-metrics">Cole TSV/CSV manual</label>
          <textarea
            id="manual-metrics"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="mt-3 min-h-[420px] w-full rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5 outline-none focus:border-ocean"
          />
        </div>
        <div className="space-y-6">
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Validacao</p>
            <h3 className="mt-1 text-lg font-semibold">Colunas e riscos</h3>
            <div className="mt-4 max-h-64 space-y-2 overflow-auto">
              {parsed.issues.length ? parsed.issues.map((issue, index) => (
                <div key={`${issue.row}-${issue.field}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm">
                  <span className="font-semibold text-ink">Linha {issue.row} | {issue.field}</span>
                  <p className="mt-1 text-slate-600">{issue.severity}: {issue.message}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Sem problemas no dataset atual.</p>}
            </div>
          </section>

          <section className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-ocean">Exportacao</p>
                <h3 className="mt-1 text-lg font-semibold">Relatorio copiavel</h3>
              </div>
              <LocalCopyButton text={exports.insightsMarkdown} label="Copiar relatorio" />
            </div>
            <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{exports.insightsMarkdown}</pre>
          </section>
        </div>
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Scores normalizados</p>
        <h3 className="mt-1 text-lg font-semibold">Amostra de registros avaliados</h3>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Tema</th>
                <th className="px-3 py-2">Formato</th>
                <th className="px-3 py-2">Pilar</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Classificacao</th>
              </tr>
            </thead>
            <tbody>
              {report.topContents.slice(0, 10).map((item) => (
                <tr key={item.record.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{item.record.date}</td>
                  <td className="px-3 py-2">{item.record.theme}</td>
                  <td className="px-3 py-2">{item.record.normalizedFormat}</td>
                  <td className="px-3 py-2">{item.record.normalizedPillar}</td>
                  <td className="px-3 py-2">{item.score.overallPerformanceScore}/100</td>
                  <td className="px-3 py-2">{item.score.classification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
