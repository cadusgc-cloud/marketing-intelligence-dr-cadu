import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildIntelligenceDashboard } from "@/lib/marketing-intelligence";

export default function ExperimentsPage() {
  const dashboard = buildIntelligenceDashboard();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v6</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Experimentos Editoriais</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Testes seguros de tema, hook, formato, tom e calendario. Tudo e planejamento manual, sem automacao de publicacao e sem manipular medo, urgencia ou promessa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={dashboard.exports.experimentMarkdown} label="Copiar experimentos" />
            <Link href="/strategy" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Abrir estrategia</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Experimentos" value={dashboard.experiments.length} detail="planejados localmente" />
        <MetricCard label="Risco maximo" value="baixo" detail="cenario padrao" />
        <MetricCard label="Metrica base" value="salvamentos" detail="e compartilhamentos" />
        <MetricCard label="Publicacao" value="manual" detail="sem API externa" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {dashboard.experiments.map((experiment) => (
          <article key={experiment.id} className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-green-50 text-leaf">risco {experiment.risk}</span>
                  <span className="badge bg-slate-100 text-slate-700">{experiment.suggestedDuration}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{experiment.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{experiment.hypothesis}</p>
              </div>
              <LocalCopyButton text={experiment.exportText} label="Copiar" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {experiment.variants.map((variant) => (
                <div key={variant.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-semibold text-ink">{variant.label}</p>
                  <p className="mt-1 text-slate-600">{variant.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Formato: {variant.format}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Criterio</p>
              <p className="mt-1">{experiment.successCriteria}</p>
            </div>
          </article>
        ))}
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
