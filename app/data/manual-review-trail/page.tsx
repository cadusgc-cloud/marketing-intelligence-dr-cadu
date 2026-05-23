import Link from "next/link";
import { WeeklyCollectionWorkspacePanel } from "@/app/data/WeeklyCollectionWorkspacePanel";
import { buildWeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import { buildWeeklyCollectionWorkspace } from "@/lib/weeklyCollectionWorkspace";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import { WEEKLY_MARKETING_DATA_MOCK, buildWeeklySaveReadinessReport } from "@/lib/weeklyDataInput";

export const dynamic = "force-static";

export default function WeeklyManualReviewTrailPage() {
  const collectionReadiness = buildWeeklyCollectionReadinessBoard(WEEKLY_MARKETING_DATA_MOCK);
  const plan = buildWeeklyNextCollectionPlan(WEEKLY_MARKETING_DATA_MOCK, collectionReadiness);
  const workspace = buildWeeklyCollectionWorkspace(plan);
  const saveReadiness = buildWeeklySaveReadinessReport(WEEKLY_MARKETING_DATA_MOCK);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Trilha local v3.4</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Trilha de revisao manual</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Referencia local para copiar a decisao humana antes de salvar uma semana. A trilha junta workspace, gate, handoff, formulario e prontidao por fonte em um registro Markdown.
            </p>
            <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
              Esta rota usa dados simulados como modelo. O fluxo real continua em `/data`, com metricas agregadas, sem API externa e sem salvamento automatico.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/data" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Voltar para /data
            </Link>
            <Link href="/data/collection-workspace" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Workspace local
            </Link>
          </div>
        </div>
      </section>

      <WeeklyCollectionWorkspacePanel workspace={workspace} saveReadiness={saveReadiness} collectionReadiness={collectionReadiness} />
    </div>
  );
}
