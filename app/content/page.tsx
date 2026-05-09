import Link from "next/link";
import {
  CONTENT_IDEAS,
  CONTENT_PILLARS,
  type ContentFunnelStage,
  type ContentPriority,
  type ContentStatus,
  contentStatusLabel,
  filterContentIdeas,
  funnelStageLabel,
  getContentIdeaById,
  suggestedPlatformLabel
} from "@/lib/contentStudio";

type ContentPageSearchParams = {
  pillar?: string;
  funnelStage?: ContentFunnelStage;
  status?: ContentStatus;
  priority?: ContentPriority;
  selected?: string;
};

const funnelStages: ContentFunnelStage[] = ["TOFU", "MOFU", "BOFU"];
const statuses: ContentStatus[] = ["idea", "scripted", "recorded", "edited", "scheduled", "published"];
const priorities: ContentPriority[] = ["low", "medium", "high"];

const priorityLabels: Record<ContentPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta"
};

const priorityClasses: Record<ContentPriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber"
};

const statusClasses: Record<ContentStatus, string> = {
  idea: "bg-slate-100 text-slate-600",
  scripted: "bg-cyan-50 text-ocean",
  recorded: "bg-indigo-50 text-indigo-700",
  edited: "bg-amber-50 text-amber",
  scheduled: "bg-green-50 text-leaf",
  published: "bg-green-50 text-leaf"
};

function optionLink(searchParams: ContentPageSearchParams, key: keyof ContentPageSearchParams, value?: string) {
  const params = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(searchParams)) {
    if (paramKey === "selected" || paramKey === key || !paramValue) continue;
    params.set(paramKey, String(paramValue));
  }
  if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/content?${query}` : "/content";
}

function selectedLink(searchParams: ContentPageSearchParams, selected: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (!value || key === "selected") continue;
    params.set(key, String(value));
  }
  params.set("selected", selected);
  return `/content?${params.toString()}`;
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

export default function ContentStudioPage({ searchParams }: { searchParams: ContentPageSearchParams }) {
  const filters = {
    pillar: searchParams.pillar,
    funnelStage: searchParams.funnelStage,
    status: searchParams.status,
    priority: searchParams.priority
  };
  const filteredIdeas = filterContentIdeas(CONTENT_IDEAS, filters);
  const selectedIdea = getContentIdeaById(searchParams.selected, filteredIdeas) ?? filteredIdeas[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Content Studio</p>
        <h2 className="mt-1 text-2xl font-semibold">Content Studio</h2>
        <p className="mt-2 text-sm text-slate-500">Planejamento de stories, shorts e TikTok para o perfil @drcadugazzinelli.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {CONTENT_PILLARS.map((pillar) => (
          <Link key={pillar} href={optionLink(searchParams, "pillar", pillar)} className="metric-card hover:bg-slate-50">
            <p className="text-sm font-semibold text-ink">{pillar}</p>
            <p className="mt-2 text-sm text-slate-500">{CONTENT_IDEAS.filter((idea) => idea.pillar === pillar).length} ideia(s)</p>
          </Link>
        ))}
      </section>

      <section className="panel space-y-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold">Filtros</h3>
            <p className="text-sm text-slate-500">Filtre por pilar, etapa do funil, status ou prioridade.</p>
          </div>
          <Link href="/content" className="text-sm font-semibold text-ocean hover:underline">
            Limpar filtros
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <FilterGroup label="Pilar">
            <FilterLink href={optionLink(searchParams, "pillar")} active={!searchParams.pillar}>Todos</FilterLink>
            {CONTENT_PILLARS.map((pillar) => (
              <FilterLink key={pillar} href={optionLink(searchParams, "pillar", pillar)} active={searchParams.pillar === pillar}>
                {pillar}
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
          <FilterGroup label="Status">
            <FilterLink href={optionLink(searchParams, "status")} active={!searchParams.status}>Todos</FilterLink>
            {statuses.map((status) => (
              <FilterLink key={status} href={optionLink(searchParams, "status", status)} active={searchParams.status === status}>
                {contentStatusLabel(status)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Prioridade">
            <FilterLink href={optionLink(searchParams, "priority")} active={!searchParams.priority}>Todas</FilterLink>
            {priorities.map((priority) => (
              <FilterLink key={priority} href={optionLink(searchParams, "priority", priority)} active={searchParams.priority === priority}>
                {priorityLabels[priority]}
              </FilterLink>
            ))}
          </FilterGroup>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Ideias reaproveitáveis</h3>
              <p className="text-sm text-slate-500">{filteredIdeas.length} conteúdo(s) encontrados.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filteredIdeas.map((idea) => (
              <Link key={idea.id} href={selectedLink(searchParams, idea.id)} className={`rounded-lg border p-4 hover:bg-slate-50 ${selectedIdea?.id === idea.id ? "border-ocean bg-cyan-50/40" : "border-slate-200"}`}>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{idea.pillar}</span>
                  <span className="badge bg-cyan-50 text-ocean">{funnelStageLabel(idea.funnelStage)}</span>
                  <span className={`badge ${priorityClasses[idea.priority]}`}>{priorityLabels[idea.priority]}</span>
                  <span className={`badge ${statusClasses[idea.status]}`}>{contentStatusLabel(idea.status)}</span>
                </div>
                <p className="mt-3 font-semibold">{idea.title}</p>
                <p className="mt-1 text-sm text-slate-500">{idea.hook}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-medium text-slate-600">
                  <span className="rounded-md bg-slate-100 px-2 py-1">Stories</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1">Reels/Shorts</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1">TikTok</span>
                </div>
              </Link>
            ))}
            {!filteredIdeas.length ? <p className="text-sm text-slate-500 md:col-span-2">Nenhuma ideia encontrada para os filtros atuais.</p> : null}
          </div>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Detalhe do conteúdo</h3>
          {selectedIdea ? (
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{suggestedPlatformLabel(selectedIdea.suggestedPlatform)}</span>
                  <span className="badge bg-cyan-50 text-ocean">{funnelStageLabel(selectedIdea.funnelStage)}</span>
                  <span className={`badge ${statusClasses[selectedIdea.status]}`}>{contentStatusLabel(selectedIdea.status)}</span>
                </div>
                <h4 className="mt-3 text-xl font-semibold">{selectedIdea.title}</h4>
                <p className="mt-2 text-sm text-slate-500">{selectedIdea.mainObjective}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Stories</p>
                <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-slate-600">
                  {selectedIdea.storiesScript.map((block) => (
                    <li key={block}>{block}</li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-sm font-semibold">Reels/Shorts</p>
                <p className="mt-2 text-sm text-slate-600">{selectedIdea.shortScript}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">TikTok</p>
                <p className="mt-2 text-sm text-slate-600">{selectedIdea.tiktokScript}</p>
              </div>

              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold">Legenda</p>
                <p className="mt-1 text-sm text-slate-600">{selectedIdea.caption}</p>
                <p className="mt-3 text-sm font-semibold">CTA</p>
                <p className="mt-1 text-sm text-slate-600">{selectedIdea.cta}</p>
              </div>

              <div>
                <p className="text-sm font-semibold">Variacao A/B</p>
                <p className="mt-1 text-sm text-slate-600">{selectedIdea.abVariation}</p>
                <p className="mt-3 text-sm font-semibold">Motivo estrategico</p>
                <p className="mt-1 text-sm text-slate-600">{selectedIdea.strategicReason}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Selecione uma ideia para ver roteiros e reaproveitamento.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
