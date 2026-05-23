import Link from "next/link";
import { AppShell, LocalOnlyNotice, MetricCard, PageHeader, RouteLinkCard, SafetyNotice, SectionHeader } from "@/components/product";
import { buildCommandCenterDashboard } from "@/lib/guided-flows";
import { getRouteByPath } from "@/lib/product-routes";

export default function DashboardPage() {
  const dashboard = buildCommandCenterDashboard();
  const flow = [
    getRouteByPath("/command-center"),
    getRouteByPath("/weekly-review"),
    getRouteByPath("/studio"),
    getRouteByPath("/review"),
    getRouteByPath("/exports")
  ].filter(Boolean);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Marketing OS v10"
        title="Marketing Intelligence OS - Dr. Cadu"
        description="Produto local para planejar, produzir, revisar, importar metricas, fechar semanas e preparar releases sem API externa."
        actions={[
          { href: "/command-center", label: "Comecar pelo Command Center", tone: "primary" },
          { href: "/onboarding", label: "Ver primeiros passos" }
        ]}
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sistema" value={dashboard.systemStatus} detail="operacao local" tone="success" />
        <MetricCard label="Readiness" value={`${dashboard.readinessScore}/100`} detail="ciclo ativo" />
        <MetricCard label="Proxima acao" value={dashboard.nextAction.estimatedMinutes} detail="minutos estimados" />
        <MetricCard label="Rotas saudaveis" value={dashboard.routeStatus} detail="health local" />
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Fluxo recomendado" title="Nao comece procurando rota; comece pela proxima acao" description="A home aponta para a rotina operacional minima da semana. O detalhe fica dentro dos modulos." />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {flow.map((route, index) => (
            <RouteLinkCard key={route!.path} href={route!.path} title={`${index + 1}. ${route!.title}`} description={route!.description} group={route!.group} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <LocalOnlyNotice />
        <SafetyNotice />
      </section>

      <section className="panel">
        <SectionHeader eyebrow="Atalhos principais" title="Entradas de trabalho" description="Rotas mais usadas para executar a semana sem improviso." />
        <div className="mt-4 flex flex-wrap gap-2">
          {["/command-center", "/flows", "/weekly-review", "/studio", "/review", "/exports", "/workspace", "/release", "/documentation"].map((href) => (
            <Link key={href} href={href} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {href}
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
