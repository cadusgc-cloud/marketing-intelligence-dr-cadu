import Link from "next/link";
import { WeeklySourceEvidenceLedgerPanel } from "@/app/data/WeeklySourceEvidenceLedgerPanel";
import { buildWeeklySourceEvidenceLedger } from "@/lib/weeklySourceEvidenceLedger";
import { WEEKLY_MARKETING_DATA_MOCK } from "@/lib/weeklyDataInput";

export const dynamic = "force-static";

export default function WeeklySourceEvidencePage() {
  const ledger = buildWeeklySourceEvidenceLedger(WEEKLY_MARKETING_DATA_MOCK);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Mapa local v3.5</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Mapa de origem dos dados</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Referencia local para conferir de onde veio cada numero semanal antes de salvar a semana. O mapa organiza fontes, campos, valores agregados, lacunas e perguntas de revisao.
            </p>
            <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
              Esta rota usa dados simulados como modelo. O fluxo real continua em `/data`, sem API externa, sem dados pessoais e sem salvamento automatico.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/data" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Voltar para /data
            </Link>
            <Link href="/data/collection-guide" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Guia de coleta
            </Link>
          </div>
        </div>
      </section>

      <WeeklySourceEvidenceLedgerPanel ledger={ledger} />
    </div>
  );
}
