import Link from "next/link";
import {
  buildStoryLearningItems,
  buildWeeklyStoryLearningSummary,
  filterStoryLearningItemsBySignal,
  getStoryLearningMainWarnings,
  getStoriesToAvoidRepeating,
  getStoryReuseCandidates,
  summarizeLearningByCta,
  summarizeLearningByTheme,
  type StoryLearningPriority,
  type StoryLearningRecommendationType
} from "@/lib/storyLearningLoop";
import { storySlotTypeLabel } from "@/lib/storyWeekBuilder";

const priorityClasses: Record<StoryLearningPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-50 text-amber",
  high: "bg-green-50 text-leaf"
};

const recommendationClasses: Record<StoryLearningRecommendationType, string> = {
  repeat: "bg-green-50 text-leaf",
  avoid: "bg-red-50 text-red-700",
  adjust: "bg-amber-50 text-amber",
  test_again: "bg-cyan-50 text-ocean",
  increase_frequency: "bg-green-50 text-leaf",
  reduce_frequency: "bg-amber-50 text-amber",
  improve_cta: "bg-amber-50 text-amber",
  add_more_bofu: "bg-cyan-50 text-ocean",
  add_more_authority: "bg-cyan-50 text-ocean",
  collect_more_data: "bg-slate-100 text-slate-700"
};

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export default function StoryLearningPage() {
  const learningItems = buildStoryLearningItems();
  const summary = buildWeeklyStoryLearningSummary(learningItems, "Semana simulada de stories");
  const reuseItems = getStoryReuseCandidates(learningItems);
  const avoidItems = getStoriesToAvoidRepeating(learningItems);
  const themeLearnings = summarizeLearningByTheme(learningItems);
  const ctaLearnings = summarizeLearningByCta(learningItems);
  const missingItems = filterStoryLearningItemsBySignal(learningItems, "missing_data");
  const ethicalItems = filterStoryLearningItemsBySignal(learningItems, "ethical_attention");
  const warnings = getStoryLearningMainWarnings(learningItems);
  const bestTheme = summary.topThemes[0];
  const bestCta = summary.topCtas[0];

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Stories</p>
        <h2 className="mt-1 text-2xl font-semibold">Aprendizado dos Stories</h2>
        <p className="mt-2 text-sm text-slate-500">Transforme resultados registrados em recomendacoes para a proxima semana.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, o aprendizado usa dados manuais e simulados. Nenhum dado e buscado automaticamente do Instagram, Meta ou qualquer plataforma.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Analisados" value={summary.totalStoriesAnalyzed} />
        <MetricCard label="Com dados" value={summary.storiesWithResults} />
        <MetricCard label="Sem dados" value={summary.storiesMissingData} />
        <MetricCard label="Alta performance" value={summary.highPerformanceStories} />
        <MetricCard label="Baixa performance" value={summary.lowPerformanceStories} />
        <MetricCard label="Geraram WhatsApp" value={summary.whatsappGeneratingStories} />
        <MetricCard label="Reutilizar" value={summary.reuseCandidates.length} detail={`${summary.avoidRepeatingItems.length} ajustar/evitar`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <p className="text-sm font-medium text-ocean">Diagnostico da semana</p>
          <h3 className="mt-1 text-lg font-semibold">Transforme resultados em planejamento</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Tema que mais funcionou</p>
              <p className="mt-1">{bestTheme ? `${bestTheme.pillar} (${bestTheme.totalWhatsappConversations} WhatsApps)` : "Coletar mais dados."}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">CTA que mais funcionou</p>
              <p className="mt-1">{bestCta ? `${bestCta.ctaText} (${bestCta.totalClicks} cliques, ${bestCta.totalWhatsappConversations} WhatsApps)` : "Coletar mais dados."}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Principal risco</p>
              <p className="mt-1">{ethicalItems.length} item(ns) com atencao etica; revisar antes de reaproveitar.</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Principal oportunidade</p>
              <p className="mt-1">Usar stories que geraram WhatsApp para orientar BOFU da proxima semana.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {summary.mainLearnings.map((learning) => (
              <li key={learning}>- {learning}</li>
            ))}
          </ul>
          <Link href="/stories/next-week" className="mt-4 inline-flex w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            Gerar próxima semana
          </Link>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Links contextuais</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/stories/next-week" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Planejar próxima semana</Link>
            <Link href="/stories/results" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Resultados dos Stories</Link>
            <Link href="/stories/execution" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Execucao diaria</Link>
            <Link href="/stories/export" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Exportacao da semana</Link>
            <Link href="/stories" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Planejador de Stories</Link>
            <Link href="/weekly" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Central Semanal</Link>
            <Link href="/data" className="rounded-md border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Dados Semanais</Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">O que repetir</h3>
          <div className="mt-4 space-y-3">
            {reuseItems.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${priorityClasses[item.priority]}`}>Prioridade {item.priority}</span>
                  <span className={`badge ${recommendationClasses[item.recommendationType]}`}>{recommendationLabel(item.recommendationType)}</span>
                </div>
                <h4 className="mt-3 font-semibold">{item.pillar}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.learning}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{item.nextWeekSuggestion}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">O que evitar ou ajustar</h3>
          <div className="mt-4 space-y-3">
            {avoidItems.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${priorityClasses[item.priority]}`}>Prioridade {item.priority}</span>
                  <span className={`badge ${recommendationClasses[item.recommendationType]}`}>{recommendationLabel(item.recommendationType)}</span>
                </div>
                <h4 className="mt-3 font-semibold">{storySlotTypeLabel(item.slotType)} · {item.pillar}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.learning}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">Como testar de novo: {item.nextWeekSuggestion}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Aprendizado por tema</h3>
          <div className="mt-4 space-y-3">
            {themeLearnings.slice(0, 8).map((theme) => (
              <div key={theme.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{theme.pillar}</p>
                  <span className={theme.shouldRepeat ? "badge bg-green-50 text-leaf" : "badge bg-amber-50 text-amber"}>
                    {theme.shouldRepeat ? "repetir" : "ajustar"}
                  </span>
                </div>
                <p className="mt-1">{theme.totalStories} stories · score medio {theme.averageEngagementScore} · {theme.totalWhatsappConversations} WhatsApps</p>
                <p className="mt-1">{theme.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Aprendizado por CTA</h3>
          <div className="mt-4 space-y-3">
            {ctaLearnings.slice(0, 8).map((cta) => (
              <div key={cta.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{cta.ctaText}</p>
                  <span className={cta.performanceLabel === "strong" ? "badge bg-green-50 text-leaf" : cta.performanceLabel === "weak" ? "badge bg-red-50 text-red-700" : "badge bg-slate-100 text-slate-700"}>
                    {cta.performanceLabel}
                  </span>
                </div>
                <p className="mt-1">{cta.totalUses} usos · {cta.totalClicks} cliques · {cta.totalWhatsappConversations} WhatsApps</p>
                <p className="mt-1">{cta.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Recomendacoes para a proxima semana</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.nextWeekRecommendations.map((recommendation) => (
            <article key={recommendation.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap gap-2">
                <span className={`badge ${priorityClasses[recommendation.priority]}`}>Prioridade {recommendation.priority}</span>
                <span className="badge bg-slate-100 text-slate-700">{recommendation.funnelStage}</span>
              </div>
              <h4 className="mt-3 font-semibold">{recommendation.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{recommendation.reason}</p>
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p><span className="font-semibold">Slot:</span> {storySlotTypeLabel(recommendation.suggestedSlotType)}</p>
                <p className="mt-1"><span className="font-semibold">Frequencia:</span> {recommendation.suggestedFrequency}x na semana</p>
                <p className="mt-1"><span className="font-semibold">Texto:</span> {recommendation.suggestedText}</p>
                <p className="mt-1"><span className="font-semibold">CTA:</span> {recommendation.suggestedCTA}</p>
              </div>
              {recommendation.warnings.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-amber">
                  {recommendation.warnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Dados faltantes</h3>
          <p className="mt-2 text-sm text-slate-600">{missingItems.length} story/stories ainda precisam de metricas antes de virar decisao final.</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {summary.missingDataWarnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Avisos do aprendizado</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function recommendationLabel(type: StoryLearningRecommendationType): string {
  return {
    repeat: "repetir",
    avoid: "evitar",
    adjust: "ajustar",
    test_again: "testar de novo",
    increase_frequency: "aumentar frequencia",
    reduce_frequency: "reduzir frequencia",
    improve_cta: "melhorar CTA",
    add_more_bofu: "mais BOFU",
    add_more_authority: "mais autoridade",
    collect_more_data: "coletar dados"
  }[type];
}
