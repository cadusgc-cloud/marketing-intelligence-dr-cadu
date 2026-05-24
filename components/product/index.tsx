import Link from "next/link";
import React, { type ReactNode } from "react";
import {
  badgeClassForTone,
  clampProgress,
  readinessLabel,
  riskLabel,
  type BadgeTone,
  type ReadinessLevel,
  type RiskLevel
} from "@/lib/product-ui";

type ActionLink = {
  href: string;
  label: string;
  tone?: "primary" | "secondary" | "dark";
};

function actionClass(tone: ActionLink["tone"] = "secondary") {
  if (tone === "primary") return "bg-ocean text-white hover:bg-cyan-800";
  if (tone === "dark") return "bg-ink text-white hover:bg-slate-700";
  return "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
}

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions = [],
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ActionLink[];
  children?: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 max-w-3xl">
          {eyebrow ? <p className="text-sm font-medium text-ocean">{eyebrow}</p> : null}
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">{title}</h1>
          {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
          {children}
        </div>
        {actions.length ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link key={`${action.href}-${action.label}`} href={action.href} className={`rounded-md px-4 py-2 text-sm font-semibold ${actionClass(action.tone)}`}>
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ActionLink }) {
  return (
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        {eyebrow ? <p className="text-sm font-medium text-ocean">{eyebrow}</p> : null}
        <h2 className="mt-1 text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={`w-fit rounded-md px-3 py-2 text-sm font-semibold ${actionClass(action.tone)}`}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  return <span className={`badge ${badgeClassForTone(tone)}`}>{label}</span>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const tone: BadgeTone = level === "baixo" ? "success" : level === "medio" ? "warning" : level === "alto" || level === "bloqueado" ? "danger" : "neutral";
  return <StatusBadge tone={tone} label={`Risco: ${riskLabel(level)}`} />;
}

export function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  const tone: BadgeTone = level === "excelente" || level === "bom" ? "success" : level === "revisar" ? "warning" : "danger";
  return <StatusBadge tone={tone} label={`Readiness: ${readinessLabel(level)}`} />;
}

export function MetricCard({ label, value, detail, tone = "neutral" }: { label: string; value: string | number; detail?: string; tone?: BadgeTone }) {
  return (
    <div className="metric-card min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 break-words text-2xl font-semibold ${tone === "danger" ? "text-danger" : tone === "warning" ? "text-amber" : tone === "success" ? "text-leaf" : "text-ink"}`}>{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function ModuleCard({
  title,
  description,
  href,
  meta,
  status,
  children
}: {
  title: string;
  description: string;
  href?: string;
  meta?: string;
  status?: ReactNode;
  children?: ReactNode;
}) {
  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {meta ? <StatusBadge label={meta} tone="info" /> : null}
        {status}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {children}
    </>
  );
  if (!href) return <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">{content}</article>;
  return (
    <Link href={href} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-cyan-200 hover:bg-slate-50">
      {content}
    </Link>
  );
}

export function RouteLinkCard({ href, title, description, group }: { href: string; title: string; description: string; group?: string }) {
  return <ModuleCard href={href} title={title} description={description} meta={group} />;
}

export function CommandActionCard({
  title,
  reason,
  href,
  estimatedMinutes,
  risk
}: {
  title: string;
  reason: string;
  href: string;
  estimatedMinutes: number;
  risk: string;
}) {
  return (
    <ModuleCard title={title} description={reason} href={href} meta={`${estimatedMinutes} min`} status={<StatusBadge label={risk} tone="warning" />}>
      <span className="mt-4 inline-flex text-sm font-semibold text-ocean">Abrir fluxo</span>
    </ModuleCard>
  );
}

export function EmptyState({ title, description, actionHref, actionLabel, exampleLabel }: { title: string; description: string; actionHref: string; actionLabel: string; exampleLabel?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {exampleLabel ? <p className="mt-2 text-xs font-medium text-slate-500">Exemplo local disponivel: {exampleLabel}</p> : null}
      <Link href={actionHref} className="mt-4 inline-flex rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
        {actionLabel}
      </Link>
    </div>
  );
}

