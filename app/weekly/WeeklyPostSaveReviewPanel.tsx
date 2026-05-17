import Link from "next/link";
import type {
  WeeklyPostSaveReviewConfidence,
  WeeklyPostSaveReviewItemStatus,
  WeeklyPostSaveReviewReport,
  WeeklyPostSaveReviewStatus
} from "@/lib/weeklyPostSaveReview";

export function WeeklyPostSaveReviewPanel({ review }: { review: WeeklyPostSaveReviewReport }) {
  return (
    <section className="panel">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.65fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase text-ocean">Pos-salvamento v3.8</p>
            <span className={`badge ${statusClass(review.status)}`}>{review.statusLabel}</span>
            <span className={`badge ${confidenceClass(review.confidence)}`}>Confianca {review.confidence}: {review.confidenceScore}/100</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-ink">{review.title}</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">{review.summary}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Primeiro passo</p>
          <h4 className="mt-2 font-semibold text-slate-900">{review.firstAction.title}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">{review.firstAction.detail}</p>
          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <p><span className="font-semibold text-slate-700">Responsavel:</span> {review.firstAction.ownerSuggestion}</p>
            <p><span className="font-semibold text-slate-700">Janela:</span> {review.firstAction.actionWindow}</p>
          </div>
          <Link href={review.firstAction.targetHref} className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Abrir {review.firstAction.targetLabel}
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {review.savedSnapshot.map((item) => (
          <article key={item.label} className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
        <div>
          <p className="text-sm font-semibold text-slate-900">Checklist compacto</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {review.reviewItems.map((item) => (
              <Link key={item.id} href={item.targetHref} className="rounded-lg border border-slate-200 p-4 text-sm hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${itemStatusClass(item.status)}`}>{itemStatusLabel(item.status)}</span>
                  <h4 className="font-semibold text-slate-900">{item.label}</h4>
                </div>
                <p className="mt-2 leading-5 text-slate-600">{item.detail}</p>
                <p className="mt-3 rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-600">{item.action}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Abrir depois</p>
          <div className="mt-3 grid gap-2">
            {review.nextOpenLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                {link.label}
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{link.purpose}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2">
        {review.guardrails.slice(0, 4).map((guardrail) => (
          <p key={guardrail} className="rounded-md bg-cyan-50 p-3 text-xs leading-5 text-ocean">
            {guardrail}
          </p>
        ))}
      </div>
    </section>
  );
}

function statusClass(status: WeeklyPostSaveReviewStatus): string {
  if (status === "ready_for_review") return "bg-green-50 text-leaf";
  if (status === "limited_review") return "bg-amber-50 text-amber";
  return "bg-red-50 text-red-700";
}

function confidenceClass(confidence: WeeklyPostSaveReviewConfidence): string {
  if (confidence === "alta") return "bg-green-50 text-leaf";
  if (confidence === "media") return "bg-amber-50 text-amber";
  return "bg-red-50 text-red-700";
}

function itemStatusClass(status: WeeklyPostSaveReviewItemStatus): string {
  if (status === "ok") return "bg-green-50 text-leaf";
  if (status === "review") return "bg-amber-50 text-amber";
  return "bg-cyan-50 text-ocean";
}

function itemStatusLabel(status: WeeklyPostSaveReviewItemStatus): string {
  if (status === "ok") return "ok";
  if (status === "review") return "revisar";
  return "limitado";
}
