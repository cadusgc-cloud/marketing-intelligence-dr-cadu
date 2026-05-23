"use client";

import { useMemo, useState } from "react";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import {
  STORYOPS_INITIAL_THEMES,
  STORY_EDITORIAL_LINES,
  buildStoryOpsSequence,
  storyOpsSafetyStatusLabel,
  type StoryEditorialLine,
  type StoryRiskLevel,
  type StorySequence
} from "@/lib/storyops";

const statusClasses: Record<StoryRiskLevel, string> = {
  low: "bg-green-50 text-leaf",
  attention: "bg-amber-50 text-amber",
  review: "bg-orange-50 text-orange-700",
  block: "bg-red-50 text-red-700"
};

type StoryOpsDraft = {
  date: string;
  theme: string;
  editorialLine: StoryEditorialLine;
  neutralContext: string;
};

const initialDraft: StoryOpsDraft = {
  date: "2026-05-23",
  theme: "expectativa realista em cirurgia plastica",
  editorialLine: "expectativa_realista",
  neutralContext: ""
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

export function StoryOpsClient() {
  const [draft, setDraft] = useState<StoryOpsDraft>(initialDraft);
  const [generatedDraft, setGeneratedDraft] = useState<StoryOpsDraft>(initialDraft);
  const sequence = useMemo(() => buildStoryOpsSequence(generatedDraft), [generatedDraft]);
  const previewSequence = useMemo(() => buildStoryOpsSequence(draft), [draft]);

  function updateDraft(partial: Partial<StoryOpsDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function selectTheme(themeLabel: string) {
    const theme = STORYOPS_INITIAL_THEMES.find((item) => item.label === themeLabel);
    updateDraft({
      theme: themeLabel,
      editorialLine: theme?.suggestedLine ?? draft.editorialLine
    });
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ocean">StoryOps Diário v2.0</p>
              <span className={`badge ${statusClasses[sequence.safetyStatus]}`}>{storyOpsSafetyStatusLabel(sequence.safetyStatus)}</span>
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-ink">StoryOps Diário</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Planejamento diario interno para criar sequencias de 6 stories naturais, rapidos, editaveis e seguros para revisao humana antes de qualquer publicacao manual.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:min-w-80">
            <p className="text-xs font-semibold uppercase text-slate-500">Guardrail</p>
            <p className="mt-2 font-semibold text-ink">Sem API externa, sem postagem automatica</p>
            <p className="mt-1">O modulo apenas planeja, revisa e exporta texto. Instagram, Meta, WhatsApp e qualquer publicacao continuam fora do sistema.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Stories gerados" value={sequence.items.length} detail="Sequencia fixa" />
        <MetricCard label="Score editorial" value={`${sequence.safetyScore}/100`} detail={storyOpsSafetyStatusLabel(sequence.safetyStatus)} />
        <MetricCard label="Alertas" value={sequence.safetyChecks.filter((item) => item.status !== "low").length} detail="Antes de postar" />
        <MetricCard label="Linha editorial" value={sequence.editorialLineLabel} />
        <MetricCard label="Dia" value={sequence.dayName} detail={sequence.date} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Entrada diaria</p>
          <h3 className="mt-1 text-lg font-semibold">Gerar sequencia natural</h3>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Data</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) => updateDraft({ date: event.target.value })}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Tema inicial</span>
              <select
                value={STORYOPS_INITIAL_THEMES.some((theme) => theme.label === draft.theme) ? draft.theme : ""}
                onChange={(event) => selectTheme(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Escolher tema sugerido</option>
                {STORYOPS_INITIAL_THEMES.map((theme) => (
                  <option key={theme.id} value={theme.label}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Tema do dia</span>
              <input
                value={draft.theme}
                onChange={(event) => updateDraft({ theme: event.target.value })}
                placeholder="Ex.: expectativa realista em cirurgia plastica"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Linha editorial</span>
              <select
                value={draft.editorialLine}
                onChange={(event) => updateDraft({ editorialLine: event.target.value as StoryEditorialLine })}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                {STORY_EDITORIAL_LINES.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                {STORY_EDITORIAL_LINES.find((line) => line.id === draft.editorialLine)?.description}
              </p>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Contexto neutro opcional</span>
              <textarea
                value={draft.neutralContext}
                onChange={(event) => updateDraft({ neutralContext: event.target.value })}
                rows={4}
                placeholder="Ex.: dia de organizar ideias. Nao informe local, paciente, agenda, tela ou caso real."
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">Use apenas contexto editavel e seguro. Nao escreva hospital, clinica, paciente, cirurgia do dia ou local real.</p>
            </label>

            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-ink">Previa do gate</p>
              <p className="mt-1">{storyOpsSafetyStatusLabel(previewSequence.safetyStatus)} - {previewSequence.safetyChecks.filter((item) => item.status !== "low").length} alerta(s) antes de gerar.</p>
            </div>

            <button
              type="button"
              onClick={() => setGeneratedDraft(draft)}
              className="inline-flex w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              Gerar sequencia de 6 stories
            </button>
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">Revisao editorial</p>
          <h3 className="mt-1 text-lg font-semibold">{sequence.theme}</h3>
          <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{sequence.dayGuidance}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sequence.safetyChecks.map((check) => (
              <article key={check.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${statusClasses[check.status]}`}>{storyOpsSafetyStatusLabel(check.status)}</span>
                  <span className="badge bg-slate-100 text-slate-700">{check.label}</span>
                </div>
                <p className="mt-2 text-slate-600">{check.message}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Sequencia sugerida</p>
            <h3 className="mt-1 text-lg font-semibold">6 stories com cara de Instagram nativo</h3>
            <p className="mt-2 text-sm text-slate-500">Cada item traz uma sugestao de midia natural, texto curto, risco editorial e motivo da recomendacao.</p>
          </div>
          <span className={`badge ${statusClasses[sequence.safetyStatus]}`}>{storyOpsSafetyStatusLabel(sequence.safetyStatus)}</span>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {sequence.items.map((item) => (
            <article key={item.order} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-slate-100 text-slate-700">Story {item.order}</span>
                <span className={`badge ${statusClasses[item.editorialRisk]}`}>Risco {storyOpsSafetyStatusLabel(item.editorialRisk)}</span>
              </div>
              <h4 className="mt-3 text-base font-semibold">{item.textOnScreen}</h4>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Foto/video sugerido</p>
                  <p className="mt-1 font-semibold text-ink">{item.mediaSuggestion.label}</p>
                  <p className="mt-1">{item.mediaSuggestion.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.mediaSuggestion.captureGuidance}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Seguranca</p>
                  <p className="mt-1">{item.safetyNote}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">Tom: {item.tone}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.recommendationReason}</p>
              <p className="mt-2 text-xs text-slate-500">{item.editableNote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-ocean">Exportacao copiavel</p>
              <h3 className="mt-1 text-lg font-semibold">Texto final para revisao humana</h3>
            </div>
            <LocalCopyButton text={sequence.exportText} label="Copiar sequencia" />
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-50">{sequence.exportText}</pre>
        </div>

        <aside className="panel">
          <h3 className="text-lg font-semibold">Checklist rapido</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>- Story parece foto/video natural, nao arte montada.</li>
            <li>- Texto curto, uma ideia por story.</li>
            <li>- Sem paciente, antes/depois, promessa ou prescricao.</li>
            <li>- Sem local, agenda, tela, documento ou dado sensivel.</li>
            <li>- Publicacao final sempre manual e revisada.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
