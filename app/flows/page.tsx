import Link from "next/link";
import { AppShell, EmptyState, PageHeader } from "@/components/product";
import { getGuidedFlowCatalog } from "@/lib/guided-flows";

export default function FlowsPage() {
  const flows = getGuidedFlowCatalog();
  return (
    <AppShell>
      <PageHeader
        eyebrow="Marketing OS v10"
        title="Fluxos Guiados"
        description="Catalogo de rotinas passo a passo para fechamento semanal, importacao manual, producao, gravacao, safety, backup e release local."
        actions={[{ href: "/command-center", label: "Voltar ao Command Center" }]}
      />

      {flows.length === 0 ? (
        <EmptyState title="Catalogo de fluxos vazio" description="O sistema precisa de fluxos guiados para orientar a operacao. Rode flows:check para diagnosticar." actionHref="/release" actionLabel="Ver release" />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flows.map((flow) => (
          <article key={flow.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-cyan-50 text-ocean">{flow.complexity}</span>
              <span className="badge bg-slate-100 text-slate-700">{flow.estimatedMinutes} min</span>
              <span className="badge bg-slate-100 text-slate-700">{flow.steps.length} etapas</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{flow.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{flow.description}</p>
            <div className="mt-3 text-xs text-slate-500">
              <p>Pre-requisitos: {flow.prerequisites.length}</p>
              <p>Outputs: {flow.outputs.map((item) => item.label).join(", ")}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/flows/${flow.id}`} className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Iniciar</Link>
              {flow.routeLinks.slice(0, 2).map((route) => (
                <Link key={route.route} href={route.route} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">{route.label}</Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
