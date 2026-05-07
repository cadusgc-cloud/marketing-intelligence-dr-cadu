import { prisma } from "@/lib/db";
import { getReports } from "@/lib/reports";
import { benchmarkKeyLabel, benchmarkUnitHint, benchmarkValueLabel, formatCurrency, formatNumber } from "@/components/ui";

export default async function BenchmarksPage() {
  const [settings, reports] = await Promise.all([prisma.benchmarkSetting.findMany({ orderBy: { label: "asc" } }), getReports()]);
  const validReports = reports.filter((report) => !report.isOperationalAnomaly);
  const avg = (values: (number | null)[]) => {
    const valid = values.filter((value): value is number => value !== null && value !== undefined);
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
  };
  const metaCpl = avg(validReports.map((report) => report.channelSummaries.find((item) => item.channel === "meta_ads")?.cpl ?? null));
  const googleCpa = avg(validReports.map((report) => report.channelSummaries.find((item) => item.channel === "google_ads")?.cpa ?? null));
  const followers = avg(validReports.map((report) => report.channelSummaries.find((item) => item.channel === "consolidated")?.newFollowers ?? null));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card"><p className="text-sm text-slate-500">CPL Meta médio interno</p><p className="mt-2 text-2xl font-semibold">{formatCurrency(metaCpl)}</p></div>
        <div className="metric-card"><p className="text-sm text-slate-500">CPA Google médio interno</p><p className="mt-2 text-2xl font-semibold">{formatCurrency(googleCpa)}</p></div>
        <div className="metric-card"><p className="text-sm text-slate-500">Seguidores por período</p><p className="mt-2 text-2xl font-semibold">{formatNumber(followers)}</p></div>
      </section>
      <section className="panel">
        <h2 className="text-xl font-semibold">Benchmarks internos</h2>
        <p className="mt-1 text-sm text-slate-500">Relatórios com anomalia operacional não entram nas médias.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead><tr className="text-left text-slate-500"><th className="py-2 pr-3">Benchmark</th><th className="py-2 pr-3">Valor</th><th className="py-2 pr-3">Descrição</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {settings.map((setting) => (
                <tr key={setting.id}>
                  <td className="py-2 pr-3">
                    <p className="font-medium">{benchmarkKeyLabel(setting.key)}</p>
                    <p className="text-xs text-slate-500">{setting.key}</p>
                  </td>
                  <td className="py-2 pr-3">
                    <p className="font-medium">{benchmarkValueLabel(setting.value, setting.unit)}</p>
                    <p className="text-xs text-slate-500">{benchmarkUnitHint(setting.unit)}</p>
                  </td>
                  <td className="py-2 pr-3 text-slate-500">{setting.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
