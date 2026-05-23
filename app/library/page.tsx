import Link from "next/link";
import { getContentLibraryInventory } from "@/lib/content-studio";

export default function LibraryPage() {
  const inventory = getContentLibraryInventory();
  return (
    <div className="space-y-6">
      <section className="panel">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-medium text-ocean">Marketing OS v5</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">Biblioteca Editorial</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Inventario local de pilares, temas, hooks, frases de stories, ganchos de reels, templates e termos de risco. Base deterministica para o Content Studio.
            </p>
          </div>
          <Link href="/studio" className="w-fit rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800">Abrir Studio</Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pilares" value={inventory.pillars.length} />
        <MetricCard label="Temas" value={inventory.themes.length} />
        <MetricCard label="Hooks" value={inventory.hooks.length} />
        <MetricCard label="Stories" value={inventory.storyPhrases.length} />
        <MetricCard label="Ganchos reels" value={inventory.reelHooks.length} />
        <MetricCard label="Templates" value={inventory.carouselTemplates.length} />
        <MetricCard label="Legendas" value={inventory.captions.length} />
        <MetricCard label="Termos risco" value={inventory.forbiddenTerms.length} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PanelList title="Pilares" items={inventory.pillars.map((pillar) => `${pillar.name}: ${pillar.description}`)} />
        <PanelList title="Temas seguros" items={inventory.themes} />
        <PanelList title="Hooks" items={inventory.hooks.slice(0, 30).map((hook) => `${hook.style}: ${hook.text}`)} />
        <PanelList title="Frases de stories" items={inventory.storyPhrases.slice(0, 30).map((story) => `${story.text} | ${story.mediaHint}`)} />
        <PanelList title="Ganchos de reels" items={inventory.reelHooks.slice(0, 30)} />
        <PanelList title="Termos que geram alerta/bloqueio" items={inventory.forbiddenTerms} />
      </section>

      <section className="panel">
        <p className="text-sm font-medium text-ocean">Templates de carrossel</p>
        <h3 className="mt-1 text-lg font-semibold">Estruturas educativas</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {inventory.carouselTemplates.slice(0, 12).map((template, index) => (
            <article key={index} className="rounded-md bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-ink">Template {index + 1}</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                {template.map((line) => <li key={line}>- {line}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function PanelList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="panel">
      <p className="text-sm font-medium text-ocean">{title}</p>
      <div className="mt-4 max-h-96 space-y-2 overflow-auto text-sm text-slate-600">
        {items.map((item) => <p key={item} className="rounded-md bg-slate-50 p-2">{item}</p>)}
      </div>
    </section>
  );
}
