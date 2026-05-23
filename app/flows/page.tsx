import Link from "next/link";
import { getGuidedFlowCatalog } from "@/lib/guided-flows";

export default function FlowsPage() {
  const flows = getGuidedFlowCatalog();
  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Marketing OS v9</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-normal">Fluxos Guiados</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Catalogo de rotinas passo a passo para fechamento semanal, importacao manual, producao, gravacao, safety, backup e release local.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flows.map((flow) => (
          <article key={flow.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-cyan-50 text-ocean">{flow.complexity}</span>
              <span className="badge bg-slate-100 text-slate-700">{flow.estimatedMinutes} min</span>
              <span className="badge bg-slate-100 text-slate-700">{flow.steps.length} etapas</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{flow.name}</h3>
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
    </div>
  );
}
