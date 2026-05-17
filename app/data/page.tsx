import Link from "next/link";
import { WeeklyDataInputClient } from "@/app/data/WeeklyDataInputClient";
import { WEEKLY_MARKETING_DATA_MOCK } from "@/lib/weeklyDataInput";
import { getLatestWeeklyMarketingData } from "@/lib/weeklyMarketingWeeks";

export const dynamic = "force-dynamic";

export default async function WeeklyDataInputPage() {
  const latestWeek = await getLatestWeeklyMarketingData();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Coleta semanal</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink">Entrada de dados agregados</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Antes de preencher, use o guia para saber de onde tirar cada numero e o que nunca deve entrar no sistema.
            </p>
          </div>
          <Link href="/data/collection-guide" className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Abrir guia de coleta
          </Link>
        </div>
      </section>

      <WeeklyDataInputClient initialData={latestWeek ?? WEEKLY_MARKETING_DATA_MOCK} source={latestWeek ? "saved" : "draft"} />
    </div>
  );
}
