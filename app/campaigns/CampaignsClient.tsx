"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LocalCopyButton } from "@/components/LocalCopyButton";
import {
  DEFAULT_CAMPAIGN_INPUT,
  EDITORIAL_PILLARS,
  campaignIntensityLabel,
  contentChannelLabel,
  generateMonthlyEditorialPlan,
  safetyClassificationLabel,
  type CampaignInput,
  type CampaignIntensity,
  type EditorialDay,
  type EditorialPillarId,
  type EditorialStatus,
  type SafetyClassification
} from "@/lib/monthly-editorial";

type CampaignDraft = {
  name: string;
  startDate: string;
  durationDays: number;
  objective: string;
  targetAudience: string;
  tone: string;
  intensity: CampaignIntensity;
  priorityPillars: EditorialPillarId[];
  neutralNotes: string;
};

const initialDraft: CampaignDraft = {
  name: DEFAULT_CAMPAIGN_INPUT.name,
  startDate: DEFAULT_CAMPAIGN_INPUT.startDate,
  durationDays: DEFAULT_CAMPAIGN_INPUT.durationDays,
  objective: DEFAULT_CAMPAIGN_INPUT.objective,
  targetAudience: DEFAULT_CAMPAIGN_INPUT.targetAudience,
  tone: DEFAULT_CAMPAIGN_INPUT.tone,
  intensity: DEFAULT_CAMPAIGN_INPUT.intensity,
  priorityPillars: DEFAULT_CAMPAIGN_INPUT.priorityPillars,
  neutralNotes: DEFAULT_CAMPAIGN_INPUT.neutralNotes
};

const safetyClasses: Record<SafetyClassification, string> = {
  seguro: "bg-green-50 text-leaf",
  atencao: "bg-amber-50 text-amber",
  revisar_antes_de_postar: "bg-orange-50 text-orange-700",
  bloquear: "bg-red-50 text-red-700"
};

