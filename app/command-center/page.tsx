import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { AppShell, CommandActionCard, EmptyState, MetricCard, PageHeader, SectionHeader, StatusBadge } from "@/components/product";
import { buildCommandCenterDashboard } from "@/lib/guided-flows";
import { buildReleasePolishReport } from "@/lib/release-polish";
import { buildDefaultReleaseReadinessReport } from "@/lib/release-readiness";
import { buildNavigationGroups } from "@/lib/product-routes";

export default function CommandCenterPage() {
  const dashboard = buildCommandCenterDashboard();
  const release = buildDefaultReleaseReadinessReport();
  const polish = buildReleasePolishReport();
  const routeGroups = buildNavigationGroups();
  const topActions = [
    dashboard.nextAction,
    { ...dashboard.nextAction, title: "Rodar fluxo recomendado", reason: "Use o runner para validar pre-requisitos e registrar progresso local.", recommendedRoute: "/flows/fechamento-semanal-completo", estimatedMinutes: 45, risk: "baixo" },
    { ...dashboard.nextAction, title: "Checar release local", reason: "Confirme UX, rotas, docs, scripts e seguranca antes de abrir PR.", recommendedRoute: "/release", estimatedMinutes: 15, risk: "baixo" }
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Marketing OS v10"
        title="Command Center"
        description="Comece por aqui: proxima acao, fluxos guiados, status geral, workspace, rotas, QA e release polish local."
        actions={[
          { href: "/flows", label: "Abrir fluxos", tone: "primary" },
          { href: "/release", label: "Ver release" },
          { href: "/documentation", label: "Documentacao" }
        ]}
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Sistema" value={dashboard.systemStatus} detail="local e deterministico" />
        <MetricCard label="Workspace" value={dashboard.workspaceName} detail={dashboard.activeWeek} />
        <MetricCard label="Readiness" value={`${dashboard.readinessScore}/100`} detail="ciclo ativo" />
        <MetricCard label="Safety" value={dashboard.safetyStatus} detail="sem bloqueio default" />
        <MetricCard label="QA" value={dashboard.qaStatus} detail="scripts locais" />
        <MetricCard label="Rotas" value={dashboard.routeStatus} detail="health local" />
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Comece aqui" title="Top 3 acoes recomendadas" description="Escolha uma acao conforme o tempo disponivel. Todas sao locais e manuais." />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {topActions.map((action) => (
            <CommandActionCard key={action.title} title={action.title} reason={action.reason} href={action.recommendedRoute} estimatedMinutes={action.estimatedMinutes} risk={action.risk} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">O que eu faco agora?</p>
          <h2 className="mt-1 text-xl font-semibold">{dashboard.nextAction.title}</h2>
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
          <h2 className="mt-1 text-lg font-semibold">Status operacional</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {dashboard.alerts.map((alert) => <li key={alert} className="rounded-md bg-slate-50 p-3">- {alert}</li>)}
          </ul>
        </aside>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Fluxos prioritarios" title="Rotinas guiadas principais" action={{ href: "/flows", label: "Ver catalogo completo" }} />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.prioritizedFlows.map((flow) => (
            <article key={flow.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-cyan-50 text-ocean">{flow.complexity}</span>
                <span className="badge bg-slate-100 text-slate-700">{flow.estimatedMinutes} min</span>
              </div>
              <h3 className="mt-3 font-semibold">{flow.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{flow.description}</p>
              <Link href={`/flows/${flow.id}`} className="mt-4 inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Iniciar</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Mapa do produto" title="Rotas agrupadas por rotina" description="Use os grupos para navegar sem decorar caminhos." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routeGroups.map((group) => (
            <article key={group.id} className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-ink">{group.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{group.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.routes.slice(0, 5).map((route) => (
                  <Link key={route.path} href={route.path} className="rounded-md bg-slate-50 px-2 py-1 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-ocean">
                    {route.title}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="panel">
          <p className="text-sm font-medium text-ocean">Atalhos</p>
          <h2 className="mt-1 text-lg font-semibold">Rotas operacionais</h2>
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
              <h2 className="mt-1 text-lg font-semibold">{release.status}</h2>
              <p className="mt-2 text-sm text-slate-500">{release.routes.length} rotas | {release.commands.length} comandos | {release.docs.length} docs/relatorios.</p>
            </div>
            <LocalCopyButton text={release.prDraft.markdown} label="Copiar PR draft" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <MetricCard label="Release score" value={`${polish.releaseScore}/100`} detail="V10" tone="success" />
            <MetricCard label="UX readiness" value={`${polish.uxReadiness.score}/100`} detail={polish.uxReadiness.status} />
            <MetricCard label="Safety" value={`${polish.safetyReadiness.score}/100`} detail="local-only" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge label="Sem API externa" tone="success" />
            <StatusBadge label="Sem publicacao automatica" tone="success" />
            <StatusBadge label="Sem dados de pacientes" tone="success" />
          </div>
        </section>
      </section>

      {dashboard.prioritizedFlows.length === 0 ? (
        <EmptyState title="Nenhum fluxo prioritario encontrado" description="O catalogo deveria carregar fluxos guiados locais. Rode flows:check para diagnosticar." actionHref="/release" actionLabel="Ver release" />
      ) : null}
    </AppShell>
  );
}
