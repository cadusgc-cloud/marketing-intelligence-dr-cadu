import Link from "next/link";
import {
  EDITORIAL_CALENDAR_ITEMS,
  WEEKLY_CONTENT_RULES,
  buildEditorialCalendarIndicators,
  filterEditorialCalendarItems,
  formatLabel,
  getEditorialBottlenecks,
  priorityLabel,
  productionStatusLabel,
  type EditorialCalendarFilters,
  type EditorialFormat,
  type ProductionStatus,
  funnelStageLabel
} from "@/lib/editorialCalendar";
import { CONTENT_PILLARS, type ContentFunnelStage, type ContentPriority } from "@/lib/contentStudio";

type CalendarPageSearchParams = {
  productionStatus?: ProductionStatus;
  pillar?: string;
  format?: EditorialFormat;
  priority?: ContentPriority;
  funnelStage?: ContentFunnelStage;
};

const productionStatuses: ProductionStatus[] = ["planned", "scripted", "recorded", "edited", "scheduled", "published"];
const formats: EditorialFormat[] = ["stories", "reels", "shorts", "tiktok", "carousel", "all"];
const priorities: ContentPriority[] = ["low", "medium", "high"];
const funnelStages: ContentFunnelStage[] = ["TOFU", "MOFU", "BOFU"];

const statusClasses: Record<ProductionStatus, string> = {
  planned: "bg-slate-100 text-slate-600",
  scripted: "bg-cyan-50 text-ocean",
  recorded: "bg-indigo-50 text-indigo-700",
  edited: "bg-amber-50 text-amber",
  scheduled: "bg-green-50 text-leaf",
  published: "bg-green-50 text-leaf"
};

const priorityClasses: Record<ContentPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber"
};

