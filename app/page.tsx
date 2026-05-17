import Link from "next/link";
import { DR_CADU_EDITORIAL_PROFILE } from "@/lib/drCaduEditorialProfile";
import { analyzeLocalMarketingDemoData, getWeeklyContentPlan } from "@/lib/drCaduContentPlan";

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
export default function DashboardPage() {
  const plan = getWeeklyContentPlan();
  const analysis = analyzeLocalMarketingDemoData();
  const primaryChannels = plan.channels.slice(0, 7);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-ocean">App interno local</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Dashboard de Marketing - Dr. Cadu</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{analysis.executiveSummary}</p>
          </div>
          <span className="w-fit rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-leaf">{analysis.statusBadge}</span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/plan" className="rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Abrir plano semanal</Link>
          <Link href="/content" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Content Studio</Link>
          <Link href="/prompts" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Prompts copiaveis</Link>
          <Link href="/export" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Exportar semana</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Dias planejados" value={plan.days.length} detail="semana completa" />
        <MetricCard label="Pacotes de conteudo" value={plan.packages.length} detail="1 por dia" />
        <MetricCard label="Stories sugeridos" value={plan.days.reduce((total, day) => total + day.stories.length, 0)} detail="5 a 10 por dia" />
        <MetricCard label="Videos curtos" value={plan.packages.filter((item) => item.derivedChannels.includes("TikTok") || item.derivedChannels.includes("YouTube Shorts")).length} detail="Reels/TikTok/Shorts" />
        <MetricCard label="Video longo" value={plan.packages.filter((item) => item.primaryChannel === "YouTube video longo").length} detail="YouTube" />
        <MetricCard label="Canais" value={primaryChannels.length} detail="sem integracao real" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <p className="text-sm font-medium text-ocean">Diagnostico executivo</p>
          <h3 className="mt-1 text-lg font-semibold">O que aconteceu e o que fazer</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Melhorou</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">{analysis.whatImproved.map((item) => <li key={item}>- {item}</li>)}</ul>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Precisa atencao</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">{analysis.needsAttention.map((item) => <li key={item}>- {item}</li>)}</ul>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Cadencia x qualidade</p>
              <p className="mt-2 text-sm text-slate-600">{analysis.cadenceQuality.explanation}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Inconclusivo</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">{analysis.inconclusive.map((item) => <li key={item}>- {item}</li>)}</ul>
            </div>
          </div>
        </div>

        <aside className="panel">
          <p className="text-sm font-medium text-ocean">Perfil editorial</p>
          <h3 className="mt-1 text-lg font-semibold">Tom do Dr. Cadu</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {DR_CADU_EDITORIAL_PROFILE.voiceTone.slice(0, 6).map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <h3 className="text-lg font-semibold">Principais sinais</h3>
          <div className="mt-3 space-y-3">
            {analysis.signals.map((signal) => (
              <div key={signal.title} className="rounded-md bg-slate-50 p-3">
                <span className="badge bg-cyan-50 text-ocean">{signal.type}</span>
                <p className="mt-2 text-sm font-semibold">{signal.title}</p>
                <p className="mt-1 text-sm text-slate-600">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Conteudos com maior potencial</h3>
          <div className="mt-3 space-y-3">
            {analysis.bestContent.map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-ink">{item.contentTitle}</p>
                <p className="mt-1 text-slate-600">{item.channel} - score {item.internalScore}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Oportunidades da semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {analysis.recommendations.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Plano da semana</p>
            <h3 className="mt-1 text-lg font-semibold">Conteudos programados</h3>
            <p className="mt-2 text-sm text-slate-500">Semana pronta para uso interno local, com execucao manual e revisao etica antes de publicacao real.</p>
          </div>
          <Link href="/plan" className="text-sm font-semibold text-ocean hover:underline">Ver planejamento completo</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plan.packages.map((item) => (
            <Link key={item.id} href={`/content/${item.id}`} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{item.day}</span>
                <span className="badge bg-cyan-50 text-ocean">{item.primaryChannel}</span>
              </div>
              <h4 className="mt-3 font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{item.objective}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Checklist de seguranca e etica</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            {plan.safetyChecklist.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Atalhos operacionais</h3>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            {[
              ["/weekly", "Central Semanal"],
              ["/signals", "Sinais"],
              ["/audit", "Auditoria"],
              ["/calendar", "Calendario"],
              ["/stories", "Stories"],
              ["/data", "Adicionar/importar dados"]
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">{label}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
