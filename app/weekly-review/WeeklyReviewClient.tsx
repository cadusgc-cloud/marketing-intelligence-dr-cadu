"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { getSampleReportImportText, parseReportImport, type ReportSource } from "@/lib/report-imports";
import { buildWeekPeriod, generateWeeklyReview } from "@/lib/weekly-review";

export function WeeklyReviewClient() {
  const [source, setSource] = useState<ReportSource>("generic");
  const [periodStart, setPeriodStart] = useState("2026-05-24");
  const [objective, setObjective] = useState("Fechar desempenho semanal e planejar a proxima semana.");
  const [text, setText] = useState(getSampleReportImportText("generic"));
  const period = useMemo(() => buildWeekPeriod(periodStart), [periodStart]);
  const importResult = useMemo(() => parseReportImport({ source, text, periodStart: "2026-05-17", periodEnd: period.endDate }), [source, text, period.endDate]);
  const previousPeriodStart = useMemo(() => {
    const date = new Date(`${period.startDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 7);
    return date.toISOString().slice(0, 10);
  }, [period.startDate]);
  const previousPeriodEnd = useMemo(() => {
    const date = new Date(`${period.startDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  }, [period.startDate]);
  const currentRecords = importResult.normalizedRows.filter((row) => row.date && row.date >= period.startDate && row.date <= period.endDate);
  const previousRecords = importResult.normalizedRows.filter((row) => row.date && row.date >= previousPeriodStart && row.date <= previousPeriodEnd);
  const review = useMemo(() => generateWeeklyReview({ period, records: currentRecords, previousRecords, objective }), [period, currentRecords, previousRecords, objective]);

  function loadSource(nextSource: ReportSource) {
    setSource(nextSource);
    setText(getSampleReportImportText(nextSource));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Fechamento Semanal</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Coleta guiada, validacao de metricas, consolidacao semanal, aprendizados e plano da proxima semana. Tudo manual, local e sem integracao externa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={review.exports.weeklyMarkdown} label="Copiar relatorio" />
            <Link href="/imports" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Importacoes</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Periodo" value={period.label} />
        <MetricCard label="Qualidade import" value={importResult.quality.status} detail={`${importResult.quality.overallQualityScore}/100`} />
        <MetricCard label="Confianca" value={review.quality.confidence} detail={`${review.quality.score}/100`} />
        <MetricCard label="Registros" value={review.currentRecords.length} detail={`${review.previousRecords.length} anteriores`} />
        <MetricCard label="Alcance" value={review.summary.totals.reach} detail="semana atual" />
        <MetricCard label="Tarefas" value={review.tasks.length} detail="proxima semana" />
      </section>

      <section className="grid gap-4 lg:grid-cols-7">
        {["1 Semana", "2 Importar", "3 Validar", "4 Consolidar", "5 Aprender", "6 Planejar", "7 Exportar"].map((step, index) => (
          <div key={step} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-ocean">Etapa {index + 1}</p>
            <p className="mt-2 text-sm font-semibold text-ink">{step}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Etapa 1</p>
            <h3 className="mt-1 text-lg font-semibold">Definir semana</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-ink">
                Inicio da semana
                <input value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-semibold text-ink">
                Origem
                <select value={source} onChange={(event) => loadSource(event.target.value as ReportSource)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <option value="generic">Generico</option>
                  <option value="reportei">Reportei</option>
                  <option value="instagram">Instagram</option>
                  <option value="meta_ads">Meta Ads manual</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold text-ink">
              Objetivo da semana
              <input value={objective} onChange={(event) => setObjective(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
          </section>

          <section className="panel">
            <p className="text-sm font-medium text-ocean">Etapa 2</p>
            <h3 className="mt-1 text-lg font-semibold">Importar dados colados</h3>
            <textarea value={text} onChange={(event) => setText(event.target.value)} className="mt-4 min-h-[360px] w-full rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5" />
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Etapa 3</p>
            <h3 className="mt-1 text-lg font-semibold">Validar qualidade</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {importResult.quality.reasons.map((reason) => <p key={reason} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">{reason}</p>)}
              {importResult.sensitiveIssues.length ? importResult.sensitiveIssues.map((issue) => <p key={`${issue.row}-${issue.term}`} className="rounded-md bg-red-50 p-3 text-sm text-red-700">{issue.message}</p>) : <p className="rounded-md bg-green-50 p-3 text-sm text-leaf">Sem dado sensivel detectado no exemplo atual.</p>}
            </div>
          </section>

          <section className="panel">
            <p className="text-sm font-medium text-ocean">Etapa 4</p>
            <h3 className="mt-1 text-lg font-semibold">Consolidar desempenho</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {review.formatSummaries.slice(0, 4).map((item) => <SummaryCard key={item.key} title={item.label} score={item.score} detail={`${item.records} registros`} />)}
            </div>
          </section>

          <section className="panel">
            <p className="text-sm font-medium text-ocean">Etapas 5 e 6</p>
            <h3 className="mt-1 text-lg font-semibold">Aprendizados e plano da proxima semana</h3>
            <div className="mt-4 space-y-3">
              {review.recommendations.slice(0, 5).map((item) => (
                <article key={item.title} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-cyan-50 text-ocean">{item.type}</span>
                    <span className="badge bg-slate-100 text-slate-700">{item.priority}</span>
                  </div>
                  <h4 className="mt-3 font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{item.rationale}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Etapa 7</p>
            <h3 className="mt-1 text-lg font-semibold">Exportar fechamento e proxima semana</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={review.exports.googleSheetsTsv} label="Copiar TSV" />
            <LocalCopyButton text={review.exports.googleAgenda} label="Copiar agenda" />
            <LocalCopyButton text={review.exports.etusManual} label="Copiar Etus" />
          </div>
        </div>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Tema</th>
                <th className="px-3 py-2">Formato</th>
                <th className="px-3 py-2">Readiness</th>
                <th className="px-3 py-2">Safety</th>
              </tr>
            </thead>
            <tbody>
              {review.nextWeekPlan.days.map((day) => (
                <tr key={day.date} className="border-t border-slate-100">
                  <td className="px-3 py-2">{day.date}</td>
                  <td className="px-3 py-2">{day.theme}</td>
                  <td className="px-3 py-2">{day.format}</td>
                  <td className="px-3 py-2">{day.readiness}/100</td>
                  <td className="px-3 py-2">{day.safety}</td>
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
      <p className="mt-2 text-lg font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

function SummaryCard({ title, score, detail }: { title: string; score: number; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{score}/100</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
