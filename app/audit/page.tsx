import Link from "next/link";
import {
  WEEKLY_AUDIT_DECISIONS,
  WEEKLY_AUDIT_SUMMARY,
  channelLabel,
  classificationLabel,
  confidenceLabel,
  countByChannel,
  countByClassification,
  filterWeeklyAuditDecisions,
  generateWeeklyAuditExecutiveSummary,
  getHighImpactOpportunities,
  getHighImpactRisks,
  impactLabel,
  ownerLabel,
  statusLabel,
  type WeeklyAuditChannel,
  type WeeklyAuditClassification,
  type WeeklyAuditImpact,
  type WeeklyAuditStatus
} from "@/lib/weeklyAudit";

type AuditPageSearchParams = {
  channel?: WeeklyAuditChannel;
  classification?: WeeklyAuditClassification;
  impact?: WeeklyAuditImpact;
  status?: WeeklyAuditStatus;
};

const channels: WeeklyAuditChannel[] = ["meta", "google", "instagram", "content", "funnel", "budget"];
const classifications: WeeklyAuditClassification[] = [
  "clear_win",
  "partial_win",
  "operational_error",
  "silent_risk",
  "missed_opportunity",
  "needs_more_data"
];
const impacts: WeeklyAuditImpact[] = ["low", "medium", "high"];
const statuses: WeeklyAuditStatus[] = ["open", "monitoring", "resolved", "ignored"];

const classificationClasses: Record<WeeklyAuditClassification, string> = {
  clear_win: "bg-green-50 text-leaf",
  partial_win: "bg-cyan-50 text-ocean",
  operational_error: "bg-red-50 text-red-700",
  silent_risk: "bg-amber-50 text-amber",
  missed_opportunity: "bg-indigo-50 text-indigo-700",
  needs_more_data: "bg-slate-100 text-slate-600"
};

const impactClasses: Record<WeeklyAuditImpact, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber"
};

