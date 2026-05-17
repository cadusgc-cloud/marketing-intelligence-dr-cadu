import Link from "next/link";
import {
  buildWeeklyDataCollectionGuide,
  getActiveWeeklyCollectionFields,
  getOptionalWeeklyCollectionNotes,
  type WeeklyCollectionCadence,
  type WeeklyCollectionFieldStatus,
  type WeeklyDataCollectionField,
  type WeeklyDataCollectionSource
} from "@/lib/weeklyDataCollectionGuide";

export const dynamic = "force-static";

const statusClasses: Record<WeeklyCollectionFieldStatus, string> = {
  active_input: "bg-green-50 text-leaf",
  optional_note: "bg-cyan-50 text-ocean",
  future_metric: "bg-slate-100 text-slate-700"
};

const cadenceClasses: Record<WeeklyCollectionCadence, string> = {
  weekly_close: "bg-amber-50 text-amber",
  daily_support: "bg-cyan-50 text-ocean",
  review_only: "bg-slate-100 text-slate-700"
};

export default function WeeklyDataCollectionGuidePage() {
  const guide = buildWeeklyDataCollectionGuide();
  const activeFields = getActiveWeeklyCollectionFields();
  const optionalNotes = getOptionalWeeklyCollectionNotes();

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Coleta manual segura</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">{guide.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{guide.summary}</p>
            <p className="mt-3 rounded-md bg-cyan-50 p-3 text-sm font-medium text-ocean">{guide.operatingPrinciple}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/data/collection-packet" className="rounded-md bg-cyan-50 px-3 py-2 text-sm font-semibold text-ocean hover:bg-cyan-100">
              Pacote copiavel
            </Link>
            <Link href="/data" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Preencher /data
            </Link>
            <Link href="/weekly" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Abrir /weekly
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Campos ativos" value={activeFields.length} detail="Entram diretamente em /data." />
        <MetricCard label="Notas opcionais" value={optionalNotes.length} detail="Entram em observacoes por enquanto." />
        <MetricCard label="Fontes" value={guide.sources.length} detail="Canais e contexto operacional." />
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Rotina" title="Fluxo semanal recomendado" description="Use esta sequencia no fechamento da semana antes de olhar diagnostico ou recomendacao." />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {guide.routine.map((step) => (
            <article key={step.id} className="rounded-lg border border-slate-200 p-4">
              <span className="badge bg-slate-100 text-slate-700">Passo {step.order}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.action}</p>
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{step.expectedOutput}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Fontes" title="De onde tirar cada dado" description="Cada fonte mostra caminho manual, campo correspondente no sistema e regra de privacidade." />
        <div className="mt-5 space-y-5">
          {guide.sources.map((source) => (
            <CollectionSourcePanel key={source.id} source={source} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="panel">
          <SectionTitle eyebrow="Nao coletar" title="Dados proibidos nesta fase" />
          <div className="mt-4 grid gap-2">
            {guide.doNotCollect.map((item) => (
              <p key={item} className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Fluxo" title="Depois de coletar" description="Caminho natural dentro do sistema, sem API externa." />
          <div className="mt-4 grid gap-3">
            {guide.routeFlow.map((route) => (
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

function CollectionSourcePanel({ source }: { source: WeeklyDataCollectionSource }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">{source.title}</h2>
            <span className={`badge ${cadenceClasses[source.cadence]}`}>{cadenceLabel(source.cadence)}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{source.sourceOwner}</p>
          <p className="mt-2 text-sm font-medium text-ocean">{source.appDestination}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-3">
          <ListBlock title="Caminho manual" items={source.manualPath} />
          <ListBlock title="Checagens de qualidade" items={source.qualityChecks} />
          <ListBlock title="Privacidade" items={source.privacyRules} />
        </div>

        <div className="grid gap-3">
          {source.fields.map((field) => (
            <CollectionFieldCard key={field.id} field={field} />
          ))}
        </div>
      </div>
    </article>
  );
}

function CollectionFieldCard({ field }: { field: WeeklyDataCollectionField }) {
  return (
    <article className="rounded-md bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${statusClasses[field.status]}`}>{fieldStatusLabel(field.status)}</span>
        <span className="badge bg-white text-slate-700">{field.appField}</span>
        {field.required ? <span className="badge bg-amber-50 text-amber">essencial</span> : null}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{field.label}</h3>
      <p className="mt-2 text-sm text-slate-600">{field.sourceMetric}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
        <p><span className="font-semibold text-slate-700">Onde:</span> {field.whereToFind}</p>
        <p><span className="font-semibold text-slate-700">Formato:</span> {field.acceptedFormat}</p>
        <p><span className="font-semibold text-slate-700">Input:</span> {field.inputHint}</p>
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

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
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

function fieldStatusLabel(status: WeeklyCollectionFieldStatus): string {
  return {
    active_input: "input ativo",
    optional_note: "observacao",
    future_metric: "metrica futura"
  }[status];
}

function cadenceLabel(cadence: WeeklyCollectionCadence): string {
  return {
    weekly_close: "fechamento semanal",
    daily_support: "apoio diario",
    review_only: "revisao"
  }[cadence];
}
