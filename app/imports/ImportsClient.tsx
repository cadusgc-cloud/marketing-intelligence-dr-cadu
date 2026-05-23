"use client";

import { useMemo, useState } from "react";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { getSampleReportImportText, parseReportImport, type ReportSource } from "@/lib/report-imports";

const sources: Array<{ value: ReportSource; label: string }> = [
  { value: "reportei", label: "Reportei" },
  { value: "instagram", label: "Instagram Insights" },
  { value: "meta_ads", label: "Meta Ads manual" },
  { value: "etus_manual", label: "Etus/manual" },
  { value: "google_sheets", label: "Google Sheets manual" },
  { value: "generic", label: "CSV/TSV generico" },
  { value: "manual", label: "Entrada manual" }
];

export function ImportsClient() {
  const [source, setSource] = useState<ReportSource>("reportei");
  const [text, setText] = useState(getSampleReportImportText("reportei"));
  const result = useMemo(() => parseReportImport({ source, text, periodStart: "2026-05-24", periodEnd: "2026-05-30" }), [source, text]);

  function loadExample(nextSource: ReportSource) {
    setSource(nextSource);
    setText(getSampleReportImportText(nextSource));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v7</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Importacoes Manuais</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Cole CSV/TSV exportado manualmente, escolha a origem, valide colunas, normalize dados e bloqueie qualquer conteudo sensivel. Nada e enviado para API ou servidor externo.
            </p>
          </div>
          <LocalCopyButton text={result.exports.normalizedTsv} label="Copiar normalizado" />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Status" value={result.quality.status} detail={`${result.quality.overallQualityScore}/100`} />
        <MetricCard label="Linhas" value={result.normalizedRows.length} detail="entrada colada" />
        <MetricCard label="Schema" value={`${result.mapping.schemaMatchScore}/100`} detail={`${result.mapping.unknownHeaders.length} desconhecidas`} />
        <MetricCard label="Issues" value={result.issues.length} detail={`${result.issues.filter((issue) => issue.severity === "blocking").length} bloqueantes`} />
        <MetricCard label="Sensivel" value={result.sensitiveIssues.length} detail={result.blocked ? "bloqueia" : "sem bloqueio"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex-1 text-sm font-semibold text-ink">
              Origem
              <select
                value={source}
                onChange={(event) => loadExample(event.target.value as ReportSource)}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ocean"
              >
                {sources.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <LocalCopyButton text={getSampleReportImportText(source)} label="Copiar exemplo" />
          </div>
          <label className="mt-5 block text-sm font-semibold text-ink" htmlFor="report-import-text">Cole CSV/TSV manual</label>
          <textarea
            id="report-import-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-3 min-h-[460px] w-full rounded-lg border border-slate-200 p-3 font-mono text-xs leading-5 outline-none focus:border-ocean"
          />
        </div>

        <div className="space-y-6">
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Mapeamento</p>
            <h3 className="mt-1 text-lg font-semibold">Colunas reconhecidas</h3>
            <div className="mt-4 max-h-72 overflow-auto rounded-md border border-slate-100">
              <table className="min-w-full text-left text-sm">
                <tbody>
                  {result.headers.map((header) => (
                    <tr key={header} className="border-b border-slate-100">
                      <td className="px-3 py-2 font-medium text-ink">{header}</td>
                      <td className="px-3 py-2 text-slate-600">{result.mapping.mapped[header]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <p className="text-sm font-medium text-ocean">Qualidade</p>
            <h3 className="mt-1 text-lg font-semibold">Alertas e bloqueios</h3>
            <div className="mt-4 max-h-72 space-y-2 overflow-auto">
              {[...result.issues.map((issue) => `${issue.severity}: linha ${issue.row ?? "-"} ${issue.message}`), ...result.sensitiveIssues.map((issue) => `${issue.classification}: linha ${issue.row ?? "-"} ${issue.message}`)].map((issue, index) => (
                <p key={`${issue}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">{issue}</p>
              ))}
              {!result.issues.length && !result.sensitiveIssues.length ? <p className="text-sm text-slate-500">Sem alertas no dataset atual.</p> : null}
            </div>
          </section>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Preview normalizado</p>
            <h3 className="mt-1 text-lg font-semibold">Primeiras linhas prontas para o Intelligence Loop</h3>
          </div>
          <LocalCopyButton text={result.exports.qualityMarkdown} label="Copiar qualidade" />
        </div>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Canal</th>
                <th className="px-3 py-2">Formato</th>
                <th className="px-3 py-2">Tema</th>
                <th className="px-3 py-2">Alcance</th>
                <th className="px-3 py-2">Salvamentos</th>
              </tr>
            </thead>
            <tbody>
              {result.normalizedRows.slice(0, 12).map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{row.date ?? "revisar"}</td>
                  <td className="px-3 py-2">{row.channel}</td>
                  <td className="px-3 py-2">{row.format}</td>
                  <td className="px-3 py-2">{row.theme}</td>
                  <td className="px-3 py-2">{row.metrics.reach ?? "-"}</td>
                  <td className="px-3 py-2">{row.metrics.saves ?? "-"}</td>
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