export function ErrorState({ title, description, recoveryHref = "/command-center", recoveryLabel = "Voltar ao Command Center" }: { title: string; description: string; recoveryHref?: string; recoveryLabel?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <RiskBadge level="bloqueado" />
      <h1 className="mt-3 text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{description}</p>
      <Link href={recoveryHref} className="mt-4 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
        {recoveryLabel}
      </Link>
    </div>
  );
}

function Callout({ title, description, tone }: { title: string; description: string; tone: BadgeTone }) {
  return (
    <div className={`rounded-lg border p-4 ${tone === "success" ? "border-green-200 bg-green-50" : tone === "warning" ? "border-amber-200 bg-amber-50" : tone === "danger" ? "border-red-200 bg-red-50" : "border-cyan-200 bg-cyan-50"}`}>
      <StatusBadge label={title} tone={tone} />
      <p className="mt-3 text-sm leading-6 text-slate-700">{description}</p>
    </div>
  );
}

export function WarningCallout(props: { title: string; description: string }) {
  return <Callout {...props} tone="warning" />;
}

export function SuccessCallout(props: { title: string; description: string }) {
  return <Callout {...props} tone="success" />;
}

export function InfoCallout(props: { title: string; description: string }) {
  return <Callout {...props} tone="info" />;
}

export function SafetyNotice() {
  return <InfoCallout title="Uso local e seguro" description="Este sistema trabalha com dados ficticios ou inseridos manualmente, sem API externa, sem publicacao automatica e sem dados pessoais de pacientes." />;
}

export function LocalOnlyNotice() {
  return <InfoCallout title="Local e manual" description="Nada aqui conecta Instagram, Meta, Reportei, Google, OpenAI, Etus ou WhatsApp: e sem API externa. Exporte, revise e publique manualmente." />;
}

export function CopyBlock({ title, text, description }: { title: string; text: string; description?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{text}</pre>
    </div>
  );
}

export function ExportPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="panel">
      <SectionHeader eyebrow="Exportacao manual" title={title} description={description} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ChecklistPanel({ title, items }: { title: string; items: Array<string | { label: string; done?: boolean }> }) {
  return (
    <section className="panel">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {items.map((item, index) => {
          const label = typeof item === "string" ? item : item.label;
          const done = typeof item === "string" ? false : item.done;
          return (
            <li key={`${label}-${index}`} className="flex gap-2 rounded-md bg-slate-50 p-3">
              <span aria-hidden="true">{done ? "[x]" : "[ ]"}</span>
              <span>{label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ProgressBar({ value, label = "Progresso" }: { value: number; label?: string }) {
  const clamped = clampProgress(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{clamped}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-ocean" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function Stepper({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <ol className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li key={`${step}-${index}`} className={`rounded-md border p-3 text-sm ${index <= currentIndex ? "border-cyan-200 bg-cyan-50 text-ocean" : "border-slate-200 bg-white text-slate-600"}`}>
          <span className="font-semibold">Etapa {index + 1}</span>
          <p className="mt-1">{step}</p>
        </li>
      ))}
    </ol>
  );
}

export function Breadcrumbs({ items }: { items: ActionLink[] }) {
  return (
    <nav aria-label="Caminho" className="text-sm text-slate-500">
      {items.map((item, index) => (
        <span key={`${item.href}-${item.label}`}>
          {index > 0 ? <span aria-hidden="true"> / </span> : null}
          <Link href={item.href} className="font-medium text-ocean hover:underline">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export function PageNav({ links }: { links: ActionLink[] }) {
  return (
    <nav aria-label="Navegacao da pagina" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link key={`${link.href}-${link.label}`} href={link.href} className={`rounded-md px-3 py-2 text-sm font-semibold ${actionClass(link.tone)}`}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
