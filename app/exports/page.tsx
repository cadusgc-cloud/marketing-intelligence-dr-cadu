import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildMarketingOpsState } from "@/lib/marketing-ops";

export default function ExportsPage() {
  const state = buildMarketingOpsState();
  const packages = state.dashboard.exports;

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v3</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Export Center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Pacotes locais e copiaveis para execucao manual: dia, semana, mes, stories, reels, carrosseis, Etus, Google Sheets, Google Agenda, briefing de editor e relatorio de seguranca.
            </p>
          </div>
          <Link href="/operations" className="w-fit rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Voltar para operacoes
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pacotes" value={packages.length} detail="inclui backup tecnico" />
        <MetricCard label="Pacotes de usuario" value={packages.filter((pkg) => pkg.userFacing).length} detail="texto copiavel" />
        <MetricCard label="Dias" value={state.dashboard.days.length} detail={state.dashboard.month.name} />
        <MetricCard label="Readiness mes" value={`${state.dashboard.readiness.month.score}/100`} detail={state.dashboard.readiness.month.status} />
      </section>

      <section className="grid gap-4">
        {packages.map((pkg) => (
          <article key={pkg.id} className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{pkg.format}</span>
                  <span className={`badge ${pkg.userFacing ? "bg-green-50 text-leaf" : "bg-slate-100 text-slate-600"}`}>{pkg.userFacing ? "usuario" : "backup tecnico"}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{pkg.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
              </div>
              <LocalCopyButton text={pkg.text} label="Copiar pacote" />
            </div>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{pkg.text}</pre>
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