function optionLink(searchParams: CalendarPageSearchParams, key: keyof CalendarPageSearchParams, value?: string) {
  const params = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(searchParams)) {
    if (paramKey === key || !paramValue) continue;
    params.set(paramKey, String(paramValue));
  }
  if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/calendar?${query}` : "/calendar";
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-ocean text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
      {children}
    </Link>
  );
}

function IndicatorCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function EditorialCalendarPage({ searchParams }: { searchParams: CalendarPageSearchParams }) {
  const filters: EditorialCalendarFilters = {
    productionStatus: searchParams.productionStatus,
    pillar: searchParams.pillar,
    format: searchParams.format,
    priority: searchParams.priority,
    funnelStage: searchParams.funnelStage
  };
  const filteredItems = filterEditorialCalendarItems(EDITORIAL_CALENDAR_ITEMS, filters);
  const indicators = buildEditorialCalendarIndicators(EDITORIAL_CALENDAR_ITEMS);
  const filteredIndicators = buildEditorialCalendarIndicators(filteredItems);
  const bottlenecks = getEditorialBottlenecks(EDITORIAL_CALENDAR_ITEMS);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Calendario Editorial</p>
        <h2 className="mt-1 text-2xl font-semibold">Calendario Editorial</h2>
        <p className="mt-2 text-sm text-slate-500">Planejamento semanal de conteudos para Stories, Reels, Shorts e TikTok.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        <IndicatorCard label="Conteudos planejados" value={indicators.total} />
        <IndicatorCard label="Roteirizados" value={indicators.scripted} />
        <IndicatorCard label="Gravados" value={indicators.recorded} />
        <IndicatorCard label="Editados" value={indicators.edited} />
        <IndicatorCard label="Agendados" value={indicators.scheduled} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Resumo executivo da semana</h3>
          <p className="mt-2 text-sm text-slate-600">
            Semana com {indicators.total} conteudos planejados, {indicators.highPriority} de alta prioridade e equilibrio {indicators.funnelBalance}. A rotina prioriza
            reaproveitamento de ideias em Stories, Reels/Shorts e TikTok, com Meta Ads como principal canal de escala.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Por funil</p>
              <p className="mt-1 text-sm text-slate-600">{indicators.funnelBalance}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Por formato</p>
              <p className="mt-1 text-sm text-slate-600">
                Stories {indicators.byFormat.stories} / Reels {indicators.byFormat.reels} / Shorts {indicators.byFormat.shorts} / TikTok {indicators.byFormat.tiktok}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Prioridade</p>
              <p className="mt-1 text-sm text-slate-600">{indicators.highPriority} conteudos high priority</p>
            </div>
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Gargalos da semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {bottlenecks.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="panel space-y-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold">Filtros</h3>
            <p className="text-sm text-slate-500">Filtre a semana por status, pilar, formato, prioridade ou etapa do funil.</p>
          </div>
          <Link href="/calendar" className="text-sm font-semibold text-ocean hover:underline">
            Limpar filtros
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <FilterGroup label="Status">
            <FilterLink href={optionLink(searchParams, "productionStatus")} active={!searchParams.productionStatus}>Todos</FilterLink>
            {productionStatuses.map((status) => (
              <FilterLink key={status} href={optionLink(searchParams, "productionStatus", status)} active={searchParams.productionStatus === status}>
                {productionStatusLabel(status)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Pilar">
            <FilterLink href={optionLink(searchParams, "pillar")} active={!searchParams.pillar}>Todos</FilterLink>
            {CONTENT_PILLARS.map((pillar) => (
              <FilterLink key={pillar} href={optionLink(searchParams, "pillar", pillar)} active={searchParams.pillar === pillar}>
                {pillar}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Formato">
            <FilterLink href={optionLink(searchParams, "format")} active={!searchParams.format}>Todos</FilterLink>
            {formats.map((format) => (
              <FilterLink key={format} href={optionLink(searchParams, "format", format)} active={searchParams.format === format}>
                {formatLabel(format)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Prioridade">
            <FilterLink href={optionLink(searchParams, "priority")} active={!searchParams.priority}>Todas</FilterLink>
            {priorities.map((priority) => (
              <FilterLink key={priority} href={optionLink(searchParams, "priority", priority)} active={searchParams.priority === priority}>
                {priorityLabel(priority)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Funil">
            <FilterLink href={optionLink(searchParams, "funnelStage")} active={!searchParams.funnelStage}>Todos</FilterLink>
            {funnelStages.map((stage) => (
              <FilterLink key={stage} href={optionLink(searchParams, "funnelStage", stage)} active={searchParams.funnelStage === stage}>
                {funnelStageLabel(stage)}
              </FilterLink>
            ))}
          </FilterGroup>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold">Visao semanal</h3>
            <p className="text-sm text-slate-500">
              {filteredItems.length} item(ns) exibidos. Filtro atual: {filteredIndicators.funnelBalance}.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-7">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{item.weekLabel}</p>
              <p className="mt-1 text-sm text-slate-500">{item.scheduledDate}</p>
              <h4 className="mt-3 font-semibold">{item.title}</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{item.pillar}</span>
                <span className="badge bg-cyan-50 text-ocean">{funnelStageLabel(item.funnelStage)}</span>
                <span className={`badge ${priorityClasses[item.priority]}`}>{priorityLabel(item.priority)}</span>
                <span className={`badge ${statusClasses[item.productionStatus]}`}>{productionStatusLabel(item.productionStatus)}</span>
              </div>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p><span className="font-semibold">Formato:</span> {formatLabel(item.format)}</p>
                <p className="mt-2"><span className="font-semibold">CTA:</span> {item.cta}</p>
                {item.relatedCampaign ? <p className="mt-2"><span className="font-semibold">Campanha:</span> {item.relatedCampaign}</p> : null}
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Plano da semana</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {WEEKLY_CONTENT_RULES.map((rule) => (
              <li key={rule}>- {rule}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Quantidade por pilar</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            {Object.entries(indicators.byPillar).map(([pillar, count]) => (
              <div key={pillar} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span>{pillar}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
