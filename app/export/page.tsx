import { LocalCopyButton } from "@/components/LocalCopyButton";
import {
  CONTENT_PROMPTS,
  buildPromptLibraryMarkdown,
  buildWeeklyContentCsv,
  buildWeeklyContentJson,
  buildWeeklyContentMarkdown,
  getWeeklyContentPlan
} from "@/lib/drCaduContentPlan";

export default function ExportPage() {
  const plan = getWeeklyContentPlan();
  const markdown = buildWeeklyContentMarkdown(plan);
  const json = buildWeeklyContentJson(plan);
  const csv = buildWeeklyContentCsv(plan);
  const prompts = buildPromptLibraryMarkdown(CONTENT_PROMPTS);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Exportacao local</p>
        <h2 className="mt-1 text-2xl font-semibold">Copiar planejamento, prompts e dados</h2>
        <p className="mt-2 text-sm text-slate-500">Exportacao manual local. Nada e enviado para Google Agenda, Notion, Etus, Meta, TikTok, YouTube ou qualquer plataforma.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Semana em Markdown</h3>
            <LocalCopyButton text={markdown} label="Copiar Markdown" />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-700">{markdown}</pre>
        </article>

        <article className="panel">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Dados em JSON</h3>
            <LocalCopyButton text={json} label="Copiar JSON" />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-700">{json}</pre>
        </article>

        <article className="panel">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Resumo CSV</h3>
            <LocalCopyButton text={csv} label="Copiar CSV" />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-700">{csv}</pre>
        </article>

        <article className="panel">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Prompts</h3>
            <LocalCopyButton text={prompts} label="Copiar prompts" />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-sm text-slate-700">{prompts}</pre>
        </article>
      </section>
    </div>
  );
}
