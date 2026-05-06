import { updateBenchmark } from "@/app/settings/actions";
import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  const settings = await prisma.benchmarkSetting.findMany({ orderBy: { label: "asc" } });
  return (
    <div className="panel">
      <h2 className="text-xl font-semibold">Configurações dos benchmarks</h2>
      <p className="mt-1 text-sm text-slate-500">Ajustes simples para calibrar as regras internas do MVP.</p>
      <div className="mt-5 space-y-3">
        {settings.map((setting) => (
          <form key={setting.id} action={updateBenchmark} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_160px_100px] md:items-center">
            <input type="hidden" name="id" value={setting.id} />
            <div>
              <p className="font-medium">{setting.label}</p>
              <p className="text-sm text-slate-500">{setting.description}</p>
            </div>
            <label className="text-sm">
              <span className="mb-1 block text-slate-500">{setting.unit}</span>
              <input name="value" defaultValue={setting.value} className="w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <button type="submit" className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Salvar
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
