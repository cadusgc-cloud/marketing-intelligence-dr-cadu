"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import {
  CONTENT_STUDIO_PILLARS,
  CONTENT_STUDIO_THEMES,
  generateContentStudioPackage,
  type ContentFormat
} from "@/lib/content-studio";

const formats: ContentFormat[] = ["pacote_completo", "stories", "reel", "carrossel", "post_estatico", "legenda", "briefing_editor"];

export function StudioClient() {
  const [theme, setTheme] = useState(CONTENT_STUDIO_THEMES[0]);
  const [pillarId, setPillarId] = useState(CONTENT_STUDIO_PILLARS[1].id);
  const [format, setFormat] = useState<ContentFormat>("pacote_completo");
  const pkg = useMemo(() => generateContentStudioPackage({ theme, pillarId, format }), [theme, pillarId, format]);

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Content Studio</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Fabrica editorial segura para transformar temas em stories, reels, posts, carrosseis, roteiros de gravacao e briefings. Tudo local, deterministico e sem API externa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/library" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Biblioteca</Link>
            <Link href="/recording" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Gravacao</Link>
            <Link href="/review" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Revisao</Link>
            <Link href="/weekly-review" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Recomendacoes V7</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Entrada editorial</p>
          <h3 className="mt-1 text-lg font-semibold">Gerar pacote completo</h3>
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Tema</span>
              <select value={theme} onChange={(event) => setTheme(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                {CONTENT_STUDIO_THEMES.slice(0, 70).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Pilar</span>
              <select value={pillarId} onChange={(event) => setPillarId(event.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                {CONTENT_STUDIO_PILLARS.map((pillar) => <option key={pillar.id} value={pillar.id}>{pillar.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Formato principal</span>
              <select value={format} onChange={(event) => setFormat(event.target.value as ContentFormat)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                {formats.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber">
              Sem paciente, sem local real, sem cirurgia do dia, sem promessa, sem publicacao automatica.
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Voice" value={`${pkg.quality.voiceScore}/100`} detail={pkg.quality.status} />
          <MetricCard label="Safety" value={`${pkg.quality.safetyScore}/100`} detail={pkg.quality.riskLevel} />
          <MetricCard label="Readiness" value={`${pkg.quality.readinessScore}/100`} detail={pkg.status} />
          <MetricCard label="Variacoes" value={pkg.variants.length} detail="todas passam pelo quality" />
          <MetricCard label="Stories" value={pkg.storySequence.items.length} detail="sequencia StoryOps" />
          <MetricCard label="Cards" value={pkg.carousel.cards.length} detail="carrossel educativo" />
          <MetricCard label="Tarefas" value={pkg.productionTasks.length} detail="fila de producao" />
          <MetricCard label="Midia" value={pkg.mediaChecklist.required.length} detail="itens obrigatorios" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-ocean">Pacote gerado</p>
              <h3 className="mt-1 text-lg font-semibold">{pkg.theme}</h3>
            </div>
            <LocalCopyButton text={pkg.exports.fullPackage} label="Copiar pacote" />
          </div>
          <div className="mt-4 grid gap-3">
            {pkg.storySequence.items.map((story) => (
              <article key={story.order} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-ink">Story {story.order}: {story.textOnScreen}</p>
                <p className="mt-1 text-slate-600">{story.mediaSuggestion.label}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Reel e carrossel</p>
          <h3 className="mt-1 text-lg font-semibold">{pkg.reel.title}</h3>
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{pkg.reel.spokenScript}</p>
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-ink">{pkg.carousel.title}</p>
            <ul className="mt-2 space-y-1 text-slate-600">
              {pkg.carousel.cards.map((card, index) => <li key={`${card}-${index}`}>Card {index + 1}: {card}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Variações seguras</p>
          <h3 className="mt-1 text-lg font-semibold">Mesmo tema, usos diferentes</h3>
          <div className="mt-4 space-y-3">
            {pkg.variants.map((variant) => (
              <article key={variant.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <p className="font-semibold text-ink">{variant.label}</p>
                <p className="mt-1 text-slate-600">{variant.text}</p>
                <p className="mt-2 text-xs text-slate-500">Quality {variant.quality.readinessScore}/100 - {variant.quality.status}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Fila de produção</p>
          <h3 className="mt-1 text-lg font-semibold">Proximas acoes</h3>
          <div className="mt-4 space-y-3">
            {pkg.productionTasks.map((task) => (
              <article key={task.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-ink">{task.title}</p>
                <p className="mt-1 text-slate-600">{task.format} | {task.priority} | {task.status}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-ocean">Briefing e midia</p>
              <h3 className="mt-1 text-lg font-semibold">Editor + captura</h3>
            </div>
            <LocalCopyButton text={pkg.editorBriefing.exportText} label="Copiar briefing" />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{pkg.mediaChecklist.exportText}</pre>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-ocean">Exportacao completa</p>
            <h3 className="mt-1 text-lg font-semibold">Texto copiavel para uso interno</h3>
          </div>
          <LocalCopyButton text={pkg.exports.fullPackage} label="Copiar tudo" />
        </div>
        <pre className="mt-4 max-h-[620px] overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{pkg.exports.fullPackage}</pre>
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}
