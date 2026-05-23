import Link from "next/link";
import {
  buildWeeklyNextCollectionPacket,
  type WeeklyNextCollectionPacketArtifact,
  type WeeklyNextCollectionPacketArtifactType
} from "@/lib/weeklyNextCollectionPacket";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import { WEEKLY_MARKETING_DATA_MOCK } from "@/lib/weeklyDataInput";

export const dynamic = "force-static";

export default function WeeklyNextCollectionPlanPage() {
  const plan = buildWeeklyNextCollectionPlan(WEEKLY_MARKETING_DATA_MOCK);
  const packet = buildWeeklyNextCollectionPacket(plan);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Plano copiavel v2.9</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">{packet.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{packet.summary}</p>
            <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
              Esta pagina usa dados simulados como modelo de referencia. Em `/data`, o botao de copiar usa o plano calculado a partir dos campos atuais do formulario.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/data" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Voltar para /data
            </Link>
            <Link href="/data/collection-packet" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Pacote geral
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Artefatos" value={packet.artifacts.length} detail="Plano, rotinas, handoff e briefs." />
        <MetricCard label="Responsaveis" value={packet.ownerBriefs.length} detail="Briefs agrupados por sugestao." />
        <MetricCard label="Tarefas do plano" value={plan.tasks.length} detail="Geradas pela prontidao da coleta." />
      </section>

      <section className="panel">
        <SectionTitle
          eyebrow="Plano completo"
          title="Copiar para revisao manual"
          description="Use o texto abaixo como roteiro interno. Ele nao e enviado automaticamente e nao conecta nenhuma plataforma externa."
        />
        <textarea
          readOnly
          value={packet.fullPacketText}
          rows={24}
          className="mt-4 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700"
          aria-label="Plano completo copiavel"
        />
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Artefatos" title="Blocos reutilizaveis" description="Cada bloco e texto simples para copiar manualmente quando fizer sentido." />
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {packet.artifacts.map((artifact) => (
            <ArtifactPanel key={artifact.id} artifact={artifact} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel">
          <SectionTitle eyebrow="Responsaveis" title="Briefs internos" description="Separacao operacional por responsavel sugerido. Nao enviar automaticamente." />
          <div className="mt-4 space-y-3">
            {packet.ownerBriefs.map((brief) => (
              <article key={brief.owner} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-cyan-50 text-ocean">{brief.taskCount} tarefa(s)</span>
                  <h2 className="font-semibold text-slate-900">{brief.title}</h2>
                </div>
                <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">{brief.content}</pre>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Nao usar" title="Limites fixos" description="Esses itens continuam fora do MVP e fora do fluxo manual seguro." />
          <div className="mt-4 grid gap-2">
            {packet.doNotUse.map((item) => (
              <p key={item} className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Fluxo" title="Depois de revisar o pacote" description="Continuar no fluxo interno e manual." />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {packet.nextRoutes.map((route) => (
            <Link key={route.href} href={route.href} className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 hover:bg-slate-50">
              <span className="font-semibold text-slate-900">{route.label}</span>
              <span className="mt-1 block">{route.purpose}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ArtifactPanel({ artifact }: { artifact: WeeklyNextCollectionPacketArtifact }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-slate-100 text-slate-700">{artifactTypeLabel(artifact.type)}</span>
        <h2 className="font-semibold text-slate-900">{artifact.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{artifact.description}</p>
      <textarea
        readOnly
        value={artifact.content}
        rows={12}
        className="mt-4 w-full rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700"
        aria-label={artifact.title}
      />
      <div className="mt-3 rounded-md bg-white p-3 text-sm text-slate-500">
        {artifact.usage.map((item) => (
          <p key={item}>- {item}</p>
        ))}
      </div>
    </article>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ocean">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function artifactTypeLabel(type: WeeklyNextCollectionPacketArtifactType): string {
  return {
    daily_routine: "rotina diaria",
    full_plan: "plano completo",
    handoff: "handoff",
    owner_brief: "briefs",
    weekly_close: "fechamento"
  }[type];
}
