import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildStudioDashboardPackage } from "@/lib/content-studio";

export default function ReviewPage() {
  const dashboard = buildStudioDashboardPackage();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Fila de Revisao</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Conteudos gerados pelo Content Studio com score de voz, safety, readiness, riscos e fila de producao. Status local e manual; nada e enviado para fora.
            </p>
          </div>
          <Link href="/studio" className="w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Gerar novo pacote</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Itens revisao" value={dashboard.reviewQueue.length} detail={`${dashboard.approvedItems} aprovados`} />
        <MetricCard label="Itens producao" value={dashboard.productionQueue.length} detail="tarefas e gravacao" />
        <MetricCard label="Readiness medio" value={`${dashboard.averageReadiness}/100`} detail="pacotes V5" />
        <MetricCard label="Bloqueados" value={dashboard.blockedItems} detail="na fila padrao" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Review queue</p>
          <h3 className="mt-1 text-lg font-semibold">Itens e scores</h3>
          <div className="mt-4 space-y-3">
            {dashboard.reviewQueue.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{item.status}</span>
                  <span className="badge bg-cyan-50 text-ocean">{item.format}</span>
                </div>
                <h4 className="mt-3 font-semibold">{item.theme}</h4>
                <p className="mt-2 text-sm text-slate-600">Voice {item.voiceScore}/100 | Safety {item.safetyScore}/100 | Readiness {item.readinessScore}/100</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <LocalCopyButton text={item.exportText} label="Copiar revisao" />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Production queue</p>
          <h3 className="mt-1 text-lg font-semibold">Fila de execucao editorial</h3>
          <div className="mt-4 space-y-3">
            {dashboard.productionQueue.slice(0, 35).map((task) => (
              <article key={task.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{task.status}</span>
                  <span className="badge bg-amber-50 text-amber">{task.priority}</span>
                  <span className="badge bg-cyan-50 text-ocean">{task.format}</span>
                </div>
                <h4 className="mt-3 font-semibold">{task.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{task.theme}</p>
                <p className="mt-1 text-xs text-slate-500">Midia: {task.requiredMedia.join(", ")}</p>
              </article>
            ))}
          </div>
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
