import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildCommandCenterDashboard } from "@/lib/guided-flows";
import { buildDefaultReleaseReadinessReport } from "@/lib/release-readiness";

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export default function CommandCenterPage() {
  const dashboard = buildCommandCenterDashboard();
  const release = buildDefaultReleaseReadinessReport();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v9</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Command Center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Comece por aqui: fluxos guiados, proxima acao, status geral, workspace, safety, rotas e release candidate local.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/flows" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Abrir fluxos</Link>
            <Link href="/release" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Release</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Sistema" value={dashboard.systemStatus} detail="local e deterministico" />
        <MetricCard label="Workspace" value={dashboard.workspaceName} detail={dashboard.activeWeek} />
        <MetricCard label="Readiness" value={`${dashboard.readinessScore}/100`} detail="ciclo ativo" />
        <MetricCard label="Safety" value={dashboard.safetyStatus} detail="sem bloqueio default" />
        <MetricCard label="QA" value={dashboard.qaStatus} detail="scripts locais" />
        <MetricCard label="Rotas" value={dashboard.routeStatus} detail="health local" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">O que eu faco agora?</p>
          <h3 className="mt-1 text-xl font-semibold">{dashboard.nextAction.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{dashboard.nextAction.reason}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Tempo" value={`${dashboard.nextAction.estimatedMinutes} min`} detail="estimativa" />
            <MetricCard label="Risco" value={dashboard.nextAction.risk} detail="sem automacao externa" />
            <MetricCard label="Saida" value={dashboard.nextAction.expectedOutput} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={dashboard.nextAction.recommendedRoute} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Iniciar acao</Link>
            <Link href="/runbook" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Ver runbook</Link>
          </div>
          <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">Alternativa curta: {dashboard.nextAction.shortAlternative}</p>
        </section>

        <aside className="panel">
          <p className="text-sm font-medium text-ocean">Alertas</p>
          <h3 className="mt-1 text-lg font-semibold">Status operacional</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {dashboard.alerts.map((alert) => <li key={alert} className="rounded-md bg-slate-50 p-3">- {alert}</li>)}
          </ul>
        </aside>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Fluxos prioritarios</p>
            <h3 className="mt-1 text-lg font-semibold">Rotinas guiadas principais</h3>
          </div>
          <Link href="/flows" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Ver catalogo completo</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.prioritizedFlows.map((flow) => (
            <article key={flow.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-cyan-50 text-ocean">{flow.complexity}</span>
                <span className="badge bg-slate-100 text-slate-700">{flow.estimatedMinutes} min</span>
              </div>
              <h4 className="mt-3 font-semibold">{flow.name}</h4>
              <p className="mt-2 text-sm text-slate-600">{flow.description}</p>
              <Link href={`/flows/${flow.id}`} className="mt-4 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Iniciar</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Atalhos</p>
          <h3 className="mt-1 text-lg font-semibold">Rotas operacionais</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.shortcuts.map((shortcut) => (
              <Link key={shortcut.route} href={shortcut.route} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {shortcut.label}
              </Link>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-ocean">Release readiness</p>
              <h3 className="mt-1 text-lg font-semibold">{release.status}</h3>
              <p className="mt-2 text-sm text-slate-500">{release.routes.length} rotas | {release.commands.length} comandos | {release.docs.length} docs/relatorios.</p>
            </div>
            <LocalCopyButton text={release.prDraft.markdown} label="Copiar PR draft" />
          </div>
        </section>
      </section>
    </div>
  );
}
