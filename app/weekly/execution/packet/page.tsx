import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { WeeklyManualExecutionPacketPanel } from "@/app/weekly/execution/WeeklyManualExecutionPacketPanel";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { buildWeeklyCommandResult } from "@/lib/weeklyCommandResult";
import { buildWeeklyExecutionBoard } from "@/lib/weeklyExecutionBoard";
import { buildWeeklyManualExecutionPacket } from "@/lib/weeklyManualExecutionPacket";
import { buildWeeklyStrategicDecisionReport } from "@/lib/weeklyStrategicDecision";
import {
  getLatestWeeklyMarketingData,
  getPreviousValidWeeklyMarketingData,
  getWeeklyMarketingDataById
} from "@/lib/weeklyMarketingWeeks";

export const dynamic = "force-dynamic";

type WeeklyExecutionPacketPageProps = {
  searchParams?: {
    week?: string;
  };
};

export default async function WeeklyExecutionPacketPage({ searchParams }: WeeklyExecutionPacketPageProps) {
  const selectedWeekId = searchParams?.week ?? "";
  const [selectedWeek, latestWeek] = await Promise.all([
    selectedWeekId ? getWeeklyMarketingDataById(selectedWeekId) : Promise.resolve(null),
    getLatestWeeklyMarketingData()
  ]);
  const activeWeek = selectedWeek ?? latestWeek;

  if (!activeWeek) {
    return (
      <EmptyState
        title="Nenhuma semana salva ainda."
        description="Salve dados agregados antes de montar o pacote de execucao manual."
        href="/data"
        actionLabel="Preencher dados semanais"
      />
    );
  }

  const center = buildWeeklyCommandCenter(activeWeek);
  const previousValidWeeks = await getPreviousValidWeeklyMarketingData(activeWeek, 4);
  const previousWeek = previousValidWeeks[0] ?? null;
  const strategicReport = buildWeeklyStrategicDecisionReport(activeWeek, previousWeek);
  const resultReport = buildWeeklyCommandResult(activeWeek, previousWeek, center, strategicReport, previousValidWeeks);
  const executionBoard = buildWeeklyExecutionBoard(resultReport);
  const packet = buildWeeklyManualExecutionPacket(resultReport, executionBoard);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Weekly Command Center</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Pacote de Execucao Manual</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Roteiro interno para revisar prioridades, aprovar gates, distribuir responsaveis e definir coleta agregada da proxima semana.
            </p>
            {selectedWeekId && !selectedWeek ? (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
                A semana solicitada nao foi encontrada. O pacote abriu a semana mais recente salva.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/weekly/execution?week=${activeWeek.id}`} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Voltar ao board
            </Link>
            <Link href={`/weekly?week=${activeWeek.id}`} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Abrir /weekly
            </Link>
          </div>
        </div>
      </section>

      <WeeklyManualExecutionPacketPanel packet={packet} />
    </div>
  );
}
