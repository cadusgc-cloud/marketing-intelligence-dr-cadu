import Link from "next/link";
import {
  buildWeeklyCollectionPacket,
  type WeeklyCollectionPacketArtifact,
  type WeeklyCollectionReadinessGateStatus
} from "@/lib/weeklyCollectionPacket";

export const dynamic = "force-static";

const gateClasses: Record<WeeklyCollectionReadinessGateStatus, string> = {
  required: "bg-amber-50 text-amber",
  recommended: "bg-cyan-50 text-ocean",
  blocked: "bg-red-50 text-red-700"
};

export default function WeeklyCollectionPacketPage() {
  const packet = buildWeeklyCollectionPacket();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Coleta manual pronta para copiar</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">{packet.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{packet.summary}</p>
            <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">
              Use este pacote para padronizar a coleta semanal antes de preencher /data. A decisao continua humana e o sistema nao envia nada para fora.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/data/collection-guide" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Guia de coleta
            </Link>
            <Link href="/data" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Preencher /data
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Artefatos copiaveis" value={packet.artifacts.length} detail="Checklist, texto, CSV e handoff." />
        <MetricCard label="Gates de revisao" value={packet.readinessGates.length} detail="Bloqueios e checagens antes de salvar." />
        <MetricCard label="Fontes orientadas" value={packet.sourceHandoffNotes.length} detail="Instagram, midia paga, funil e contexto." />
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Artefatos" title="Copiar, preencher e revisar" description="Os campos abaixo sao texto manual. Eles nao conectam APIs, nao salvam automaticamente e nao disparam mensagens." />
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {packet.artifacts.map((artifact) => (
            <ArtifactPanel key={artifact.id} artifact={artifact} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel">
          <SectionTitle eyebrow="Gates" title="Antes de salvar a semana" description="Se algum gate obrigatorio falhar, registre a limitacao antes de usar a Central Semanal." />
          <div className="mt-4 space-y-3">
            {packet.readinessGates.map((gate) => (
              <article key={gate.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${gateClasses[gate.status]}`}>{gateStatusLabel(gate.status)}</span>
                  <h3 className="font-semibold text-slate-900">{gate.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{gate.question}</p>
                <ul className="mt-3 space-y-1 text-sm text-slate-500">
                  {gate.passCriteria.map((criteria) => (
                    <li key={criteria}>- {criteria}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Fontes" title="Handoff por origem" description="Resumo de quem fornece cada bloco e quais campos devem chegar agregados." />
          <div className="mt-4 space-y-3">
            {packet.sourceHandoffNotes.map((source) => (
              <article key={source.sourceId} className="rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900">{source.sourceTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{source.owner}</p>
                <p className="mt-3 whitespace-pre-line rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">{source.handoff}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="panel">
          <SectionTitle eyebrow="Nao usar" title="Fora do pacote" />
          <div className="mt-4 grid gap-2">
            {packet.doNotUse.map((item) => (
              <p key={item} className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Proximo passo" title="Depois da coleta" description="Fluxo local, manual e interno." />
          <div className="mt-4 grid gap-3">
            {packet.nextRoutes.map((route) => (
              <Link key={route.href} href={route.href} className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 hover:bg-slate-50">
                <span className="font-semibold text-slate-900">{route.label}</span>
                <span className="mt-1 block">{route.purpose}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ArtifactPanel({ artifact }: { artifact: WeeklyCollectionPacketArtifact }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-slate-100 text-slate-700">{artifactTypeLabel(artifact.type)}</span>
        <h2 className="font-semibold text-slate-900">{artifact.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{artifact.description}</p>
      <textarea
        className="mt-4 min-h-64 w-full resize-y rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700"
        readOnly
        value={artifact.content}
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

function artifactTypeLabel(type: WeeklyCollectionPacketArtifact["type"]): string {
  return {
    checklist: "checklist",
    csv: "csv/tsv",
    field_value: "campo: valor",
    handoff: "handoff interno"
  }[type];
}

function gateStatusLabel(status: WeeklyCollectionReadinessGateStatus): string {
  return {
    required: "obrigatorio",
    recommended: "recomendado",
    blocked: "bloqueio"
  }[status];
}
