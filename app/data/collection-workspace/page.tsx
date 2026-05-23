import Link from "next/link";
import { WeeklyCollectionWorkspacePanel } from "@/app/data/WeeklyCollectionWorkspacePanel";
import { buildWeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import { buildWeeklyCollectionWorkspace } from "@/lib/weeklyCollectionWorkspace";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import { WEEKLY_MARKETING_DATA_MOCK, buildWeeklySaveReadinessReport } from "@/lib/weeklyDataInput";

export const dynamic = "force-static";

export default function WeeklyCollectionWorkspacePage() {
  const plan = buildWeeklyNextCollectionPlan(WEEKLY_MARKETING_DATA_MOCK);
  const workspace = buildWeeklyCollectionWorkspace(plan);
  const saveReadiness = buildWeeklySaveReadinessReport(WEEKLY_MARKETING_DATA_MOCK);
  const collectionReadiness = buildWeeklyCollectionReadinessBoard(WEEKLY_MARKETING_DATA_MOCK);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Checklist local v3.4</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Workspace local de coleta</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Acompanhe o status da coleta semanal, o gate de decisao, o handoff pre-salvamento e a trilha de revisao manual, sem banco, sem API e sem campos livres. Esta rota usa dados simulados como modelo; em `/data`, o workspace acompanha o plano calculado pelos campos atuais.
            </p>
            <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
              O progresso fica apenas no navegador via localStorage e armazena somente status de tarefa. Nao insira dados pessoais ou clinicos no sistema.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/data" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Voltar para /data
            </Link>
            <Link href="/data/next-collection-plan" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Plano copiavel
            </Link>
          </div>
        </div>
      </section>

      <WeeklyCollectionWorkspacePanel workspace={workspace} saveReadiness={saveReadiness} collectionReadiness={collectionReadiness} />
    </div>
  );
}