function optionLink(searchParams: AuditPageSearchParams, key: keyof AuditPageSearchParams, value?: string) {
  const params = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(searchParams)) {
    if (paramKey === key || !paramValue) continue;
    params.set(paramKey, String(paramValue));
  }
  if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/audit?${query}` : "/audit";
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

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function WeeklyAuditPage({ searchParams }: { searchParams: AuditPageSearchParams }) {
  const decisions = filterWeeklyAuditDecisions(WEEKLY_AUDIT_DECISIONS, searchParams);
  const byClassification = countByClassification(WEEKLY_AUDIT_DECISIONS);
  const byChannel = countByChannel(WEEKLY_AUDIT_DECISIONS);
  const risks = getHighImpactRisks(WEEKLY_AUDIT_DECISIONS);
  const opportunities = getHighImpactOpportunities(WEEKLY_AUDIT_DECISIONS);
  const wins = WEEKLY_AUDIT_DECISIONS.filter((decision) => decision.classification === "clear_win" || decision.classification === "partial_win");
  const improvements = WEEKLY_AUDIT_DECISIONS.filter(
    (decision) => decision.classification === "operational_error" || decision.classification === "missed_opportunity"
  );
  const needsData = WEEKLY_AUDIT_DECISIONS.filter((decision) => decision.classification === "needs_more_data");

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Auditoria semanal</p>
        <h2 className="mt-1 text-2xl font-semibold">Auditoria semanal</h2>
        <p className="mt-2 text-sm text-slate-500">Análise interna dos movimentos da equipe de marketing do Dr. Cadu.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-6">
        <MetricCard label="Decisões auditadas" value={WEEKLY_AUDIT_DECISIONS.length} />
        <MetricCard label="Acertos claros" value={byClassification.clear_win} />
        <MetricCard label="Acertos parciais" value={byClassification.partial_win} />
        <MetricCard label="Riscos silenciosos" value={byClassification.silent_risk} />
        <MetricCard label="Oportunidades perdidas" value={byClassification.missed_opportunity} />
        <MetricCard label="Precisa de dados" value={byClassification.needs_more_data} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <h3 className="text-lg font-semibold">Diagnóstico executivo da semana</h3>
          <p className="mt-2 text-sm text-slate-600">{generateWeeklyAuditExecutiveSummary()}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Principal risco</p>
              <p className="mt-1 text-sm text-slate-600">{WEEKLY_AUDIT_SUMMARY.mainRisk}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-sm font-semibold">Principal oportunidade</p>
              <p className="mt-1 text-sm text-slate-600">{WEEKLY_AUDIT_SUMMARY.mainOpportunity}</p>
            </div>
          </div>
        </div>
        <aside className="panel">
          <h3 className="text-lg font-semibold">Plano para as próximas 24–72h</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {WEEKLY_AUDIT_SUMMARY.next72hPlan.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {channels.map((channel) => (
          <div key={channel} className="metric-card">
            <p className="text-sm font-semibold text-ink">{channelLabel(channel)}</p>
            <p className="mt-2 text-sm text-slate-500">{byChannel[channel]} achado(s)</p>
          </div>
        ))}
      </section>

      <section className="panel space-y-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold">Filtros</h3>
            <p className="text-sm text-slate-500">Filtre por canal, classificacao, impacto ou status.</p>
          </div>
          <Link href="/audit" className="text-sm font-semibold text-ocean hover:underline">
            Limpar filtros
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <FilterGroup label="Canal">
            <FilterLink href={optionLink(searchParams, "channel")} active={!searchParams.channel}>Todos</FilterLink>
            {channels.map((channel) => (
              <FilterLink key={channel} href={optionLink(searchParams, "channel", channel)} active={searchParams.channel === channel}>
                {channelLabel(channel)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Classificação">
            <FilterLink href={optionLink(searchParams, "classification")} active={!searchParams.classification}>Todas</FilterLink>
            {classifications.map((classification) => (
              <FilterLink key={classification} href={optionLink(searchParams, "classification", classification)} active={searchParams.classification === classification}>
                {classificationLabel(classification)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Impacto">
            <FilterLink href={optionLink(searchParams, "impact")} active={!searchParams.impact}>Todos</FilterLink>
            {impacts.map((impact) => (
              <FilterLink key={impact} href={optionLink(searchParams, "impact", impact)} active={searchParams.impact === impact}>
                {impactLabel(impact)}
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup label="Status">
            <FilterLink href={optionLink(searchParams, "status")} active={!searchParams.status}>Todos</FilterLink>
            {statuses.map((status) => (
              <FilterLink key={status} href={optionLink(searchParams, "status", status)} active={searchParams.status === status}>
                {statusLabel(status)}
              </FilterLink>
            ))}
          </FilterGroup>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold">Decisões e achados</h3>
            <p className="text-sm text-slate-500">{decisions.length} item(ns) exibido(s).</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {decisions.map((decision) => (
            <article key={decision.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-slate-100 text-slate-700">{channelLabel(decision.channel)}</span>
                <span className={`badge ${classificationClasses[decision.classification]}`}>{classificationLabel(decision.classification)}</span>
                <span className={`badge ${impactClasses[decision.impact]}`}>Impacto {impactLabel(decision.impact)}</span>
                <span className="badge bg-slate-100 text-slate-700">Confiança {confidenceLabel(decision.confidence)}</span>
                <span className="badge bg-slate-100 text-slate-700">{statusLabel(decision.status)}</span>
              </div>
              <h4 className="mt-3 font-semibold">{decision.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{decision.description}</p>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p><span className="font-semibold">Evidência:</span> {decision.evidence}</p>
                <p className="mt-2"><span className="font-semibold">Recomendação:</span> {decision.recommendation}</p>
                <p className="mt-2"><span className="font-semibold">Próxima ação:</span> {decision.nextAction}</p>
                <p className="mt-2"><span className="font-semibold">Responsável:</span> {ownerLabel(decision.owner)}</p>
                <p className="mt-2"><span className="font-semibold">Métrica:</span> {decision.relatedMetric}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">O que a equipe acertou</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {wins.map((decision) => (
              <li key={decision.id}>- {decision.title}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">O que precisa melhorar</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {improvements.map((decision) => (
              <li key={decision.id}>- {decision.title}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Riscos silenciosos</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {risks.map((decision) => (
              <li key={decision.id}>- {decision.title}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">O que ainda precisa de dados</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {needsData.map((decision) => (
              <li key={decision.id}>- {decision.title}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Decisões por canal</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
          {channels.map((channel) => (
            <div key={channel} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <span>{channelLabel(channel)}</span>
              <span className="font-semibold">{byChannel[channel]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
