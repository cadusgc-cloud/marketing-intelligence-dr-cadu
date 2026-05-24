import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import { generateRecordingSession } from "@/lib/content-studio";
import { buildDefaultWeeklyReview } from "@/lib/weekly-review";

export default function RecordingPage() {
  const session = generateRecordingSession();
  const weekly = buildDefaultWeeklyReview();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Planejamento de Gravacao</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Sessao local para gravar 8 a 10 videos curtos e reaproveitar em stories, reels, posts, carrosseis e briefings, sem expor local ou paciente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LocalCopyButton text={session.exportText} label="Copiar sessao" />
            <Link href="/studio" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Studio</Link>
            <Link href="/weekly-review" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Plano V7</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Videos" value={session.topics.length} detail="8 a 10 ideias" />
        <MetricCard label="Antes" value={session.beforeChecklist.length} detail="checklist" />
        <MetricCard label="Depois" value={session.afterChecklist.length} detail="checklist" />
        <MetricCard label="Reaproveitamentos" value={session.topics.reduce((total, topic) => total + topic.repurposing.length, 0)} detail="derivados" />
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Sugestao do fechamento semanal</p>
        <h3 className="mt-1 text-lg font-semibold">Gravar a partir dos temas vencedores</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {weekly.nextWeekPlan.days.filter((day) => day.format === "reel").slice(0, 3).map((day) => (
            <article key={day.date} className="rounded-lg border border-slate-200 p-4">
              <span className="badge bg-cyan-50 text-ocean">{day.date}</span>
              <h4 className="mt-3 font-semibold">{day.theme}</h4>
              <p className="mt-2 text-sm text-slate-600">{day.rationale}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Ordem de gravacao</p>
          <h3 className="mt-1 text-lg font-semibold">{session.title}</h3>
          <div className="mt-4 space-y-3">
            {session.topics.map((topic) => (
              <article key={topic.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">Video {topic.order}</span>
                  <span className="badge bg-cyan-50 text-ocean">{topic.pillar}</span>
                </div>
                <h4 className="mt-3 font-semibold">{topic.theme}</h4>
                <p className="mt-2 text-sm text-slate-600">{topic.shortScript}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {topic.shots.map((shot) => (
                    <div key={shot.id} className="rounded-md bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-ink">{shot.label}</p>
                      <p className="mt-1 text-slate-600">{shot.guidance}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Antes de gravar</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {session.beforeChecklist.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </section>
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Depois de gravar</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {session.afterChecklist.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </section>
        </aside>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Briefing para editor</p>
            <h3 className="mt-1 text-lg font-semibold">Lote de videos curtos</h3>
          </div>
          <LocalCopyButton text={session.editorBatchBriefing} label="Copiar briefing" />
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{session.editorBatchBriefing}</pre>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
