import Link from "next/link";
import {
  WEEKLY_COMMAND_CENTER_LINKS,
  buildWeeklyCommandCenter,
  summarizeWeeklyCommandData,
  type WeeklyActionChannel,
  type WeeklyActionItem,
  type WeeklyOperationalStatus
} from "@/lib/weeklyCommandCenter";
import { channelLabel, decisionTypeLabel, severityLabel } from "@/lib/decisionSignals";
import { classificationLabel, impactLabel } from "@/lib/weeklyAudit";

const statusClasses: Record<WeeklyOperationalStatus, string> = {
  healthy: "bg-green-50 text-leaf",
  attention: "bg-amber-50 text-amber",
  critical: "bg-red-50 text-red-700",
  incomplete_data: "bg-slate-100 text-slate-700"
};

const actionPriorityClasses: Record<WeeklyActionItem["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber"
};

const channelOrder: WeeklyActionChannel[] = ["meta", "google", "instagram", "content", "funnel", "budget"];

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

function ActionList({ title, items }: { title: string; items: WeeklyActionItem[] }) {
  return (
    <div className="panel">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-slate-100 text-slate-700">{channelLabel(item.channel)}</span>
              <span className={`badge ${actionPriorityClasses[item.priority]}`}>{priorityLabel(item.priority)}</span>
              <span className="badge bg-cyan-50 text-ocean">{decisionTypeLabel(item.decisionType)}</span>
            </div>
            <h4 className="mt-3 font-semibold">{item.title}</h4>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <p className="mt-2 text-sm text-slate-500">{item.rationale}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function WeeklyCommandCenterPage() {
  const center = buildWeeklyCommandCenter();
  const criticalSignals = center.triggeredSignals.filter((signal) => signal.severity === "critical");
  const scaleSignals = center.triggeredSignals.filter((signal) => signal.decisionType === "scale");
  const googleSignals = center.triggeredSignals.filter((signal) => signal.channel === "google");
  const channelSummaries: Record<WeeklyActionChannel, string> = {
    meta: center.metaSummary,
    google: center.googleSummary,
    instagram: center.instagramSummary,
    content: center.contentSummary,
    funnel: center.funnelSummary,
    budget: "Orçamento deve proteger Meta Ads e evitar verba nova em canais ainda diagnósticos."
  };

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Central Semanal</p>
        <h2 className="mt-1 text-2xl font-semibold">Central Semanal</h2>
        <p className="mt-2 text-sm text-slate-500">Visão integrada dos dados, sinais, auditoria e plano de ação do marketing.</p>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold">Diagnóstico executivo da semana</h3>
              <span className={`badge ${statusClasses[center.operationalStatus]}`}>{statusLabel(center.operationalStatus)}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{center.executiveSummary}</p>
            <p className="mt-2 text-sm text-slate-500">{summarizeWeeklyCommandData()}</p>
          </div>
          <div className="grid gap-2 text-sm md:min-w-80">
            <DecisionBlock label="Decisão principal" value={center.mainDecision} />
            <DecisionBlock label="Risco principal" value={center.mainRisk} />
            <DecisionBlock label="Oportunidade principal" value={center.mainOpportunity} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        <MetricCard label="Sinais acionados" value={center.triggeredSignals.length} />
        <MetricCard label="Sinais críticos" value={criticalSignals.length} />
        <MetricCard label="Ações 24h" value={center.actionPlan24h.length} />
        <MetricCard label="Ações 72h" value={center.actionPlan72h.length} />
        <MetricCard label="Dados faltantes" value={center.missingData.length} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {channelOrder.map((channel) => (
          <div key={channel} className="panel">
            <h3 className="text-lg font-semibold">{channelLabel(channel)}</h3>
            <p className="mt-2 text-sm text-slate-600">{channelSummaries[channel]}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Sinais acionados mais importantes</h3>
          <div className="mt-4 space-y-3">
            {[...criticalSignals, ...scaleSignals, ...googleSignals].slice(0, 6).map((signal) => (
              <article key={signal.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{channelLabel(signal.channel)}</span>
                  <span className="badge bg-amber-50 text-amber">{severityLabel(signal.severity)}</span>
                  <span className="badge bg-cyan-50 text-ocean">{decisionTypeLabel(signal.decisionType)}</span>
                </div>
                <h4 className="mt-3 font-semibold">{signal.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{signal.nextAction}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Achados da auditoria semanal</h3>
          <div className="mt-4 space-y-3">
            {center.auditFindings.slice(0, 6).map((finding) => (
              <article key={finding.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{channelLabel(finding.channel)}</span>
                  <span className="badge bg-cyan-50 text-ocean">{classificationLabel(finding.classification)}</span>
                  <span className="badge bg-amber-50 text-amber">Impacto {impactLabel(finding.impact)}</span>
                </div>
                <h4 className="mt-3 font-semibold">{finding.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{finding.nextAction}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ActionList title="Plano para as próximas 24h" items={center.actionPlan24h} />
        <ActionList title="Plano para as próximas 72h" items={center.actionPlan72h} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Conteúdos recomendados para a semana</h3>
          <div className="mt-4 space-y-3">
            {center.recommendedContent.map((content) => (
              <article key={content.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-slate-100 text-slate-700">{content.pillar}</span>
                  <span className="badge bg-cyan-50 text-ocean">{content.funnelStage}</span>
                  <span className="badge bg-green-50 text-leaf">{content.suggestedFormat}</span>
                </div>
                <h4 className="mt-3 font-semibold">{content.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{content.reason}</p>
                <p className="mt-2 text-sm text-slate-500">CTA: {content.cta}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Dados faltantes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {center.missingData.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-lg font-semibold">Abrir módulos de origem</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {WEEKLY_COMMAND_CENTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function DecisionBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function statusLabel(status: WeeklyOperationalStatus): string {
  return {
    healthy: "Saudável",
    attention: "Atenção",
    critical: "Crítico",
    incomplete_data: "Dados incompletos"
  }[status];
}

function priorityLabel(priority: WeeklyActionItem["priority"]): string {
  return {
    low: "Baixa",
    medium: "Média",
    high: "Alta"
  }[priority];
}
