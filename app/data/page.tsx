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
          <div className="flex flex-wrap gap-2">
            <Link href="/data/collection-guide" className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Abrir guia de coleta
            </Link>
            <Link href="/data/source-evidence" className="w-fit rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Mapa de origem
            </Link>
            <Link href="/data/collection-packet" className="w-fit rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Pacote copiavel
            </Link>
          </div>
        </div>
      </section>

      <WeeklyDataInputClient initialData={latestWeek ?? WEEKLY_MARKETING_DATA_MOCK} source={latestWeek ? "saved" : "draft"} />
    </div>
  );
}
