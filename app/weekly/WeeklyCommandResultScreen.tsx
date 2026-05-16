import Link from "next/link";
import type {
  WeeklyCommandResult,
  WeeklyResultMetricCard,
  WeeklyResultSignal,
  WeeklyResultSignalType,
  WeeklyResultStatus
} from "@/lib/weeklyCommandResult";

const statusClasses: Record<WeeklyResultStatus, string> = {
  growth: "bg-green-50 text-leaf",
  stable: "bg-slate-100 text-slate-700",
  cadence_drop: "bg-amber-50 text-amber",
  quality_drop: "bg-red-50 text-red-700",
  insufficient_data: "bg-cyan-50 text-ocean"
};

const signalClasses: Record<WeeklyResultSignalType, string> = {
  positive: "bg-green-50 text-leaf",
  warning: "bg-amber-50 text-amber",
  anomaly: "bg-red-50 text-red-700",
  insufficient_data: "bg-cyan-50 text-ocean"
};

export function WeeklyCommandResultScreen({ report }: { report: WeeklyCommandResult }) {
  return (
    <section className="space-y-6">
      <div className="panel">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase text-ocean">Central operacional interna</p>
              <span className={`badge ${statusClasses[report.status]}`}>{report.statusLabel}</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">Weekly Command Center</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{report.weekLabel}</p>
            <p className="mt-1 text-sm text-slate-500">{report.periodLabel}</p>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-700">{report.executiveSummary}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Decisao humana preservada</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{report.caution}</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <SectionTitle eyebrow="Diagnostico executivo" title="O que melhorou, piorou e ainda nao permite conclusao" />
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <DiagnosisList title="Melhorou" items={report.diagnosis.improved} tone="positive" />
          <DiagnosisList title="Piorou" items={report.diagnosis.worsened} tone="warning" />
          <DiagnosisList title="Inconclusivo" items={report.diagnosis.inconclusive} tone="neutral" />
          <DiagnosisList title="Atencao" items={report.diagnosis.needsAttention} tone="attention" />
        </div>
      </div>

      <div className="panel">
        <SectionTitle eyebrow="Metricas principais" title="Leitura numerica da semana" description="Comparacao com a semana anterior valida quando existe dado seguro." />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {report.coreMetrics.map((metric) => (
            <MetricResultCard key={metric.key} metric={metric} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="panel">
          <SectionTitle eyebrow="Interpretacao" title="Cadencia x Qualidade" />
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <span className={`badge ${statusClasses[report.cadenceQuality.status]}`}>{report.cadenceQuality.title}</span>
            <p className="mt-3 text-sm leading-6 text-slate-700">{report.cadenceQuality.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {report.cadenceQuality.evidence.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-md bg-white p-3 text-sm text-slate-700">
              <span className="font-semibold">Proxima acao:</span> {report.cadenceQuality.nextAction}
            </p>
          </div>
        </section>

        <section className="panel">
          <SectionTitle eyebrow="Sinais" title="Mudancas relevantes e lacunas" />
          <div className="mt-4 grid gap-3">
            {report.signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <SectionTitle eyebrow="Aprendizado criativo" title="Funcoes de conteudo" description="Leitura segura por funcao editorial, sem inventar performance por peca." />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {report.contentLearning.map((item) => (
            <article key={item.functionName} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold">{item.label}</h4>
                <span className="badge bg-slate-100 text-slate-700">{contentStatusLabel(item.status)}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.evidence}</p>
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{item.nextAction}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel">
          <SectionTitle eyebrow="Presenca diaria" title="Stories e rotina editorial" />
          <div className="mt-4 rounded-lg border border-slate-200 p-4">
            <span className="badge bg-slate-100 text-slate-700">{storiesStatusLabel(report.storiesPresence.status)}</span>
            <p className="mt-3 text-sm leading-6 text-slate-600">{report.storiesPresence.summary}</p>
            <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{report.storiesPresence.nextAction}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.storiesPresence.links.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <SectionTitle eyebrow="Team Audit Mode" title="Auditoria interna da execucao" />
          <p className="mt-4 text-sm leading-6 text-slate-600">{report.teamAudit.summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AuditList title="Riscos" items={report.teamAudit.risks} />
            <AuditList title="Oportunidades" items={report.teamAudit.opportunities} />
          </div>
          <p className="mt-4 rounded-md bg-cyan-50 p-3 text-sm text-ocean">{report.teamAudit.note}</p>
        </section>
      </div>

      <section className="panel">
        <SectionTitle eyebrow="Proxima semana" title="Plano da proxima semana" description="Plano interno para repetir, ajustar, testar e evitar." />
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <PlanList title="Repetir" items={report.nextWeekPlan.repeat} />
          <PlanList title="Ajustar" items={report.nextWeekPlan.adjust} />
          <PlanList title="Testar" items={report.nextWeekPlan.test} />
          <PlanList title="Evitar" items={report.nextWeekPlan.avoid} />
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Acoes finais" title="Abrir modulos conectados" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {report.finalActions.map((action) => (
            <Link key={action.href} href={action.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ocean">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function DiagnosisList({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "warning" | "neutral" | "attention" }) {
  const toneClass = {
    positive: "bg-green-50 text-leaf",
    warning: "bg-red-50 text-red-700",
    neutral: "bg-slate-100 text-slate-700",
    attention: "bg-amber-50 text-amber"
  }[tone];

  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <span className={`badge ${toneClass}`}>{title}</span>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </article>
  );
}

function MetricResultCard({ metric }: { metric: WeeklyResultMetricCard }) {
  return (
    <article className="metric-card">
      <p className="text-sm text-slate-500">{metric.label}</p>
      <p className="mt-2 text-2xl font-semibold">{formatMetricValue(metric.value, metric.unit)}</p>
      <p className="mt-1 text-xs text-slate-500">{formatMetricComparison(metric)}</p>
      <p className="mt-3 text-sm text-slate-600">{metric.interpretation}</p>
    </article>
  );
}

function SignalCard({ signal }: { signal: WeeklyResultSignal }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap gap-2">
        <span className={`badge ${signalClasses[signal.type]}`}>{signalTypeLabel(signal.type)}</span>
        <span className="badge bg-slate-100 text-slate-700">{signal.source}</span>
      </div>
      <h4 className="mt-3 font-semibold">{signal.title}</h4>
      <p className="mt-2 text-sm text-slate-600">{signal.description}</p>
    </article>
  );
}

function AuditList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </article>
  );
}

function formatMetricComparison(metric: WeeklyResultMetricCard): string {
  if (metric.status === "missing") return "Dado nao coletado";
  if (metric.previousValue === null) return "Sem semana anterior valida";
  if (metric.deltaAbsolute === null) return "Sem delta calculavel";
  const percent = metric.deltaPercent === null ? "" : ` (${formatPercent(metric.deltaPercent)})`;
  return `Delta: ${formatMetricValue(metric.deltaAbsolute, metric.unit)}${percent}`;
}

function formatMetricValue(value: number | null, unit: WeeklyResultMetricCard["unit"]): string {
  if (value === null) return "Nao coletado";
  if (unit === "BRL") return `R$ ${value.toFixed(2).replace(".", ",")}`;
  if (unit === "rate") return formatPercent(value);
  return String(value);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1).replace(".", ",")}%`;
}

function signalTypeLabel(type: WeeklyResultSignalType): string {
  return {
    positive: "Sinal positivo",
    warning: "Alerta",
    anomaly: "Anomalia",
    insufficient_data: "Dados insuficientes"
  }[type];
}

function contentStatusLabel(status: "active" | "attention" | "missing_data"): string {
  return {
    active: "Ativo",
    attention: "Atenção",
    missing_data: "Sem dado"
  }[status];
}

function storiesStatusLabel(status: "active" | "attention" | "missing_data"): string {
  return {
    active: "Presenca ativa",
    attention: "Requer cadencia",
    missing_data: "Sem dado"
  }[status];
}
