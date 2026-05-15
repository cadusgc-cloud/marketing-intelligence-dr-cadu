import type { WeeklyMetricComparison, WeeklyStrategicDecisionReport, WeeklyStrategicRecommendation, WeeklyStrategicSeverity } from "@/lib/weeklyStrategicDecision";

const severityClasses: Record<WeeklyStrategicSeverity, string> = {
  info: "bg-slate-100 text-slate-700",
  attention: "bg-cyan-50 text-ocean",
  warning: "bg-amber-50 text-amber",
  critical: "bg-red-50 text-red-700"
};

const priorityClasses: Record<WeeklyStrategicRecommendation["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-cyan-50 text-ocean",
  high: "bg-amber-50 text-amber"
};

export function WeeklyStrategicDecisionPanel({ report }: { report: WeeklyStrategicDecisionReport }) {
  const comparisons = report.comparisons.filter((item) => item.deltaAbsolute !== null).slice(0, 6);

  return (
    <section className="panel">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-ocean">v1.1</p>
          <h3 className="mt-1 text-lg font-semibold">Leitura Estratégica da Semana</h3>
          <p className="mt-1 text-sm text-slate-500">{report.statusMessage}</p>
        </div>
        <span className="badge bg-slate-100 text-slate-700">{report.comparisonLabel}</span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div>
          <h4 className="font-semibold">Principais sinais</h4>
          <div className="mt-3 grid gap-3">
            {report.signals.map((signal) => (
              <article key={signal.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${severityClasses[signal.severity]}`}>{severityLabel(signal.severity)}</span>
                  {signal.relatedMetricKeys.slice(0, 2).map((metric) => (
                    <span key={metric} className="badge bg-slate-100 text-slate-700">{metric}</span>
                  ))}
                </div>
                <h5 className="mt-3 font-semibold">{signal.title}</h5>
                <p className="mt-2 text-sm text-slate-600">{signal.description}</p>
                <p className="mt-2 text-sm text-slate-500">{signal.rationale}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Recomendações para a próxima semana</h4>
          <div className="mt-3 grid gap-3">
            {report.recommendations.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${priorityClasses[item.priority]}`}>{priorityLabel(item.priority)}</span>
                  <span className="badge bg-slate-100 text-slate-700">{item.type}</span>
                  <span className="badge bg-slate-100 text-slate-700">{item.ownerSuggestion}</span>
                </div>
                <h5 className="mt-3 font-semibold">{item.title}</h5>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                <p className="mt-2 text-sm text-slate-500">{item.rationale}</p>
                <p className="mt-2 text-xs font-semibold uppercase text-ocean">{item.actionWindow}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {comparisons.length ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="font-semibold">Deltas observados</h4>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {comparisons.map((item) => (
              <div key={item.key} className="rounded-md bg-white p-3 text-sm">
                <p className="font-medium text-slate-700">{item.label}</p>
                <p className="mt-1 text-slate-500">{formatComparison(item)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber">{report.caution}</p>
    </section>
  );
}

function severityLabel(severity: WeeklyStrategicSeverity): string {
  return {
    info: "Informação",
    attention: "Atenção",
    warning: "Alerta",
    critical: "Crítico"
  }[severity];
}

function priorityLabel(priority: WeeklyStrategicRecommendation["priority"]): string {
  return {
    low: "Baixa",
    medium: "Média",
    high: "Alta"
  }[priority];
}

function formatComparison(item: WeeklyMetricComparison): string {
  const delta = item.deltaAbsolute === null ? "sem delta" : formatValue(item.deltaAbsolute, item.unit);
  const percent = item.deltaPercent === null ? "" : ` (${formatPercent(item.deltaPercent)})`;
  return `${directionLabel(item.direction)} ${delta}${percent}`;
}

function directionLabel(direction: WeeklyMetricComparison["direction"]): string {
  return {
    up: "Subiu",
    down: "Caiu",
    flat: "Estável"
  }[direction];
}

function formatValue(value: number, unit: WeeklyMetricComparison["unit"]): string {
  if (unit === "BRL") return `R$ ${value.toFixed(2).replace(".", ",")}`;
  if (unit === "rate") return formatPercent(value);
  return String(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1).replace(".", ",")}%`;
}
