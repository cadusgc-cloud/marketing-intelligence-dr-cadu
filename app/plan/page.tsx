import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { buildWeeklyContentMarkdown, getWeeklyContentPlan } from "@/lib/drCaduContentPlan";

export default function WeeklyPlanPage() {
  const plan = getWeeklyContentPlan();
  const markdown = buildWeeklyContentMarkdown(plan);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Planejamento semanal</p>
        <h2 className="mt-1 text-2xl font-semibold">Semana completa de conteudo</h2>
        <p className="mt-2 text-sm text-slate-500">7 dias, stories diarios, conteudo principal por dia, videos curtos, video longo e reaproveitamento multicanal.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LocalCopyButton text={markdown} label="Copiar plano em Markdown" />
          <Link href="/export" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Exportacoes</Link>
          <Link href="/prompts" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Biblioteca de prompts</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="metric-card"><p className="text-sm text-slate-500">Dias</p><p className="mt-2 text-2xl font-semibold">{plan.days.length}</p></div>
        <div className="metric-card"><p className="text-sm text-slate-500">Pacotes</p><p className="mt-2 text-2xl font-semibold">{plan.packages.length}</p></div>
        <div className="metric-card"><p className="text-sm text-slate-500">Stories</p><p className="mt-2 text-2xl font-semibold">{plan.days.reduce((total, day) => total + day.stories.length, 0)}</p></div>
        <div className="metric-card"><p className="text-sm text-slate-500">Canais</p><p className="mt-2 text-2xl font-semibold">{plan.channels.length}</p></div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Visao por dia</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-7">
          {plan.days.map((day) => {
            const pkg = plan.packages.find((item) => item.id === day.primaryContentId);
            return (
              <article key={day.id} className="rounded-lg border border-slate-200 p-4">
                <span className="badge bg-slate-100 text-slate-700">{day.day}</span>
                <h4 className="mt-3 font-semibold">{pkg?.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{day.objective}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge bg-cyan-50 text-ocean">{pkg?.primaryChannel}</span>
                  <span className="badge bg-amber-50 text-amber">{day.priority}</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{day.stories.length} stories sugeridos</p>
                <Link href={`/content/${day.primaryContentId}`} className="mt-4 inline-flex text-sm font-semibold text-ocean hover:underline">Abrir pacote</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Stories diarios</h3>
          <div className="mt-4 space-y-4">
            {plan.days.map((day) => (
              <div key={day.id} className="rounded-md bg-slate-50 p-3">
                <p className="font-semibold">{day.day}</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
                  {day.stories.map((story) => <li key={story.order}>{story.text}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Checklist de execucao interna</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Revisar cada legenda antes de publicar manualmente.</li>
            <li>- Conferir que nao ha paciente, DM, nome ou foto sensivel.</li>
            <li>- Copiar pacote de conteudo pelo Content Studio.</li>
            <li>- Usar prompts apenas manualmente, fora do app, se desejado.</li>
            <li>- Registrar metricas agregadas apos a semana.</li>
            <li>- Nao enviar nada automaticamente para equipe ou redes sociais.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