const statusClasses: Record<EditorialStatus, string> = {
  ideia: "bg-slate-100 text-slate-700",
  rascunho: "bg-cyan-50 text-ocean",
  revisar: "bg-amber-50 text-amber",
  pronto: "bg-green-50 text-leaf",
  publicado_manual: "bg-indigo-50 text-indigo-700",
  arquivado: "bg-slate-100 text-slate-500",
  bloqueado: "bg-red-50 text-red-700"
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

function ExportBlock({ title, text, label = "Copiar" }: { title: string; text: string; label?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h4 className="font-semibold">{title}</h4>
        <LocalCopyButton text={text} label={label} />
      </div>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{text}</pre>
    </div>
  );
}

function DayButton({ day, active, onSelect }: { day: EditorialDay; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border p-3 text-left transition ${active ? "border-ocean bg-cyan-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
    >
      <div className="flex flex-wrap gap-2">
        <span className="badge bg-slate-100 text-slate-700">Dia {day.dayNumber}</span>
        <span className={`badge ${safetyClasses[day.safetyGate.classification]}`}>{safetyClassificationLabel(day.safetyGate.classification)}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{day.date}</p>
      <p className="mt-1 text-sm text-slate-600">{day.theme}</p>
      <p className="mt-2 text-xs text-slate-500">{day.pillar.name}</p>
    </button>
  );
}

export function CampaignsClient() {
  const [draft, setDraft] = useState<CampaignDraft>(initialDraft);
  const [generatedDraft, setGeneratedDraft] = useState<CampaignDraft>(initialDraft);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const plan = useMemo(() => generateMonthlyEditorialPlan(toCampaignInput(generatedDraft)), [generatedDraft]);
  const selectedDay = plan.days.find((day) => day.dayNumber === selectedDayNumber) ?? plan.days[0];

  function updateDraft(partial: Partial<CampaignDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function togglePillar(pillarId: EditorialPillarId) {
    setDraft((current) => {
      const selected = current.priorityPillars.includes(pillarId);
      const nextPillars = selected ? current.priorityPillars.filter((id) => id !== pillarId) : [...current.priorityPillars, pillarId];
      return { ...current, priorityPillars: nextPillars.length ? nextPillars : current.priorityPillars };
    });
  }

  function generatePlan() {
    setGeneratedDraft(draft);
    setSelectedDayNumber(1);
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing Intelligence OS v2.0</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Campanhas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Maquina Editorial de 30 dias para planejar conteudo organico, gerar stories pelo StoryOps, organizar reels/posts, revisar seguranca medico-publicitaria e exportar tudo para uso manual.
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber lg:max-w-sm">
            <p className="font-semibold">Modo interno/local</p>
            <p className="mt-1">Sem API externa, sem publicacao automatica, sem conta real, sem upload de midia e sem dados de pacientes.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Formulario de campanha</p>
          <h3 className="mt-1 text-lg font-semibold">Gerar plano editorial</h3>
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Nome da campanha</span>
              <input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Data inicial</span>
                <input type="date" value={draft.startDate} onChange={(event) => updateDraft({ startDate: event.target.value })} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Duracao</span>
                <input type="number" min={1} max={60} value={draft.durationDays} onChange={(event) => updateDraft({ durationDays: Number(event.target.value) })} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Intensidade</span>
                <select value={draft.intensity} onChange={(event) => updateDraft({ intensity: event.target.value as CampaignIntensity })} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <option value="leve">Leve</option>
                  <option value="padrao">Padrao</option>
                  <option value="intensa">Intensa</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Objetivo principal</span>
              <textarea value={draft.objective} onChange={(event) => updateDraft({ objective: event.target.value })} rows={3} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Publico-alvo</span>
              <textarea value={draft.targetAudience} onChange={(event) => updateDraft({ targetAudience: event.target.value })} rows={3} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Tom</span>
              <input value={draft.tone} onChange={(event) => updateDraft({ tone: event.target.value })} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Observacoes neutras</span>
              <textarea value={draft.neutralNotes} onChange={(event) => updateDraft({ neutralNotes: event.target.value })} rows={3} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <p className="mt-2 text-xs text-slate-500">Nao informe local, paciente, agenda, cirurgia do dia, documento ou dado sensivel.</p>
            </label>
            <div>
              <p className="text-sm font-semibold text-slate-700">Pilares prioritarios</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {EDITORIAL_PILLARS.map((pillar) => (
                  <label key={pillar.id} className="flex gap-2 rounded-md border border-slate-200 p-3 text-sm">
                    <input type="checkbox" checked={draft.priorityPillars.includes(pillar.id)} onChange={() => togglePillar(pillar.id)} className="mt-1" />
                    <span>
                      <span className="font-semibold">{pillar.name}</span>
                      <span className="mt-1 block text-xs text-slate-500">{pillar.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button type="button" onClick={generatePlan} className="w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
              Gerar plano editorial
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Dias" value={plan.summary.totalDays} detail={`${plan.startDate} a ${plan.endDate}`} />
            <MetricCard label="Stories" value={plan.summary.totalStories} detail="6 por dia via StoryOps" />
            <MetricCard label="Reels" value={plan.summary.totalReels} detail={campaignIntensityLabel(plan.intensity)} />
            <MetricCard label="Posts/carrosseis" value={plan.summary.totalPostsAndCarousels} detail="Feed e derivados" />
            <MetricCard label="Alertas" value={plan.summary.totalSafetyAlerts} detail={safetyClassificationLabel(plan.safetyGate.classification)} />
            <MetricCard label="Bloqueios" value={plan.summary.blockedItems} detail="Itens que exigem revisao" />
            <MetricCard label="Midias" value={plan.summary.mediaSuggestions} detail="Sugestoes naturais" />
            <MetricCard label="Lacunas" value={plan.summary.mediaGaps} detail="MediaOps" />
          </section>

          <section className="panel">
            <p className="text-sm font-medium text-ocean">Canais ativos</p>
            <h3 className="mt-1 text-lg font-semibold">Distribuicao planejada</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.activeChannels.map((channel) => (
                <span key={channel} className="badge bg-slate-100 text-slate-700">{contentChannelLabel(channel)}</span>
              ))}
            </div>
            <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              A central prepara o mes para execucao manual: copiar, revisar, fotografar/gravar e publicar fora do sistema. Nada e enviado para Instagram, Meta, TikTok, YouTube, Facebook ou Google.
            </p>
          </section>

          <section className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-ocean">Atalhos</p>
                <h3 className="mt-1 text-lg font-semibold">Fluxo conectado</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/storyops" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">StoryOps</Link>
                <Link href="/calendar" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Calendario</Link>
                <Link href="/content" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Content Studio</Link>
                <Link href="/media" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Midias</Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Visao mensal</p>
            <h3 className="mt-1 text-lg font-semibold">30 dias de pauta, stories, reels/posts e midia</h3>
            <p className="mt-2 text-sm text-slate-500">Clique em um dia para ver o pacote completo e copiar a exportacao.</p>
          </div>
          <LocalCopyButton text={plan.exports.monthly_markdown} label="Copiar mes" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {plan.days.map((day) => (
            <DayButton key={day.id} day={day} active={day.dayNumber === selectedDay.dayNumber} onSelect={() => setSelectedDayNumber(day.dayNumber)} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="panel">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-ocean">Visao do dia</p>
              <h3 className="mt-1 text-xl font-semibold">{selectedDay.date} - {selectedDay.theme}</h3>
              <p className="mt-2 text-sm text-slate-600">{selectedDay.dailyObjective}</p>
            </div>
            <span className={`badge ${statusClasses[selectedDay.editorialStatus]}`}>{selectedDay.editorialStatus}</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="font-semibold">Stories do dia</h4>
              <p className="mt-2 text-sm text-slate-600">Sequencia StoryOps com {selectedDay.content.storySequence.items.length} itens.</p>
              <div className="mt-3 space-y-2">
                {selectedDay.content.storySequence.items.map((item) => (
                  <div key={item.order} className="rounded-md bg-slate-50 p-3 text-sm">
                    <p className="font-semibold">Story {item.order}: {item.textOnScreen}</p>
                    <p className="mt-1 text-slate-600">{item.mediaSuggestion.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="font-semibold">Reel/Post</h4>
              {selectedDay.content.reelPlan ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">{selectedDay.content.reelPlan.title}</p>
                  <p className="mt-1">{selectedDay.content.reelPlan.openingHook}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Sem reel previsto neste dia pela intensidade escolhida.</p>
              )}
              {selectedDay.content.carouselPlan ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">{selectedDay.content.carouselPlan.title}</p>
                  <p className="mt-1">{selectedDay.content.carouselPlan.cards.length} cards educativos.</p>
                </div>
              ) : selectedDay.content.postPlan ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">{selectedDay.content.postPlan.title}</p>
                  <p className="mt-1">{selectedDay.content.postPlan.centralIdea}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Sem post/carrossel previsto neste dia.</p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <h4 className="font-semibold">Midia sugerida</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {selectedDay.mediaSuggestions.map((media) => (
                <div key={media.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">{media.label}</p>
                  <p className="mt-1">{media.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{media.privacyNote}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="panel">
            <p className="text-sm font-medium text-ocean">Safety gate</p>
            <h3 className="mt-1 text-lg font-semibold">{safetyClassificationLabel(selectedDay.safetyGate.classification)} ({selectedDay.safetyGate.score}/100)</h3>
            <div className="mt-3 space-y-2">
              {selectedDay.safetyGate.issues.length ? selectedDay.safetyGate.issues.map((issue) => (
                <div key={issue.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                  <p className="font-semibold text-ink">{issue.message}</p>
                  <p className="mt-1">{issue.suggestion}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Nenhum alerta critico no pacote do dia.</p>}
            </div>
          </section>

          <section className="panel">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-ocean">Exportacao do dia</p>
                <h3 className="mt-1 text-lg font-semibold">Copiar pacote</h3>
              </div>
              <LocalCopyButton text={selectedDay.exportText} label="Copiar dia" />
            </div>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">{selectedDay.exportText}</pre>
          </section>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <p className="text-sm font-medium text-ocean">Visao semanal</p>
          <h3 className="mt-1 text-lg font-semibold">Agrupamento por semanas</h3>
          <div className="mt-4 space-y-4">
            {plan.weeks.map((week) => (
              <article key={week.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold">Semana {week.weekNumber}: {week.theme}</p>
                    <p className="mt-1 text-sm text-slate-500">{week.startDate} a {week.endDate}</p>
                  </div>
                  <LocalCopyButton text={week.exportText} label="Copiar semana" />
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {week.days.map((day) => (
                    <li key={day.id}>- {day.weekday}: {day.theme} | Reel {day.content.reelPlan ? "sim" : "nao"} | Post {day.content.postPlan || day.content.carouselPlan ? "sim" : "nao"}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="text-sm font-medium text-ocean">MediaOps</p>
          <h3 className="mt-1 text-lg font-semibold">Checklist mensal de imagens naturais</h3>
          <div className="mt-4 space-y-3">
            {plan.mediaChecklist.monthlyItems.map((item) => (
              <div key={item.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.label}</p>
                  <span className="badge bg-slate-100 text-slate-700">{item.currentCount}/{item.targetCount}</span>
                </div>
                <p className="mt-1">{item.safetyNote}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber">
            <p className="font-semibold">Itens proibidos exigem bloqueio</p>
            <p className="mt-1">{plan.mediaChecklist.prohibitedItems.slice(0, 8).join(", ")}.</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-ocean">Exportacoes copiaveis</p>
            <h3 className="mt-1 text-lg font-semibold">Markdown, planilha, agenda e briefing</h3>
          </div>
          <span className={`badge ${safetyClasses[plan.safetyGate.classification]}`}>{safetyClassificationLabel(plan.safetyGate.classification)}</span>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ExportBlock title="Plano mensal em Markdown" text={plan.exports.monthly_markdown} label="Copiar Markdown" />
          <ExportBlock title="Google Sheets TSV" text={plan.exports.google_sheets_tsv} label="Copiar tabela" />
          <ExportBlock title="Google Agenda" text={plan.exports.google_agenda_text} label="Copiar agenda" />
          <ExportBlock title="Briefing para editor" text={plan.exports.video_editor_brief} label="Copiar briefing" />
        </div>
      </section>
    </div>
  );
}

function toCampaignInput(draft: CampaignDraft): CampaignInput {
  return {
    name: draft.name,
    startDate: draft.startDate,
    durationDays: draft.durationDays,
    objective: draft.objective,
    targetAudience: draft.targetAudience,
    tone: draft.tone,
    intensity: draft.intensity,
    priorityPillars: draft.priorityPillars,
    neutralNotes: draft.neutralNotes
  };
}
